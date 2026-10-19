const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const branchRoutes = require("./routes/branchRoutes");
const userRoutes = require("./routes/userRoutes");
const psfRoutes = require("./routes/psfRoutes");
const importRoutes = require("./routes/importRoutes");
const typeOfConcernRoutes = require("./routes/typeOfConcernRoutes");

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL // Will be configured in Render
}));
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/users", userRoutes);
app.use("/api/psf", psfRoutes);
app.use("/api/import", importRoutes);
app.use("/api/type-of-concerns", typeOfConcernRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "ERAM MOTORS PSF Management API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});