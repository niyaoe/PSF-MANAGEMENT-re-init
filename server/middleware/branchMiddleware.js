const enforceBranchAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    // Admin can access all branches.
    if (req.user.role === "admin") {
        return next();
    }

    // Manager and employee must have at least one branch.
    if (
        !Array.isArray(req.user.branchIds) ||
        req.user.branchIds.length === 0
    ) {
        return res.status(403).json({
            message: "No branches assigned to this user"
        });
    }

    // Store the user's allowed branches.
    req.branchIds = req.user.branchIds;

    next();
};

module.exports = enforceBranchAccess;