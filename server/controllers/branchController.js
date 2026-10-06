const Branch = require("../models/Branch");

const getBranches = async (req, res) => {
    try {
        const branches = await Branch.find()
            .sort({ name: 1 });

        res.json({
            message: "Branches fetched successfully",
            branches
        });
    } catch (error) {
        console.error("Get branches error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const createBranch = async (req, res) => {
    try {
        const { name, code } = req.body;

        if (!name || !code) {
            return res.status(400).json({
                message: "Branch name and code are required"
            });
        }

        const existingBranch = await Branch.findOne({
            code: code.toUpperCase()
        });

        if (existingBranch) {
            return res.status(409).json({
                message: "Branch code already exists"
            });
        }

        const branch = await Branch.create({
            name,
            code
        });

        res.status(201).json({
            message: "Branch created successfully",
            branch
        });
    } catch (error) {
        console.error("Create branch error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getBranches,
    createBranch
};