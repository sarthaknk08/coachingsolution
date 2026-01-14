const express = require("express");
const router = express.Router();
const {
  createStudentProfile,
  getStudents,
  getStudentByUserId,
  updateStudent,
  deleteStudent,
  getMyProfile,
} = require("../controllers/studentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Student routes
router.get("/profile", protect, getMyProfile); // Get current student's profile
router.post("/", protect, adminOnly, createStudentProfile);
router.get("/", protect, adminOnly, getStudents);
router.get("/user/:userId", protect, getStudentByUserId);
router.put("/:id", protect, adminOnly, updateStudent);
router.delete("/:id", protect, adminOnly, deleteStudent);

module.exports = router;
