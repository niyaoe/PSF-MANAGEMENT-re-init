const XLSX = require("xlsx");
const Branch = require("../models/Branch");
const PSFRecord = require("../models/PSFRecord");

const OLD_EXPECTED_HEADERS = [
  "Sl",
  "Bill Date",
  "RO Number",
  "Branch",
  "Seg",
  "Customer Name",
  "User Name",
  "Registration No.",
  "Model",
  "Chassis No.",
  "Service Type",
  "SA Name",
  "Revisit Y/N",
  "USER MOB",
  "OWNR MOB",
  "1st call Date",
  "2nt Follow up Date",
  "3rd Follw up Date",
  "WhatsAppBot",
  "10",
  "Service Advisor behaviour",
  "Did the Service Advisor explained properly about the work , time and the amount for service?",
  "Vehicle neatness and cleanliness at delivery time",
  "Quality of work done on your vehicle",
  "Waiting area facilities",
  "Delivery at promised time",
  "VOC",
  "Type of Concern",
  "Call Date",
  "Complaint Status",
  "CRM/CXM Remarks",
];

const NEW_EXPECTED_HEADERS = [
  "Bill Date",
  "Dealer Location",
  "Repair Order Number",
  "Registration Number",
  "Chassis Number",
  "RO Service Advisor",
  "Customer Name",
  "Revisit Indicator",
  "Product Name",
  "Service Type",
];

const mapExcelRow = (row) => {
  return {
    slNumber: row["Sl"],
    billDate: row["Bill Date"],
    roNumber: String(row["RO Number"] || "").trim(),

    // Branch will be converted to branchId later.
    branchName: String(row["Branch"] || "").trim(),

    segment: String(row["Seg"] || "").trim(),
    customerName: String(row["Customer Name"] || "").trim(),
    userName: String(row["User Name"] || "").trim(),
    registrationNumber: String(row["Registration No."] || "").trim(),
    model: String(row["Model"] || "").trim(),
    chassisNumber: String(row["Chassis No."] || "").trim(),
    serviceType: String(row["Service Type"] || "").trim(),
    serviceAdvisorName: String(row["SA Name"] || "").trim(),
    revisit: String(row["Revisit Y/N"] || "").trim(),

    userMobile: String(row["USER MOB"] || "").trim(),
    ownerMobile: String(row["OWNR MOB"] || "").trim(),

    firstCallDate: row["1st call Date"] || null,
    secondFollowUpDate: row["2nt Follow up Date"] || null,
    thirdFollowUpDate: row["3rd Follw up Date"] || null,

    // User requested WhatsAppBot to remain blank.
    whatsAppBot: "",

    // Excel header "10" is actually the Rating column.
    rating: row["10"] === "" ? null : Number(row["10"]),

    serviceAdvisorBehaviour: String(
      row["Service Advisor behaviour"] || "",
    ).trim(),

    advisorExplanation: String(
      row[
        "Did the Service Advisor explained properly about the work , time and the amount for service?"
      ] || "",
    ).trim(),

    vehicleCleanliness: String(
      row["Vehicle neatness and cleanliness at delivery time"] || "",
    ).trim(),

    qualityOfWork: String(
      row["Quality of work done on your vehicle"] || "",
    ).trim(),

    waitingAreaFacilities: String(row["Waiting area facilities"] || "").trim(),

    deliveryAtPromisedTime: String(
      row["Delivery at promised time"] || "",
    ).trim(),

    voc: String(row["VOC"] || "").trim(),
    typeOfConcern: String(row["Type of Concern"] || "").trim(),

    callDate: row["Call Date"] || null,

    complaintStatus: String(row["Complaint Status"] || "").trim(),

    crmCxmRemarks: String(row["CRM/CXM Remarks"] || "").trim(),

    // Extra application field, not from Excel.
    messageToBeSent: "",
  };
};

const mapNewExcelRow = (row) => {
  return {
    billDate: row["Bill Date"] || null,

    // Dealer location will be converted to branchId later.
    branchName: String(row["Dealer Location"] || "").trim(),

    roNumber: String(row["Repair Order Number"] || "").trim(),

    registrationNumber: String(row["Registration Number"] || "").trim(),

    chassisNumber: String(row["Chassis Number"] || "").trim(),

    serviceAdvisorName: String(row["RO Service Advisor"] || "").trim(),

    customerName: String(row["Customer Name"] || "").trim(),

    revisit: String(row["Revisit Indicator"] || "").trim(),

    model: String(row["Product Name"] || "").trim(),

    serviceType: String(row["Service Type"] || "").trim(),
  };
};

const importPSFExcel = async (filePath) => {
  const workbook = XLSX.readFile(filePath, {
    cellDates: true,
  });

  const preferredSheetNames = ["Main-data", "Service_Bill_Status_Report1"];

  const sheetName = preferredSheetNames.find((name) => workbook.Sheets[name]);

  if (!sheetName) {
    throw new Error(
      `No supported Excel sheet found. Available sheets: ${workbook.SheetNames.join(", ")}`,
    );
  }

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: "",
  });

  if (rows.length === 0) {
    throw new Error("Excel file contains no data");
  }

  const actualHeaders = Object.keys(rows[0]);

  const isOldFormat = OLD_EXPECTED_HEADERS.every((header) =>
    actualHeaders.includes(header),
  );

  const isNewFormat = NEW_EXPECTED_HEADERS.every((header) =>
    actualHeaders.includes(header),
  );

  if (!isOldFormat && !isNewFormat) {
    throw new Error(
      "Excel format not recognized. Please upload a valid PSF Excel file.",
    );
  }

  let mappedRows;

  if (isOldFormat) {
    mappedRows = rows
      .filter((row) => {
        return String(row["Branch"] || "").trim() !== "";
      })
      .map(mapExcelRow);
  } else {
    mappedRows = rows
      .filter((row) => {
        const dealerLocation = String(row["Dealer Location"] || "").trim();

        const status = String(row["Status"] || "")
          .trim()
          .toLowerCase();

        return dealerLocation !== "" && status === "invoiced";
      })
      .map(mapNewExcelRow);
  }

  const branches = await Branch.find({
    isActive: true,
  });

  const branchMap = new Map();

  branches.forEach((branch) => {
    branchMap.set(branch.name.trim().toLowerCase(), branch._id);
  });

  // Excel branch aliases.
  // Different Excel names can represent the same actual branch.

  const branchAliases = {
    kunnamkulam_: "kunnamkulam",

    chittur_sz: "chittur",

    kasargod_madb: "kasaragod",

    koratty_sz: "koratty",

    kunnamkulam_sz: "kunnamkulam",

    mananthavady: "mananthavady",

    "mundur palakkad": "mundur",

    pattambi: "pattambi",

    pooladikunnu_sz: "pooladikunnu",

    puthanathani: "puthanathani",

    thrissur: "thrissur",

    wayanad: "wayanad",

    calicut: "calicut",

    kannur: "kannur",
  };

  const rowsWithBranchId = mappedRows.map((row, index) => {
    const normalizedBranchName = row.branchName.trim().toLowerCase();

    const branchLookupName =
      branchAliases[normalizedBranchName] || normalizedBranchName;

    const branchId = branchMap.get(branchLookupName);

    if (!branchId) {
      throw new Error(
        `Branch not found: "${row.branchName}" at Excel row ${index + 2}`,
      );
    }

    return {
      ...row,
      branchId,
    };
  });

  const operations = rowsWithBranchId.map((row) => {
    const { branchName, ...record } = row;

    if (isNewFormat) {
      return {
        updateOne: {
          filter: {
            branchId: record.branchId,
            roNumber: record.roNumber,
          },
          update: {
            $set: {
              billDate: record.billDate,
              branchId: record.branchId,
              roNumber: record.roNumber,
              registrationNumber: record.registrationNumber,
              chassisNumber: record.chassisNumber,
              serviceAdvisorName: record.serviceAdvisorName,
              customerName: record.customerName,
              revisit: record.revisit,
              model: record.model,
              serviceType: record.serviceType,
            },
          },
          upsert: true,
        },
      };
    }

    return {
      updateOne: {
        filter: {
          branchId: record.branchId,
          roNumber: record.roNumber,
        },
        update: {
          $setOnInsert: {
            ...record,
          },
        },
        upsert: true,
      },
    };
  });

  const result = await PSFRecord.bulkWrite(operations, {
    ordered: false,
  });

  return {
    sheetName,
    totalRows: rows.length,
    rows: rowsWithBranchId,
    insertedCount: result.upsertedCount,
    matchedCount: result.matchedCount,
  };
};

module.exports = {
  importPSFExcel,
};
