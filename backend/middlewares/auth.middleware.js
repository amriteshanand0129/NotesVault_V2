// Dependencies
const jwt = require("jsonwebtoken");
const logger = require("../logger");
const jwksClient = require("jwks-rsa");

// Database models
const user_model = require("../models/user.model");

// Configurations
require("dotenv").config();
const client = jwksClient({
  jwksUri: process.env.SIGNING_KEY_URL,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      logger.error("AUTH | SERVER | Failed to fetch Signing Key: ", err);
      callback(err, null);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

const validateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ error: "Unauthenticated Access: You need to be logged in to access this endpoint" });
  }

  try {
    const token = authHeader.split(" ")[1];
    jwt.verify(
      token,
      getKey,
      {
        audience: process.env.AUDIENCE,
        issuer: process.env.ISSUER,
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) {
          return res.status(401).send({ error: "Token Validation Failed, Try Logging in again." });
        } else {
          req.user = decoded;
          return next();
        }
      }
    );
  } catch (err) {
    res.status(400).send({ error: "Token Validation Failed, Try Logging in again." });
  }
};

const addUserData = async (req, res, next) => {
  try {
    req.user = await user_model.findOne({ auth0_user_id: req.user.sub });
  } catch (err) {
    logger.error(`AUTH | Failed to fetch user ${req.user} data: ${err}`);
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
