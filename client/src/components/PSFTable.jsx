
import "./PSFTable.css";

const PSFTable = ({ records, onSelectRecord, page, limit }) => {
  if (!records || records.length === 0) {
    return (
      <div className="psft-empty">
        <span className="psft-empty-icon">▤</span>
        <strong>No PSF records found</strong>
        <p>Try changing your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="psft-wrapper">
      <table className="psft-table">
        <thead>
          <tr>
            <th>Sl No.</th>
            <th>RO Number</th>
            <th>Bill Date</th>
            <th>Customer Name</th>
            <th>Registration No.</th>
            <th>Chassis No.</th>
            <th>Pincode</th>
            <th>Owner Mobile</th>
            <th>Branch</th>
            <th>Model</th>
            <th>Service Type</th>
            <th>SA Name</th>
            <th>Complaint Status</th>
            <th>Call Date</th>
            <th>Rating</th>
            <th>CRM/CXM Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record, index) => (
            <tr key={record._id}>
              <td className="psft-number">
                {(page - 1) * limit + index + 1}
              </td>
              <td className="psft-ro">{record.roNumber || "-"}</td>
              <td>
                {record.billDate
                  ? new Date(record.billDate).toLocaleDateString()
                  : "-"}
              </td>
              <td className="psft-customer">
                {record.customerName || "-"}
              </td>
              <td>{record.registrationNumber || "-"}</td>
              <td>{record.chassisNumber || "-"}</td>
              <td>{record.pincode || "-"}</td>
              <td>{record.ownerMobile || "-"}</td>
              <td>{record.branchId?.name || "-"}</td>
              <td>{record.model || "-"}</td>
              <td>{record.serviceType || "-"}</td>
              <td>{record.serviceAdvisorName || "-"}</td>
              <td>
                <span
                  className={`psft-status ${
                    record.complaintStatus
                      ? `psft-status-${String(
                          record.complaintStatus
                        ).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
                      : ""
                  }`}
                >
                  {record.complaintStatus || "-"}
                </span>
              </td>
              <td>
                {record.callDate
                  ? new Date(record.callDate).toLocaleDateString()
                  : "-"}
              </td>
              <td>{record.rating ?? "-"}</td>
              <td className="psft-remarks" title={record.crmCxmRemarks || ""}>
                {record.crmCxmRemarks || "-"}
              </td>
              <td>
                <button
                  type="button"
                  className="psft-action-button"
                  onClick={() => onSelectRecord(record)}
                  aria-label={`View or edit record ${record.roNumber || ""}`}
                >
                  View / Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PSFTable;
