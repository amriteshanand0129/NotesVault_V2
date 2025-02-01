// Dependencies
const fs = require("fs");
const path = require("path");
const logger = require("../logger");
const mongoose = require("mongoose");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { PDFDocument, StandardFonts, rgb, degrees } = require("pdf-lib");

// Database models
const user_model = require("../models/user.model");
const subject_model = require("../models/subject.model");
const resource_model = require("../models/resource.model");
const contribution_model = require("../models/contribution.model");

// Configuring AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Resource uploader to AWS S3
const uploadToS3 = async (file_name, file_path, file_type) => {
  const file_content = fs.readFileSync(file_path);

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file_name,
    Body: file_content,
    ContentType: file_type,
  };

  const command = new PutObjectCommand(params);
  const awsResponse = await s3.send(command);

  return {
    ...awsResponse,
    Location: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file_name}`,
  };
};

// File size calculator
const calculateFileSize = (file_size) => {
  let file_size_String = file_size;

  if (file_size < 1024) {
    file_size_String = Math.floor(file_size) + " B";
  } else if (file_size < 1048576) {
    file_size_String = Math.floor(file_size / 1024) + " KB";
  } else {
    file_size_String = Math.floor(file_size / 1048576) + " MB";
  }

  return file_size_String;
};

// Watermark applier
const applyWatermark = async (inputFilePath) => {
  const fontSize = 12;
  const color = rgb(0, 0, 1);
  const watermarkText = "NOTESVAULT: https://notesvault.onrender.com";

  const existingPdfBytes = fs.readFileSync(inputFilePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();

    page.drawText(watermarkText, {
      x: width / 2 - fontSize * (watermarkText.length / 4),
      y: 10,
      size: fontSize,
      font: font,
      color: color,
      rotate: degrees(0),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const outputFilePath = `${inputFilePath.replace(".pdf", "")}_watermarked.pdf`;

  fs.writeFileSync(outputFilePath, pdfBytes);

  return outputFilePath;
};

// Subject list updater
const addSubject = async (subject_code, subject_name) => {
  const subject = await subject_model.findOne({ subject_code: subject_code });
  if (!subject) {
    await subject_model.create({ subject_code: subject_code, subject_name: subject_name, count: 1 });
  } else {
    await subject_model.updateOne({ subject_code: subject_code }, { $inc: { count: 1 } });
  }
};

// Resource upload controller for both ADMIN and STUDENT
const uploadResource = async (req, res) => {
  let file_path = "",
    watermarkedFilePath = "";

  try {
    file_path = req.file.path;
    if (req.user.user_type == "ADMIN") {
      watermarkedFilePath = await applyWatermark(file_path);
      const file_size = calculateFileSize(fs.statSync(watermarkedFilePath).size);
      const awsResponse = await uploadToS3(req.file.filename, watermarkedFilePath, req.file.mimetype);
      const awsLocation = awsResponse.Location.replace(" ", "%20");

      const created = await resource_model.create({
        subject_code: req.body.subject_code,
        subject_name: req.body.subject_name,
        availability_status: "LIVE",
        file_name: req.body.file_name,
        description: req.body.description,
        file_size: file_size,
        file_address: awsLocation,
      });

      await addSubject(req.body.subject_code, req.body.subject_name);

      res.status(200).send({ message: "File uploaded successfully!" });
      logger.info(`<RESOURCE>: File uploaded successfully by ${req.user.user_type} ${req.user.name}: "${awsLocation}"`);
      return;
    } else if (req.user.user_type == "STUDENT") {
      const file_size = calculateFileSize(fs.statSync(file_path).size);
      const awsResponse = await uploadToS3(req.file.filename, file_path, req.file.mimetype);

      const contributionId = `${req.user._id}-${Date.now()}`;
      const contribution = await contribution_model.create({
        contributer_id: req.user._id,
        contribution_id: contributionId,
        contribution_status: "PENDING",
      });

      const created = await resource_model.create({
        subject_code: req.body.subject_code,
        subject_name: req.body.subject_name,
        contributer_id: req.user._id,
        contribution_id: contributionId,
        contributer_name: req.user.name,
        availability_status: "PENDING",
        file_name: req.body.file_name,
        description: req.body.description,
        file_size: file_size,
        file_address: awsResponse.Location,
      });

      res.status(200).send({ message: "File uploaded successfully! You can check the status of your contribution in the profile tab" });
      logger.info(`<RESOURCE>: File uploaded successfully by ${req.user.user_type} ${req.user.name}: ${awsResponse.Location}`);
      return;
    }
  } catch (err) {
    res.status(500).send({ error: "Failed to upload file" });
    logger.error(`<RESOURCE>: Failed to upload file by ${req.user.user_type} ${req.user.name}: ${err}`);
  } finally {
    if (fs.existsSync(file_path)) fs.unlinkSync(file_path);
    if (fs.existsSync(watermarkedFilePath)) fs.unlinkSync(watermarkedFilePath);
  }
};

// Accepting contribution controller for Admin
const acceptContribution = async (req, res) => {
  const user = req.user;
  try {
    const file = await pending_resource_model.findOne({ _id: req.body._id });
    const created = await resource_model.create({
      contributerId: file.contributerId,
      contributedBy: file.contributedBy,
      uploadedOn: file.createdAt,
      subject_code: req.body.subject_code,
      subject_name: req.body.subject_name,
      file_name: req.body.file_name,
      description: req.body.description,
      filebuffer: file.filebuffer,
      filesize: file.filesize,
    });
    try {
      const result = await approved_contributions_model.create({
        contributerId: created.contributerId,
        contributionId: created._id,
        status: true,
      });
    } catch (err) {
      console.log("Error while updating Approved Contributions list");
    }
    const result = await pending_resource_model.deleteOne({ _id: req.body._id });
    if (result.deletedCount == 1) {
      console.log("Pending Contribution List Updated");
    } else {
      console.log("Failed to update Pending Contribution List");
    }
    console.log("Contribution Accepted Successfully");
    res.status(201).send({
      message: "Contribution Accepted Successfully",
      redirectTo: "/",
    });
  } catch (err) {
    console.log("Error: Accepting Contribution Failed", err);
    res.status(401).send({
      error: "Error: Accepting Contribution Failed",
    });
  }
};

// Reject contribution controller for Admin
const rejectContribution = async (req, res) => {
  const user = req.user;
  try {
    const file = await pending_resource_model.findOne({ _id: req.body._id });
    const created = await rejected_contributions_model.create({
      contributerId: file.contributerId,
      uploadedOn: file.createdAt,
      subject_code: file.subject_code,
      subject_name: file.subject_name,
      file_name: file.file_name,
      description: file.description,
      remarks: req.body.remarks,
    });
    const result = await pending_resource_model.deleteOne({ _id: req.body._id });
    if (result.deletedCount == 1) {
      console.log("Pending Contribution List Updated");
    } else {
      console.log("Failed to update Pending Contribution List");
    }
    res.status(201).send({
      message: "Contribution Rejected",
    });
  } catch (err) {
    console.log("Error: Rejecting Contribution Failed", err);
    res.status(401).send({
      error: "Error: Rejecting Contribution Failed",
    });
  }
};

// Resource deletion controller for Admin
const deleteResource = async (req, res) => {
  const id = req.params.id;
  try {
    const file = await resource_model.findOne({ _id: id });
    const subjectname = file.subject_name;
    if (file.contributerId) {
      const idObject = new mongoose.Types.ObjectId(id);
      const updation = await approved_contributions_model.updateOne(
        { contributionId: idObject },
        {
          status: false,
          details: {
            subject_name: file.subject_name,
            subject_code: file.subject_code,
            file_name: file.file_name,
            description: file.description,
            uploadedOn: file.uploadedOn,
          },
        }
      );
      if (updation.modifiedCount == 1) {
        const result = await resource_model.deleteOne({ _id: id });
        if (result.deletedCount == 1) {
          res.status(201).send({
            message: "Resource Deleted",
            redirectTo: "/subject_catalog/subject/" + subjectname,
          });
        } else {
          await approved_contributions_model.updateOne(
            { contributionId: idObject },
            {
              status: true,
            }
          );
          console.log("Failed to delete Resource");
          res.status(501).send({
            error: "Failed to delete Resource",
          });
        }
      } else {
        console.log("Failed to modify Approved Contribution List");
        res.status(501).send({
          error: "Failed to modify Contribution List",
        });
      }
    } else {
      const result = await resource_model.deleteOne({ _id: id });
      if (result.deletedCount == 1) {
        console.log("Resource Deleted");
        res.status(201).send({
          message: "Resource Deleted",
          redirectTo: "/subject_catalog/subject/" + subjectname,
        });
      } else {
        console.log("Failed to delete Resource");
        res.status(501).send({
          error: "Failed to delete Resource",
        });
      }
    }
  } catch (error) {
    console.log("Failed to delete Resource", error);
    res.status(501).send({
      error: "Failed to delete Resource",
    });
  }
};

module.exports = {
  uploadResource: uploadResource,
  //   acceptContribution: acceptContribution,
  //   rejectContribution: rejectContribution,
  //   deleteResource: deleteResource,
};
