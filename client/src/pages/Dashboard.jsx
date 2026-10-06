import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import SummaryCard from "../components/SummaryCard";
import DashboardFilters from "../components/DashboardFilters";
import Pagination from "../components/Pagination";
import PSFTable from "../components/PSFTable";
import BranchFilter from "../components/BranchFilter";
import PSFEditModal from "../components/PSFEditModal";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const [summary, setSummary] = useState({
    totalRecords: 0,
    openComplaints: 0,
    closedComplaints: 0,
    notConnected: 0,
  });

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);

      setBranches(user.branches || []);
    }
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (complaintStatus) {
        params.complaintStatus = complaintStatus;
      }

      if (notConnected) {
        params.notConnected = notConnected;
      }

      if (fromDate) {
        params.fromDate = fromDate;
      }

      if (toDate) {
        params.toDate = toDate;
      }

      if (branchId) {
        params.branchId = branchId;
      }

      params.page = page;
      params.limit = limit;

      const response = await api.get("/psf/dashboard", {
        params,
      });
      // console.log(response.data.records);

      setSummary(response.data.summary);
      setRecords(response.data.records);
      setPagination(response.data.pagination);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return;
      }

      const user = JSON.parse(storedUser);

      if (user.role === "admin") {
        const response = await api.get("/branches");

        setBranches(response.data.branches);
      } else {
        setBranches(user.branches || []);
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [page]);

  if (loading) {
    return (
      <div className="eram-loading-screen">
        <div className="eram-spinner">ERAM</div>
      </div>
    );
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <DashboardLayout>
      {/* <h1>PSF Dashboard</h1> */}
      {/* <p>Role: {user?.role}</p> */}
      {/* <p>Accessible Branches: {branches.length}</p> */}
      {/* <button onClick={handleLogout}>Logout</button> */}

      {/* {user?.role === "admin" && (
        <BranchFilter
          branches={branches}
          branchId={branchId}
          setBranchId={setBranchId}
        />
      )} */}

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
        onSearch={fetchDashboard}
        branches={branches}
        branchId={branchId}
        setBranchId={setBranchId}
      />

      <div className="aero-summary-grid">
        <SummaryCard title="Total Records" value={summary.totalRecords} />

        <SummaryCard title="Open Complaints" value={summary.openComplaints} />

        <SummaryCard
          title="Closed Complaints"
          value={summary.closedComplaints}
        />

        <SummaryCard title="Not Connected" value={summary.notConnected} />
        <SummaryCard title="Connected" value={summary.connected} />
      </div>

      <PSFTable
        records={records}
        onSelectRecord={setSelectedRecord}
        page={page}
        limit={limit}
      />

      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        onPageChange={(newPage) => {
          setPage(newPage);
        }}
      />

      <PSFEditModal
        record={selectedRecord}
        onClose={() => {
          setSelectedRecord(null);
        }}
        onSaveSuccess={() => {
          fetchDashboard();
        }}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
