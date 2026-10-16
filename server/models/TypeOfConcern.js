
const mongoose = require("mongoose");

const typeOfConcernSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    section: {
      type: String,
      required: true,
      enum: ["Open", "Closed", "Pending"],
      default: "Open",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "TypeOfConcern",
  typeOfConcernSchema,
);
