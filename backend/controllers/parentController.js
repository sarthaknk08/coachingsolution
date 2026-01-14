const Parent = require("../models/Parent");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const bcrypt = require("bcryptjs");

// Create or link parent
exports.createParent = async (req, res) => {
  try {
    const { name, email, phone, alternatePhone, occupation, address, city, state, childrenIds } = req.body;

    // If no userId provided, create user first
    let userId = req.body.userId;
    
    if (!userId) {
      // Create new user account for parent
      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required to create parent" });
      }

      // Check if email already exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Generate default password (Parent@123) with hashing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Parent@123", salt);
      
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "parent",
      });
      userId = user._id;
    } else {
      // Validate existing user
      const user = await User.findById(userId);
      if (!user || user.role !== "parent") {
        return res.status(400).json({ message: "Invalid parent user" });
      }
    }

    let parent = await Parent.findOne({ user: userId });

    if (parent) {
      // Update existing
      parent.phone = phone || parent.phone;
      parent.alternatePhone = alternatePhone || parent.alternatePhone;
      parent.occupation = occupation || parent.occupation;
      parent.address = address || parent.address;
      parent.city = city || parent.city;
      parent.state = state || parent.state;
      if (childrenIds) {
        parent.children = childrenIds;
      }
    } else {
      // Create new
      parent = await Parent.create({
        user: userId,
        phone,
        alternatePhone,
        occupation,
        address,
        city,
        state,
        children: childrenIds || [],
      });
    }

    await parent.save();

    const populatedParent = await Parent.findById(parent._id)
      .populate("user", "name email")
      .populate({
        path: "children",
        populate: { path: "user", select: "name email" },
      });

    res.status(201).json(populatedParent);
  } catch (err) {
    console.error("PARENT CREATE ERROR:", err);
    res.status(500).json({ message: "Failed to create parent profile" });
  }
};

// Get all parents (admin)
exports.getParents = async (req, res) => {
  try {
    const parents = await Parent.find()
      .populate("user", "name email")
      .populate({
        path: "children",
        populate: [
          { path: "user", select: "name email" },
          { path: "batch", select: "name className" },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(parents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get parent by user ID
exports.getParentByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const parent = await Parent.findOne({ user: userId })
      .populate("user", "name email")
      .populate({
        path: "children",
        populate: [
          { path: "user", select: "name email" },
          { path: "batch", select: "name className" },
        ],
      });

    if (!parent) {
      return res.status(404).json({ message: "Parent profile not found" });
    }

    res.json(parent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update parent profile
exports.updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, alternatePhone, occupation, address, city, state, childrenIds } = req.body;

    const parent = await Parent.findById(id);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    parent.phone = phone || parent.phone;
    parent.alternatePhone = alternatePhone || parent.alternatePhone;
    parent.occupation = occupation || parent.occupation;
    parent.address = address || parent.address;
    parent.city = city || parent.city;
    parent.state = state || parent.state;
    if (childrenIds) {
      parent.children = childrenIds;
    }

    await parent.save();

    const updatedParent = await Parent.findById(parent._id)
      .populate("user", "name email")
      .populate({
        path: "children",
        populate: [
          { path: "user", select: "name email" },
          { path: "batch", select: "name className" },
        ],
      });

    res.json(updatedParent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add child to parent
exports.addChildToParent = async (req, res) => {
  try {
    const { parentId, studentId } = req.body;

    const parent = await Parent.findById(parentId);
    const student = await StudentProfile.findById(studentId);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!parent.children.includes(studentId)) {
      parent.children.push(studentId);
    }

    if (!student.parents.includes(parentId)) {
      student.parents.push(parentId);
    }

    await parent.save();
    await student.save();

    const updatedParent = await Parent.findById(parent._id)
      .populate("user", "name email")
      .populate({
        path: "children",
        populate: [
          { path: "user", select: "name email" },
          { path: "batch", select: "name className" },
        ],
      });

    res.json(updatedParent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove child from parent
exports.removeChildFromParent = async (req, res) => {
  try {
    const { parentId, studentId } = req.body;

    const parent = await Parent.findById(parentId);
    const student = await StudentProfile.findById(studentId);

    if (!parent || !student) {
      return res.status(404).json({ message: "Parent or Student not found" });
    }

    parent.children = parent.children.filter((id) => id.toString() !== studentId);
    student.parents = student.parents.filter((id) => id.toString() !== parentId);

    await parent.save();
    await student.save();

    const updatedParent = await Parent.findById(parent._id)
      .populate("user", "name email")
      .populate({
        path: "children",
        populate: [
          { path: "user", select: "name email" },
          { path: "batch", select: "name className" },
        ],
      });

    res.json(updatedParent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete parent profile
exports.deleteParent = async (req, res) => {
  try {
    const { id } = req.params;

    const parent = await Parent.findByIdAndDelete(id);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Remove parent from student records
    await StudentProfile.updateMany(
      { parents: id },
      { $pull: { parents: id } }
    );

    res.json({ message: "Parent deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
