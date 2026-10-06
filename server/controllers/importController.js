const { importPSFExcel } = require("../services/excelImportService");

const importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Excel file is required",
      });
    }

    const result = await importPSFExcel(req.file.path);

    res.json({
      message: "Excel file imported successfully",
      totalRows: result.totalRows,
      importedRows: result.rows.length,
      insertedCount: result.insertedCount,
      matchedCount: result.matchedCount,
    });
  } catch (error) {
    console.error("Excel import error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  importExcel,
};
