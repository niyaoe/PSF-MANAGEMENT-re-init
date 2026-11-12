const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Branch = require("../models/Branch");

const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            branchIds
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password and role are required"
            });
        }

        if (!["manager", "employee"].includes(role)) {
            return res.status(400).json({
                message: "Only manager or employee users can be created"
            });
        }

        if (!Array.isArray(branchIds) || branchIds.length === 0) {
            return res.status(400).json({
                message: "At least one branch is required"
            });
        }

        const uniqueBranchIds = [
            ...new Set(branchIds)
        ];

        const branches = await Branch.find({
            _id: { $in: uniqueBranchIds },
            isActive: true
        });

        if (branches.length !== uniqueBranchIds.length) {
            return res.status(400).json({
                message: "One or more branches are invalid or inactive"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            branchIds: uniqueBranchIds,
            isActive: true
        });

        const userResponse = await User.findById(user._id)
            .select("-password")
            .populate("branchIds", "name code");

        res.status(201).json({
            message: `${role} created successfully`,
            user: userResponse
        });
    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const updateUserBranches = async (req, res) => {
    try {
        const { userId } = req.params;
        const { branchIds } = req.body;

        if (!Array.isArray(branchIds) || branchIds.length === 0) {
            return res.status(400).json({
                message: "At least one branch is required"
            });
        }

        const uniqueBranchIds = [...new Set(branchIds)];

        const branches = await Branch.find({
            _id: { $in: uniqueBranchIds },
            isActive: true
        });

        if (branches.length !== uniqueBranchIds.length) {
            return res.status(400).json({
                message: "One or more branches are invalid or inactive"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role === "admin") {
            return res.status(400).json({
                message: "Admin branch assignment cannot be changed"
            });
        }

        user.branchIds = uniqueBranchIds;

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("-password")
            .populate("branchIds", "name code");

        res.json({
            message: "User branches updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Update user branches error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .populate("branchIds", "name code")
            .sort({ createdAt: -1 });

        res.json({
            message: "Users fetched successfully",
            users
        });
    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            name,
            email,
            password,
            role,
            branchIds,
            isActive
        } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role === "admin") {
            return res.status(400).json({
                message: "Admin account cannot be updated"
            });
        }

        // Update name
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    message: "Name cannot be empty"
                });
            }

            user.name = name.trim();
        }

        // Update email
        if (email !== undefined) {
            const normalizedEmail = email.trim().toLowerCase();

            if (!normalizedEmail) {
                return res.status(400).json({
                    message: "Email cannot be empty"
                });
            }

            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(409).json({
                    message: "Email already registered"
                });
            }

            user.email = normalizedEmail;
        }

        // Update password
        if (password !== undefined && password !== "") {
            if (password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters"
                });
            }

            user.password = await bcrypt.hash(password, 10);
        }

        // Update role
        if (role !== undefined) {
            if (!["manager", "employee"].includes(role)) {
                return res.status(400).json({
                    message: "Invalid role"
                });
            }

            user.role = role;
        }

        // Update branches
        if (branchIds !== undefined) {
            if (!Array.isArray(branchIds) || branchIds.length === 0) {
                return res.status(400).json({
                    message: "At least one branch is required"
                });
            }

            const uniqueBranchIds = [...new Set(branchIds)];

            const branches = await Branch.find({
                _id: { $in: uniqueBranchIds },
                isActive: true
            });

            if (branches.length !== uniqueBranchIds.length) {
                return res.status(400).json({
                    message: "One or more branches are invalid or inactive"
                });
            }

            user.branchIds = uniqueBranchIds;
        }

        // Update active status
        if (isActive !== undefined) {
            if (typeof isActive !== "boolean") {
                return res.status(400).json({
                    message: "isActive must be a boolean"
                });
            }

            user.isActive = isActive;
        }

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("-password")
            .populate("branchIds", "name code");

        return res.json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update user error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createUser,
    updateUserBranches,
    getUsers,
    updateUser,
};