const mongoose = require("mongoose");

const psfRecordSchema = new mongoose.Schema(
  {
    slNumber: {
      type: Number,
    },

    billDate: {
      type: Date,
    },

    roNumber: {
      type: String,
      trim: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    segment: {
      type: String,
      trim: true,
    },

    customerName: {
      type: String,
      trim: true,
    },

    userName: {
      type: String,
      trim: true,
    },

    registrationNumber: {
      type: String,
      trim: true,
    },

    model: {
      type: String,
      trim: true,
    },

    chassisNumber: {
      type: String,
      trim: true,
    },

    serviceType: {
      type: String,
      trim: true,
    },

    serviceAdvisorName: {
      type: String,
      trim: true,
    },

    revisit: {
      type: String,
      trim: true,
    },

    userMobile: {
      type: String,
      trim: true,
    },

    ownerMobile: {
      type: String,
      trim: true,
    },

    firstCallDate: {
      type: Date,
      default: null,
    },

    secondFollowUpDate: {
      type: Date,
      default: null,
    },

    thirdFollowUpDate: {
      type: Date,
      default: null,
    },

    whatsAppBot: {
      type: String,
      default: null,
    },

    rating: {
      type: Number,
      default: null,
    },

    serviceAdvisorBehaviour: {
      type: String,
      default: null,
    },

    advisorExplanation: {
      type: String,
      default: null,
    },

    vehicleCleanliness: {
      type: String,
      default: null,
    },

    qualityOfWork: {
      type: String,
      default: null,
    },

    waitingAreaFacilities: {
      type: String,
      default: null,
    },

    deliveryAtPromisedTime: {
      type: String,
      default: null,
    },

    voc: {
      type: String,
      default: null,
    },

    typeOfConcern: {
      type: String,
      default: null,
    },

    callDate: {
      type: Date,
      default: null,
    },

    complaintStatus: {
      type: String,
      default: null,
    },

    crmCxmRemarks: {
      type: String,
      default: "",
    },

    messageToBeSent: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    callBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

psfRecordSchema.index({
  branchId: 1,
  complaintStatus: 1,
});

psfRecordSchema.index({
  branchId: 1,
  billDate: 1,
});

psfRecordSchema.index({
  roNumber: 1,
});

psfRecordSchema.index({ branchId: 1, roNumber: 1 }, { unique: true });

module.exports = mongoose.model("PSFRecord", psfRecordSchema);
