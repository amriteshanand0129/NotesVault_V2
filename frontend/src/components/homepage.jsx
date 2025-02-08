import React from "react";
import axios from "axios";
import { userContext } from "../context/userContext.jsx";
import PendingContributionList from "./pendingContributionList.jsx";

export const Homepage = () => {
  const { user, accessToken, isAuthenticated } = userContext();

  return <>{user?.userType === "ADMIN" && <PendingContributionList></PendingContributionList>}</>;
};
