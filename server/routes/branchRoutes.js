const express = require("express");

const {
    getBranches,
    createBranch
} = require("../controllers/branchController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    authorizeRoles("admin", "manager", "employee"),
    getBranches
);

router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createBranch
);

module.exports = router;