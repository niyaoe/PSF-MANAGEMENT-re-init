import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
// import DashboardLayout from "../components/DashboardLayout";
import DashboardFilters from "../components/DashboardFilters";
import Pagination from "../components/Pagination";
import PSFTable from "../components/PSFTable";
import PSFEditModal from "../components/PSFEditModal";
import "./Dashboard.css";

const SECTIONS = [
  { id: "open", label: "Open", description: "Active complaints", icon: "○" },
  {
    id: "pending",
    label: "Pending",
    description: "Awaiting follow-up",
    icon: "◷",
  },
  {
    id: "closed",
    label: "Closed",
    description: "Resolved complaints",
    icon: "✓",
  },
];

const EMPTY_SUMMARY = {
  totalRecords: 0,
  openComplaints: 0,
  closedComplaints: 0,
  pending: 0,
  notConnected: 0,
  connected: 0,
  concernCounts: [],
};

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [activeSection, setActiveSection] = useState("open");
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [complaintStatus, setComplaintStatus] = useState("");
  const [notConnected, setNotConnected] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalRecords: 0,
    totalPages: 0,
  });

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchBranches = async () => {
      try {
        if (user?.role === "admin") {
          const response = await api.get("/branches");
          if (!cancelled) {
            setBranches(response.data.branches || []);
          }
        } else if (!cancelled) {
          setBranches(user?.branches || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch branches:", err);
        }
      }
    };

    fetchBranches();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
        section: activeSection,
      };

      if (search.trim()) params.search = search.trim();
      if (complaintStatus) params.complaintStatus = complaintStatus;
      if (notConnected) params.notConnected = notConnected;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (branchId) params.branchId = branchId;

      const response = await api.get("/psf/dashboard", { params });

      setSummary((previous) => ({
        ...previous,
        ...response.data.summary,
      }));

      setRecords(response.data.records || []);

      setPagination(
        response.data.pagination || {
          page: 1,
          limit,
          totalRecords: 0,
          totalPages: 0,
        },
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load dashboard records.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    activeSection,
    search,
    complaintStatus,
    notConnected,
    fromDate,
    toDate,
    branchId,
  ]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSearch = () => {
    if (page !== 1) {
      setPage(1);
      return;
    }

    fetchDashboard();
  };

  const handleSectionChange = (section) => {
    if (section === activeSection) return;

    setActiveSection(section);
    setPage(1);
  };

  const sectionTotal = {
    open: summary.openComplaints || 0,
    pending: summary.pending ?? summary.notConnected ?? 0,
    closed: summary.closedComplaints || 0,
  }[activeSection];

  const summaryCards = [
    {
      label: "Open",
      value: summary.openComplaints || 0,
      type: "open",
    },
    {
      label: "Pending",
      value: summary.pending ?? summary.notConnected ?? 0,
      type: "pending",
    },
    {
      label: "Closed",
      value: summary.closedComplaints || 0,
      type: "closed",
    },
  ];

  return (
    <div className="psfd-dashboard">
      {/* 1. FILTERS AT THE TOP */}
      <section className="psfd-filter-section">
        <div className="psfd-filter-topbar">
          <span className="psfd-filter-label">FILTERS</span>

          <button
            type="button"
            className="psfd-refresh-button"
            onClick={fetchDashboard}
            disabled={loading}
            title="Refresh records"
          >
            ↻
          </button>
        </div>

        <DashboardFilters
          search={search}
          setSearch={setSearch}
          complaintStatus={complaintStatus}
          setComplaintStatus={setComplaintStatus}
          notConnected={notConnected}
          setNotConnected={setNotConnected}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          onSearch={handleSearch}
          branches={branches}
          branchId={branchId}
          setBranchId={(id) => {
            setBranchId(id);
            setPage(1);
          }}
        />
      </section>

      {/* 2. SMALL OPEN / PENDING / CLOSED COUNT TILES */}
      <section className="psfd-summary-grid" aria-label="Complaint counts">
        {summaryCards.map((card) => (
          <article
            className={`psfd-summary-card psfd-summary-${card.type}`}
            key={card.type}
          >
            <span className="psfd-summary-label">{card.label}</span>
            <strong className="psfd-summary-value">
              {Number(card.value).toLocaleString("en-IN")}
            </strong>
          </article>
        ))}
      </section>

      {/* 3. PROPERLY ALIGNED SECTION TABS */}
      <section className="psfd-section-panel">
        <div
          className="psfd-section-tabs"
          role="tablist"
          aria-label="Complaint sections"
        >
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={activeSection === section.id}
              className={`psfd-section-tab ${
                activeSection === section.id ? "psfd-section-tab-active" : ""
              } psfd-tab-${section.id}`}
              onClick={() => handleSectionChange(section.id)}
            >
              <span className="psfd-tab-icon" aria-hidden="true">
                {section.icon}
              </span>

              <span className="psfd-tab-copy">
                <strong>{section.label}</strong>
                <small>
                  {Number(
                    {
                      open: summary.openComplaints || 0,
                      pending: summary.pending ?? summary.notConnected ?? 0,
                      closed: summary.closedComplaints || 0,
                    }[section.id],
                  ).toLocaleString("en-IN")}
                </small>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. SUMMARY FOR THE SELECTED SECTION */}
      <section className="psfd-content-panel">
        <div className="psfd-section-summary-header">
          <span>
            {SECTIONS.find((item) => item.id === activeSection)?.label} summary
          </span>
          <span className="psfd-record-count">
            {Number(sectionTotal).toLocaleString("en-IN")} records
          </span>
        </div>

        {summary.concernCounts?.length > 0 ? (
          <div className="psfd-concern-grid">
            {summary.concernCounts.map((concern) => (
              <article
                className="psfd-concern-card"
                key={concern._id || concern.name}
              >
                <span className="psfd-concern-indicator" />
                <span className="psfd-concern-name">{concern.name}</span>
                <strong>
                  {Number(concern.count || 0).toLocaleString("en-IN")}
                </strong>
              </article>
            ))}
          </div>
        ) : (
          <div className="psfd-empty-breakdown">
            No concern summary available.
          </div>
        )}
      </section>

      {/* 5. RECORDS FOR THE SELECTED SECTION */}
      <section className="psfd-content-panel psfd-records-panel">
        <div className="psfd-records-toolbar">
          <span className="psfd-records-title">
            {SECTIONS.find((item) => item.id === activeSection)?.label} records
          </span>

          <span className="psfd-total-badge">
            {Number(pagination.totalRecords || 0).toLocaleString("en-IN")}{" "}
            results
          </span>
        </div>

        {error && (
          <div className="psfd-error-message" role="alert">
            <span>{error}</span>
            <button type="button" onClick={fetchDashboard}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="psfd-loading-state" role="status">
            <span className="psfd-loading-spinner" />
            <span>Loading records...</span>
          </div>
        ) : (
          <div className="psfd-table-container">
            <PSFTable
              records={records}
              onSelectRecord={setSelectedRecord}
              page={page}
              limit={limit}
            />
          </div>
        )}

        {/* 6. PAGINATION AT THE BOTTOM */}
        <div className="psfd-pagination-container">
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>

      <PSFEditModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onSaveSuccess={fetchDashboard}
      />
    </div>
  );
};

export default Dashboard;
