
const TypeOfConcern = require("../models/TypeOfConcern");

// Get all type of concerns
const getTypeOfConcerns = async (req, res) => {
  try {
    const concerns = await TypeOfConcern.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Types of concern fetched successfully",
      count: concerns.length,
      concerns,
    });
  } catch (error) {
    console.error("Get types of concern error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Create a type of concern
const createTypeOfConcern = async (req, res) => {
  try {
    const { name, section } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Concern name is required",
      });
    }

    if (!["Open", "Closed", "Pending"].includes(section)) {
      return res.status(400).json({
        message: "Invalid section",
      });
    }

    const existingConcern = await TypeOfConcern.findOne({
      name: {
        $regex: `^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });

    if (existingConcern) {
      return res.status(409).json({
        message: "This type of concern already exists",
      });
    }

    const concern = await TypeOfConcern.create({
      name: name.trim(),
      section,
    });

    res.status(201).json({
      message: "Type of concern created successfully",
      concern,
    });
  } catch (error) {
    console.error("Create type of concern error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Update a type of concern
const updateTypeOfConcern = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, section, isActive } = req.body;

    const concern = await TypeOfConcern.findById(id);

    if (!concern) {
      return res.status(404).json({
        message: "Type of concern not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Concern name cannot be empty",
        });
      }

      concern.name = name.trim();
    }

    if (section !== undefined) {
      if (!["Open", "Closed", "Pending"].includes(section)) {
        return res.status(400).json({
          message: "Invalid section",
        });
      }

      concern.section = section;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          message: "isActive must be true or false",
        });
      }

      concern.isActive = isActive;
    }

    await concern.save();

    res.status(200).json({
      message: "Type of concern updated successfully",
      concern,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This type of concern already exists",
      });
    }

    console.error("Update type of concern error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getTypeOfConcerns,
  createTypeOfConcern,
  updateTypeOfConcern,
};
