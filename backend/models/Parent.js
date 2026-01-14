const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phone: { type: String },
    alternatePhone: { type: String },
    occupation: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentProfile",
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Parent", parentSchema);
