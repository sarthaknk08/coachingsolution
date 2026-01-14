const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncementsAdmin,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementsParent,
  getAnnouncementsStudent,
  getAnnouncementsByBatch,
} = require("../controllers/announcementController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ============= ADMIN ONLY =============
router.post("/admin/create", protect, adminOnly, createAnnouncement);
router.get("/admin/all", protect, adminOnly, getAnnouncementsAdmin);
router.put("/admin/:id", protect, adminOnly, updateAnnouncement);
router.delete("/admin/:id", protect, adminOnly, deleteAnnouncement);

// ============= PUBLIC (PARENT & STUDENT) =============
router.get("/parent", protect, getAnnouncementsParent);
router.get("/my", protect, getAnnouncementsStudent); // For student dashboard
router.get("/student", protect, getAnnouncementsStudent);
router.get("/batch/:batchId", protect, getAnnouncementsByBatch);

module.exports = router;
