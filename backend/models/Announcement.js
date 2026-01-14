const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Announcement message is required"],
      minlength: [5, "Message must be at least 5 characters"],
    },
    // Audience: who can see this announcement
    audience: {
      type: String,
      enum: ["all", "parents", "students", "batch"],
      default: "all",
      required: true,
    },
    // If audience is "batch", which batch
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },
    // Type of announcement for categorization
    type: {
      type: String,
      enum: ["holiday", "exam", "notice", "event", "assignment", "general"],
      default: "general",
    },
    // Priority level for UI highlighting
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    // Admin who created this
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Is this announcement active/visible
    isActive: {
      type: Boolean,
      default: true,
    },
    // Optional attachment
    attachmentUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
announcementSchema.index({ audience: 1, isActive: 1, createdAt: -1 });
announcementSchema.index({ batchId: 1, isActive: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);
