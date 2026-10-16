
import { useEffect, useState } from "react";
import api from "../services/api";
import BackButton from "../components/BackButton";
import "./UserHistory.css";

const UserHistory = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [history, setHistory] = useState([]);

  const [summary, setSummary] = useState({
    freshCallsToday: 0,
    freshCallsThisMonth: 0,
    followUpCallsToday: 0,
    followUpCallsThisMonth: 0,
    totalCallsToday: 0,
    totalCallsThisMonth: 0,
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBranches = async () => {
    if (user?.role !== "admin") return;

    try {
      const response = await api.get("/branches");
      setBranches(response.data.branches || []);
    } catch (error) {
      console.error("Fetch branches error:", error);
      setError(
        error.response?.data?.message || "Failed to fetch branches"
      );
    }
  };

  const fetchUserHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const params = { date: selectedDate };

      if (user?.role === "admin" && branchId) {
        params.branchId = branchId;
      }

      const response = await api.get("/psf/user-history", { params });

      setSummary(response.data.summary);
      setHistory(response.data.history || []);
    } catch (error) {
      console.error("Fetch user history error:", error);
      setError(
        error.response?.data?.message || "Failed to fetch user history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchUserHistory();
  }, []);

  const handleApplyFilter = () => {
    fetchUserHistory();
  };

  const handleClearFilter = () => {
    const today = new Date().toISOString().split("T")[0];

    setSelectedDate(today);
    setBranchId("");

    setTimeout(() => {
      fetchUserHistory();
    }, 0);
  };

  return (
    <div className="user-history-page">
      {/* Aero header */}
      <header className="uh-aero-header">
        <div className="uh-aero-heading-icon" aria-hidden="true">
          <span>▤</span>
          <span>◷</span>
        </div>

        <div className="uh-aero-header-content">
          <h1 className="uh-aero-title">User History</h1>
          <p className="uh-aero-subtitle">
            Employee call history and daily activity summary
          </p>
        </div>

        <div className="uh-aero-header-meta">
          <span className="uh-aero-status-light" />
          Call Activity
        </div>
      </header>

      {/* Back button */}
      {/* <div className="uh-back-row">
        <BackButton className="user-history-back-button" />
      </div> */}

      {/* Error */}
      {error && (
        <div className="uh-aero-message uh-aero-error" role="alert">
          <span className="uh-aero-message-icon">!</span>
          <span>{error}</span>
          <button
            type="button"
            className="uh-aero-message-close"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <section className="uh-aero-panel">
        <div className="uh-aero-panel-heading">
          <div className="uh-aero-panel-icon">⚙</div>
          <div>
            <h2 className="uh-aero-panel-title">History Filters</h2>
            <p className="uh-aero-panel-subtitle">
              Select a date and branch to view call activity.
            </p>
          </div>
        </div>

        <div className="uh-aero-filter-form">
          <div className="uh-aero-form-group">
            <label htmlFor="uh-history-date">History Date</label>
            <input
              id="uh-history-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>

          {user?.role === "admin" && (
            <div className="uh-aero-form-group">
              <label htmlFor="uh-history-branch">Branch</label>
              <select
                id="uh-history-branch"
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
              >
                <option value="">All Branches</option>
                {branches.map((branch) => {
                  const id = branch._id || branch.id;

                  return (
                    <option key={id} value={id}>
                      {branch.name}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="uh-aero-filter-actions">
            <button
              type="button"
              className="uh-aero-button uh-aero-primary-button"
              onClick={handleApplyFilter}
              disabled={loading}
            >
              Apply Filter
            </button>

            <button
              type="button"
              className="uh-aero-button uh-aero-secondary-button"
              onClick={handleClearFilter}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="uh-aero-summary-section">
        <div className="uh-aero-section-heading">
          <div>
            <h2>Call Activity Summary</h2>
            <p>Today and month-to-date call counts</p>
          </div>

          <span className="uh-aero-date-chip">{selectedDate}</span>
        </div>

        <div className="uh-aero-summary-grid">
          <div className="uh-aero-summary-card uh-aero-fresh">
            <div className="uh-aero-summary-top">
              <span className="uh-aero-summary-icon">☎</span>
              <span className="uh-aero-summary-tag">TODAY</span>
            </div>
            <div className="uh-aero-summary-title">Fresh Calls Today</div>
            <div className="uh-aero-summary-value">
              {summary.freshCallsToday}
            </div>
          </div>

          <div className="uh-aero-summary-card uh-aero-fresh">
            <div className="uh-aero-summary-top">
              <span className="uh-aero-summary-icon">▦</span>
              <span className="uh-aero-summary-tag">MONTH</span>
            </div>
            <div className="uh-aero-summary-title">
              Fresh Calls This Month
            </div>
            <div className="uh-aero-summary-value">
              {summary.freshCallsThisMonth}
            </div>
          </div>

          <div className="uh-aero-summary-card uh-aero-followup">
            <div className="uh-aero-summary-top">
              <span className="uh-aero-summary-icon">↻</span>
              <span className="uh-aero-summary-tag">TODAY</span>
            </div>
            <div className="uh-aero-summary-title">Follow-up Calls Today</div>
            <div className="uh-aero-summary-value">
              {summary.followUpCallsToday}
            </div>
          </div>

          <div className="uh-aero-summary-card uh-aero-followup">
            <div className="uh-aero-summary-top">
              <span className="uh-aero-summary-icon">▦</span>
              <span className="uh-aero-summary-tag">MONTH</span>
            </div>
            <div className="uh-aero-summary-title">
              Follow-up Calls This Month
            </div>
            <div className="uh-aero-summary-value">
              {summary.followUpCallsThisMonth}
            </div>
          </div>

          <div className="uh-aero-summary-card uh-aero-total">
            <div className="uh-aero-summary-top">
              <span className="uh-aero-summary-icon">Σ</span>
              <span className="uh-aero-summary-tag">TODAY</span>
            </div>
            <div className="uh-aero-summary-title">Total Calls Today</div>
            <div className="uh-aero-summary-value">
              {summary.totalCallsToday}
            </div>
          </div>

          <div className="uh-aero-summary-card uh-aero-total">
            <div className="uh-aero-summary-top">
              <span className="uh-aero-summary-icon">▤</span>
              <span className="uh-aero-summary-tag">MONTH</span>
            </div>
            <div className="uh-aero-summary-title">
              Total Calls This Month
            </div>
            <div className="uh-aero-summary-value">
              {summary.totalCallsThisMonth}
            </div>
          </div>
        </div>
      </section>

      {/* History table */}
      <section className="uh-aero-panel uh-aero-history-panel">
        <div className="uh-aero-panel-heading uh-aero-table-heading">
          <div className="uh-aero-panel-icon">▤</div>
          <div className="uh-aero-table-heading-content">
            <h2 className="uh-aero-panel-title">Employee History</h2>
            <p className="uh-aero-panel-subtitle">
              Call activity by employee and branch
            </p>
          </div>

          <div className="uh-aero-table-tools">
            <span className="uh-aero-count-chip">
              {history.length} Employees
            </span>
            <button
              type="button"
              className="uh-aero-refresh-button"
              onClick={fetchUserHistory}
              disabled={loading}
              aria-label="Refresh user history"
              title="Refresh"
            >
              <span className={loading ? "uh-aero-spin" : ""}>↻</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="uh-aero-state">
            <span className="uh-aero-loader" />
            Loading user history...
          </div>
        ) : (
          <div className="uh-aero-table-wrapper">
            <table className="uh-aero-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Branch</th>
                  <th>Fresh Today</th>
                  <th>Fresh This Month</th>
                  <th>Follow-up Today</th>
                  <th>Follow-up This Month</th>
                  <th>Total Today</th>
                  <th>Total This Month</th>
                </tr>
              </thead>

              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="uh-aero-empty">
                      <span className="uh-aero-empty-icon">◇</span>
                      <strong>No employee history found</strong>
                      <span>Try selecting another date or branch.</span>
                    </td>
                  </tr>
                ) : (
                  history.map((employee) => (
                    <tr key={employee.userId}>
                      <td className="uh-aero-employee-name">
                        <span className="uh-aero-employee-avatar">
                          {(employee.name || "?").charAt(0).toUpperCase()}
                        </span>
                        {employee.name}
                      </td>
                      <td>{employee.branch || "-"}</td>
                      <td>{employee.freshCallsToday}</td>
                      <td>{employee.freshCallsThisMonth}</td>
                      <td>{employee.followUpCallsToday}</td>
                      <td>{employee.followUpCallsThisMonth}</td>
                      <td className="uh-aero-total-cell">
                        {employee.totalCallsToday}
                      </td>
                      <td className="uh-aero-total-cell">
                        {employee.totalCallsThisMonth}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="uh-aero-table-footer">
          <span>
            Showing <strong>{loading ? "—" : history.length}</strong> employees
          </span>
          <span className="uh-aero-footer-indicator">
            <span />
            User activity records
          </span>
        </div>
      </section>
    </div>
  );
};

export default UserHistory;
