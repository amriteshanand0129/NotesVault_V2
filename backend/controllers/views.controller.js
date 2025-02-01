// Dependencies
const logger = require("../logger");
const mongoose = require("mongoose");

// Database models
const subject_model = require("../models/subject.model");
const resource_model = require("../models/resource.model");

// Subject List fetcher
const getSubjects = async (req, res) => {
  try {
    const subjects = await subject_model.find();
    res.status(200).send(subjects);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch Subjects" });
    logger.error(`<VIEWS>: Failed to fetch subjects: ${err}`);
  }
};

// Subject Files fetcher
const getSubjectFiles = async (req, res) => {
  try {
    const subject_files = await resource_model.find({ subject_code: req.params.subject_code });
    if (subject_files.length === 0) {
      return res.status(404).send({ error: "No Subjects found" });
    }
    res.status(200).send(subject);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch Subject Files" });
    logger.error(`<VIEWS>: Failed to fetch subject files for ${req.params.subject_code}: ${err}`);
  }
};

module.exports = {
  getSubjects: getSubjects,
  getSubjectFiles: getSubjectFiles,
};
