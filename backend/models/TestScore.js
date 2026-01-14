const mongoose = require("mongoose");

const testScoreSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: { type: Number },
    grade: { type: String },
    rank: { type: Number },
    feedback: { type: String },
    status: {
      type: String,
      enum: ["absent", "passed", "failed"],
      default: "passed",
    },
  },
  { timestamps: true }
);

// Calculate percentage and grade before saving
testScoreSchema.pre("save", async function() {
  try {
    if (this.marksObtained !== undefined && this.totalMarks) {
      this.percentage = (this.marksObtained / this.totalMarks) * 100;
      
      if (this.percentage >= 90) this.grade = "A+";
      else if (this.percentage >= 80) this.grade = "A";
      else if (this.percentage >= 70) this.grade = "B+";
      else if (this.percentage >= 60) this.grade = "B";
      else if (this.percentage >= 50) this.grade = "C";
      else this.grade = "F";
    }
  } catch (error) {
    console.error("Error in TestScore pre-save hook:", error);
    throw error;
  }
});

module.exports = mongoose.model("TestScore", testScoreSchema);
