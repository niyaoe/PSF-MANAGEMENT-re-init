const express = require("express");

const {
    getPSFRecords,
    updatePSFRecord,
    getPSFDashboard,
    getUserHistory,
} = require("../controllers/psfController");


const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    authorizeRoles("admin", "manager", "employee"),
    getPSFRecords
);

router.get(
    "/dashboard",
    protect,
    authorizeRoles("admin", "manager", "employee"),
    getPSFDashboard
);

router.put(
    "/:id",
    protect,
    authorizeRoles("admin", "employee"), // "manager" 
    updatePSFRecord
);

router.get(
  "/user-history",
  protect,
  authorizeRoles("admin", "manager", "employee"),
  getUserHistory
);

module.exports = router;