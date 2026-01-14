const User = require("../models/User");

exports.getStudentUsers = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("_id name email")
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
