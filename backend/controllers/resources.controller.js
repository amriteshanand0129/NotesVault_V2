// Dependencies
const fs = require("fs");
const path = require("path");
const logger = require("../logger");
const mongoose = require("mongoose");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { PDFDocument, StandardFonts, rgb, degrees } = require("pdf-lib");

// Database models
const user_model = require("../models/user.model");
const subject_model = require("../models/subject.model");
const resource_model = require("../models/resource.model");
const contribution_model = require("../models/contribution.model");
const axios = require("axios");

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

    // ADMIN
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
      logger.info(`RESOURCE | ${req.user.user_type} | ${req.user.name} : File uploaded successfully : "${awsLocation}"`);
      return;
    }

    // STUDENT CONTRIBUTION
    else if (req.user.user_type == "STUDENT") {
      const file_size = calculateFileSize(fs.statSync(file_path).size);
      const awsResponse = await uploadToS3(req.file.filename, file_path, req.file.mimetype);

      const contributionId = `${req.user._id}-${Date.now()}`;

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

      const contribution = await contribution_model.create({
        contributer_id: req.user._id,
        contribution_id: contributionId,
        resource: created._id,
        contribution_status: "PENDING",
      });

      res.status(200).send({ message: "File uploaded successfully! You can check the status of your contribution in the profile tab" });
      logger.info(`RESOURCE | ${req.user.user_type} | ${req.user.name} : File contributed successfully: ${awsResponse.Location}`);
      return;
    }
  } catch (err) {
    res.status(500).send({ error: "Failed to upload file" });
    logger.error(`RESOURCE | ${req.user.user_type} | ${req.user.name} : Failed to contribute file : ${err}`);
  } finally {
    if (fs.existsSync(file_path)) fs.unlinkSync(file_path);
    if (fs.existsSync(watermarkedFilePath)) fs.unlinkSync(watermarkedFilePath);
  }
};

// Accepting contribution controller for Admin
const acceptContribution = async (req, res) => {
  let tempFilePath = "",
    watermarkedFilePath = "";
  try {
    const resource = await resource_model.findOne({ _id: req.body.resource_id });

    // Fetching, downloading and saving the file from S3
    const response = await axios.get(resource.file_address, { responseType: "arraybuffer" });
    const fileBuffer = Buffer.from(response.data, "binary");

    const tempFileName = `${Date.now()}-${resource.file_name}.pdf`;
    const tempFilePath = path.join("./uploads", tempFileName);
    fs.writeFileSync(tempFilePath, fileBuffer);

    const watermarkedFilePath = await applyWatermark(tempFilePath);

    const awsResponse = await uploadToS3(tempFileName, watermarkedFilePath, "application/pdf");

    // Deleting original contributed file from S3
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: path.basename(resource.file_address),
    };
    try {
      await s3.send(new DeleteObjectCommand(deleteParams));
    } catch (err) {
      logger.error(`RESOURCE | ${req.user.user_type} | ${req.user.name} : Failed to delete unwatermarked file ${resource.file_address} from S3 while accepting contribution ${resource.contribution_id}: ${err}`);
    }

    resource.subject_code = req.body.subject_code;
    resource.subject_name = req.body.subject_name;
    resource.file_name = req.body.file_name;
    resource.description = req.body.description;
    resource.file_size = calculateFileSize(fs.statSync(watermarkedFilePath).size);
    resource.file_address = awsResponse.Location;
    resource.availability_status = "LIVE";
    await resource.save();

    await addSubject(req.body.subject_code, req.body.subject_name);

    try {
      await contribution_model.updateOne({ contribution_id: req.body.contribution_id }, { contribution_status: "APPROVED" });
    } catch (err) {
      logger.error(`RESOURCE | ${req.user.user_type} | ${req.user.name} : Failed to update contribution status to APPROVED for contribution ${req.body.contribution_id}: ${err}`);
    }

    logger.info(`RESOURCE | ${req.user.user_type} | ${req.user.name} : Contribution ${req.body.contribution_id} accepted successfully`);
    res.status(201).send({ message: "Contribution Accepted Successfully" });
  } catch (err) {
    logger.error(`RESOURCE | ${req.user.user_type} | ${req.user.name} : Failed to accept contribution ${req.body.contribution_id}: ${err}`);
    res.status(401).send({
      error: "Failed to Accept Contribution",
    });
  } finally {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    if (fs.existsSync(watermarkedFilePath)) fs.unlinkSync(watermarkedFilePath);
  }
};

// Reject contribution controller for Admin
const rejectContribution = async (req, res) => {
  try {
    await resource_model.updateOne({ _id: req.body.resource_id }, { availability_status: "ARCHIVED" });
    await contribution_model.updateOne({ contribution_id: req.body.contribution_id }, { contribution_status: "REJECTED", remarks: req.body.remarks });

    logger.info(`RESOURCE | ${req.user.user_type} | ${req.user.name} : Contribution ${req.body.contribution_id} rejected successfully`);
    res.status(201).send({
      message: "Contribution Rejected Successfully",
    });
    return;
  } catch (err) {
    logger.error(`RESOURCE | ${req.user.user_type} | ${req.user.name} : Failed to reject contribution ${req.body.contribution_id}: ${err}`);
    res.status(401).send({
      error: "Failed to Reject Contribution",
    });
  }
};

// Deleting resource from S3
const deleteFromS3 = async (file) => {
  const file_address = file.file_address.replace("%20", " ");
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: path.basename(file_address),
  };
  try {
    const response = await s3.send(new DeleteObjectCommand(deleteParams));
  } catch (err) {
    logger.error(`RESOURCE | ${req.user.user_type} | ${req.user.name} : Failed to delete file ${file.file_address} from S3 while deleting resource ${file.contribution_id}: ${err}`);
  }
};

// Resource deletion controller for Admin
const deleteResource = async (req, res) => {
  const resource_id = req.params.id;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const file = await resource_model.findOne({ _id: resource_id }).session(session); 
    const subject_code = file.subject_code;
    if (file.contribution_id) {
      try {
        const updation = await contribution_model.updateOne(
          { contribution_id: file.contribution_id },
          {
            contribution_status: "DELETED",
          },
          { session }
        );
      } catch (err) {
        session.abortTransaction();
        session.endSession();
        logger.error(`RESOURCE | ${req.user.user_type} | ${req.user.name} : Failed to update contribution status to DELETED for contribution ${file.contribution_id}: ${err}`);
        return res.status(401).send({
          error: "Failed to delete Resource",
        });
      }
    }
    try {
      const updation = await resource_model.updateOne(
        { _id: resource_id },
        {
          availability_status: "ARCHIVED",
        },
        { session }
      );
    } catch (err) {
      session.abortTransaction();
      session.endSession();
      logger.error(`RESOURCE | ${req.user.user_type} | ${req.user.name} : Failed to update resource status to ARCHIVED with id: ${resource_id}: ${err}`);
      return res.status(401).send({
        error: "Failed to delete Resource",
      });
    }
    try {
      const subject = await subject_model.findOne({ subject_code: subject_code }).session(session);
      if (subject.count == 1) {
        const updation= await subject_model.deleteOne({ subject_code: subject_code }, { session });
      } else {
        const updation = await subject_model.updateOne(
          {
            subject_code: subject_code,
          },
          { $inc: { count: -1 } },
          { session }
        );
      }
    } catch (err) {
      session.abortTransaction();
      session.endSession();
      logger.error(`RESOURCE | ${req.user.user_type} | ${req.user.name} : Failed to update subject count for subject code: ${subject_code}: ${err}`);
      return res.status(401).send({
        error: "Failed to delete Resource",
      });
    }
    await session.commitTransaction();
    await session.endSession();
    res.status(200).send({
      message: "Resource Deleted Successfully",
    });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    logger.error(`RESOURCE | ${req.user.user_type} | ${req.user.name} : Failed to delete resource with id: ${resource_id}: ${error}`);
    res.status(501).send({
      error: "Failed to delete Resource",
    });
  }
};

module.exports = {
  uploadResource: uploadResource,
  acceptContribution: acceptContribution,
  rejectContribution: rejectContribution,
  deleteResource: deleteResource,
};
