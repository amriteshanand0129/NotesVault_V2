import axios from "axios";
import { useState, useEffect } from "react";
import { getFileDetails } from "../api/resource.api.jsx";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useBreadcrumb } from "../context/breadcrumbContext";
import SecondaryNavbar from "./secondaryNavbar";
import { useMessage } from "../context/messageContext";
import { userContext } from "../context/userContext.jsx";

const FileViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [file, setFile] = useState(location.state?.file || null);
  const [loading, setLoading] = useState(!file);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const { fileId } = useParams();
  const { showMessage } = useMessage();
  const { setBreadcrumb } = useBreadcrumb();
  const { user, accessToken } = userContext();

  const fetchFile = async () => {
    setLoading(true);
    try {
      const response = await getFileDetails(fileId);
      if (response.error) {
        showMessage(response.error, "error");
        return;
      }
      setFile(response.data);
    } catch (error) {
      showMessage("Error fetching file!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!file) {
      fetchFile();
    }
    setBreadcrumb([
      { name: "Dashboard", link: "/" },
      { name: "Resources", link: "/resources" },
      { name: file?.subject_name, link: `/resources/${file?.subject_code}` },
      { name: file?.file_name, link: "#" },
    ]);
  }, [file, fileId, setBreadcrumb]);

  const deleteFile = async () => {
    setDeleting(true);
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/deleteResource/${file._id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      document.getElementById(`myDeleteModal${fileId}`).classList.remove("show");
      document.body.classList.remove("modal-open");
      document.body.style = "";
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) backdrop.remove();
      showMessage(response.data.message);
      navigate("/resources");
    } catch (error) {
      console.log(error);
      showMessage("Failed to delete file", "error");
    } finally {
      setDeleting(false);
    }
  };

  const updateResource = async (e, file) => {
    setUpdating(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("resource_id", file._id);
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/updateResource`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      document.getElementById(`myUpdateModal${fileId}`).classList.remove("show");
      document.body.classList.remove("modal-open");
      document.body.style = "";
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) backdrop.remove();
      showMessage(response.data.message, "success");
      fetchFile();
    } catch (error) {
      console.log(error);
      showMessage("Failed to update resource", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="">
      <div className="modal fade" id={`myDeleteModal${fileId}`} tabIndex="-1" aria-labelledby="myModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-lg">Delete Resource</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  deleteFile();
                }}
              >
                <div className="form-group py-1">
                  <label className="py-1 text-gray-600">Are you sure, you want to delete this resource ?</label>
                </div>
                <div className="center-align-button pt-2 mt-2 flex justify-around">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-outline-danger">
                   { deleting ?  "Deleting Resource ......" : "Yes, Delete this resource"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id={`myUpdateModal${fileId}`} tabIndex="-1" aria-labelledby="myModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-lg">Update Resource</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateResource(e, file);
                }}
              >
                <input type="hidden" name="resource_id" value={file._id} />
                <div className="form-group py-1">
                  <label className="py-1 text-gray-600">Subject Code</label>
                  <input type="text" className="form-control" name="subject_code" defaultValue={file.subject_code} required />
                </div>
                <div className="form-group py-1">
                  <label className="py-1 text-gray-600">Subject Name</label>
                  <input type="text" className="form-control" name="subject_name" defaultValue={file.subject_name} required />
                </div>
                <div className="form-group py-1">
                  <label className="py-1 text-gray-600">File Name</label>
                  <input type="text" className="form-control" name="file_name" defaultValue={file.file_name} required />
                </div>
                <div className="form-group py-1">
                  <label className="py-1 text-gray-600">Description</label>
                  <input type="text" className="form-control" name="description" defaultValue={file.description} required />
                </div>
                <div className="center-align-button pt-2 mt-2 flex justify-around">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-outline-warning">
                    { updating ? "Updating ......": "Update Resource" }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <SecondaryNavbar searchCallback={() => {}} />
      <div className="fileDetailsCard card w-[380px] m-auto">
        <div className="card-body">
          <h3 className="card-title text-xl text-black">{file.subject_code}</h3>
          <p className="card-text text-lg text-black">{file.subject_name}</p>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <span className="resourceHeading text-gray-500">File Name: </span>
            {file.file_name}
          </li>
          <li className="list-group-item">
            <span className="resourceHeading text-gray-500">Description: </span>
            {file.description}
          </li>
          <li className="list-group-item">
            <span className="resourceHeading text-gray-500">File Size: </span>
            {file.file_size}
          </li>
          {file.contributer_name && (
            <li className="list-group-item">
              <span className="resourceHeading text-gray-500">Contributed By: </span>
              {file.contributer_name}
            </li>
          )}
        </ul>
      </div>

      {user?.userType === "ADMIN" && (
        <div className="mx-auto w-[20%] flex flex-row items-center justify-between">
          <button type="button" className="btn mt-4 btn-danger" data-bs-toggle="modal" data-bs-target={`#myDeleteModal${fileId}`}>
            Delete Resource
          </button>
          <button type="button" className="btn mt-4 btn-warning text-white" data-bs-toggle="modal" data-bs-target={`#myUpdateModal${fileId}`}>
            Edit Resource
          </button>
        </div>
      )}

      <div className="mt-4 ">
        <iframe src={file.file_address} className="lg:w-4/5 sm:w-full m-auto lg:h-[700px] border rounded-lg"></iframe>
      </div>
    </div>
  );
};

export default FileViewer;
