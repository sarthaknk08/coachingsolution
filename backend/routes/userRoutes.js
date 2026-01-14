const express = require("express");
const router = express.Router();
const { getStudentUsers } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/students", protect, adminOnly, getStudentUsers);

module.exports = router;
