
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./PSFOverallConcernStatus.css";

const PSFOverallConcernStatus = () => {
    const [branches, setBranches] = useState([]);
    const [rows, setRows] = useState([]);
    const [branchTotals, setBranchTotals] = useState({});
    const [grandTotal, setGrandTotal] = useState(0);

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

            setBranches(response.data.branches || []);
            setRows(response.data.rows || []);
            setBranchTotals(response.data.branchTotals || {});
            setGrandTotal(response.data.grandTotal || 0);

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
                            {grandTotal.toLocaleString("en-IN")}
                        </strong>
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

                                {rows.map(row => (
                                    <tr key={row._id}>

                                        <td className="psf-concern-name">
                                            {row.concernName || "Unknown concern"}
                                        </td>

                                        {branches.map(branch => (
                                            <td key={branch._id}>
                                                {Number(
                                                    row.counts?.[branch._id] ?? 0
                                                ).toLocaleString("en-IN")}
                                            </td>
                                        ))}

                                        <td className="psf-concern-row-total">
                                            {Number(row.total || 0).toLocaleString("en-IN")}
                                        </td>

                                    </tr>
                                ))}

                                {rows.length === 0 && (
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
                                                branchTotals?.[branch._id] ?? 0
                                            ).toLocaleString("en-IN")}
                                        </td>
                                    ))}

                                    <td>
                                        {grandTotal.toLocaleString("en-IN")}
                                    </td>

                                </tr>

                            </tbody>
                        </table>
                    </div>
                )}

                {/* Status bar */}
                <footer className="psf-concern-statusbar">
                    <span>{branches.length} branches</span>
                    <span>{rows.length} concerns</span>

                    <span className="psf-concern-status-total">
                        Total: {grandTotal.toLocaleString("en-IN")}
                    </span>
                </footer>

            </section>
        </main>
    );
};

export default PSFOverallConcernStatus;
