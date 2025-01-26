import React from "react";
import axios from "axios";
import { userContext } from "../context/userContext.jsx";

export const Homepage = () => {
  const { accessToken, isAuthenticated } = userContext();

  const sendRequest = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/request`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(response);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <>
      <div className="homepage">
        <div className="homepage-header">
          <h1>Welcome to the Freelancer Marketplace</h1>
        </div>
        <div className="homepage-body">
          <p>The Freelancer Marketplace is a platform where clients can post jobs and freelancers can apply for them. Clients can view the profiles of freelancers who have applied for their job and choose the best candidate for the job.</p>
          <p>Freelancers can view all the jobs posted by clients and apply for the ones that match their skills and experience. They can also view the profiles of clients who have posted the job and decide if they want to work with them.</p>
          <p>The Freelancer Marketplace is a great way for clients to find skilled professionals to work on their projects and for freelancers to find interesting projects to work on.</p>
        </div>
      </div>
      <button onClick={() => sendRequest()}>Send Request</button>
    </>
  );
};
