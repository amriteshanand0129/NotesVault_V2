import React from "react";
import axios from "axios";
import { userContext } from "../context/userContext.jsx";
import PendingContributionList from "./pendingContributionList.jsx";
import Heading from "./heading.jsx";
import ResourceStats from "./resourceStats.jsx";

export const Homepage = () => {
  const { user, accessToken, isAuthenticated } = userContext();

  return (
    <>
      <Heading></Heading>
      {user?.userType === "ADMIN" && <PendingContributionList></PendingContributionList>}
      <ResourceStats></ResourceStats>
    </>
  );
};
