import axios from "axios";
import React, { useState } from "react";
import { userContext } from "../context/userContext.jsx";

const ResourceUploadPage = () => {
  const { user, accessToken, isAuthenticated } = userContext();
  const [formData, setFormData] = useState({
    subject_code: "",
    subject_name: "",
    file_name: "",
    description: "",
    fileInput: null,
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      fileInput: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("subject_code", formData.subject_code);
    data.append("subject_name", formData.subject_name);
    data.append("file_name", formData.file_name);
    data.append("description", formData.description);
    data.append("fileInput", formData.fileInput);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = response.data;
      setFormData({ subject_code: "", subject_name: "", file_name: "", description: "", fileInput: null });
      alert(result.message);
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("An error occurred while uploading the resource.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="form-container max-w-lg mx-auto my-10 lg:px-8 sm:px-2 py-2 pb-4 sm:px-2 border-2 border-gray-300 rounded-lg bg-white">
        <div className="text-lg p-3 text-center border-b border-gray-400 mb-8">{user.userType === "ADMIN" ? <h4>Upload Resource</h4> : <h4>Contribute Resource</h4>}</div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="subject_code" className="form-label">
              Subject Code
            </label>
            <input type="text" id="subject_code" name="subject_code" className="form-control w-full border-1 border-gray-400" value={formData.subject_code} onChange={handleInputChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="subject_name" className="form-label">
              Subject Name
            </label>
            <input type="text" id="subject_name" name="subject_name" className="form-control w-full border-1 border-gray-400" value={formData.subject_name} onChange={handleInputChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="file_name" className="form-label">
              File Name
            </label>
            <input type="text" id="file_name" name="file_name" className="form-control w-full border-1 border-gray-400" value={formData.file_name} onChange={handleInputChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <input type="text" id="description" name="description" className="form-control w-full border-1 border-gray-400" value={formData.description} onChange={handleInputChange} />
          </div>
          <div className="mb-3">
            <input type="file" id="fileInput" name="fileInput" className="form-control w-full border-1 border-gray-400" onChange={handleFileChange} />
            <span className="form-text">Only PDF Files are allowed</span>
          </div>
          <div className="text-center mt-10">
            <button type="submit" className="btn btn-dark w-full sm:w-auto" disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ResourceUploadPage;
