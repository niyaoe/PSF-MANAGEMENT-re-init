import { useEffect, useState } from "react";
import api from "../services/api";
import BackButton from "../components/BackButton";
import "../styles/userHistory.css";

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
    new Date().toISOString().split("T")[0],
  );

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Fetch branches
   *
   * Only admin needs the branch list.
   */

  const fetchBranches = async () => {
    if (user?.role !== "admin") {
      return;
    }

    try {
      const response = await api.get("/branches");

      setBranches(response.data.branches || []);
    } catch (error) {
      console.error("Fetch branches error:", error);

      setError(error.response?.data?.message || "Failed to fetch branches");
    }
  };

  /*
   * Fetch user history
   */

  const fetchUserHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        date: selectedDate,
      };

      if (user?.role === "admin" && branchId) {
        params.branchId = branchId;
      }

      const response = await api.get("/psf/user-history", {
        params,
      });

      setSummary(response.data.summary);

      setHistory(response.data.history || []);
    } catch (error) {
      console.error("Fetch user history error:", error);

      setError(error.response?.data?.message || "Failed to fetch user history");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Initial load
   */

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchUserHistory();
  }, []);

  /*
   * Apply filter
   */

  const handleApplyFilter = () => {
    fetchUserHistory();
  };

  /*
   * Clear filter
   */

  const handleClearFilter = () => {
    const today = new Date().toISOString().split("T")[0];

    setSelectedDate(today);
    setBranchId("");

    setTimeout(() => {
      fetchUserHistory();
    }, 0);
  };

  /*
   * Loading
   */

  if (loading) {
    return <div className="user-history-loading">Loading User History...</div>;
  }

  return (
    <div className="user-history-page">
      {/* Header */}

      <div className="user-history-header">
        <BackButton className="user-history-back-button" />

        <div className="user-history-header-content">
          <h1 className="user-history-title">User History</h1>

          <p className="user-history-subtitle">Employee call history</p>
        </div>
      </div>

      {/* Error */}

      {error && <div className="user-history-error">{error}</div>}

      {/* Filters */}

      <div className="user-history-filter-panel">
        <div className="user-history-filter-group">
          <label>History Date</label>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => {
              setSelectedDate(event.target.value);
            }}
          />
        </div>

        {user?.role === "admin" && (
          <div className="user-history-filter-group">
            <label>Branch</label>

            <select
              value={branchId}
              onChange={(event) => {
                setBranchId(event.target.value);
              }}
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

        <div className="user-history-filter-actions">
          <button
            type="button"
            className="user-history-button"
            onClick={handleApplyFilter}
          >
            Apply
          </button>

          <button
            type="button"
            className="user-history-button"
            onClick={handleClearFilter}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Summary */}

      <div className="user-history-summary-grid">
        <div className="user-history-summary-card">
          <div className="user-history-summary-title">Fresh Calls Today</div>

          <div className="user-history-summary-value">
            {summary.freshCallsToday}
          </div>
        </div>

        <div className="user-history-summary-card">
          <div className="user-history-summary-title">
            Fresh Calls This Month
          </div>

          <div className="user-history-summary-value">
            {summary.freshCallsThisMonth}
          </div>
        </div>

        <div className="user-history-summary-card">
          <div className="user-history-summary-title">
            Follow-up Calls Today
          </div>

          <div className="user-history-summary-value">
            {summary.followUpCallsToday}
          </div>
        </div>

        <div className="user-history-summary-card">
          <div className="user-history-summary-title">
            Follow-up Calls This Month
          </div>

          <div className="user-history-summary-value">
            {summary.followUpCallsThisMonth}
          </div>
        </div>

        <div className="user-history-summary-card">
          <div className="user-history-summary-title">Total Calls Today</div>

          <div className="user-history-summary-value">
            {summary.totalCallsToday}
          </div>
        </div>

        <div className="user-history-summary-card">
          <div className="user-history-summary-title">
            Total Calls This Month
          </div>

          <div className="user-history-summary-value">
            {summary.totalCallsThisMonth}
          </div>
        </div>
      </div>

      {/* History Table */}

      <div className="user-history-table-panel">
        <div className="user-history-table-wrapper">
          <table className="user-history-table">
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
                  <td colSpan="8" className="user-history-empty">
                    No employee history found
                  </td>
                </tr>
              ) : (
                history.map((employee) => (
                  <tr key={employee.userId}>
                    <td>{employee.name}</td>

                    <td>{employee.branch || "-"}</td>

                    <td>{employee.freshCallsToday}</td>

                    <td>{employee.freshCallsThisMonth}</td>

                    <td>{employee.followUpCallsToday}</td>

                    <td>{employee.followUpCallsThisMonth}</td>

                    <td>{employee.totalCallsToday}</td>

                    <td>{employee.totalCallsThisMonth}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserHistory;
