import { useState, useEffect } from "react";
import { getFileDetails } from "../api/resource.api.jsx";
import { useLocation, useParams } from "react-router-dom";
import { useBreadcrumb } from "../context/breadcrumbContext";
import SecondaryNavbar from "./secondaryNavbar";

const FileViewer = () => {
  const location = useLocation();
  const { fileId } = useParams();
  const [file, setFile] = useState(location.state?.file || null);
  const [loading, setLoading] = useState(!file);
  const { setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    if (!file) {
      const fetchFile = async () => {
        setLoading(true);
        try {
          const response = await getFileDetails(fileId);
          setFile(response.data);
        } catch (error) {
          console.error("Error fetching file details:", error);
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

  return (
    <div className="">
      <SecondaryNavbar searchCallback={() => {}} />
      <div className="card sm:w-1/2 lg:max-w-sm m-auto">
        <div className="card-body">
          <h3 className="card-title text-xl text-black ">{file.subject_code}</h3>
          <p className="card-text">{file.subject_name}</p>
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
        </ul>
      </div>
      <button className="btn btn-primary mt-4" onClick={handleDownload}>
        Download File
      </button>
      
      <div className="mt-4 ">
        <iframe src={file.file_address} className="lg:w-4/5 sm:w-full m-auto lg:h-[700px] border rounded-lg"></iframe>
      </div>
    </div>
  );
};

export default FileViewer;
