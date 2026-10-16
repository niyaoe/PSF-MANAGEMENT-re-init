import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/typeOfConcern.css";

const TypeOfConcern = () => {
  const [concerns, setConcerns] = useState([]);
  const [name, setName] = useState("");
  const [section, setSection] = useState("Open");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSection, setEditSection] = useState("Open");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchConcerns = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/type-of-concerns");

      setConcerns(response.data.concerns || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch types of concern",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerns();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter a concern name");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.post("/type-of-concerns", {
        name: name.trim(),
        section,
      });

      setName("");
      setSection("Open");
      setSuccess("Type of concern added successfully");

      await fetchConcerns();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to create type of concern",
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (concern) => {
    setEditingId(concern._id);
    setEditName(concern.name);
    setEditSection(concern.section);

    setError("");
    setSuccess("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditSection("Open");
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) {
      setError("Concern name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.put(`/type-of-concerns/${id}`, {
        name: editName.trim(),
        section: editSection,
      });

      setSuccess("Type of concern updated successfully");
      cancelEditing();

      await fetchConcerns();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update type of concern",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (concern) => {
    try {
      setError("");
      setSuccess("");

      await api.put(`/type-of-concerns/${concern._id}`, {
        isActive: !concern.isActive,
      });

      setSuccess(
        concern.isActive
          ? "Concern deactivated successfully"
          : "Concern activated successfully",
      );

      await fetchConcerns();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to change concern status",
      );
    }
  };

  return (
    <div className="toc-page">
      <div className="toc-header">
        <div>
          <h2>Type of Concern</h2>
          <p>Manage concern categories and dashboard sections.</p>
        </div>

        <div className="toc-count">Total: {concerns.length}</div>
      </div>

      <form className="toc-form" onSubmit={handleSubmit}>
        <div className="toc-field">
          <label htmlFor="toc-name">Concern Name</label>

          <input
            id="toc-name"
            type="text"
            placeholder="Enter concern name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="toc-field">
          <label htmlFor="toc-section">Section</label>

          <select
            id="toc-section"
            value={section}
            onChange={(event) => setSection(event.target.value)}
          >
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <button type="submit" disabled={saving} className="toc-add-button">
          {saving ? "Saving..." : "Add Concern"}
        </button>
      </form>

      {error && <div className="toc-message toc-error">{error}</div>}

      {success && <div className="toc-message toc-success">{success}</div>}

      <div className="toc-table-wrapper">
        <table className="toc-table">
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>Concern Name</th>
              <th>Section</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="toc-empty">
                  Loading concerns...
                </td>
              </tr>
            ) : concerns.length === 0 ? (
              <tr>
                <td colSpan="5" className="toc-empty">
                  No concerns found
                </td>
              </tr>
            ) : (
              concerns.map((concern, index) => (
                <tr key={concern._id}>
                  <td>{index + 1}</td>

                  <td>
                    {editingId === concern._id ? (
                      <input
                        className="toc-edit-input"
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                      />
                    ) : (
                      concern.name
                    )}
                  </td>

                  <td>
                    {editingId === concern._id ? (
                      <select
                        className="toc-edit-select"
                        value={editSection}
                        onChange={(event) => setEditSection(event.target.value)}
                      >
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                        <option value="Pending">Pending</option>
                      </select>
                    ) : (
                      <span
                        className={`toc-section toc-section-${concern.section.toLowerCase()}`}
                      >
                        {concern.section}
                      </span>
                    )}
                  </td>

                  <td>
                    <span
                      className={
                        concern.isActive
                          ? "toc-status-active"
                          : "toc-status-inactive"
                      }
                    >
                      {concern.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="toc-actions">
                      {editingId === concern._id ? (
                        <>
                          <button
                            type="button"
                            className="toc-action-button toc-save-button"
                            disabled={saving}
                            onClick={() => handleUpdate(concern._id)}
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            className="toc-action-button toc-cancel-button"
                            disabled={saving}
                            onClick={cancelEditing}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="toc-action-button toc-edit-button"
                            onClick={() => startEditing(concern)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className={
                              concern.isActive
                                ? "toc-action-button toc-deactivate-button"
                                : "toc-action-button toc-activate-button"
                            }
                            onClick={() => toggleActive(concern)}
                          >
                            {concern.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TypeOfConcern;
