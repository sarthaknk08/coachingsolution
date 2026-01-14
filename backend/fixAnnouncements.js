const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const Announcement = require("./models/Announcement");
const User = require("./models/User");

async function fixAnnouncements() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Set all announcements to isActive = true
    await Announcement.updateMany({}, { isActive: true });
    console.log("✓ All announcements set to isActive=true");

    const admin = await User.findOne({ role: "admin" });

    // Get current announcements
    const currentAnnounc = await Announcement.find({});
    console.log("Current announcements:", currentAnnounc.length);
    currentAnnounc.forEach(a => {
      console.log(`  - ${a.title} (audience: ${a.audience}, active: ${a.isActive})`);
    });

    // Delete all and recreate
    await Announcement.deleteMany({});
    console.log("✓ Cleared all announcements");

    const newAnnounc = await Announcement.create([
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

    console.log("✓ Created " + newAnnounc.length + " announcements");
    newAnnounc.forEach(a => {
      console.log(`  - ${a.title} (audience: ${a.audience})`);
    });

    console.log("\n✅ Announcements fixed!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixAnnouncements();
