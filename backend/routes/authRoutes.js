const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  changePassword,
  updateEmail,
  updatePhone,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.post("/change-password", protect, changePassword);
router.post("/update-email", protect, updateEmail);
router.post("/update-phone", protect, updatePhone);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

module.exports = router;
