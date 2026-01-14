const mongoose = require("mongoose");

const coachingConfigSchema = new mongoose.Schema(
  {
    coachingName: {
      type: String,
      default: "Coaching CMS",
      required: true,
    },
    coachingLogo: {
      type: String, // URL or base64 data
      default: null,
    },
    coachingDescription: {
      type: String,
      default: "Manage Your Institute Efficiently",
    },
    databaseUrl: {
      type: String,
      select: false, // Don't return by default for security
    },
    primaryColor: {
      type: String,
      default: "#2563eb", // Blue
    },
    secondaryColor: {
      type: String,
      default: "#1e40af", // Dark Blue
    },
    contactEmail: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Create singleton pattern - only one coaching config per instance
coachingConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model("CoachingConfig", coachingConfigSchema);
