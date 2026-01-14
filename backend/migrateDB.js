const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const CoachingConfig = require("./models/CoachingConfig");

const connectDB = require("./config/db");

async function migrateDatabase() {
  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log("\n=== DATABASE MIGRATION STARTED ===\n");

    // 1. Remove and recreate the phone index
    console.log("1. Fixing phone index issue...");
    try {
      await User.collection.dropIndex("phone_1");
      console.log("   ✓ Dropped old phone index");
    } catch (e) {
      console.log("   Note: Index may not exist yet");
    }

    // Recreate index with sparse=true to allow multiple nulls
    await User.collection.createIndex({ phone: 1 }, { sparse: true, unique: true });
    console.log("   ✓ Created sparse unique phone index");

    // 2. Clear null/undefined phone values
    console.log("\n2. Clearing null phone values...");
    const result = await User.updateMany(
      { $or: [{ phone: null }, { phone: "" }, { phone: undefined }] },
      { $unset: { phone: "" } }
    );
    console.log(`   ✓ Cleared phone values for ${result.modifiedCount} users`);

    // 3. Ensure CoachingConfig exists
    console.log("\n3. Checking CoachingConfig collection...");
    let coachingConfig = await CoachingConfig.findOne();

    if (!coachingConfig) {
      console.log("   No coaching config found, creating default...");
      coachingConfig = await CoachingConfig.create({
        coachingName: "Coaching CMS",
        coachingDescription: "Manage Your Institute Efficiently",
        primaryColor: "#2563eb",
        secondaryColor: "#1e40af",
      });
      console.log("   ✓ Created default CoachingConfig");
    } else {
      console.log("   ✓ CoachingConfig already exists");
    }

    // 4. Display current stats
    console.log("\n4. Database Statistics:");
    const userCount = await User.countDocuments();
    const parentCount = await User.countDocuments({ role: "parent" });
    const adminCount = await User.countDocuments({ role: "admin" });
    const studentCount = await User.countDocuments({ role: "student" });

    console.log(`   Total Users: ${userCount}`);
    console.log(`   - Admins: ${adminCount}`);
    console.log(`   - Parents: ${parentCount}`);
    console.log(`   - Students: ${studentCount}`);

    console.log("\n   Current Coaching Config:");
    console.log(`   - Name: ${coachingConfig.coachingName}`);
    console.log(`   - Primary Color: ${coachingConfig.primaryColor}`);
    console.log(`   - Secondary Color: ${coachingConfig.secondaryColor}`);

    console.log("\n=== DATABASE MIGRATION COMPLETED SUCCESSFULLY ===\n");
    process.exit(0);
  } catch (error) {
    console.error("Migration Error:", error.message);
    process.exit(1);
  }
}

migrateDatabase();
