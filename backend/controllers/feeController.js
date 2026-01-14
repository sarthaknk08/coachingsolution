const Fee = require("../models/Fee");
const StudentProfile = require("../models/StudentProfile");

exports.assignFee = async (req, res) => {
  try {
    const { studentId, totalAmount, paidAmount } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "Student required" });
    }

    const student = await StudentProfile.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const total = Number(totalAmount);
    const paid = Number(paidAmount || 0);

    const status =
      paid >= total ? "paid" : paid > 0 ? "partial" : "pending";

    const fee = await Fee.create({
      student: studentId,
      totalAmount: total,
      paidAmount: paid,
      status,
    });

    const populatedFee = await Fee.findById(fee._id).populate({
      path: "student",
      populate: { path: "user", select: "name email" },
    });

    res.status(201).json(populatedFee);
  } catch (err) {
    console.error("FEE ERROR:", err);
    res.status(500).json({ message: "Failed to assign fee" });
  }
};

exports.getFees = async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeeByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const fee = await Fee.findOne({ student: studentId }).populate({
      path: "student",
      populate: { path: "user", select: "name email" },
    });

    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }

    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount, paidAmount } = req.body;

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }

    fee.totalAmount = Number(totalAmount) || fee.totalAmount;
    fee.paidAmount = Number(paidAmount) || fee.paidAmount;
    fee.status =
      fee.paidAmount >= fee.totalAmount
        ? "paid"
        : fee.paidAmount > 0
        ? "partial"
        : "pending";

    await fee.save();

    const updatedFee = await Fee.findById(fee._id).populate({
      path: "student",
      populate: { path: "user", select: "name email" },
    });

    res.json(updatedFee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFee = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findByIdAndDelete(id);
    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }

    res.json({ message: "Fee deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current student's fee (for student dashboard)
exports.getMyFee = async (req, res) => {
  try {
    const StudentProfile = require("../models/StudentProfile");
    const userId = req.user.id;

    // Find student profile for this user
    const studentProfile = await StudentProfile.findOne({ user: userId });
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Get fee for this student
    const fee = await Fee.findOne({ student: studentProfile._id }).populate({
      path: "student",
      populate: { path: "user", select: "name email" },
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee information not found",
      });
    }

    res.json({
      success: true,
      data: fee,
    });
  } catch (err) {
    console.error("GET MY FEE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
