import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently, logout } = useAuth0();
  const [userData, setUserData] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
    logout: null
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const accessToken = await getAccessTokenSilently();
          setUserData({ user, isAuthenticated, isLoading: false, accessToken, logout });
        } catch (error) {
          console.error("Error fetching access token", error);
        }
      } else {
        setUserData({ user: null, isAuthenticated: false, isLoading, logout });
      }
    };

    fetchUserData();
  }, [isAuthenticated, user, isLoading, getAccessTokenSilently]);

  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  );
};

export const userContext = () => useContext(UserContext);
