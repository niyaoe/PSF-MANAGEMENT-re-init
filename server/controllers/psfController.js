const mongoose = require("mongoose");
const PSFRecord = require("../models/PSFRecord");
const TypeOfConcern = require("../models/TypeOfConcern");

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
      section,
      page = 1,
      limit = 20,
    } = req.query;

    const allowedSections = ["open", "pending", "closed"];

    if (section && !allowedSections.includes(section.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid dashboard section",
      });
    }

    // Pagination validation
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const recordsPerPage = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100,
    );
    const skip = (currentPage - 1) * recordsPerPage;

    // Branch access restrictions
    const baseFilter = {};

    if (req.user.role === "admin") {
      if (branchId) {
        if (!mongoose.isValidObjectId(branchId)) {
          return res.status(400).json({
            message: "Invalid branch ID",
          });
        }

        baseFilter.branchId = branchId;
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
          (id) => id.toString() === branchId,
        );

        if (!hasAccess) {
          return res.status(403).json({
            message: "Access denied for this branch",
          });
        }

        baseFilter.branchId = branchId;
      } else {
        baseFilter.branchId = {
          $in: req.user.branchIds,
        };
      }
    }

    // Build independent conditions so search and other filters
    // cannot overwrite one another.
    const commonConditions = [];

    // Escape regular-expression characters in search text
    if (search?.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      commonConditions.push({
        $or: [
          { roNumber: { $regex: escapedSearch, $options: "i" } },
          { customerName: { $regex: escapedSearch, $options: "i" } },
          {
            registrationNumber: {
              $regex: escapedSearch,
              $options: "i",
            },
          },
          {
            chassisNumber: {
              $regex: escapedSearch,
              $options: "i",
            },
          },
          { userName: { $regex: escapedSearch, $options: "i" } },
          { ownerMobile: { $regex: escapedSearch, $options: "i" } },
        ],
      });
    }

    // Existing complaint-status filter
    if (complaintStatus) {
      if (complaintStatus.toLowerCase() === "open") {
        commonConditions.push({
          $or: [
            { complaintStatus: /^open$/i },
            { complaintStatus: "" },
            { complaintStatus: null },
            { complaintStatus: { $exists: false } },
          ],
        });
      } else {
        commonConditions.push({
          complaintStatus: new RegExp(
            `^${complaintStatus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i",
          ),
        });
      }
    }

    // Existing not-connected filter
    const emptyFirstCallDate = {
      $or: [
        { firstCallDate: { $exists: false } },
        { firstCallDate: null },
        { firstCallDate: "" },
      ],
    };

    if (notConnected === "true") {
      commonConditions.push(emptyFirstCallDate);
    } else if (notConnected === "false") {
      commonConditions.push({
        firstCallDate: {
          $exists: true,
          $nin: [null, ""],
        },
      });
    }

    // Bill date range filter
    if (fromDate || toDate) {
      const billDateFilter = {};

      const parseDateOnly = (value) => {
        if (!value) return null;

        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

        if (!match) return new Date(NaN);

        const date = new Date(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
        );

        if (
          date.getFullYear() !== Number(match[1]) ||
          date.getMonth() !== Number(match[2]) - 1 ||
          date.getDate() !== Number(match[3])
        ) {
          return new Date(NaN);
        }

        return date;
      };

      if (fromDate) {
        const startDate = parseDateOnly(fromDate);

        if (!startDate || isNaN(startDate.getTime())) {
          return res.status(400).json({
            message: "Invalid fromDate. Use YYYY-MM-DD.",
          });
        }

        billDateFilter.$gte = startDate;
      }

      if (toDate) {
        const endDate = parseDateOnly(toDate);

        if (!endDate || isNaN(endDate.getTime())) {
          return res.status(400).json({
            message: "Invalid toDate. Use YYYY-MM-DD.",
          });
        }

        endDate.setHours(23, 59, 59, 999);
        billDateFilter.$lte = endDate;
      }

      if (
        billDateFilter.$gte &&
        billDateFilter.$lte &&
        billDateFilter.$gte > billDateFilter.$lte
      ) {
        return res.status(400).json({
          message: "fromDate cannot be after toDate",
        });
      }

      commonConditions.push({ billDate: billDateFilter });
    }

    // Find concern IDs by their configured sections.
    // The section names are matched case-insensitively.
    const [openConcerns, pendingConcerns, closedConcerns] =
      await Promise.all([
        TypeOfConcern.find({ section: /^open$/i }).select("_id").lean(),
        TypeOfConcern.find({ section: /^pending$/i }).select("_id").lean(),
        TypeOfConcern.find({ section: /^closed$/i }).select("_id").lean(),
      ]);

    const openConcernIds = openConcerns.map((item) => item._id);
    const pendingConcernIds = pendingConcerns.map((item) => item._id);
    const closedConcernIds = closedConcerns.map((item) => item._id);

    // The rules below intentionally preserve your OR/AND requirements.
    const sectionConditions = {
      closed: {
        $or: [
          { complaintStatus: /^closed$/i },
          { typeOfConcern: { $in: closedConcernIds } },
        ],
      },

      open: {
        $and: [
          { complaintStatus: /^open$/i },
          { typeOfConcern: { $in: openConcernIds } },
        ],
      },

      pending: {
        $or: [
          emptyFirstCallDate,
          { typeOfConcern: { $in: pendingConcernIds } },
        ],
      },
    };

    // Compose filters without losing any existing conditions.
    const buildFilter = (extraConditions = []) => ({
      $and: [
        baseFilter,
        ...commonConditions,
        ...extraConditions,
      ],
    });

    // Tab counts use all common filters but are independent
    // of which tab is currently selected.
    const [
      openComplaints,
      pending,
      closedComplaints,
    ] = await Promise.all([
      PSFRecord.countDocuments(
        buildFilter([sectionConditions.open]),
      ),
      PSFRecord.countDocuments(
        buildFilter([sectionConditions.pending]),
      ),
      PSFRecord.countDocuments(
        buildFilter([sectionConditions.closed]),
      ),
    ]);

    // Filter records for the selected tab.
    const selectedSection = section
      ? section.toLowerCase()
      : null;

    const selectedConditions = selectedSection
      ? [sectionConditions[selectedSection]]
      : [];

    const filter = buildFilter(selectedConditions);

    const [totalRecords, records] = await Promise.all([
      PSFRecord.countDocuments(filter),

      PSFRecord.find(filter)
        .populate("branchId", "name code")
        .populate("typeOfConcern", "name section")
        .sort({ billDate: -1, _id: -1 })
        .skip(skip)
        .limit(recordsPerPage)
        .lean(),
    ]);

    // Concern breakdown for the selected tab.
    // Use a Mongoose find query so branch IDs and other filter values
    // are cast correctly before querying MongoDB.
    const concernRecords = await PSFRecord.find(filter)
      .select("typeOfConcern")
      .lean();

    const concernCountMap = new Map();

    for (const record of concernRecords) {
      if (!record.typeOfConcern) continue;

      const concernId = record.typeOfConcern.toString();

      concernCountMap.set(
        concernId,
        (concernCountMap.get(concernId) || 0) + 1
      );
    }

    const concernIds = [...concernCountMap.keys()];

    const concernDetails = concernIds.length
      ? await TypeOfConcern.find({
        _id: { $in: concernIds },
      })
        .select("name section")
        .lean()
      : [];

    const concernMap = new Map(
      concernDetails.map((concern) => [
        concern._id.toString(),
        concern,
      ])
    );

    const concernCounts = concernIds
      .map((concernId) => {
        const concern = concernMap.get(concernId);

        if (!concern) return null;

        return {
          _id: concern._id,
          name: concern.name,
          section: concern.section,
          count: concernCountMap.get(concernId),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.count - a.count);

    const totalPages = Math.ceil(totalRecords / recordsPerPage);

    res.json({
      message: "PSF dashboard data fetched successfully",

      summary: {
        totalRecords,
        openComplaints,
        pending,
        closedComplaints,
        concernCounts,
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
       */ 0;
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
