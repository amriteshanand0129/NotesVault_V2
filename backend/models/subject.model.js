const mongoose = require("mongoose");

const subjectSchema = mongoose.Schema(
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
    count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Subjects", subjectSchema);
