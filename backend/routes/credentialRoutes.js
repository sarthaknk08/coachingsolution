const express = require("express");
const router = express.Router();
const {
  getAllParents,
  resetParentPassword,
  updateParentEmail,
  updateParentPhone,
  getAllStudents,
  resetStudentPassword,
  updateStudentEmail,
} = require("../controllers/credentialController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ============= PARENT CREDENTIALS (ADMIN ONLY) =============
router.get("/parents", protect, adminOnly, getAllParents);
router.put("/parent/reset-password", protect, adminOnly, resetParentPassword);
router.put("/parent/update-email", protect, adminOnly, updateParentEmail);
router.put("/parent/update-phone", protect, adminOnly, updateParentPhone);

// ============= STUDENT CREDENTIALS (ADMIN ONLY) =============
router.get("/students", protect, adminOnly, getAllStudents);
router.put("/student/reset-password", protect, adminOnly, resetStudentPassword);
router.put("/student/update-email", protect, adminOnly, updateStudentEmail);

module.exports = router;
