
const express = require("express");

const router = express.Router();

const {
  getTypeOfConcerns,
  createTypeOfConcern,
  updateTypeOfConcern,
} = require("../controllers/typeOfConcernController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Get all concerns
router.get(
  "/",
  protect,
  authorizeRoles("admin", "manager", "employee"),
  getTypeOfConcerns,
);

// Create a concern
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createTypeOfConcern,
);

// Update a concern
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateTypeOfConcern,
);

module.exports = router;
