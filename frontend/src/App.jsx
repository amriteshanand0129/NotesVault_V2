import "./App.css";
import React from "react";
import Navbar from "./components/navbar";
import FilesList from "./components/filesList.jsx";
import Resources from "./components/resources.jsx";
import FileViewer from "./components/fileViewer.jsx";
import { Homepage } from "./components/homepage.jsx";
import Profile from "./components/profile.jsx";
import ResourceUploadPage from "./components/uploadPage.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:subjectCode" element={<FilesList />} />
        <Route path="/resources/:subjectCode/:fileId" element={<FileViewer />} />
        <Route path="/upload_resource" element={<ResourceUploadPage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
