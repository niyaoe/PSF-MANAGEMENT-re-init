
import { useState } from "react";
import api from "../services/api";
import "./WhatsAppModal.css";

const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getValue = (value) => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (typeof value === "object") {
        return value.name || value.code || "-";
    }

    return String(value);
};

const WhatsAppModal = ({ onClose }) => {
    const [roNumber, setRoNumber] = useState("");
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copyMessage, setCopyMessage] = useState("");

    const handleSearch = async (event) => {
        event.preventDefault();

        const searchValue = roNumber.trim();

        if (!searchValue) {
            setError("Please enter an RO Number.");
            return;
        }

        setLoading(true);
        setError("");
        setCopyMessage("");
        setRecord(null);

        try {
            const response = await api.get("/psf", {
                params: {
                    search: searchValue,
                    page: 1,
                    limit: 100,
                },
            });

            const records = response.data.records || [];

            // The API search also matches customer name, registration,
            // chassis number and mobile, so match RO Number exactly here.
            const matches = records.filter(
                (item) =>
                    String(item.roNumber || "").trim().toLowerCase() ===
                    searchValue.toLowerCase(),
            );

            if (matches.length === 0) {
                setError("No record found for this RO Number.");
                return;
            }

            if (matches.length > 1) {
                setError(
                    "Multiple records have this RO Number. Please contact your administrator.",
                );
                return;
            }

            setRecord(matches[0]);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to search records.",
            );
        } finally {
            setLoading(false);
        }
    };

    const getWhatsAppText = () => {
        if (!record) return "";

        return [
            // `SlNo: ${getValue(record.slNo)}`,
            `RO Number: ${getValue(record.roNumber)}`,
            `Bill Date: ${formatDate(record.billDate) || "-"}`,
            `Call Date: ${formatDate(record.callDate) || "-"}`,
            `Customer Name: ${getValue(record.customerName)}`,
            `Registration No: ${getValue(record.registrationNumber)}`,
            `Model: ${getValue(record.model)}`,
            `Mobile No: ${getValue(record.ownerMobile || record.userMobile)}`,
            `Service Type: ${getValue(record.serviceType)}`,
            `Concern: ${getValue(record.voc)}`,
            `Location: ${getValue(record.location || record.branchId?.name)}`,
            `Service Advisor: ${getValue(record.serviceAdvisor)}`,
        ].join("\n");
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getWhatsAppText());
            setCopyMessage("Details copied to clipboard.");
        } catch {
            setCopyMessage(
                "Clipboard access failed. Please allow clipboard access and try again.",
            );
        }
    };

    const handleOpenWhatsApp = () => {
        if (!record) return;

        const text = encodeURIComponent(getWhatsAppText());
        window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    };

    return (
        <div
            className="wa-aero-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                className="wa-aero-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="wa-aero-title"
            >
                <header className="wa-aero-titlebar">
                    <div className="wa-aero-title">
                        <span className="wa-aero-title-icon">☏</span>
                        <span id="wa-aero-title">WhatsApp Details</span>
                    </div>

                    <button
                        type="button"
                        className="wa-aero-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </header>

                <div className="wa-aero-body">
                    <form className="wa-aero-search" onSubmit={handleSearch}>
                        <label htmlFor="wa-ro-number">Search by RO Number</label>

                        <div className="wa-aero-search-row">
                            <input
                                id="wa-ro-number"
                                type="text"
                                value={roNumber}
                                onChange={(event) => setRoNumber(event.target.value)}
                                placeholder="Enter RO Number"
                                autoFocus
                            />

                            <button type="submit" disabled={loading}>
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </div>
                    </form>

                    {error && <div className="wa-aero-error">{error}</div>}

                    {record && (
                        <>
                            <div className="wa-aero-record-heading">
                                <strong>Customer Details</strong>
                                <span>RO: {getValue(record.roNumber)}</span>
                            </div>

                            <div className="wa-aero-details">
                                {[
                                    ["Bill Date", formatDate(record.billDate) || "-"],
                                    ["Call Date", formatDate(record.callDate) || "-"],
                                    ["Customer Name", getValue(record.customerName)],
                                    ["Registration No", getValue(record.registrationNumber)],
                                    ["Model", getValue(record.model)],
                                    [
                                        "Mobile No",
                                        getValue(record.ownerMobile || record.userMobile),
                                    ],
                                    ["Service Type", getValue(record.serviceType)],
                                    ["Location", getValue(record.location || record.branchId?.name)],
                                    ["Service Advisor", getValue(record.serviceAdvisor)],
                                ].map(([label, value]) => (
                                    <div className="wa-aero-detail-row" key={label}>
                                        <strong>{label}:</strong>
                                        <span>{value}</span>
                                    </div>
                                ))}

                                <div className="wa-aero-concern-row">
                                    <strong>Concern:</strong>
                                    <span>{getValue(record.voc)}</span>
                                </div>
                            </div>

                            {copyMessage && (
                                <p className="wa-aero-copy-message" role="status">
                                    {copyMessage}
                                </p>
                            )}

                            <div className="wa-aero-actions">
                                <button
                                    type="button"
                                    className="wa-aero-copy-button"
                                    onClick={handleCopy}
                                >
                                    ▣ Copy Details
                                </button>

                                <button
                                    type="button"
                                    className="wa-aero-whatsapp-button"
                                    onClick={handleOpenWhatsApp}
                                >
                                    ☏ Open WhatsApp
                                </button>
                            </div>
                        </>
                    )}

                    {!record && !error && (
                        <div className="wa-aero-empty">
                            Search using an RO Number to view customer details.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default WhatsAppModal;
