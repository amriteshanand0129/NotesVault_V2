import { useState, useEffect } from "react";
import { getFileDetails } from "../api/resource.api.jsx";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useBreadcrumb } from "../context/breadcrumbContext";
import SecondaryNavbar from "./secondaryNavbar";
import { useMessage } from "../context/messageContext";
import { userContext } from "../context/userContext.jsx";
import axios from "axios";

const FileViewer = () => {
  const location = useLocation();
  const { fileId } = useParams();
  const [file, setFile] = useState(location.state?.file || null);
  const [loading, setLoading] = useState(!file);
  const { setBreadcrumb } = useBreadcrumb();
  const { showMessage } = useMessage();
  const { user, accessToken } = userContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!file) {
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
      fetchFile();
    }
    setBreadcrumb([
      { name: "Dashboard", link: "/" },
      { name: "Resources", link: "/resources" },
      { name: file?.subject_name, link: `/resources/${file?.subject_code}` },
      { name: file?.file_name, link: "#" },
    ]);
  }, [file, fileId, setBreadcrumb]);

  if (loading) return <p>Loading...</p>;
  if (!file) return <p>File not found.</p>;

  const handleDownload = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getSignedUrl?fileName=${file.file_name}`);
      const data = await response.json();

      if (data.url) {
        const link = document.createElement("a");
        link.href = data.url;
        link.download = file.file_name; // Sets proper file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Failed to get download URL");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const deleteFile = async () => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/deleteResource/${file._id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      showMessage(response.data.message);
      navigate("/resources");
    } catch (error) {
      console.log(error);
      showMessage("Failed to delete file", "error");
    }
  };

  return (
    <div className="">
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
      <button className="btn btn-primary mt-4" onClick={handleDownload}>
        Download File
      </button>
      {user?.userType === "ADMIN" && (
        <button className="btn btn-danger mt-4" onClick={deleteFile}>
          Delete File
        </button>
      )}

      <div className="mt-4 ">
        <iframe src={file.file_address} className="lg:w-4/5 sm:w-full m-auto lg:h-[700px] border rounded-lg"></iframe>
      </div>
    </div>
  );
};

export default FileViewer;
