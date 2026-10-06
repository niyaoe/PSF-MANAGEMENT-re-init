const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/temp");
    },

    filename: (req, file, cb) => {
        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}` +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = [".xlsx", ".xls"];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
        return cb(
            new Error("Only .xlsx and .xls Excel files are allowed")
        );
    }

    cb(null, true);
};

const uploadExcel = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = uploadExcel;