import React, { useState, useEffect } from "react";
import { getPendingContributions, acceptContribution, rejectContribution } from "../api/resource.api.jsx";
import { userContext } from "../context/userContext";
import { useMessage } from "../context/messageContext";

const PendingContributionList = () => {
  const [pendingContributions, setPendingContributions] = useState([]);
  const [view, setView] = useState(false);
  const [loading, setLoading] = useState(false);
  const { accessToken } = userContext();
  const { showMessage } = useMessage();

  const fetchPendingContributions = async () => {
    setLoading(true);
    const { data, error } = await getPendingContributions();
    if (error) {
      showMessage(error, "error");
      setLoading(false);
      return;
    }
    setPendingContributions(data);
    setLoading(false);
  };

  const acceptContributionHandler = async (e, constribution) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await acceptContribution(accessToken, formData);
    // if (response.success) {
    const modal = document.getElementById(`myModal${constribution._id}`);
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
    // }
    fetchPendingContributions();
  };

  const rejectContributionHandler = async (e, constribution) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await rejectContribution(accessToken, formData);
    // if (response.success) {
    const modal = document.getElementById(`myModalReject${constribution._id}`);
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
    // }
    fetchPendingContributions();
  };

  useEffect(() => {
    const fetchPendingCount = async () => {
      const { data, error } = await getPendingContributions();
      if (error) {
        console.error(error);
        return;
      }
      setPendingContributions(data);
    };

    fetchPendingCount();
  }, []);
  return (
    <div className="border-2 rounded-2xl m-2">
      
      <div className="pendingContributionsTab flex flex-row flex-wrap gap-2 justify-between items-center p-4">
        <div className="text-left">You have {pendingContributions.length} contribution(s) waiting for approval.</div>
        <button
          className="btn btn-primary min-w-[200px]"
          onClick={() => {
            setView(!view);
          }}
          disabled={pendingContributions.length === 0}
        >
          {view ? "Hide Pending Contributions" : "Show Pending Contributions"}
        </button>
      </div>
      {view && (
        <div className="flex flex-row flex-wrap border-t-2 p-2 gap-4 justify-center">
          {loading ? (
            <div>Loading...</div>
          ) : (
            pendingContributions.map((contribution) => (
              <div className="card w-[400px] mb-4" key={contribution._id}>
                <div className="card-body">
                  <h5 className="card-title text-black text-lg">{contribution.resource.subject_code}</h5>
                  <p className="card-text text-black text-lg">{contribution.resource.subject_name}</p>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <span className="resourceHeading text-gray-500">File Name: </span>
                    {contribution.resource.file_name}
                  </li>
                  <li className="list-group-item">
                    <span className="resourceHeading text-gray-500">Description: </span>
                    {contribution.resource.description}
                  </li>
                  <li className="list-group-item">
                    <span className="resourceHeading text-gray-500">Contributed By: </span>
                    {contribution.resource.contributer_name}
                  </li>
                  <li className="list-group-item">
                    <span className="resourceHeading text-gray-500">File Size: </span>
                    {contribution.resource.file_size}
                  </li>
                  <li className="list-group-item">
                    <span className="resourceHeading text-gray-500">Contributed On: </span>
                    {new Date(contribution.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </li>
                </ul>
                <iframe className="h-[200px]" src={`${contribution.resource.file_address}`} frameBorder="0" title={`file-${contribution._id}`}></iframe>

                {/* Accept Contribution Modal */}
                <div className="modal fade" id={`myModal${contribution._id}`} tabIndex="-1" aria-labelledby="myModalLabel" aria-hidden="true">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title text-lg">Accept Contribution</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div className="modal-body">
                        <form onSubmit={(e) => acceptContributionHandler(e, contribution)}>
                          <input type="hidden" name="resource_id" value={contribution.resource._id} />
                          <input type="hidden" name="contribution_id" value={contribution.contribution_id} />
                          <div className="form-group py-1">
                            <label className="py-1 text-gray-600">Contributed By</label>
                            <input type="text" className="form-control" value={contribution.resource.contributer_name} readOnly />
                          </div>
                          <div className="form-group py-1">
                            <label className="py-1 text-gray-600">Subject Code</label>
                            <input type="text" className="form-control" name="subject_code" defaultValue={contribution.resource.subject_code} required />
                          </div>
                          <div className="form-group py-1">
                            <label className="py-1 text-gray-600">Subject Name</label>
                            <input type="text" className="form-control" name="subject_name" defaultValue={contribution.resource.subject_name} required />
                          </div>
                          <div className="form-group py-1">
                            <label className="py-1 text-gray-600">File Name</label>
                            <input type="text" className="form-control" name="file_name" defaultValue={contribution.resource.file_name} required />
                          </div>
                          <div className="form-group py-1">
                            <label className="py-1 text-gray-600">Description</label>
                            <input type="text" className="form-control" name="description" defaultValue={contribution.resource.description} required />
                          </div>
                          <div className="center-align-button pt-2">
                            <button type="submit" className="btn btn-success">
                              Accept
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reject Contribution Modal */}
                <div className="modal fade" id={`myModalReject${contribution._id}`} tabIndex="-1" aria-labelledby="myModalLabel" aria-hidden="true">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title text-lg">Reject Contribution</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div className="modal-body">
                        <form onSubmit={(e) => rejectContributionHandler(e, contribution)}>
                          <input type="hidden" name="resource_id" value={contribution.resource._id} />
                          <input type="hidden" name="contribution_id" value={contribution.contribution_id} />
                          <div className="form-group py-1">
                            <label className="py-1 text-gray-600">Contributed By</label>
                            <input type="text" className="form-control" value={contribution.resource.contributer_name} readOnly />
                          </div>
                          <div className="form-group py-1">
                            <label className="py-1 text-gray-600">Reason</label>
                            <input type="text" className="form-control" name="remarks" placeholder="Specify the reason for rejection" required />
                          </div>
                          <div className="center-align-button pt-2">
                            <button type="submit" className="btn btn-danger">
                              Reject
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer flex flex-row flex-wrap justify-around">
                  <button type="button" className="btn btn-outline-success m-2" data-bs-toggle="modal" data-bs-target={`#myModal${contribution._id}`}>
                    Accept Contribution
                  </button>
                  <button type="button" className="btn btn-outline-danger m-2" data-bs-toggle="modal" data-bs-target={`#myModalReject${contribution._id}`}>
                    Reject Contribution
                  </button>
                  {/* <div className="card-body"> */}
                  <a href={`/download_pendingfile/${contribution._id}`} download>
                    <button type="button" className="btn btn-outline-info m-2">
                      Download File
                    </button>
                  </a>
                  {/* </div> */}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PendingContributionList;
