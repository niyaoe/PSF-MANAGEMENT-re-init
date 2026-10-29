
import { Fragment, useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./PSFOverallStatus.css";

const SECTION_ORDER = ["open", "closed", "pending"];

const SECTION_LABELS = {
    open: "Open",
    closed: "Closed",
    pending: "Pending",
};

const PSFOverallStatus = () => {
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

    const fetchOverallStatus = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};
            if (branchId) params.branchId = branchId;
            if (fromDate) params.fromDate = fromDate;
            if (toDate) params.toDate = toDate;

            const response = await api.get("/psf/overall-status", {
                params,
            });

            setBranches(response.data.branches || []);
            setRows(response.data.rows || []);
            setBranchTotals(response.data.branchTotals || {});
            setGrandTotal(response.data.grandTotal || 0);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load overall status."
            );
        } finally {
            setLoading(false);
        }
    }, [branchId, fromDate, toDate]);

    useEffect(() => {
        fetchOverallStatus();
    }, [fetchOverallStatus]);

    const groupedRows = SECTION_ORDER.map((section) => {
        const sectionRows = rows.filter(
            (row) => row.section === section
        );

        return {
            section,
            rows: sectionRows,
            total: sectionRows.reduce(
                (sum, row) => sum + (Number(row.total) || 0),
                0
            ),
        };
    });

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
        <main className="psf-overall-page">
            <div className="psf-aero-toolbar">
                <div className="psf-aero-toolbar-left">
                    <span className="psf-aero-app-icon">▦</span>

                    <div className="psf-aero-toolbar-title">
                        <strong>PSF Overall Status</strong>
                        <span>Branch-wise summary</span>
                    </div>
                </div>

                <div className="psf-aero-toolbar-right">
                    <div className="psf-aero-total">
                        <span>Grand Total</span>
                        <strong>
                            {grandTotal.toLocaleString("en-IN")}
                        </strong>
                    </div>

                    <button
                        type="button"
                        className={`psf-aero-button psf-aero-filter-toggle ${filtersOpen ? "active" : ""
                            }`}
                        onClick={() => setFiltersOpen((prev) => !prev)}
                        aria-expanded={filtersOpen}
                    >
                        <span>☷</span>
                        Filters
                        {activeFilters > 0 && (
                            <span className="psf-aero-filter-count">
                                {activeFilters}
                            </span>
                        )}
                        <span className="psf-aero-chevron">
                            {filtersOpen ? "▲" : "▼"}
                        </span>
                    </button>

                    <button
                        type="button"
                        className="psf-aero-button"
                        onClick={fetchOverallStatus}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>
                </div>
            </div>

            <section
                className={`psf-aero-filter-wrap ${filtersOpen ? "expanded" : ""
                    }`}
                aria-hidden={!filtersOpen}
            >
                <div className="psf-aero-filter-inner">
                    <div className="psf-aero-filter-field">
                        <label htmlFor="overall-branch">Branch</label>
                        <select
                            id="overall-branch"
                            value={branchId}
                            onChange={(event) =>
                                setBranchId(event.target.value)
                            }
                            disabled={!filtersOpen}
                        >
                            <option value="">All accessible branches</option>
                            {branches.map((branch) => (
                                <option
                                    key={branch._id}
                                    value={branch._id}
                                >
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="psf-aero-filter-field">
                        <label htmlFor="overall-from-date">
                            Bill date from
                        </label>
                        <input
                            id="overall-from-date"
                            type="date"
                            value={fromDate}
                            max={toDate || undefined}
                            onChange={(event) =>
                                setFromDate(event.target.value)
                            }
                            disabled={!filtersOpen}
                        />
                    </div>

                    <div className="psf-aero-filter-field">
                        <label htmlFor="overall-to-date">
                            Bill date to
                        </label>
                        <input
                            id="overall-to-date"
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            onChange={(event) =>
                                setToDate(event.target.value)
                            }
                            disabled={!filtersOpen}
                        />
                    </div>

                    <div className="psf-aero-filter-actions">
                        <button
                            type="button"
                            className="psf-aero-button"
                            onClick={clearFilters}
                            disabled={!filtersOpen}
                        >
                            Reset
                        </button>

                        <button
                            type="button"
                            className="psf-aero-button primary"
                            onClick={fetchOverallStatus}
                            disabled={!filtersOpen || loading}
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </section>

            {error && (
                <div className="psf-aero-error" role="alert">
                    <span>{error}</span>
                    <button
                        type="button"
                        className="psf-aero-button"
                        onClick={fetchOverallStatus}
                    >
                        Retry
                    </button>
                </div>
            )}

            <section className="psf-aero-table-panel">
                {loading ? (
                    <div className="psf-aero-loading">
                        <span className="psf-aero-spinner" />
                        Loading overall status...
                    </div>
                ) : (
                    <div className="psf-aero-table-scroll">
                        <table className="psf-overall-table">
                            <thead>
                                <tr>
                                    <th className="psf-overall-concern-heading">
                                        Concern
                                    </th>

                                    {branches.map((branch) => (
                                        <th key={branch._id} title={branch.name}>
                                            {branch.code || branch.name}
                                        </th>
                                    ))}

                                    <th className="psf-overall-total-heading">
                                        Total
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {groupedRows.map((group) => (
                                    <Fragment key={group.section}>
                                        <tr
                                            className={`psf-overall-section-row psf-overall-section-${group.section}`}
                                        >
                                            <td colSpan={branches.length + 2}>
                                                <span>
                                                    {SECTION_LABELS[group.section]}
                                                </span>
                                                <strong>
                                                    {group.total.toLocaleString("en-IN")}
                                                </strong>
                                            </td>
                                        </tr>

                                        {group.rows.map((row) => (
                                            <tr
                                                key={row._id}
                                                className={`psf-overall-row-${group.section}`}
                                            >
                                                <td className="psf-overall-concern-name">
                                                    {row.concernName ||
                                                        row.name ||
                                                        "Unknown concern"}
                                                </td>

                                                {branches.map((branch) => (
                                                    <td
                                                        key={branch._id}
                                                        className="psf-overall-count-cell"
                                                    >
                                                        {(
                                                            row.counts?.[branch._id] ?? 0
                                                        ).toLocaleString("en-IN")}
                                                    </td>
                                                ))}

                                                <td className="psf-overall-row-total">
                                                    {(Number(row.total) || 0).toLocaleString("en-IN")}
                                                </td>
                                            </tr>
                                        ))}
                                    </Fragment>
                                ))}

                                {rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={branches.length + 2}
                                            className="psf-overall-empty"
                                        >
                                            No concern records found for these filters.
                                        </td>
                                    </tr>
                                )}

                                <tr className="psf-overall-grand-total-row">
                                    <td>Grand Total</td>

                                    {branches.map((branch) => (
                                        <td key={branch._id}>
                                            {(
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

                <footer className="psf-aero-statusbar">
                    <span>{branches.length} branches</span>
                    <span>{rows.length} concern rows</span>
                    <span className="psf-aero-status-total">
                        Total: {grandTotal.toLocaleString("en-IN")}
                    </span>
                </footer>
            </section>
        </main>
    );
};

export default PSFOverallStatus;
