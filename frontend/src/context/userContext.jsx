import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const UserContext = createContext();

const TOKEN_KEY = "nv_token";

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isTokenExpired(decoded) {
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Bootstrap from localStorage on first load
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && !isTokenExpired(decoded)) {
        setUserData({
          user: { name: decoded.name, email: decoded.email, userType: decoded.user_type },
          isAuthenticated: true,
          isLoading: false,
          accessToken: token,
        });
        return;
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setUserData((prev) => ({ ...prev, isLoading: false }));
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
    const { token, user_type, name, email: userEmail } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    setUserData({
      user: { name, email: userEmail, userType: user_type },
      isAuthenticated: true,
      isLoading: false,
      accessToken: token,
    });
  }, []);

  const register = useCallback(async (name, email, password) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { name, email, password });
    const { token, user_type, name: userName, email: userEmail } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    setUserData({
      user: { name: userName, email: userEmail, userType: user_type },
      isAuthenticated: true,
      isLoading: false,
      accessToken: token,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUserData({ user: null, isAuthenticated: false, isLoading: false, accessToken: null });
  }, []);

  return (
    <UserContext.Provider value={{ ...userData, login, register, logout, showAuthModal, setShowAuthModal }}>
      {children}
    </UserContext.Provider>
  );
};

export const userContext = () => useContext(UserContext);
