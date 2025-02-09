// Dependencies
const fs = require("fs");
const logger = require("../logger");

const validateUploadForm = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: "File is required!" });
    }
    if (req.file.mimetype !== "application/pdf") {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).send({ error: "Only PDF files are allowed!" });
    }
    if (!req.body.subject_code) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).send({ error: "Subject code is required!" });
    }
    if (!req.body.subject_name) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).send({ error: "Subject name is required!" });
    }
    if (!req.body.file_name) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).send({ error: "File name is required!" });
    }
    if (!req.body.description) {
      res.status(400).send({ error: "Description is required!" });
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return;
    }
    next();
  } catch (err) {
    res.status(500).send({ error: "Error validating upload form" });
  }
};

const resource_middleware = {
  validateUploadForm: validateUploadForm,
};

module.exports = resource_middleware;
