const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const StudentProfile = require("./models/StudentProfile");
const Batch = require("./models/Batch");
const Fee = require("./models/Fee");
const Test = require("./models/Test");
const TestScore = require("./models/TestScore");
const Announcement = require("./models/Announcement");

async function addStudentData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create student user
    let studentUser = await User.findOne({ email: "john@student.com" });
    if (!studentUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Student@123", salt);
      studentUser = await User.create({
        name: "John",
        email: "john@student.com",
        password: hashedPassword,
        role: "student",
      });
      console.log("✓ Student user created, ID:", studentUser._id);
    } else {
      console.log("✓ Student user already exists, ID:", studentUser._id);
    }

    // Create student profile
    let studentProfile = await StudentProfile.findOne({ user: studentUser._id });
    if (!studentProfile) {
      let batch = await Batch.findOne({ className: "10th" });
      // If no batch exists, create one
      if (!batch) {
        const admin = await User.findOne({ role: "admin" });
        batch = await Batch.create({
          name: "Class 10th - Stream A",
          className: "10th",
          subjects: ["Math", "Science", "English"],
          timing: "4:00 PM - 6:00 PM",
          feeAmount: 5000,
          isActive: true,
          createdBy: admin._id,
        });
      }
      try {
        studentProfile = await StudentProfile.create({
          user: studentUser._id,
          rollNumber: "001",
          className: "12th +",
          batch: batch._id,
          parents: [],
          parentContact: "9876543210",
          dateOfBirth: new Date("2008-01-01"),
          bloodGroup: "O+",
          address: "123 Street",
          city: "Delhi",
          state: "Delhi",
          emergencyContact: "9876543210",
        });
        console.log("✓ Student profile created");
      } catch (err) {
        if (err.code === 11000) {
          // Duplicate key error - find by rollNumber instead
          studentProfile = await StudentProfile.findOne({ rollNumber: "001" });
          if (studentProfile) {
            console.log("✓ Student profile already exists");
          }
        } else {
          throw err;
        }
      }
    } else {
      console.log("✓ Student profile already exists");
    }

    // Create fees
    let fees = await Fee.findOne({ student: studentProfile._id });
    if (!fees) {
      fees = await Fee.create({
        student: studentProfile._id,
        totalAmount: 5000,
        paidAmount: 3300,
      });
      console.log("✓ Fees created");
    } else {
      console.log("✓ Fees already exist");
    }

    // Create test
    const admin = await User.findOne({ role: "admin" });
    const testBatch = await Batch.findOne({ className: "10th" });
    let test = await Test.findOne({ name: "Maths Test" });
    if (!test) {
      test = await Test.create({
        name: "Maths Test",
        subject: "Mathematics",
        testDate: new Date(),
        totalMarks: 100,
        batch: testBatch._id,
        createdBy: admin._id,
      });
      console.log("✓ Test created");
    } else {
      console.log("✓ Test already exists");
    }

    // Create test score
    let testScore = await TestScore.findOne({ student: studentProfile._id });
    if (!testScore) {
      try {
        testScore = await TestScore.create({
          test: test._id,
          student: studentProfile._id,
          marksObtained: 85,
          totalMarks: 100,
          rank: 5,
          feedback: "Good performance. Focus on geometry.",
          status: "passed",
        });
        console.log("✓ Test score created");
      } catch (err) {
        console.log("⚠ Test score creation failed:", err.message);
      }
    } else {
      console.log("✓ Test score already exists");
    }

    // Create announcements
    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      await Announcement.create([
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
      console.log("✓ Announcements created");
    } else {
      console.log("✓ Announcements already exist");
    }

    console.log("\n✅ All student data added successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addStudentData();
