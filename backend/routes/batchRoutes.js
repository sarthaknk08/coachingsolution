const express = require("express");
const router = express.Router();
const {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
} = require("../controllers/batchController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, getBatches);
router.get("/:id", protect, getBatchById);
router.post("/", protect, adminOnly, createBatch);
router.put("/:id", protect, adminOnly, updateBatch);
router.delete("/:id", protect, adminOnly, deleteBatch);

module.exports = router;

