// Dependencies
const logger = require("../logger");
const mongoose = require("mongoose");

// Database models
const subject_model = require("../models/subject.model");
const resource_model = require("../models/resource.model");
const contribution_model = require("../models/contribution.model");

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
    const pending_contributions = await contribution_model.find({ contribution_status: "PENDING" }).populate('resource');
    res.status(200).send(pending_contributions);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch pending contributions" });
    logger.error(`VIEWS | ${req.user.user_type} | ${req.user.name} : Failed to fetch pending contributions: ${err}`);
  }
};

module.exports = {
  getSubjects: getSubjects,
  getSubjectFiles: getSubjectFiles,
  getFileDetails: getFileDetails,
  getPendingContributions: getPendingContributions,
};
