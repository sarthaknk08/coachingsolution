const express = require("express");
const router = express.Router();
const {
  getCoachingConfig,
  updateCoachingDetails,
  updateCoachingLogo,
  updateDatabaseConfig,
  getDatabaseConfig,
} = require("../controllers/coachingConfigController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public route - get coaching config
router.get("/config", getCoachingConfig);

// Admin routes
router.put("/details", protect, adminOnly, updateCoachingDetails);
router.put("/logo", protect, adminOnly, updateCoachingLogo);
router.put("/database", protect, adminOnly, updateDatabaseConfig);
router.get("/database", protect, adminOnly, getDatabaseConfig);

module.exports = router;
