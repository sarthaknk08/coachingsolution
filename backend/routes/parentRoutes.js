const express = require("express");
const router = express.Router();
const {
  createParent,
  getParents,
  getParentByUserId,
  updateParent,
  addChildToParent,
  removeChildFromParent,
  deleteParent,
} = require("../controllers/parentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Parent management
router.post("/", protect, adminOnly, createParent);
router.get("/", protect, adminOnly, getParents);
router.get("/user/:userId", protect, getParentByUserId);
router.put("/:id", protect, updateParent);
router.delete("/:id", protect, adminOnly, deleteParent);

// Child management
router.post("/child/add", protect, adminOnly, addChildToParent);
router.post("/child/remove", protect, adminOnly, removeChildFromParent);

module.exports = router;
