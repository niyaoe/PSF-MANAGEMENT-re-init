const express = require("express");

const {
  createUser,
  updateUserBranches,
  getUsers,
  updateUser,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createUser);
router.get("/", protect, authorizeRoles("admin"), getUsers);
router.put("/:userId", protect, authorizeRoles("admin"), updateUser);
router.put(
  "/:userId/branches",
  protect,
  authorizeRoles("admin"),
  updateUserBranches,
);

module.exports = router;
