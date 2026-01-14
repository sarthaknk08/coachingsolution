const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: { type: String },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    subject: { type: String },
    totalMarks: {
      type: Number,
      required: true,
    },
    testDate: {
      type: Date,
      required: true,
    },
    resultDate: { type: Date },
    testType: {
      type: String,
      enum: ["unit-test", "half-yearly", "final", "mock", "practice"],
      default: "unit-test",
    },
    totalStudents: { type: Number, default: 0 },
    passedStudents: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    topperScore: { type: Number },
    lowestScore: { type: Number },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed"],
      default: "scheduled",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);
