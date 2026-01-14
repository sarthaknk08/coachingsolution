const Batch = require("../models/Batch");
const StudentProfile = require("../models/StudentProfile");

exports.createBatch = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const batch = await Batch.create({
      name: req.body.name,
      className: req.body.className,
      subjects: req.body.subjects || [],
      timing: req.body.timing,
      feeAmount: Number(req.body.feeAmount),
      createdBy: req.user._id,
    });

    res.status(201).json(batch);
  } catch (err) {
    console.error("BATCH ERROR:", err);
    res.status(500).json({ message: "Failed to create batch" });
  }
};

exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    
    // Get student count for each batch
    const batchesWithStudents = await Promise.all(
      batches.map(async (batch) => {
        const students = await StudentProfile.find({ batch: batch._id });
        return {
          ...batch.toObject(),
          students,
        };
      })
    );

    res.json(batchesWithStudents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const students = await StudentProfile.find({ batch: batch._id });

    res.json({
      ...batch.toObject(),
      students,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update batch
exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const students = await StudentProfile.find({ batch: batch._id });

    res.json({
      ...batch.toObject(),
      students,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update batch" });
  }
};

// Delete batch
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json({ message: "Batch deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete batch" });
  }
};
