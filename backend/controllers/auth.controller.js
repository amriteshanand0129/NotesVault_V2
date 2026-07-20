// Dependencies
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../logger");

// Database models
const user_model = require("../models/user.model");

// Configurations
require("dotenv").config();

const SALT_ROUNDS = 10;

// Register controller
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send({ error: "Name, email, and password are required." });
  }

  if (password.length < 8) {
    return res.status(400).send({ error: "Password must be at least 8 characters long." });
  }

  try {
    const existing = await user_model.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).send({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await user_model.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const token = jwt.sign(
      { sub: user._id, user_type: user.user_type, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    logger.info(`AUTH | REGISTER | New user registered: ${user.email}`);
    return res.status(201).send({ token, user_type: user.user_type, name: user.name, email: user.email });
  } catch (err) {
    logger.error(`AUTH | REGISTER | Failed to register user: ${err}`);
    return res.status(500).send({ error: "Registration failed. Please try again." });
  }
};

// Login controller
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ error: "Email and password are required." });
  }

  try {
    const user = await user_model.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).send({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { sub: user._id, user_type: user.user_type, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    logger.info(`AUTH | LOGIN | User logged in: ${user.email}`);
    return res.status(200).send({ token, user_type: user.user_type, name: user.name, email: user.email });
  } catch (err) {
    logger.error(`AUTH | LOGIN | Failed to log in user: ${err}`);
    return res.status(500).send({ error: "Login failed. Please try again." });
  }
};

module.exports = { register, login };
