const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");
const Fee = require("../models/Fee");
const Parent = require("../models/Parent");
const bcrypt = require("bcryptjs");

exports.createStudentProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      className,
      batch,
      parentContact,
      dateOfBirth,
      bloodGroup,
      address,
      city,
      state,
      emergencyContact,
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if roll number already exists
    const existingStudent = await StudentProfile.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: "Roll number already exists" });
    }

    // Create user first
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    // Create student profile
    const student = await StudentProfile.create({
      user: user._id,
      rollNumber,
      className,
      batch,
      parentContact,
      dateOfBirth,
      bloodGroup,
      address,
      city,
      state,
      emergencyContact,
    });

    const populatedStudent = await StudentProfile.findById(student._id)
      .populate("user", "name email")
      .populate("batch")
      .populate("parents");

    res.status(201).json(populatedStudent);
  } catch (err) {
    console.error("STUDENT CREATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .populate("user", "name email")
      .populate("batch")
      .populate("parents")
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (err) {
    console.error("STUDENT GET ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const student = await StudentProfile.findOne({ user: userId })
      .populate("user", "name email")
      .populate("batch")
      .populate("parents");

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Also fetch their fees
    const fees = await Fee.findOne({ student: student._id });

    const studentWithFees = {
      ...student.toObject(),
      fees,
    };

    res.json(studentWithFees);
  } catch (err) {
    console.error("STUDENT BY USER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rollNumber,
      className,
      batch,
      parentContact,
      dateOfBirth,
      bloodGroup,
      address,
      city,
      state,
      emergencyContact,
    } = req.body;

    const student = await StudentProfile.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if new roll number is unique
    if (rollNumber && rollNumber !== student.rollNumber) {
      const existing = await StudentProfile.findOne({ rollNumber });
      if (existing) {
        return res.status(400).json({ message: "Roll number already exists" });
      }
    }

    student.rollNumber = rollNumber || student.rollNumber;
    student.className = className || student.className;
    student.batch = batch || student.batch;
    student.parentContact = parentContact || student.parentContact;
    student.dateOfBirth = dateOfBirth || student.dateOfBirth;
    student.bloodGroup = bloodGroup || student.bloodGroup;
    student.address = address || student.address;
    student.city = city || student.city;
    student.state = state || student.state;
    student.emergencyContact = emergencyContact || student.emergencyContact;

    await student.save();

    const updatedStudent = await StudentProfile.findById(student._id)
      .populate("user", "name email")
      .populate("batch")
      .populate("parents");

    res.json(updatedStudent);
  } catch (err) {
    console.error("STUDENT UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await StudentProfile.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const userId = student.user;

    // Delete associated fees
    await Fee.deleteMany({ student: id });

    // Remove from parent records
    await Parent.updateMany({ children: id }, { $pull: { children: id } });

    // Delete student profile
    await StudentProfile.findByIdAndDelete(id);

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("STUDENT DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get current student's profile (for student dashboard)
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await StudentProfile.findOne({ user: userId })
      .populate("user", "name email mobileNumber")
      .populate("batch");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (err) {
    console.error("GET STUDENT PROFILE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
