
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./PSFOverallConcernStatus.css";

const PSFOverallConcernStatus = () => {
    const [branches, setBranches] = useState([]);
    const [rows, setRows] = useState([]);
    // const [branchTotals, setBranchTotals] = useState({});
    // const [grandTotal, setGrandTotal] = useState(0);
    const [selectedConcernIds, setSelectedConcernIds] = useState([]);
    const [concernDropdownOpen, setConcernDropdownOpen] = useState(false);

    const [branchId, setBranchId] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch overall concern status
    const fetchOverallConcernStatus = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (branchId) params.branchId = branchId;
            if (fromDate) params.fromDate = fromDate;
            if (toDate) params.toDate = toDate;

            const response = await api.get(
                "/psf/overall-concern-status",
                { params }
            );

            const fetchedRows = response.data.rows || [];

            setBranches(response.data.branches || []);
            setRows(fetchedRows);


            // Select only the specified concerns by default
            const defaultSelectedConcernNames = [
                "PDI related",
                "Passed To CRM",
                "Vehicle at Service Center",
                "Wrong Number",
                "Infra - Sales",
                "Previous Service Related",
                "Vehicle Damage",
                "Proper Updation",
                "Using Other Person",
                "Behaviour of Staffs",
                "Work Not Completed",
                "Software Updation",
                "RSA Related",
                "Parts / Accessory Related",
                "Vehicle Damaged during RoadTest/ P&D",
                "Poor Workshop Infrastructure/ambience",
                "Service Quality",
                "Items Missing in the workshop",
                "Unauthorised use of Vehicle",
                "Department Vehicle",
                "Product Related",
                "Infra - Service",
                "Washing Issue",
                "Vehicle Not Driven",
                "Delay in Delivery",
                "Delay in Attending",
                "Delay in Appointment",
                "Compliant Not Solved",
                "Bill Amount Issue",
                "Parts Issue",
            ];

            setSelectedConcernIds(
                fetchedRows
                    .filter(row =>
                        defaultSelectedConcernNames.includes(
                            row.concernName?.trim()
                        )
                    )
                    .map(row => String(row._id))
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load overall concern status."
            );
        } finally {
            setLoading(false);
        }
    }, [branchId, fromDate, toDate]);

    useEffect(() => {
        fetchOverallConcernStatus();
    }, [fetchOverallConcernStatus]);

    // Reset filters
    const clearFilters = () => {
        setBranchId("");
        setFromDate("");
        setToDate("");
    };

    const activeFilters = [
        branchId,
        fromDate,
        toDate,
    ].filter(Boolean).length;

    // Selected concern rows
    const selectedRows = rows
        .filter(row =>
            selectedConcernIds.includes(String(row._id))
        )
        .sort((a, b) => Number(b.total || 0) - Number(a.total || 0));

    // Selected concern count
    const selectedConcernCount = selectedRows.length;

    // Selected grand total
    const selectedGrandTotal = selectedRows.reduce(
        (sum, row) => sum + Number(row.total || 0),
        0
    );

    // Branch-wise totals based only on selected concerns
    const selectedBranchTotals = {};

    branches.forEach(branch => {
        selectedBranchTotals[branch._id] = selectedRows.reduce(
            (sum, row) =>
                sum + Number(row.counts?.[branch._id] || 0),
            0
        );
    });

    // Toggle individual concern
    const toggleConcern = (concernId) => {
        setSelectedConcernIds(prev =>
            prev.includes(String(concernId))
                ? prev.filter(id => id !== String(concernId))
                : [...prev, String(concernId)]
        );
    };

    // Clear all selected concerns
    const clearSelectedConcerns = () => {
        setSelectedConcernIds([]);
    };

    return (
        <main className="psf-concern-page">

            {/* Toolbar */}
            <div className="psf-concern-toolbar">

                <div className="psf-concern-toolbar-left">
                    <span className="psf-concern-app-icon">☷</span>

                    <div className="psf-concern-toolbar-title">
                        <strong>PSF Overall Concern Status</strong>
                        <span>Branch-wise concern summary</span>
                    </div>
                </div>

                <div className="psf-concern-toolbar-right">

                    <div className="psf-concern-total">
                        <span>Grand Total</span>
                        <strong>
                            {selectedGrandTotal.toLocaleString("en-IN")}
                        </strong>
                    </div>

                    <div className="psf-concern-dropdown">

                        <button
                            type="button"
                            className={`psf-concern-button ${concernDropdownOpen ? "active" : ""
                                }`}
                            onClick={() =>
                                setConcernDropdownOpen(prev => !prev)
                            }
                        >
                            ☷ Concerns

                            <span className="psf-concern-filter-count">
                                {selectedConcernCount}/{rows.length}
                            </span>

                            <span className="psf-concern-chevron">
                                {concernDropdownOpen ? "▲" : "▼"}
                            </span>
                        </button>

                        {concernDropdownOpen && (
                            <div className="psf-concern-dropdown-menu">

                                <div className="psf-concern-dropdown-header">
                                    <strong>Select Concerns</strong>

                                    <button
                                        type="button"
                                        onClick={clearSelectedConcerns}
                                    >
                                        Clear
                                    </button>
                                </div>

                                <div className="psf-concern-dropdown-list">

                                    {rows.map(row => (
                                        <label
                                            key={row._id}
                                            className="psf-concern-checkbox"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedConcernIds.includes(
                                                    String(row._id)
                                                )}
                                                onChange={() =>
                                                    toggleConcern(row._id)
                                                }
                                            />

                                            <span>{row.concernName}</span>

                                            <small>
                                                {Number(row.total || 0).toLocaleString("en-IN")}
                                            </small>
                                        </label>
                                    ))}

                                    {rows.length === 0 && (
                                        <div className="psf-concern-dropdown-empty">
                                            No concerns available
                                        </div>
                                    )}

                                </div>

                                <div className="psf-concern-dropdown-footer">
                                    {selectedConcernCount} of {rows.length} selected
                                </div>

                            </div>
                        )}

                    </div>

                    <button
                        type="button"
                        className={`psf-concern-button ${filtersOpen ? "active" : ""}`}
                        onClick={() => setFiltersOpen(prev => !prev)}
                        aria-expanded={filtersOpen}
                    >
                        ☷ Filters

                        {activeFilters > 0 && (
                            <span className="psf-concern-filter-count">
                                {activeFilters}
                            </span>
                        )}

                        <span className="psf-concern-chevron">
                            {filtersOpen ? "▲" : "▼"}
                        </span>
                    </button>

                    <button
                        type="button"
                        className="psf-concern-button"
                        onClick={fetchOverallConcernStatus}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>

                </div>
            </div>

            {/* Filters */}
            <section
                className={`psf-concern-filter-wrap ${filtersOpen ? "expanded" : ""}`}
                aria-hidden={!filtersOpen}
            >
                <div className="psf-concern-filter-inner">

                    <div className="psf-concern-filter-field">
                        <label htmlFor="concern-branch">
                            Branch
                        </label>

                        <select
                            id="concern-branch"
                            value={branchId}
                            onChange={e => setBranchId(e.target.value)}
                            disabled={!filtersOpen}
                        >
                            <option value="">
                                All accessible branches
                            </option>

                            {branches.map(branch => (
                                <option
                                    key={branch._id}
                                    value={branch._id}
                                >
                                    {branch.code || branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="psf-concern-filter-field">
                        <label htmlFor="concern-from-date">
                            Bill date from
                        </label>

                        <input
                            id="concern-from-date"
                            type="date"
                            value={fromDate}
                            max={toDate || undefined}
                            onChange={e => setFromDate(e.target.value)}
                            disabled={!filtersOpen}
                        />
                    </div>

                    <div className="psf-concern-filter-field">
                        <label htmlFor="concern-to-date">
                            Bill date to
                        </label>

                        <input
                            id="concern-to-date"
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            onChange={e => setToDate(e.target.value)}
                            disabled={!filtersOpen}
                        />
                    </div>

                    <div className="psf-concern-filter-actions">

                        <button
                            type="button"
                            className="psf-concern-button"
                            onClick={clearFilters}
                            disabled={!filtersOpen}
                        >
                            Reset
                        </button>

                        <button
                            type="button"
                            className="psf-concern-button primary"
                            onClick={fetchOverallConcernStatus}
                            disabled={!filtersOpen || loading}
                        >
                            Apply Filters
                        </button>

                    </div>
                </div>
            </section>

            {/* Error */}
            {error && (
                <div className="psf-concern-error" role="alert">
                    <span>{error}</span>

                    <button
                        type="button"
                        className="psf-concern-button"
                        onClick={fetchOverallConcernStatus}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Table */}
            <section className="psf-concern-table-panel">

                {loading ? (
                    <div className="psf-concern-loading">
                        <span className="psf-concern-spinner" />
                        Loading overall concern status...
                    </div>
                ) : (
                    <div className="psf-concern-table-scroll">

                        <table className="psf-concern-table">

                            <thead>
                                <tr>
                                    <th className="psf-concern-heading">
                                        Concern
                                    </th>

                                    {branches.map(branch => (
                                        <th
                                            key={branch._id}
                                            title={branch.name}
                                        >
                                            {branch.code || branch.name}
                                        </th>
                                    ))}

                                    <th className="psf-concern-total-heading">
                                        Total
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {selectedRows.map(row => (
                                    <tr key={row._id}>

                                        <td className="psf-concern-name">
                                            {row.concernName || "Unknown concern"}
                                        </td>

                                        {branches.map(branch => (
                                            <td key={branch._id}>
                                                {Number(row.counts?.[branch._id] ?? 0) === 0
                                                    ? "-"
                                                    : Number(row.counts?.[branch._id]).toLocaleString("en-IN")}
                                            </td>
                                        ))}

                                        <td className="psf-concern-row-total">
                                            {Number(row.total || 0).toLocaleString("en-IN")}
                                        </td>

                                    </tr>
                                ))}

                                {selectedRows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={branches.length + 2}
                                            className="psf-concern-empty"
                                        >
                                            No concerns found.
                                        </td>
                                    </tr>
                                )}

                                {/* Sticky Grand Total */}
                                <tr className="psf-concern-grand-total">

                                    <td>Grand Total</td>

                                    {branches.map(branch => (
                                        <td key={branch._id}>
                                            {Number(
                                                selectedBranchTotals[branch._id] ?? 0
                                            ).toLocaleString("en-IN")}
                                        </td>
                                    ))}

                                    <td>
                                        {selectedGrandTotal.toLocaleString("en-IN")}
                                    </td>

                                </tr>

                            </tbody>
                        </table>
                    </div>
                )}

                {/* Status bar */}
                <footer className="psf-concern-statusbar">
                    <span>{branches.length} branches</span>
                    <span>{selectedConcernCount} / {rows.length} concerns selected</span>

                    <span className="psf-concern-status-total">
                        Total: {selectedGrandTotal.toLocaleString("en-IN")}
                    </span>
                </footer>

            </section>
        </main>
    );
};

export default PSFOverallConcernStatus;
