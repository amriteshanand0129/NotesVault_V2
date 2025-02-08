const mongoose = require("mongoose");

const resourceSchema = mongoose.Schema(
  {
    subject_code: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10,
      index: true,
    },
    subject_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    contributer_id: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
    },
    contribution_id: {
      type: String,
      trim: true,
    },
    contributer_name: {
      type: String,
      trim: true,
    },
    availability_status: {
      type: String,
      required: true,
      enum: ["PENDING", "LIVE", "ARCHIVED"],
    },
    file_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    file_size: {
      type: String,
      required: true,
    },
    file_address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Resources", resourceSchema);
