// Dependencies
const logger = require("../logger");
const mongoose = require("mongoose");

// Database models
const subject_model = require("../models/subject.model");
const resource_model = require("../models/resource.model");
const contribution_model = require("../models/contribution.model");
const user_model = require("../models/user.model");

// Subject List fetcher
const getSubjects = async (req, res) => {
  try {
    const subjects = await subject_model.find();
    res.status(200).send(subjects);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch Subjects" });
    logger.error(`VIEWS | : Failed to fetch subjects: ${err}`);
  }
};

// Subject Files fetcher
const getSubjectFiles = async (req, res) => {
  try {
    const subject_files = await resource_model.find({ subject_code: req.params.subject_code, availability_status: "LIVE" });
    if (subject_files.length === 0) {
      return res.status(404).send({ error: "No Subjects found" });
    }
    res.status(200).send(subject_files);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch Subject Files" });
    logger.error(`VIEWS | : Failed to fetch subject files for ${req.params.subject_code}: ${err}`);
  }
};

// File Details fetcher
const getFileDetails = async (req, res) => {
  try {
    const file = await resource_model.findById(req.params.file_id);
    if (!file || file.availability_status !== "LIVE") {
      return res.status(404).send({ error: "File not found" });
    }
    res.status(200).send(file);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch file details" });
    logger.error(`VIEWS | : Failed to fetch file details for ${req.params.file_id}: ${err}`);
  }
};

// Pending Contributions fetcher
const getPendingContributions = async (req, res) => {
  try {
    const pending_contributions = await contribution_model.find({ contribution_status: "PENDING" }).populate("resource");
    res.status(200).send(pending_contributions);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch pending contributions" });
    logger.error(`VIEWS | ${req.user.user_type} | ${req.user.name} : Failed to fetch pending contributions: ${err}`);
  }
};

const getStats = async (req, res) => {
  let totalUsers = 0, totalSubjects = 0, totalResources = 0, totalContributions = 0;
  try {
    totalUsers = await user_model.countDocuments();
  } catch (err) {
    logger.error(`VIEWS | : Failed to fetch user statistics: ${err}`);
  }
  try {
    totalContributions = await contribution_model.countDocuments();
  } catch (err) {
    logger.error(`VIEWS | : Failed to fetch user statistics: ${err}`);
  }
  try {
    totalSubjects = await subject_model.countDocuments();
  } catch (err) {
    logger.error(`VIEWS | : Failed to fetch user statistics: ${err}`);
  }
  try {
    const subjects = await subject_model.find();
    totalResources = subjects.reduce((sum, subject) => sum + (subject.count || 0), 0);
  } catch (err) {
    logger.error(`VIEWS | : Failed to fetch resource statistics: ${err}`);
  }
  const response = [
    {
      name: "Registered Users",
      value: totalUsers-1
    },
    {
      name: "Subjects",
      value: totalSubjects-1
    },
    {
      name: "Resources",
      value: totalResources-1
    },
    {
      name: "Contributions made",
      value: totalContributions-1
    }
  ]
  res.status(201).send(response);
};

const getProfile = async (req, res) => {
  try {
    const user = await user_model.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    const contributions = await contribution_model.find({ contributer_id: req.user._id });
    const user_profile = {
      name : user.name,
      email : user.email,
      contributions : contributions
    }
    res.status(200).send(user_profile);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch user profile" });
    logger.error(`VIEWS | ${req.user.user_type} | ${req.user.name} : Failed to fetch user profile: ${err}`);
  }
}

module.exports = {
  getSubjects: getSubjects,
  getSubjectFiles: getSubjectFiles,
  getFileDetails: getFileDetails,
  getPendingContributions: getPendingContributions,
  getStats: getStats,
  getProfile: getProfile
};
