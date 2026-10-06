const express = require("express");

const {
    importExcel
} = require("../controllers/importController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const uploadExcel = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
    "/excel",
    protect,
    authorizeRoles("admin"),
    uploadExcel.single("file"),
    importExcel
);

module.exports = router;