import React from "react";
import axios from "axios";
import { userContext } from "../context/userContext.jsx";

const Profile = () => {
  const { user, accessToken, isAuthenticated } = userContext();

  return (
    <>
    <button
      onClick={async () => {
        try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log(response.data);
        } catch (error) {
        console.error("Error fetching profile:", error);
        }
      }}
    >
      Fetch Profile
    </button>
    </>
  );
};

export default Profile;