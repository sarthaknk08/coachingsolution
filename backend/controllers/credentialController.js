const User = require("../models/User");
const Parent = require("../models/Parent");
const StudentProfile = require("../models/StudentProfile");
const bcrypt = require("bcryptjs");

/**
 * ============= PARENT CREDENTIAL MANAGEMENT =============
 */

/**
 * Get all parents with their info (no passwords)
 */
exports.getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find()
      .populate("user", "email phone")
      .populate("children", "user rollNumber className")
      .sort({ createdAt: -1 });

    // Remove password hashes from response
    const parentsList = parents.map((p) => ({
      _id: p._id,
      name: p.user?.name,
      email: p.user?.email,
      phone: p.phone,
      alternatePhone: p.alternatePhone,
      occupation: p.occupation,
      city: p.city,
      children: p.children,
      createdAt: p.createdAt,
    }));

    res.json({
      success: true,
      data: parentsList,
    });
  } catch (err) {
    console.error("GET PARENTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch parents",
    });
  }
};

/**
 * Reset parent password (auto-generate or admin-set)
 */
exports.resetParentPassword = async (req, res) => {
  try {
    const { parentId, newPassword } = req.body;

    // Validate input
    if (!parentId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Parent ID and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find parent
    const parent = await Parent.findById(parentId).populate("user");
    if (!parent || !parent.user) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    parent.user.password = hashedPassword;
    await parent.user.save();

    // Log the action (optional - for audit trail)
    console.log(`[AUDIT] Admin ${req.user._id} reset password for parent ${parentId}`);

    res.json({
      success: true,
      message: `Password reset successfully for ${parent.user.name}`,
    });
  } catch (err) {
    console.error("RESET PARENT PASSWORD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to reset parent password",
    });
  }
};

/**
 * Update parent email
 */
exports.updateParentEmail = async (req, res) => {
  try {
    const { parentId, newEmail } = req.body;

    // Validate input
    if (!parentId || !newEmail) {
      return res.status(400).json({
        success: false,
        message: "Parent ID and new email are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== parentId) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Find parent
    const parent = await Parent.findById(parentId).populate("user");
    if (!parent || !parent.user) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    // Update email
    const oldEmail = parent.user.email;
    parent.user.email = newEmail.toLowerCase();
    await parent.user.save();

    // Log the action
    console.log(
      `[AUDIT] Admin ${req.user._id} updated parent ${parentId} email from ${oldEmail} to ${newEmail}`
    );

    res.json({
      success: true,
      message: `Email updated successfully for ${parent.user.name}`,
      data: {
        parentId,
        name: parent.user.name,
        newEmail: parent.user.email,
      },
    });
  } catch (err) {
    console.error("UPDATE PARENT EMAIL ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update parent email",
    });
  }
};

/**
 * Update parent phone number
 */
exports.updateParentPhone = async (req, res) => {
  try {
    const { parentId, newPhone } = req.body;

    // Validate input
    if (!parentId || !newPhone) {
      return res.status(400).json({
        success: false,
        message: "Parent ID and new phone are required",
      });
    }

    // Validate phone format (basic: 10 digits)
    const phoneRegex = /^[0-9]{10,}$/;
    if (!phoneRegex.test(newPhone.replace(/\D/g, ""))) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // Check if phone already exists
    const existingParent = await Parent.findOne({ phone: newPhone });
    if (existingParent && existingParent._id.toString() !== parentId) {
      return res.status(409).json({
        success: false,
        message: "Phone number already in use",
      });
    }

    // Find parent
    const parent = await Parent.findById(parentId).populate("user");
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    // Update phone
    const oldPhone = parent.phone;
    parent.phone = newPhone;
    await parent.save();

    // Log the action
    console.log(
      `[AUDIT] Admin ${req.user._id} updated parent ${parentId} phone from ${oldPhone} to ${newPhone}`
    );

    res.json({
      success: true,
      message: `Phone number updated successfully for ${parent.user.name}`,
      data: {
        parentId,
        name: parent.user.name,
        newPhone: parent.phone,
      },
    });
  } catch (err) {
    console.error("UPDATE PARENT PHONE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update parent phone",
    });
  }
};

/**
 * ============= STUDENT CREDENTIAL MANAGEMENT =============
 */

/**
 * Get all students with their info (no passwords)
 */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .populate("user", "name email")
      .populate("batch", "name className")
      .sort({ createdAt: -1 });

    // Remove sensitive data
    const studentsList = students.map((s) => ({
      _id: s._id,
      userId: s.user?._id,
      name: s.user?.name,
      email: s.user?.email,
      rollNumber: s.rollNumber,
      className: s.className,
      batch: s.batch,
      parentContact: s.parentContact,
      createdAt: s.createdAt,
    }));

    res.json({
      success: true,
      data: studentsList,
    });
  } catch (err) {
    console.error("GET STUDENTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: err.message,
    });
  }
};

/**
 * Reset student password
 */
exports.resetStudentPassword = async (req, res) => {
  try {
    const { studentId, newPassword } = req.body;

    // Validate input
    if (!studentId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Student ID and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find student
    const student = await StudentProfile.findById(studentId).populate("user");
    if (!student || !student.user) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    student.user.password = hashedPassword;
    await student.user.save();

    // Log the action
    console.log(
      `[AUDIT] Admin ${req.user._id} reset password for student ${studentId}`
    );

    res.json({
      success: true,
      message: `Password reset successfully for ${student.user.name}`,
    });
  } catch (err) {
    console.error("RESET STUDENT PASSWORD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to reset student password",
    });
  }
};

/**
 * Update student email
 */
exports.updateStudentEmail = async (req, res) => {
  try {
    const { studentId, newEmail } = req.body;

    // Validate input
    if (!studentId || !newEmail) {
      return res.status(400).json({
        success: false,
        message: "Student ID and new email are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== studentId) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Find student
    const student = await StudentProfile.findById(studentId).populate("user");
    if (!student || !student.user) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Update email
    const oldEmail = student.user.email;
    student.user.email = newEmail.toLowerCase();
    await student.user.save();

    // Log the action
    console.log(
      `[AUDIT] Admin ${req.user._id} updated student ${studentId} email from ${oldEmail} to ${newEmail}`
    );

    res.json({
      success: true,
      message: `Email updated successfully for ${student.user.name}`,
      data: {
        studentId,
        name: student.user.name,
        newEmail: student.user.email,
      },
    });
  } catch (err) {
    console.error("UPDATE STUDENT EMAIL ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update student email",
    });
  }
};
