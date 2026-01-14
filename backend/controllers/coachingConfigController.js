const CoachingConfig = require("../models/CoachingConfig");
const fs = require("fs");
const path = require("path");

/**
 * Get coaching configuration (public - no auth required)
 */
exports.getCoachingConfig = async (req, res) => {
  try {
    const config = await CoachingConfig.getConfig();

    res.json({
      success: true,
      data: {
        coachingName: config.coachingName,
        coachingLogo: config.coachingLogo,
        coachingDescription: config.coachingDescription,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        contactEmail: config.contactEmail,
        contactPhone: config.contactPhone,
        address: config.address,
        city: config.city,
        state: config.state,
      },
    });
  } catch (err) {
    console.error("GET COACHING CONFIG ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coaching configuration",
    });
  }
};

/**
 * Update coaching details (admin only)
 */
exports.updateCoachingDetails = async (req, res) => {
  try {
    console.log("UPDATE COACHING DETAILS - Request body:", req.body);
    console.log("UPDATE COACHING DETAILS - User ID:", req.user?.id);

    const {
      coachingName,
      coachingDescription,
      primaryColor,
      secondaryColor,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
    } = req.body;

    // Validate required field
    if (!coachingName || coachingName.trim() === "") {
      console.log("UPDATE COACHING DETAILS - Validation failed: coachingName is required");
      return res.status(400).json({
        success: false,
        message: "Coaching name is required",
      });
    }

    // Build update object only with provided values
    const updateData = {};
    if (coachingName !== undefined && coachingName !== null) updateData.coachingName = coachingName.trim();
    if (coachingDescription !== undefined && coachingDescription !== null) updateData.coachingDescription = coachingDescription.trim();
    if (primaryColor !== undefined && primaryColor !== null) updateData.primaryColor = primaryColor;
    if (secondaryColor !== undefined && secondaryColor !== null) updateData.secondaryColor = secondaryColor;
    if (contactEmail !== undefined && contactEmail !== null) updateData.contactEmail = contactEmail.trim();
    if (contactPhone !== undefined && contactPhone !== null) updateData.contactPhone = contactPhone.trim();
    if (address !== undefined && address !== null) updateData.address = address.trim();
    if (city !== undefined && city !== null) updateData.city = city.trim();
    if (state !== undefined && state !== null) updateData.state = state.trim();

    console.log("UPDATE COACHING DETAILS - Update data to apply:", updateData);

    let config = await CoachingConfig.getConfig();
    console.log("UPDATE COACHING DETAILS - Config found, ID:", config._id);

    // Update only the fields that were provided
    Object.assign(config, updateData);
    console.log("UPDATE COACHING DETAILS - After Object.assign, coachingName:", config.coachingName);

    const savedConfig = await config.save();
    console.log("UPDATE COACHING DETAILS - Successfully saved, new coachingName:", savedConfig.coachingName);

    res.json({
      success: true,
      message: "Coaching details updated successfully",
      data: {
        coachingName: savedConfig.coachingName,
        coachingLogo: savedConfig.coachingLogo,
        coachingDescription: savedConfig.coachingDescription,
        primaryColor: savedConfig.primaryColor,
        secondaryColor: savedConfig.secondaryColor,
        contactEmail: savedConfig.contactEmail,
        contactPhone: savedConfig.contactPhone,
        address: savedConfig.address,
        city: savedConfig.city,
        state: savedConfig.state,
      },
    });
  } catch (err) {
    console.error("UPDATE COACHING DETAILS ERROR - Full error:", err);
    console.error("UPDATE COACHING DETAILS ERROR - Message:", err.message);
    console.error("UPDATE COACHING DETAILS ERROR - Stack:", err.stack);
    
    res.status(500).json({
      success: false,
      message: "Failed to update coaching details: " + err.message,
      error: process.env.NODE_ENV === "development" ? err.toString() : undefined,
    });
  }
};

/**
 * Update coaching logo
 */
exports.updateCoachingLogo = async (req, res) => {
  try {
    const { logoData } = req.body; // Base64 encoded image

    console.log("UPDATE COACHING LOGO - Received request");
    console.log("UPDATE COACHING LOGO - Logo data size:", logoData ? logoData.length : 0, "bytes");

    if (!logoData) {
      console.log("UPDATE COACHING LOGO - Error: No logo data provided");
      return res.status(400).json({
        success: false,
        message: "Logo data is required",
      });
    }

    // Check size - limit to 5MB
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (logoData.length > maxSizeBytes) {
      console.log("UPDATE COACHING LOGO - Error: Logo too large", logoData.length, "bytes");
      return res.status(400).json({
        success: false,
        message: "Logo file is too large. Maximum size is 5MB.",
      });
    }

    let config = await CoachingConfig.getConfig();
    console.log("UPDATE COACHING LOGO - Config found, updating logo");

    config.coachingLogo = logoData; // Store as base64
    const savedConfig = await config.save();

    console.log("UPDATE COACHING LOGO - Logo updated successfully");

    res.json({
      success: true,
      message: "Coaching logo updated successfully",
      data: {
        coachingName: savedConfig.coachingName,
        coachingLogo: savedConfig.coachingLogo,
        coachingDescription: savedConfig.coachingDescription,
        primaryColor: savedConfig.primaryColor,
        secondaryColor: savedConfig.secondaryColor,
        contactEmail: savedConfig.contactEmail,
        contactPhone: savedConfig.contactPhone,
        address: savedConfig.address,
        city: savedConfig.city,
        state: savedConfig.state,
      },
    });
  } catch (err) {
    console.error("UPDATE COACHING LOGO ERROR - Full error:", err);
    console.error("UPDATE COACHING LOGO ERROR - Message:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to update coaching logo: " + err.message,
    });
  }
};

/**
 * Update database configuration (admin only)
 */
exports.updateDatabaseConfig = async (req, res) => {
  try {
    const { databaseUrl } = req.body;

    if (!databaseUrl) {
      return res.status(400).json({
        success: false,
        message: "Database URL is required",
      });
    }

    // Validate MongoDB connection string format
    if (
      !databaseUrl.startsWith("mongodb://") &&
      !databaseUrl.startsWith("mongodb+srv://")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid MongoDB connection string format",
      });
    }

    let config = await CoachingConfig.getConfig();
    config.databaseUrl = databaseUrl;
    await config.save();

    // Update backend .env file
    try {
      const envPath = path.join(__dirname, "../../.env");
      let envContent = fs.readFileSync(envPath, "utf8");

      // Replace MONGO_URI or add it
      if (envContent.includes("MONGO_URI=")) {
        envContent = envContent.replace(
          /MONGO_URI=.*/,
          `MONGO_URI=${databaseUrl}`
        );
      } else {
        envContent += `\nMONGO_URI=${databaseUrl}`;
      }

      fs.writeFileSync(envPath, envContent);
    } catch (fileErr) {
      console.warn("Could not update .env file:", fileErr.message);
      // Continue even if file update fails - config is still saved in DB
    }

    res.json({
      success: true,
      message: "Database configuration updated successfully. Server restart may be required for full effect.",
      data: {
        message: "Database URL updated",
      },
    });
  } catch (err) {
    console.error("UPDATE DATABASE CONFIG ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update database configuration",
    });
  }
};

/**
 * Get database configuration (admin only)
 */
exports.getDatabaseConfig = async (req, res) => {
  try {
    const config = await CoachingConfig.findOne().select("+databaseUrl");

    res.json({
      success: true,
      data: {
        databaseUrl: config?.databaseUrl || process.env.MONGO_URI || "",
      },
    });
  } catch (err) {
    console.error("GET DATABASE CONFIG ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch database configuration",
    });
  }
};
