const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

// Import models
const User = require("./models/User");
const Batch = require("./models/Batch");
const StudentProfile = require("./models/StudentProfile");
const Fee = require("./models/Fee");
const TestScore = require("./models/TestScore");
const Test = require("./models/Test");
const Announcement = require("./models/Announcement");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB\n");

    // Check if admin exists
    const adminExists = await User.findOne({ email: "admin@coaching.com" });
    
    if (adminExists) {
      console.log("✓ Admin user already exists");
    } else {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin@123", salt);

      const admin = await User.create({
        name: "Admin User",
        email: "admin@coaching.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("✓ Admin user created:");
      console.log(`  Email: admin@coaching.com`);
      console.log(`  Password: Admin@123`);
      console.log(`  ID: ${admin._id}\n`);
    }

    // Create sample batches if they don't exist
    const batchCount = await Batch.countDocuments();
    if (batchCount === 0) {
      const admin = await User.findOne({ role: "admin" });
      
      const batches = await Batch.create([
        {
          name: "Class 10th - Stream A",
          className: "10th",
          subjects: ["Math", "Science", "English", "History"],
          timing: "4:00 PM - 6:00 PM",
          feeAmount: 5000,
          isActive: true,
          createdBy: admin._id,
        },
        {
          name: "Class 12th - Stream B",
          className: "12th",
          subjects: ["Math", "Physics", "Chemistry", "Biology"],
          timing: "6:30 PM - 8:30 PM",
          feeAmount: 7000,
          isActive: true,
          createdBy: admin._id,
        },
        {
          name: "Class 8th",
          className: "8th",
          subjects: ["Math", "Science", "English"],
          timing: "2:00 PM - 4:00 PM",
          feeAmount: 4000,
          isActive: true,
          createdBy: admin._id,
        },
      ]);

      console.log("✓ Sample batches created:");
      batches.forEach((batch) => {
        console.log(`  - ${batch.name}`);
      });
      console.log();
    } else {
      console.log(`✓ Batches already exist (${batchCount} found)\n`);
    }

    // Create sample student if doesn't exist
    const studentExists = await User.findOne({ email: "john@student.com" });
    let studentUser;
    
    if (studentExists && studentExists.role === "student") {
      console.log("✓ Sample student user already exists");
      studentUser = studentExists;
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Student@123", salt);
      
      studentUser = await User.create({
        name: "John",
        email: "john@student.com",
        password: hashedPassword,
        role: "student",
      });
      
      console.log("✓ Sample student user created:");
      console.log(`  Email: john@student.com`);
      console.log(`  Password: Student@123`);
    }

    // Create student profile if doesn't exist
    const studentProfileExists = await StudentProfile.findOne({ user: studentUser._id });
    let studentProfile;
    
    if (studentProfileExists) {
      console.log("✓ Sample student profile already exists\n");
      studentProfile = studentProfileExists;
    } else {
      const batch = await Batch.findOne({ className: "10th" });
      
      studentProfile = await StudentProfile.create({
        user: studentUser._id,
        rollNumber: "001",
        className: "12th +",
        batch: batch._id,
        parents: [],
      });
      
      console.log("✓ Sample student profile created\n");
    }

    // Create fees if doesn't exist
    const feesExists = await Fee.findOne({ student: studentProfile._id });
    if (!feesExists) {
      await Fee.create({
        student: studentProfile._id,
        totalAmount: 5000,
        paidAmount: 3300,
      });
      console.log("✓ Sample fees created\n");
    } else {
      console.log("✓ Sample fees already exist\n");
    }

    // Create sample test if doesn't exist
    const testExists = await Test.findOne({ name: "Maths Test" });
    let testDoc;
    
    if (testExists) {
      console.log("✓ Sample test already exists");
      testDoc = testExists;
    } else {
      const admin = await User.findOne({ role: "admin" });
      testDoc = await Test.create({
        name: "Maths Test",
        subject: "Mathematics",
        testDate: new Date(),
        totalMarks: 100,
        createdBy: admin._id,
      });
      console.log("✓ Sample test created");
    }

    // Create test score if doesn't exist
    const scoreExists = await TestScore.findOne({ student: studentProfile._id });
    if (!scoreExists) {
      await TestScore.create({
        test: testDoc._id,
        student: studentProfile._id,
        marksObtained: 85,
        totalMarks: 100,
        rank: 5,
        feedback: "Good performance. Focus on geometry.",
        status: "passed",
      });
      console.log("✓ Sample test score created\n");
    } else {
      console.log("✓ Sample test score already exists\n");
    }

    // Create sample announcements if don't exist
    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      const admin = await User.findOne({ role: "admin" });
      
      await Announcement.create([
        {
          title: "Monthly Test Schedule",
          message: "Monthly tests will be conducted every last Saturday of the month from 2 PM onwards.",
          audience: "all",
          type: "exam",
          priority: "high",
          createdBy: admin._id,
        },
        {
          title: "Holiday Notice",
          message: "The coaching center will be closed on National Holiday (26th January). Classes will resume from 27th January.",
          audience: "all",
          type: "holiday",
          priority: "medium",
          createdBy: admin._id,
        },
        {
          title: "Assignment Submission",
          message: "Please submit your assignments by Friday EOD.",
          audience: "students",
          type: "assignment",
          priority: "medium",
          createdBy: admin._id,
        },
        {
          title: "Fee Payment Reminder",
          message: "Please ensure that pending fees are paid by end of this month to avoid any issues.",
          audience: "parents",
          type: "notice",
          priority: "high",
          createdBy: admin._id,
        },
      ]);
      
      console.log("✓ Sample announcements created\n");
    } else {
      console.log(`✓ Announcements already exist (${announcementCount} found)\n`);
    }

    console.log("✅ Database seeding completed successfully!\n");
    console.log("📝 You can now login with:");
    console.log("   Email: admin@coaching.com");
    console.log("   Password: Admin@123\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
