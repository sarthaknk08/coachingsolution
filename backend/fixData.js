const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const Announcement = require("./models/Announcement");
const TestScore = require("./models/TestScore");
const Test = require("./models/Test");
const StudentProfile = require("./models/StudentProfile");
const User = require("./models/User");

async function fixData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get the student
    const studentUser = await User.findOne({ email: "john@student.com" });
    if (!studentUser) {
      console.log("Student user not found");
      process.exit(1);
    }

    const student = await StudentProfile.findOne({ user: studentUser._id });
    if (!student) {
      console.log("Student profile not found");
      process.exit(1);
    }

    // Delete and recreate test scores
    await TestScore.deleteMany({ student: student._id });
    console.log("✓ Deleted existing test scores");

    // Get the test
    const test = await Test.findOne({ name: "Maths Test" });
    if (test) {
      const newScore = await TestScore.create({
        test: test._id,
        student: student._id,
        marksObtained: 85,
        totalMarks: 100,
        rank: 5,
        feedback: "Good performance. Focus on geometry.",
        status: "passed",
      });
      console.log("✓ Test score recreated:", newScore._id);
    }

    // Delete and recreate announcements
    await Announcement.deleteMany({});
    console.log("✓ Deleted existing announcements");

    const admin = await User.findOne({ role: "admin" });
    const newAnnouncements = await Announcement.create([
      {
        title: "Monthly Test Schedule",
        message: "Monthly tests will be conducted every last Saturday of the month from 2 PM onwards.",
        audience: "all",
        type: "exam",
        priority: "high",
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: "Holiday Notice",
        message: "The coaching center will be closed on National Holiday (26th January). Classes will resume from 27th January.",
        audience: "all",
        type: "holiday",
        priority: "medium",
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: "Assignment Submission",
        message: "Please submit your assignments by Friday EOD.",
        audience: "students",
        type: "assignment",
        priority: "medium",
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: "Fee Payment Reminder",
        message: "Please ensure that pending fees are paid by end of this month to avoid any issues.",
        audience: "parents",
        type: "notice",
        priority: "high",
        isActive: true,
        createdBy: admin._id,
      },
    ]);
    console.log("✓ Announcements recreated:", newAnnouncements.length);

    console.log("\n✅ Data fixed successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixData();
