
import BranchFilter from "./BranchFilter";
import "./DashboardFilters.css";

const DashboardFilters = ({
  search,
  setSearch,
  complaintStatus,
  setComplaintStatus,
  notConnected,
  setNotConnected,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  dateField,
  setDateField,
  onSearch,
  branches,
  branchId,
  setBranchId,
}) => {
  const handleClearFilters = () => {
    setSearch("");
    setComplaintStatus("");
    setNotConnected("All");
    setFromDate("");
    setToDate("");
    setBranchId("");
    setDateField("billDate");
  };

  const dateLabel = dateField === "billDate" ? "Bill Date" : "Call Date";

  return (
    <div className="aero-filter-panel">
      <div className="aero-filter-group">
        <label>Search</label>
        <input
          type="text"
          placeholder="RO, registration, chassis, Name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {branches.length > 0 && (
        <BranchFilter
          branches={branches}
          branchId={branchId}
          setBranchId={setBranchId}
        />
      )}

      <div className="aero-filter-group aero-date-switch-group">
        <label>Filter Date By</label>

        <div className="aero-date-switch">
          <button
            type="button"
            className={dateField === "billDate" ? "active" : ""}
            onClick={() => setDateField("billDate")}
          >
            Bill
          </button>

          <button
            type="button"
            className={dateField === "callDate" ? "active" : ""}
            onClick={() => setDateField("callDate")}
          >
            Call
          </button>
        </div>
      </div>

      <div className="aero-filter-group">
        <label>{dateLabel} From</label>
        <input
          type="date"
          value={fromDate}
          onChange={(event) => setFromDate(event.target.value)}
        />
      </div>

      <div className="aero-filter-group">
        <label>{dateLabel} To</label>
        <input
          type="date"
          value={toDate}
          onChange={(event) => setToDate(event.target.value)}
        />
      </div>

      <div className="aero-filter-actions">
        <button
          className="aero-button"
          type="button"
          onClick={onSearch}
        >
          Apply Filter
        </button>

        <button
          className="aero-button"
          type="button"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default DashboardFilters;
