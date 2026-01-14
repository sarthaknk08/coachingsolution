const Announcement = require("../models/Announcement");
const Batch = require("../models/Batch");

// ============= ADMIN ONLY =============

/**
 * Create Announcement
 * Admin only
 */
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience, batchId, type, priority } = req.body;

    // Validation
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    // If audience is batch, validate batchId
    if (audience === "batch" && !batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required when audience is 'batch'",
      });
    }

    // Validate batchId exists if provided
    if (batchId) {
      const batch = await Batch.findById(batchId);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }
    }

    const announcementData = {
      title: title.trim(),
      message: message.trim(),
      audience,
      type: type || "general",
      priority: priority || "medium",
      createdBy: req.user._id,
      isActive: true,
    };

    // Only add batchId if audience is 'batch'
    if (audience === "batch" && batchId) {
      announcementData.batchId = batchId;
    }

    const announcement = await Announcement.create(announcementData);

    const populated = await Announcement.findById(announcement._id).populate(
      "createdBy",
      "name email"
    );

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: populated,
    });
  } catch (err) {
    console.error("ANNOUNCEMENT CREATE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
};

/**
 * Get all announcements for admin
 */
exports.getAnnouncementsAdmin = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("createdBy", "name email")
      .populate("batchId", "name className")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: announcements,
    });
  } catch (err) {
    console.error("ANNOUNCEMENT FETCH ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

/**
 * Update announcement
 */
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, audience, batchId, type, priority, isActive } =
      req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Validate if changing audience to batch
    if (audience === "batch" && !batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required when audience is 'batch'",
      });
    }

    // Validate batchId exists if provided
    if (batchId) {
      const batch = await Batch.findById(batchId);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }
    }

    // Update fields
    if (title) announcement.title = title.trim();
    if (message) announcement.message = message.trim();
    if (audience) announcement.audience = audience;
    if (type) announcement.type = type;
    if (priority) announcement.priority = priority;
    if (isActive !== undefined) announcement.isActive = isActive;

    // Update batchId based on audience
    announcement.batchId = audience === "batch" ? batchId : null;

    await announcement.save();

    const updated = await Announcement.findById(announcement._id)
      .populate("createdBy", "name email")
      .populate("batchId", "name className");

    res.json({
      success: true,
      message: "Announcement updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("ANNOUNCEMENT UPDATE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update announcement",
    });
  }
};

/**
 * Delete announcement
 */
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (err) {
    console.error("ANNOUNCEMENT DELETE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
};

// ============= PUBLIC (PARENTS & STUDENTS) =============

/**
 * Get announcements for parent
 * Parent can see announcements targeted to "parents" or "all"
 */
exports.getAnnouncementsParent = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      isActive: true,
      audience: { $in: ["parents", "all"] },
    })
      .populate("createdBy", "name")
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      data: announcements,
    });
  } catch (err) {
    console.error("ANNOUNCEMENT FETCH ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

/**
 * Get announcements for student
 * Student can see announcements targeted to "students" or "all"
 * If part of a batch, can also see batch-specific announcements
 */
exports.getAnnouncementsStudent = async (req, res) => {
  try {
    // Get student's batch from StudentProfile
    const StudentProfile = require("../models/StudentProfile");
    const student = await StudentProfile.findOne({ user: req.user._id });
    const studentBatchId = student?.batch || null;

    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { audience: "students" },
        { audience: "all" },
        { audience: "batch", batchId: studentBatchId },
      ],
    })
      .populate("createdBy", "name")
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      data: announcements,
    });
  } catch (err) {
    console.error("ANNOUNCEMENT FETCH ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

/**
 * Get announcements for a specific batch
 * Used by admin/student to see batch-specific announcements
 */
exports.getAnnouncementsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { audience: "all" },
        { audience: "batch", batchId },
        { audience: "students" },
        { audience: "parents" },
      ],
    })
      .populate("createdBy", "name")
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      data: announcements,
    });
  } catch (err) {
    console.error("ANNOUNCEMENT FETCH ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};
