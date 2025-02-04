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
      alert(result.message);
      window.location.href = result.redirectTo;
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
    <div style={{ width: "40%", margin: "10vh auto 50px", padding: "50px", border: "1px solid grey", borderRadius: "10px" }}>
      <div style={{ textAlign: "center", borderBottom: "1px solid rgb(177, 177, 177)", marginBottom: "30px" }}>
        <h4>Add Resource</h4>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="subject_code" className="form-label">
            Subject Code
          </label>
          <input type="text" id="subject_code" name="subject_code" className="form-control" style={{ border: "1px solid grey" }} value={formData.subject_code} onChange={handleInputChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="subject_name" className="form-label">
            Subject Name
          </label>
          <input type="text" id="subject_name" name="subject_name" className="form-control" style={{ border: "1px solid grey" }} value={formData.subject_name} onChange={handleInputChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="file_name" className="form-label">
            File Name
          </label>
          <input type="text" id="file_name" name="file_name" className="form-control" style={{ border: "1px solid grey" }} value={formData.file_name} onChange={handleInputChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <input type="text" id="description" name="description" className="form-control" style={{ border: "1px solid grey" }} value={formData.description} onChange={handleInputChange} />
        </div>
        <div className="mb-3">
          <input type="file" id="fileInput" name="fileInput" className="form-control" style={{ border: "1px solid grey" }} onChange={handleFileChange} />
          <span className="form-text">File size must be less than 16MB.</span>
        </div>
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button type="submit" className="btn btn-dark" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceUploadPage;
