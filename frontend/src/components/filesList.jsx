import SecondaryNavbar from "./secondaryNavbar";
import React, { useState, useEffect } from "react";
import { userContext } from "../context/userContext.jsx";
import { getSubjectFiles } from "../api/resource.api.jsx";
import { useBreadcrumb } from "../context/breadcrumbContext";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMessage } from "../context/messageContext";


const FileCard = ({ file }) => {
  const navigate = useNavigate();

  const handleFileClick = (file) => {
    navigate(`/resources/${file.subject_code}/${file._id}`, { state: { file } });
  };

  return (
    <div onClick={() => handleFileClick(file)}>
      <div className="grid gap-4 sm:px-2 lg:px-4  cursor-pointer">
        <div className="subject-card border-1 border-gray-400 text-gray-600 bg-white hover:border-black hover:text-black rounded-2xl shadow-md p-3 flex flex-col justify-center content-center max-w-[400px] transition-transform duration-200 hover:scale-105">
          <div>
            <h2 className="text-lg">{file.file_name}</h2>
            <h2 className="text-">{file.description}</h2>
          </div>
          <p className="text-right text-sm">{file.file_size}</p>
        </div>
      </div>
    </div>
  );
};

const FilesList = () => {
  const { subjectCode } = useParams();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const { accessToken } = userContext();
  const { setBreadcrumb } = useBreadcrumb();
  const { showMessage } = useMessage();

  useEffect(() =>  {
    const fetchFiles = async () => {
      const response = await getSubjectFiles(accessToken, subjectCode);
      if(response.error) {
        showMessage(response.error, "error");
        return;
      }
      setFiles(response.data);
      setFilteredFiles(response.data);
    };
    fetchFiles();
    setBreadcrumb([
      { name: "Dashboard", link: "/" },
      { name: "Resources", link: "/resources" },
      { name: subjectCode, link: `/resources/${subjectCode}` },
    ]);
  }, [accessToken, subjectCode, setBreadcrumb]);

  useEffect(() => {
    setBreadcrumb([ 
      { name: "Dashboard", link: "/" },
      { name: "Resources", link: "/resources" },
      { name: files[0]?.subject_name, link: `/resources/${subjectCode}` },
    ]);
  }, [files]);

  const handleSearch = (searchTerm) => {
    const filtered = files.filter((file) => {
      return file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) || file.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredFiles(filtered);
  };

  return (
    <div className="">
      <SecondaryNavbar searchCallback={handleSearch} message={`Files found: ${filteredFiles.length}`} searchPlaceholder="Search by File Name/Description" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {filteredFiles.map((file) => (
          <FileCard key={file._id} file={file} />
        ))}
      </div>
    </div>
  );
};

export default FilesList;
