const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    auth0_user_id: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      immutable: true,
      index: true,
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
