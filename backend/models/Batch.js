const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    className: { type: String, required: true },
    subjects: [{ type: String }],
    timing: { type: String },
    feeAmount: { type: Number },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Batch", batchSchema);
