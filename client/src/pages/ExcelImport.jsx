
import { useState } from "react";
import api from "../services/api";
import "./ExcelImport.css";

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
      setMessage(
        error.response?.data?.message || "Excel import failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value) =>
    Number(value ?? 0).toLocaleString("en-IN");

  return (
    <div className="excel-aero-page">
      {/* Aero page header */}
      <header className="excel-aero-header">
        <div className="excel-aero-heading-icon" aria-hidden="true">
          <span>▤</span>
        </div>

        <div className="excel-aero-header-content">
          <h1 className="excel-aero-title">Excel Import</h1>
          <p className="excel-aero-subtitle">
            Import PSF records from an Excel file
          </p>
        </div>

        <div className="excel-aero-header-meta">
          <span className="excel-aero-status-light" />
          Data import
        </div>
      </header>

      {/* Feedback */}
      {message && (
        <div
          className={`excel-aero-message ${
            result ? "excel-aero-message-success" : ""
          }`}
          role="status"
        >
          <span className="excel-aero-message-icon" aria-hidden="true">
            {result ? "✓" : "i"}
          </span>

          <span className="excel-aero-message-text">{message}</span>

          <button
            type="button"
            className="excel-aero-message-close"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Import form */}
      <section className="excel-aero-panel">
        <div className="excel-aero-panel-heading">
          <div className="excel-aero-panel-icon" aria-hidden="true">
            ⇧
          </div>

          <div>
            <h2 className="excel-aero-panel-title">Import Excel File</h2>
            <p className="excel-aero-panel-subtitle">
              Choose an Excel workbook to import PSF records
            </p>
          </div>
        </div>

        <form className="excel-aero-form" onSubmit={handleUpload}>
          <div className="excel-aero-field">
            <label htmlFor="excel-import-file">Select Excel file</label>

            <div className="excel-aero-file-control">
              <input
                id="excel-import-file"
                className="excel-aero-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                required
              />
            </div>

            <p className="excel-aero-help">
              Supported formats: .xlsx and .xls
            </p>

            {file && (
              <div className="excel-aero-selected-file">
                <span className="excel-aero-file-icon" aria-hidden="true">
                  ▤
                </span>

                <div className="excel-aero-file-info">
                  <strong>{file.name}</strong>
                  <span>
                    {file.size < 1024 * 1024
                      ? `${Math.max(1, Math.round(file.size / 1024))} KB`
                      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                  </span>
                </div>

                <button
                  type="button"
                  className="excel-aero-clear-file"
                  onClick={() => {
                    setFile(null);
                    setMessage("");
                    setResult(null);

                    const input = document.getElementById(
                      "excel-import-file"
                    );
                    if (input) input.value = "";
                  }}
                  aria-label="Remove selected file"
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="excel-aero-form-actions">
            <button
              className="excel-aero-button"
              type="submit"
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <span className="excel-aero-spinner" />
                  Importing...
                </>
              ) : (
                <>
                  <span aria-hidden="true">⇧</span>
                  Import Excel
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Import results */}
      {result && (
        <section className="excel-aero-panel excel-aero-result-panel">
          <div className="excel-aero-panel-heading">
            <div className="excel-aero-panel-icon excel-aero-result-icon">
              ✓
            </div>

            <div>
              <h2 className="excel-aero-panel-title">Import Result</h2>
              <p className="excel-aero-panel-subtitle">
                Summary returned by the import process
              </p>
            </div>
          </div>

          <div className="excel-aero-results">
            <article className="excel-aero-result-card excel-aero-total">
              <span className="excel-aero-result-symbol" aria-hidden="true">
                ▤
              </span>
              <div className="excel-aero-result-copy">
                <span className="excel-aero-result-label">Total Rows</span>
                <strong className="excel-aero-result-value">
                  {formatNumber(result.totalRows)}
                </strong>
              </div>
            </article>

            <article className="excel-aero-result-card excel-aero-valid">
              <span className="excel-aero-result-symbol" aria-hidden="true">
                ✓
              </span>
              <div className="excel-aero-result-copy">
                <span className="excel-aero-result-label">Valid Rows</span>
                <strong className="excel-aero-result-value">
                  {formatNumber(result.importedRows)}
                </strong>
              </div>
            </article>

            <article className="excel-aero-result-card excel-aero-inserted">
              <span className="excel-aero-result-symbol" aria-hidden="true">
                +
              </span>
              <div className="excel-aero-result-copy">
                <span className="excel-aero-result-label">Inserted</span>
                <strong className="excel-aero-result-value">
                  {formatNumber(result.insertedCount)}
                </strong>
              </div>
            </article>

            <article className="excel-aero-result-card excel-aero-matched">
              <span className="excel-aero-result-symbol" aria-hidden="true">
                ↔
              </span>
              <div className="excel-aero-result-copy">
                <span className="excel-aero-result-label">Matched</span>
                <strong className="excel-aero-result-value">
                  {formatNumber(result.matchedCount)}
                </strong>
              </div>
            </article>
          </div>
        </section>
      )}
    </div>
  );
};

export default ExcelImport;
