const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Get the database
    const db = mongoose.connection.db;

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Found ${collections.length} collections to delete:`);

    // Drop each collection
    for (let collection of collections) {
      await db.dropCollection(collection.name);
      console.log(`✓ Dropped collection: ${collection.name}`);
    }

    console.log("\n✓ All collections deleted successfully!");
    console.log("\nNow the server will create fresh collections when you restart it.\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing database:", error.message);
    process.exit(1);
  }
};

clearDatabase();
