const express = require("express");
const router = express.Router();
const { getAdminStats } = require("../controllers/dashboardController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/admin", protect, adminOnly, getAdminStats);

module.exports = router;
