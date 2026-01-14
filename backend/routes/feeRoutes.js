const express = require("express");
const router = express.Router();
const {
  assignFee,
  getFees,
  getFeeByStudent,
  getMyFee,
  updateFee,
  deleteFee,
} = require("../controllers/feeController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, adminOnly, assignFee);
router.get("/", protect, adminOnly, getFees);
router.get("/my-fees", protect, getMyFee); // Get current student's fee
router.get("/student/:studentId", protect, getFeeByStudent);
router.put("/:id", protect, adminOnly, updateFee);
router.delete("/:id", protect, adminOnly, deleteFee);

module.exports = router;

