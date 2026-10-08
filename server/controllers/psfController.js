const mongoose = require("mongoose");
const PSFRecord = require("../models/PSFRecord");

const getPSFRecords = async (req, res) => {
  try {
    let filter = {};

    const search = req.query.search?.trim();

    const branchId = req.query.branchId?.trim();

    if (branchId && !mongoose.isValidObjectId(branchId)) {
      return res.status(400).json({
        message: "Invalid branch ID",
      });
    }

    if (search) {
      filter.$or = [
        {
          roNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          customerName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          registrationNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          chassisNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          userName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          ownerMobile: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (req.user.role === "admin") {
      if (branchId) {
        filter.branchId = branchId;
      }
    } else {
      if (
        !Array.isArray(req.user.branchIds) ||
        req.user.branchIds.length === 0
      ) {
        return res.status(403).json({
          message: "No branches assigned to this user",
        });
      }

      if (branchId) {
        const hasAccess = req.user.branchIds.some(
          (assignedBranchId) => assignedBranchId.toString() === branchId,
        );

        if (!hasAccess) {
          return res.status(403).json({
            message: "Access denied for this branch",
          });
        }

        filter.branchId = branchId;
      } else {
        filter.branchId = {
          $in: req.user.branchIds,
        };
      }
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

    const skip = (page - 1) * limit;

    const [records, totalRecords] = await Promise.all([
      PSFRecord.find(filter)
        .populate("branchId", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      PSFRecord.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      message: "PSF records fetched successfully",

      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },

      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Get PSF records error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updatePSFRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await PSFRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        message: "PSF record not found",
      });
    }

    // Admin can update any record.
    // Manager/employee can update only records
    // belonging to one of their assigned branches.
    if (req.user.role !== "admin") {
      if (
        !Array.isArray(req.user.branchIds) ||
        !req.user.branchIds.some(
          (branchId) => branchId.toString() === record.branchId.toString(),
        )
      ) {
        return res.status(403).json({
          message: "Access denied for this branch",
        });
      }
    }

    const editableFields = [
      "firstCallDate",
      "secondFollowUpDate",
      "thirdFollowUpDate",
      "whatsAppBot",
      "rating",
      "serviceAdvisorBehaviour",
      "advisorExplanation",
      "vehicleCleanliness",
      "qualityOfWork",
      "waitingAreaFacilities",
      "deliveryAtPromisedTime",
      "voc",
      "typeOfConcern",
      "callDate",
      "complaintStatus",
      "crmCxmRemarks",
      "messageToBeSent",
      "segment",
      "ownerMobile",
      "pincode",
    ];

    editableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        record[field] = req.body[field];
      }
    });

    record.updatedBy = req.user.userId;
    record.callBy = req.user.userId;

    await record.save();

    const updatedRecord = await PSFRecord.findById(record._id)
      .populate("branchId", "name code")
      .populate("updatedBy", "name email role");

    res.json({
      message: "PSF record updated successfully",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Update PSF record error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getPSFDashboard = async (req, res) => {
  try {
    const {
      branchId,
      complaintStatus,
      notConnected,
      fromDate,
      toDate,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    let filter = {};

    if (search?.trim()) {
      filter.$or = [
        {
          roNumber: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          customerName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          registrationNumber: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          chassisNumber: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          userName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          ownerMobile: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /*
     * Branch access
     */

    if (req.user.role === "admin") {
      if (branchId) {
        if (!mongoose.isValidObjectId(branchId)) {
          return res.status(400).json({
            message: "Invalid branch ID",
          });
        }

        filter.branchId = branchId;
      }
    } else {
      if (
        !Array.isArray(req.user.branchIds) ||
        req.user.branchIds.length === 0
      ) {
        return res.status(403).json({
          message: "No branches assigned to this user",
        });
      }

      if (branchId) {
        if (!mongoose.isValidObjectId(branchId)) {
          return res.status(400).json({
            message: "Invalid branch ID",
          });
        }

        const hasAccess = req.user.branchIds.some(
          (assignedBranchId) => assignedBranchId.toString() === branchId,
        );

        if (!hasAccess) {
          return res.status(403).json({
            message: "Access denied for this branch",
          });
        }

        filter.branchId = branchId;
      } else {
        filter.branchId = {
          $in: req.user.branchIds,
        };
      }
    }

    /*
     * Complaint status filter
     */

    if (complaintStatus) {
      if (complaintStatus.toLowerCase() === "open") {
        filter.$or = [
          {
            complaintStatus: "Open",
          },
          {
            complaintStatus: "",
          },
          {
            complaintStatus: null,
          },
          {
            complaintStatus: {
              $exists: false,
            },
          },
        ];
      } else {
        filter.complaintStatus = complaintStatus;
      }
    }

    /*
     * Not connected filter
     *
     * firstCallDate is empty or does not exist
     */

    if (notConnected === "true") {
      filter.$and = [
        {
          $or: [
            {
              firstCallDate: {
                $exists: false,
              },
            },
            {
              firstCallDate: null,
            },
            {
              firstCallDate: "",
            },
          ],
        },
        {
          $or: [
            {
              voc: {
                $exists: false,
              },
            },
            {
              voc: null,
            },
            {
              voc: "",
            },
          ],
        },
      ];
    }

    if (notConnected === "false") {
      filter.$or = [
        {
          firstCallDate: {
            $exists: true,
            $nin: [null, ""],
          },
        },
        {
          voc: {
            $exists: true,
            $nin: [null, ""],
          },
        },
      ];
    }

    /*
     * Bill date range filter
     */

    if (fromDate || toDate) {
      filter.billDate = {};

      if (fromDate) {
        filter.billDate.$gte = new Date(fromDate);
      }

      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);

        filter.billDate.$lte = endDate;
      }
    }

    const currentPage = Math.max(parseInt(page) || 1, 1);

    const recordsPerPage = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * recordsPerPage;

    const totalRecords = await PSFRecord.countDocuments(filter);

    /*
     * Dashboard records
     */

    const records = await PSFRecord.find(filter)
      .populate("branchId", "name code")
      .sort({ billDate: -1 })
      .skip(skip)
      .limit(recordsPerPage);

    /*
     * Summary
     */

    // const totalRecords = records.length;

    const summaryRecords = await PSFRecord.find(filter).select(
      "complaintStatus firstCallDate voc",
    );

    const openComplaints = summaryRecords.filter((record) => {
      const status = record.complaintStatus?.trim().toLowerCase();

      return status === "open" || !status;
    }).length;

    const closedComplaints = summaryRecords.filter(
      (record) => record.complaintStatus?.trim().toLowerCase() === "closed",
    ).length;

    const notConnectedRecords = summaryRecords.filter((record) => {
      const firstCallEmpty = !record.firstCallDate;

      const vocEmpty = !record.voc?.trim();

      return firstCallEmpty && vocEmpty;
    }).length;

    const connectedRecords = totalRecords - notConnectedRecords;

    const totalPages = Math.ceil(totalRecords / recordsPerPage);

    res.json({
      message: "PSF dashboard data fetched successfully",

      summary: {
        totalRecords,
        openComplaints,
        closedComplaints,
        notConnected: notConnectedRecords,
        connected: connectedRecords,
      },

      pagination: {
        page: currentPage,
        limit: recordsPerPage,
        totalRecords,
        totalPages,
      },

      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Get PSF dashboard error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const { date, branchId } = req.query;

    /*
     * Selected date
     */

    const selectedDate = date ? new Date(date) : new Date();

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    /*
     * Selected day
     */

    const selectedDayStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    const selectedDayEnd = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() + 1,
    );

    /*
     * Selected month
     */

    const monthStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
    );

    const nextMonthStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      1,
    );

    /*
     * User model
     */

    const User = require("../models/User");

    /*
     * Employee filter
     */

    let userFilter = {
      role: "employee",
      isActive: true,
    };

    /*
     * Admin
     */

    if (req.user.role === "admin") {
      if (branchId) {
        if (!mongoose.isValidObjectId(branchId)) {
          return res.status(400).json({
            message: "Invalid branch ID",
          });
        }

        userFilter.branchIds = branchId;
      }
    } else if (req.user.role === "employee") {
      /*
       * Employee
       */0
      userFilter._id = req.user.userId;
    } else if (req.user.role === "manager") {
      /*
       * Manager
       */
      if (
        !Array.isArray(req.user.branchIds) ||
        req.user.branchIds.length === 0
      ) {
        return res.status(403).json({
          message: "No branches assigned to this user",
        });
      }

      userFilter.branchIds = {
        $in: req.user.branchIds,
      };
    }

    /*
     * Get employees
     */

    const users = await User.find(userFilter)
      .select("name email role branchIds")
      .populate("branchIds", "name code");

    /*
     * Get employee IDs
     */

    const userIds = users.map((user) => user._id);

    /*
     * PSF record filter
     */

    const psfFilter = {
      callBy: {
        $in: userIds,
      },
    };

    /*
     * Admin branch filter
     *
     * This filters the actual PSF records too.
     */

    if (req.user.role === "admin" && branchId) {
      psfFilter.branchId = branchId;
    }

    /*
     * Manager branch restriction
     */

    if (req.user.role === "manager") {
      psfFilter.branchId = {
        $in: req.user.branchIds,
      };
    }

    /*
     * Employee branch restriction
     *
     * Employee can only see records
     * from their assigned branches.
     */

    if (req.user.role === "employee") {
      const employee = users[0];

      if (employee) {
        psfFilter.branchId = {
          $in: employee.branchIds.map((branch) => branch._id),
        };
      }
    }

    /*
     * Fetch PSF records
     */

    const records = await PSFRecord.find(psfFilter)
      .select(
        "callBy branchId firstCallDate secondFollowUpDate thirdFollowUpDate",
      )
      .populate("branchId", "name code");

    /*
     * History map
     *
     * Key:
     *
     * employeeId + branchId
     */

    const historyMap = {};

    /*
     * Create rows for every employee
     * and every assigned branch.
     */

    users.forEach((user) => {
      user.branchIds.forEach((branch) => {
        /*
         * Admin branch filter
         */

        if (
          req.user.role === "admin" &&
          branchId &&
          branch._id.toString() !== branchId
        ) {
          return;
        }

        /*
         * Manager branch filter
         */

        if (
          req.user.role === "manager" &&
          !req.user.branchIds.some(
            (assignedBranchId) =>
              assignedBranchId.toString() === branch._id.toString(),
          )
        ) {
          return;
        }

        const key = `${user._id.toString()}_${branch._id.toString()}`;

        historyMap[key] = {
          userId: user._id,
          name: user.name,
          branchId: branch._id,
          branch: branch.name,

          freshCallsToday: 0,
          freshCallsThisMonth: 0,

          followUpCallsToday: 0,
          followUpCallsThisMonth: 0,

          totalCallsToday: 0,
          totalCallsThisMonth: 0,
        };
      });
    });

    /*
     * Count PSF calls
     */

    records.forEach((record) => {
      if (!record.callBy || !record.branchId) {
        return;
      }

      const key = `${record.callBy.toString()}_${record.branchId._id.toString()}`;

      /*
       * Safety check
       */

      if (!historyMap[key]) {
        return;
      }

      const historyRow = historyMap[key];

      /*
       * Fresh call
       */

      if (record.firstCallDate) {
        const freshDate = new Date(record.firstCallDate);

        /*
         * Selected date
         */

        if (freshDate >= selectedDayStart && freshDate < selectedDayEnd) {
          historyRow.freshCallsToday++;
        }

        /*
         * Selected month
         */

        if (freshDate >= monthStart && freshDate < nextMonthStart) {
          historyRow.freshCallsThisMonth++;
        }
      }

      /*
       * Follow-up calls
       */

      const followUpDates = [
        record.secondFollowUpDate,
        record.thirdFollowUpDate,
      ];

      followUpDates.forEach((followUpDate) => {
        if (!followUpDate) {
          return;
        }

        const followUpDateValue = new Date(followUpDate);

        /*
         * Selected date
         */

        if (
          followUpDateValue >= selectedDayStart &&
          followUpDateValue < selectedDayEnd
        ) {
          historyRow.followUpCallsToday++;
        }

        /*
         * Selected month
         */

        if (
          followUpDateValue >= monthStart &&
          followUpDateValue < nextMonthStart
        ) {
          historyRow.followUpCallsThisMonth++;
        }
      });
    });

    /*
     * Calculate totals
     */

    const history = Object.values(historyMap).map((row) => {
      row.totalCallsToday = row.freshCallsToday + row.followUpCallsToday;

      row.totalCallsThisMonth =
        row.freshCallsThisMonth + row.followUpCallsThisMonth;

      return row;
    });

    /*
     * Summary
     */

    const summary = {
      freshCallsToday: 0,
      freshCallsThisMonth: 0,

      followUpCallsToday: 0,
      followUpCallsThisMonth: 0,

      totalCallsToday: 0,
      totalCallsThisMonth: 0,
    };

    history.forEach((row) => {
      summary.freshCallsToday += row.freshCallsToday;

      summary.freshCallsThisMonth += row.freshCallsThisMonth;

      summary.followUpCallsToday += row.followUpCallsToday;

      summary.followUpCallsThisMonth += row.followUpCallsThisMonth;

      summary.totalCallsToday += row.totalCallsToday;

      summary.totalCallsThisMonth += row.totalCallsThisMonth;
    });

    /*
     * Response
     */

    res.json({
      message: "User history fetched successfully",

      selectedDate: selectedDayStart,

      summary,

      history,
    });
  } catch (error) {
    console.error("Get user history error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getPSFRecords,
  updatePSFRecord,
  getPSFDashboard,
  getUserHistory,
};
