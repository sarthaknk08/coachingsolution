const express = require("express");
const router = express.Router();
const {
  createTest,
  getTests,
  getTestsByBatch,
  getTestsByBatchForStudent,
  updateTest,
  deleteTest,
  addTestScore,
  getTestScores,
  getStudentTestScores,
  getMyTestScores,
  deleteTestScore,
  getTestAnalytics,
} = require("../controllers/testController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Test scores - MUST come before generic /:id routes
router.post("/score/add", protect, adminOnly, addTestScore);
router.get("/scores/:testId", protect, adminOnly, getTestScores);
router.get("/my-marks", protect, getMyTestScores); // Get current student's marks
router.get("/my-batch", protect, getTestsByBatchForStudent); // Get tests for student's batch
router.get("/student/:studentId", protect, getStudentTestScores);
router.delete("/score/:id", protect, adminOnly, deleteTestScore);

// Test management - specific routes before generic routes
router.get("/batch/:batchId", protect, getTestsByBatch);
router.get("/analytics/:testId", protect, getTestAnalytics);

// Generic test routes
router.post("/", protect, adminOnly, createTest);
router.get("/", protect, adminOnly, getTests);
router.put("/:id", protect, adminOnly, updateTest);
router.delete("/:id", protect, adminOnly, deleteTest);

module.exports = router;
