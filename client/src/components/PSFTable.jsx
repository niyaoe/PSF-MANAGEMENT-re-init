const PSFTable = ({ records, onSelectRecord, page, limit }) => {
  if (!records || records.length === 0) {
    return <p>No PSF records found.</p>;
  }

  return (
    <div className="aero-table-wrapper">
      <table className="aero-table">
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
              <td>{(page - 1) * limit + index + 1}</td>
              <td
                onClick={() => {
                  onSelectRecord(record);
                }}
              >
                {record.roNumber}
              </td>
              <td>
                {record.billDate
                  ? new Date(record.billDate).toLocaleDateString()
                  : ""}
              </td>

              <td>{record.customerName}</td>

              <td>{record.registrationNumber}</td>

              <td>{record.chassisNumber}</td>

              <td>{record.pincode || "-"}</td>

              <td>{record.ownerMobile}</td>

              <td>{record.branchId?.name}</td>

              <td>{record.model}</td>

              <td>{record.serviceType}</td>

              <td>{record.serviceAdvisorName}</td>

              <td>{record.complaintStatus}</td>

              <td>
                {record.callDate
                  ? new Date(record.callDate).toLocaleDateString()
                  : ""}
              </td>

              <td>{record.rating}</td>

              <td>{record.crmCxmRemarks}</td>
              <td>
                <button
                  onClick={() => {
                    onSelectRecord(record);
                  }}
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
