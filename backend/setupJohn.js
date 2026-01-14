const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const StudentProfile = require("./models/StudentProfile");
const Batch = require("./models/Batch");
const Fee = require("./models/Fee");
const TestScore = require("./models/TestScore");
const Test = require("./models/Test");
const Announcement = require("./models/Announcement");

async function setupCurrentJohn() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find the currently logged-in John (john@gmail.com)
    const johnUser = await User.findOne({ email: "john@gmail.com" });
    if (!johnUser) {
      console.log("❌ Could not find john@gmail.com user");
      process.exit(1);
    }

    console.log("Found John user:", johnUser._id);
    console.log("John's current role:", johnUser.role);

    // Ensure role is student
    if (johnUser.role !== "student") {
      johnUser.role = "student";
      await johnUser.save();
      console.log("✓ Updated John's role to student");
    }

    // Create student profile for this John if doesn't exist
    let profile = await StudentProfile.findOne({ user: johnUser._id });
    if (!profile) {
      let batch = await Batch.findOne({ className: "10th" });
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

      profile = await StudentProfile.create({
        user: johnUser._id,
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
      console.log("✓ Created student profile:", profile._id);
    } else {
      console.log("✓ Student profile already exists:", profile._id);
    }

    // Create fees
    let fees = await Fee.findOne({ student: profile._id });
    if (!fees) {
      fees = await Fee.create({
        student: profile._id,
        totalAmount: 5000,
        paidAmount: 3300,
      });
      console.log("✓ Created fees");
    } else {
      console.log("✓ Fees already exist");
    }

    // Create test if doesn't exist
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
      console.log("✓ Created test");
    } else {
      console.log("✓ Test already exists");
    }

    // Create test score for this student
    let testScore = await TestScore.findOne({ student: profile._id });
    if (!testScore) {
      testScore = await TestScore.create({
        test: test._id,
        student: profile._id,
        marksObtained: 85,
        totalMarks: 100,
        rank: 5,
        feedback: "Good performance. Focus on geometry.",
        status: "passed",
      });
      console.log("✓ Created test score");
    } else {
      console.log("✓ Test score already exists");
    }

    // Ensure announcements are active
    const announcements = await Announcement.find({ isActive: true });
    if (announcements.length === 0) {
      console.log("⚠ No active announcements found. Creating...");
      await Announcement.updateMany({}, { isActive: true });
      console.log("✓ Activated all announcements");
    } else {
      console.log("✓ Active announcements found:", announcements.length);
    }

    console.log("\n✅ John (john@gmail.com) setup complete!");
    console.log("   Profile ID:", profile._id);
    console.log("   Can now access dashboard with test scores and announcements");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setupCurrentJohn();
