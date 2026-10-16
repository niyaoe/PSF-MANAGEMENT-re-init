
import { useEffect, useState } from "react";
import api from "../services/api";
import "./BranchManagement.css";

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBranches = async () => {
    try {
      const response = await api.get("/branches");
      setBranches(response.data.branches || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load branches"
      );
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/branches", { name, code });

      setMessage(response.data.message);
      setName("");
      setCode("");

      await fetchBranches();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to create branch"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="branch-aero-page">
      {/* Aero page header */}
      <header className="branch-aero-header">
        <div className="branch-aero-heading-icon" aria-hidden="true">
          <span>⌂</span>
        </div>

        <div className="branch-aero-header-content">
          <h1 className="branch-aero-title">Branch Management</h1>
          <p className="branch-aero-subtitle">
            Create and manage PSF branches
          </p>
        </div>

        <div className="branch-aero-header-meta">
          <span className="branch-aero-status-light" />
          Branch directory
        </div>
      </header>

      {/* Feedback message */}
      {message && (
        <div className="branch-aero-message" role="status">
          <span className="branch-aero-message-icon" aria-hidden="true">
            ✓
          </span>
          <span className="branch-aero-message-text">{message}</span>
          <button
            type="button"
            className="branch-aero-message-close"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Create branch */}
      <section className="branch-aero-panel">
        <div className="branch-aero-panel-heading">
          <div className="branch-aero-panel-icon" aria-hidden="true">
            +
          </div>
          <div>
            <h2 className="branch-aero-panel-title">Create Branch</h2>
            <p className="branch-aero-panel-subtitle">
              Add a branch to your PSF directory
            </p>
          </div>
        </div>

        <form className="branch-aero-form" onSubmit={handleSubmit}>
          <div className="branch-aero-form-group">
            <label htmlFor="branch-name">Branch name</label>
            <input
              id="branch-name"
              type="text"
              placeholder="Enter branch name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="branch-aero-form-group">
            <label htmlFor="branch-code">Branch code</label>
            <input
              id="branch-code"
              type="text"
              placeholder="e.g. CLT"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
          </div>

          <div className="branch-aero-form-actions">
            <button
              className="branch-aero-create-button"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="branch-aero-spinner" />
                  Creating...
                </>
              ) : (
                <>
                  <span aria-hidden="true">＋</span>
                  Create Branch
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Branch directory */}
      <section className="branch-aero-panel branch-aero-list-panel">
        <div className="branch-aero-panel-heading branch-aero-list-heading">
          <div className="branch-aero-panel-icon" aria-hidden="true">
            ▤
          </div>

          <div className="branch-aero-list-heading-copy">
            <h2 className="branch-aero-panel-title">Existing Branches</h2>
            <p className="branch-aero-panel-subtitle">
              View registered branches and their status
            </p>
          </div>

          <div className="branch-aero-list-tools">
            <span className="branch-aero-count">
              {branches.length}{" "}
              {branches.length === 1 ? "branch" : "branches"}
            </span>

            <button
              type="button"
              className="branch-aero-refresh-button"
              onClick={fetchBranches}
              title="Refresh branches"
              aria-label="Refresh branches"
            >
              ↻
            </button>
          </div>
        </div>

        {branches.length === 0 ? (
          <div className="branch-aero-empty">
            <span className="branch-aero-empty-icon" aria-hidden="true">
              ⌂
            </span>
            <strong>No branches found</strong>
            <span>Create a branch using the form above.</span>
          </div>
        ) : (
          <div className="branch-aero-table-wrapper">
            <table className="branch-aero-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Branch Name</th>
                  <th scope="col">Branch Code</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>

              <tbody>
                {branches.map((branch, index) => (
                  <tr key={branch._id}>
                    <td className="branch-aero-index">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td>
                      <div className="branch-aero-name-cell">
                        <span
                          className="branch-aero-row-icon"
                          aria-hidden="true"
                        >
                          ⌂
                        </span>
                        <strong>{branch.name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="branch-aero-code">
                        {branch.code}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`branch-aero-branch-status ${
                          branch.isActive
                            ? "branch-aero-active"
                            : "branch-aero-inactive"
                        }`}
                      >
                        <span />
                        {branch.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="branch-aero-table-footer">
          <span>
            {branches.length} registered{" "}
            {branches.length === 1 ? "branch" : "branches"}
          </span>
          <span className="branch-aero-footer-indicator">
            <span />
            Directory
          </span>
        </footer>
      </section>
    </div>
  );
};

export default BranchManagement;
