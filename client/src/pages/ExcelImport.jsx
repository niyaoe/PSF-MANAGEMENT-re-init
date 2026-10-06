import { useState } from "react";
import api from "../services/api";
import "../styles/excelImport.css";
import BackButton from "../components/BackButton";

const ExcelImport = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setFile(selectedFile || null);
    setMessage("");
    setResult(null);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please select an Excel file");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setResult(null);

      const formData = new FormData();

      formData.append("file", file);

      const response = await api.post("/import/excel", formData);

      setMessage(response.data.message);

      setResult(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Excel import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="excel-aero-page">
      
      <div className="excel-aero-header">
        <BackButton className="excel-aero-back-button" />
        <div className="excel-aero-header-content">
          <h1 className="excel-aero-title">Excel Import</h1>

          <p className="excel-aero-subtitle">
            Import PSF records from an Excel file
          </p>
        </div>
      </div>

      <div className="excel-aero-panel">
        <h2 className="excel-aero-panel-title">Import Excel File</h2>

        <form className="excel-aero-form" onSubmit={handleUpload}>
          <div className="excel-aero-field">
            <label>Select Excel File</label>

            <input
              className="excel-aero-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />

            <p className="excel-aero-help">Supported formats: .xlsx and .xls</p>
          </div>

          <button
            className="excel-aero-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Importing..." : "Import Excel"}
          </button>
        </form>
      </div>

      {message && <p className="excel-aero-message">{message}</p>}

      {result && (
        <div className="excel-aero-panel">
          <h2 className="excel-aero-panel-title">Import Result</h2>

          <div className="excel-aero-results">
            <div className="excel-aero-result-card">
              <span className="excel-aero-result-label">Total Rows</span>

              <strong className="excel-aero-result-value">
                {result.totalRows}
              </strong>
            </div>

            <div className="excel-aero-result-card">
              <span className="excel-aero-result-label">Valid Rows</span>

              <strong className="excel-aero-result-value">
                {result.importedRows}
              </strong>
            </div>

            <div className="excel-aero-result-card">
              <span className="excel-aero-result-label">Inserted</span>

              <strong className="excel-aero-result-value">
                {result.insertedCount}
              </strong>
            </div>

            <div className="excel-aero-result-card">
              <span className="excel-aero-result-label">Matched</span>

              <strong className="excel-aero-result-value">
                {result.matchedCount}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelImport;
