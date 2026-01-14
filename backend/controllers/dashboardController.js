const User = require("../models/User");
const Batch = require("../models/Batch");
const StudentProfile = require("../models/StudentProfile");
const Fee = require("../models/Fee");

exports.getAdminStats = async (req, res) => {
  try {
    const studentsCount = await StudentProfile.countDocuments();
    const batchesCount = await Batch.countDocuments();

    const fees = await Fee.find();
    const totalFees = fees.reduce(
      (sum, f) => sum + (f.totalAmount || 0),
      0
    );
    const feesCollected = fees.reduce(
      (sum, f) => sum + (f.paidAmount || 0),
      0
    );
    const feesPending = totalFees - feesCollected;

    res.json({
      students: studentsCount,
      batches: batchesCount,
      totalFees,
      feesCollected,
      feesPending,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
