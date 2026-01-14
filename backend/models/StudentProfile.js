const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },
    className: {
      type: String,
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    parents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parent",
      },
    ],
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    feesStatus: {
      type: String,
      enum: ["paid", "pending", "partial"],
      default: "pending",
    },
    parentContact: {
      type: String,
      required: true,
    },
    dateOfBirth: { type: Date },
    bloodGroup: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    emergencyContact: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
