const mongoose = require("mongoose");

const contributionSchema = mongoose.Schema(
  {
    contributer_id: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      required: true,
      ref: "Users",
    },
    contribution_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Resources",
    },
    contribution_status: {
      type: String,
      default: "PENDING",
      enum: ["PENDING", "APPROVED", "REJECTED", "DELETED"],
      required: true,
    },
    remarks: {
      type: String,
      maxlength: 200,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Contributions", contributionSchema);
