const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    user_type: {
      type: String,
      immutable: true,
      default: "STUDENT",
      enum: ["STUDENT", "ADMIN"],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Users", userSchema);
