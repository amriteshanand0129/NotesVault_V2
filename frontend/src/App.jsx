import "./App.css";
import React, { useState } from "react";
import Navbar from "./components/navbar";
import ResourceUploadPage from "./components/uploadPage.jsx";
import { Homepage } from "./components/homepage.jsx";
import { userContext } from "./context/userContext.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const { accessToken, user, isAuthenticated, isLoading } = userContext();

  return (
    <BrowserRouter>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/subject_catalog" element={<Homepage />} />
        <Route path="/upload_resource" element={<ResourceUploadPage />} />
        <Route path="/profile" element={<Homepage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
