import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/psfEditModal.css";

const PSFEditModal = ({ record, onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    ownerMobile: record?.ownerMobile || "",
    pincode: record?.pincode || "",

    firstCallDate: record?.firstCallDate
      ? record.firstCallDate.substring(0, 10)
      : "",

    secondFollowUpDate: record?.secondFollowUpDate
      ? record.secondFollowUpDate.substring(0, 10)
      : "",

    thirdFollowUpDate: record?.thirdFollowUpDate
      ? record.thirdFollowUpDate.substring(0, 10)
      : "",

    whatsAppBot: record?.whatsAppBot || "",

    rating: record?.rating || "",

    serviceAdvisorBehaviour: record?.serviceAdvisorBehaviour || "",

    advisorExplanation: record?.advisorExplanation || "",

    vehicleCleanliness: record?.vehicleCleanliness || "",

    qualityOfWork: record?.qualityOfWork || "",

    waitingAreaFacilities: record?.waitingAreaFacilities || "",

    deliveryAtPromisedTime: record?.deliveryAtPromisedTime || "",

    voc: record?.voc || "",

    typeOfConcern: record?.typeOfConcern || "",

    callDate: record?.callDate ? record.callDate.substring(0, 10) : "",

    complaintStatus: record?.complaintStatus || "",

    crmCxmRemarks: record?.crmCxmRemarks || "",

    messageToBeSent: record?.messageToBeSent || "",
  });

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!record) {
      return;
    }

    setFormData({
      ownerMobile: record.ownerMobile || "",
      pincode: record.pincode || "",

      firstCallDate: record.firstCallDate
        ? record.firstCallDate.substring(0, 10)
        : "",

      secondFollowUpDate: record.secondFollowUpDate
        ? record.secondFollowUpDate.substring(0, 10)
        : "",

      thirdFollowUpDate: record.thirdFollowUpDate
        ? record.thirdFollowUpDate.substring(0, 10)
        : "",

      whatsAppBot: record.whatsAppBot || "",

      rating: record.rating || "",

      serviceAdvisorBehaviour: record.serviceAdvisorBehaviour || "",

      advisorExplanation: record.advisorExplanation || "",

      vehicleCleanliness: record.vehicleCleanliness || "",

      qualityOfWork: record.qualityOfWork || "",

      waitingAreaFacilities: record.waitingAreaFacilities || "",

      deliveryAtPromisedTime: record.deliveryAtPromisedTime || "",

      voc: record.voc || "",

      typeOfConcern: record.typeOfConcern || "",

      callDate: record.callDate ? record.callDate.substring(0, 10) : "",

      complaintStatus: record.complaintStatus || "",

      crmCxmRemarks: record.crmCxmRemarks || "",

      messageToBeSent: record.messageToBeSent || "",
    });

    setMessage("");
  }, [record]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      setMessage("");

      await api.put(`/psf/${record._id}`, formData);

      setMessage("PSF record updated successfully");

      if (onSaveSuccess) {
        onSaveSuccess();
      }

      onClose();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to update PSF record",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!record) {
    return null;
  }

  return (
    <div className="psf-edit-aero-overlay">
      <div className="psf-edit-aero-modal">
        {/* =================================
                    Title Bar
                ================================= */}

        <div className="psf-edit-aero-titlebar">
          <div className="psf-edit-aero-title">Edit PSF Record</div>

          <button
            className="psf-edit-aero-close"
            type="button"
            onClick={onClose}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* =================================
                    Modal Body
                ================================= */}

        <div className="psf-edit-aero-body">
          {/* =================================
                        Record Information
                    ================================= */}

          <div className="psf-edit-aero-record-info">
            <div className="psf-edit-aero-record-item">
              <span className="psf-edit-aero-record-label">RO Number</span>

              <span className="psf-edit-aero-record-value">
                {record.roNumber || "-"}
              </span>
            </div>

            <div className="psf-edit-aero-record-item">
              <span className="psf-edit-aero-record-label">Customer</span>

              <span className="psf-edit-aero-record-value">
                {record.customerName || "-"}
              </span>
            </div>

            <div className="psf-edit-aero-record-item">
              <span className="psf-edit-aero-record-label">Registration</span>

              <span className="psf-edit-aero-record-value">
                {record.registrationNumber || "-"}
              </span>
            </div>

            <div className="psf-edit-aero-record-item">
              <span className="psf-edit-aero-record-label">Branch</span>

              <span className="psf-edit-aero-record-value">
                {record.branchId?.name || "-"}
              </span>
            </div>

            <div className="psf-edit-aero-record-item">
              <span className="psf-edit-aero-record-label">Model</span>

              <span className="psf-edit-aero-record-value">
                {record.model || "-"}
              </span>
            </div>

            <div className="psf-edit-aero-record-item">
              <span className="psf-edit-aero-record-label">Service Type</span>

              <span className="psf-edit-aero-record-value">
                {record.serviceType || "-"}
              </span>
            </div>

            <div className="psf-edit-aero-record-item">
              <span className="psf-edit-aero-record-label">
                Service Advisor
              </span>

              <span className="psf-edit-aero-record-value">
                {record.serviceAdvisorName || "-"}
              </span>
            </div>

            <div className="psf-edit-aero-record-item">
              <span className="psf-edit-aero-record-label">
                Complaint Status
              </span>

              <span className="psf-edit-aero-record-value">
                {record.complaintStatus || "-"}
              </span>
            </div>
          </div>

          {/* =================================
                        Editable Form
                    ================================= */}

          <div className="psf-edit-aero-form">
            <div className="psf-edit-aero-fields">
              {/* Owner Mobile */}

              <div className="psf-edit-aero-field">
                <label>Owner Mobile</label>

                <input
                  type="text"
                  name="ownerMobile"
                  value={formData.ownerMobile}
                  onChange={handleChange}
                />
              </div>
              {/* Pincode*/}

              <div className="psf-edit-aero-field">
                <label>Pincode</label>

                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  maxLength="6"
                  inputMode="numeric"
                />
              </div>

              {/* 1st Call Date */}

              <div className="psf-edit-aero-field">
                <label>1st Call Date</label>

                <input
                  type="date"
                  name="firstCallDate"
                  value={formData.firstCallDate}
                  onChange={handleChange}
                />
              </div>

              {/* 2nd Follow-up Date */}

              <div className="psf-edit-aero-field">
                <label>2nd Follow-up Date</label>

                <input
                  type="date"
                  name="secondFollowUpDate"
                  value={formData.secondFollowUpDate}
                  onChange={handleChange}
                />
              </div>

              {/* 3rd Follow-up Date */}

              <div className="psf-edit-aero-field">
                <label>3rd Follow-up Date</label>

                <input
                  type="date"
                  name="thirdFollowUpDate"
                  value={formData.thirdFollowUpDate}
                  onChange={handleChange}
                />
              </div>

              {/* WhatsApp Bot */}

              <div className="psf-edit-aero-field">
                <label>WhatsApp Bot</label>

                <select
                  name="whatsAppBot"
                  value={formData.whatsAppBot}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>

                  <option value="Yes">Yes</option>

                  <option value="No">No</option>
                </select>
              </div>

              {/* Rating */}

              <div className="psf-edit-aero-field">
                <label>Rating</label>

                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                >
                  <option value="">Rating</option>

                  <option value="10">10</option>
                  <option value="9">9</option>
                  <option value="8">8</option>
                  <option value="7">7</option>
                  <option value="6">6</option>
                  <option value="5">5</option>
                  <option value="4">4</option>
                  <option value="3">3</option>
                  <option value="2">2</option>
                  <option value="1">1</option>
                </select>
              </div>

              {/* Service Advisor Behaviour */}

              <div className="psf-edit-aero-field">
                <label>Service Advisor Behaviour</label>

                <select
                  name="serviceAdvisorBehaviour"
                  value={formData.serviceAdvisorBehaviour}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>

                  <option value="Very Satisfied">Very Satisfied</option>

                  <option value="Satisfied">Satisfied</option>

                  <option value="Neutral">Neutral</option>

                  <option value="Dissatisfied">Dissatisfied</option>

                  <option value="Very Dissatisfied">Very Dissatisfied</option>
                </select>
              </div>

              {/* Advisor Explanation */}

              <div className="psf-edit-aero-field">
                <label>Advisor Explanation</label>

                <select
                  name="advisorExplanation"
                  value={formData.advisorExplanation}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>

                  <option value="Very Satisfied">Very Satisfied</option>

                  <option value="Satisfied">Satisfied</option>

                  <option value="Neutral">Neutral</option>

                  <option value="Dissatisfied">Dissatisfied</option>

                  <option value="Very Dissatisfied">Very Dissatisfied</option>
                </select>
              </div>

              {/* Vehicle Cleanliness */}

              <div className="psf-edit-aero-field">
                <label>Vehicle Cleanliness</label>

                <select
                  name="vehicleCleanliness"
                  value={formData.vehicleCleanliness}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>

                  <option value="Very Satisfied">Very Satisfied</option>

                  <option value="Satisfied">Satisfied</option>

                  <option value="Neutral">Neutral</option>

                  <option value="Dissatisfied">Dissatisfied</option>

                  <option value="Very Dissatisfied">Very Dissatisfied</option>
                </select>
              </div>

              {/* Quality of Work */}

              <div className="psf-edit-aero-field">
                <label>Quality of Work</label>

                <select
                  name="qualityOfWork"
                  value={formData.qualityOfWork}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>

                  <option value="Very Satisfied">Very Satisfied</option>

                  <option value="Satisfied">Satisfied</option>

                  <option value="Neutral">Neutral</option>

                  <option value="Dissatisfied">Dissatisfied</option>

                  <option value="Very Dissatisfied">Very Dissatisfied</option>
                </select>
              </div>

              {/* Waiting Area */}

              <div className="psf-edit-aero-field">
                <label>Waiting Area Facilities</label>

                <select
                  name="waitingAreaFacilities"
                  value={formData.waitingAreaFacilities}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>

                  <option value="Very Satisfied">Very Satisfied</option>

                  <option value="Satisfied">Satisfied</option>

                  <option value="Neutral">Neutral</option>

                  <option value="Dissatisfied">Dissatisfied</option>

                  <option value="Very Dissatisfied">Very Dissatisfied</option>
                </select>
              </div>

              {/* Delivery */}

              <div className="psf-edit-aero-field">
                <label>Delivery at Promised Time</label>

                <select
                  name="deliveryAtPromisedTime"
                  value={formData.deliveryAtPromisedTime}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>

                  <option value="Very Satisfied">Very Satisfied</option>

                  <option value="Satisfied">Satisfied</option>

                  <option value="Neutral">Neutral</option>

                  <option value="Dissatisfied">Dissatisfied</option>

                  <option value="Very Dissatisfied">Very Dissatisfied</option>
                </select>
              </div>

              {/* VOC */}

              <div className="psf-edit-aero-field psf-edit-aero-field-full">
                <label>VOC</label>

                <textarea
                  name="voc"
                  value={formData.voc}
                  onChange={handleChange}
                />
              </div>

              {/* Type of Concern */}

              <div className="psf-edit-aero-field">
                <label>Type of Concern</label>

                <select
                  name="typeOfConcern"
                  value={formData.typeOfConcern}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>

                  <option value="Call not Connected">Call not Connected</option>

                  <option value="Ring but no Responce">
                    Ring but no Responce
                  </option>

                  <option value="Customer Busy">Customer Busy</option>

                  <option value="Wrong Number">Wrong Number</option>

                  <option value="Call after some Time">
                    Call after some Time
                  </option>

                  <option value="Bill amount issue">Bill amount issue</option>

                  <option value="Complaint Not Solved">
                    Complaint Not Solved
                  </option>

                  <option value="Delay In Appointment">
                    Delay In Appointment
                  </option>

                  <option value="Delay In Attending">Delay In Attending</option>

                  <option value="Delay in Delivery">Delay in Delivery</option>

                  <option value="Satisfied">Satisfied</option>

                  <option value="Parts Issue">Parts Issue</option>

                  <option value="Vehicle at Service Center">
                    Vehicle at Service Center
                  </option>

                  <option value="Vehicle not Driven">Vehicle not Driven</option>

                  <option value="Washing Issue">Washing Issue</option>

                  <option value="Work not Completed">Work not Completed</option>

                  <option value="Behaviour of Staff">Behaviour of Staff</option>

                  <option value="Using Other Person">Using Other Person</option>

                  <option value="Proper Updation">Proper Updation</option>

                  <option value="Vehicle Damage">Vehicle Damage</option>

                  <option value="Already Contacted">Already Contacted</option>

                  <option value="Prvs service related">
                    Prvs service related
                  </option>

                  <option value="Infra-Sales">Infra-Sales</option>

                  <option value="Infra-Service">Infra-Service</option>

                  <option value="Department Vehicle">Department Vehicle</option>

                  <option value="Product Related">Product Related</option>

                  <option value="Unauthorised use of Vehicle">
                    Unauthorised use of Vehicle
                  </option>

                  <option value="Items Missing in the workshop">
                    Items Missing in the workshop
                  </option>

                  <option value="Service Quality">Service Quality</option>

                  <option value="Poor Workshop infrastructure - Ambience">
                    Poor Workshop infrastructure - Ambience
                  </option>

                  <option value="Vehicle Damaged During Road Test / P&D">
                    Vehicle Damaged During Road Test / P&D
                  </option>

                  <option value="Parts / Accessory related">
                    Parts / Accessory related
                  </option>

                  <option value="Product related">Product related</option>

                  <option value="RSA Related">RSA Related</option>

                  <option value="Software updation">Software updation</option>
                </select>
              </div>

              {/* Call Date */}

              <div className="psf-edit-aero-field">
                <label>Call Date</label>

                <input
                  type="date"
                  name="callDate"
                  value={formData.callDate}
                  onChange={handleChange}
                />
              </div>

              {/* Complaint Status */}

              <div className="psf-edit-aero-field">
                <label>Complaint Status</label>

                <select
                  name="complaintStatus"
                  value={formData.complaintStatus}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>

                  <option value="Open">Open</option>

                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* CRM/CXM Remarks */}

              <div className="psf-edit-aero-field psf-edit-aero-field-full">
                <label>CRM/CXM Remarks</label>

                <textarea
                  name="crmCxmRemarks"
                  value={formData.crmCxmRemarks}
                  onChange={handleChange}
                />
              </div>

              {/* Message To Be Sent */}

              <div className="psf-edit-aero-field">
                <label>Message to be Sent</label>

                <select
                  name="messageToBeSent"
                  value={formData.messageToBeSent}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>

                  <option value="Yes">Yes</option>

                  <option value="No">No</option>
                </select>
              </div>
            </div>

            {/* =================================
                            Actions
                        ================================= */}

            <div className="psf-edit-aero-actions">
              <button
                className="psf-edit-aero-button"
                type="button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                className="psf-edit-aero-button"
                type="button"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
            </div>

            {message && <p className="psf-edit-aero-message">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PSFEditModal;
