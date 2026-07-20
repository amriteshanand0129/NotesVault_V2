// Dependencies
const jwt = require("jsonwebtoken");
const logger = require("../logger");

// Database models
const user_model = require("../models/user.model");

// Configurations
require("dotenv").config();

const validateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ error: "Unauthenticated Access: You need to be logged in to access this endpoint" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    req.user = decoded;
    return next();
  } catch (err) {
    logger.error(`AUTH | Token validation failed: ${err.message}`);
    return res.status(401).send({ error: "Token validation failed. Please log in again." });
  }
};

const addUserData = async (req, res, next) => {
  try {
    const user = await user_model.findById(req.user.sub).select("-password");
    if (!user) {
      return res.status(401).send({ error: "User account not found. Please register again." });
    }
    req.user = user;
  } catch (err) {
    logger.error(`AUTH | Failed to fetch user data for sub ${req.user.sub}: ${err}`);
    return res.status(500).send({ error: "Error fetching user data" });
  }
  next();
};

const isAdmin = (req, res, next) => {
  try {
    if (req.user.user_type === "ADMIN") {
      next();
    } else {
      res.status(403).send({ error: "Unauthorized Access: You are not authorized to access this endpoint" });
    }
  } catch (err) {
    logger.error(`AUTH | Failed to verify ADMIN status for ${req.user}: ${err}`);
    res.status(500).send({ error: "Error while verifying ADMIN status" });
  }
};

const auth_middleware = {
  validateToken: validateToken,
  addUserData: addUserData,
  isAdmin: isAdmin,
};

module.exports = auth_middleware;
