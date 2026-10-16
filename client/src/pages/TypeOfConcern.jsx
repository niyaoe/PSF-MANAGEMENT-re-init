
import { useEffect, useState } from "react";
import api from "../services/api";
import "./TypeOfConcern.css";

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
        error.response?.data?.message ||
        "Failed to fetch types of concern"
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
      setSuccess("");
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
        error.response?.data?.message ||
        "Failed to create type of concern"
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
      setSuccess("");
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
        error.response?.data?.message ||
        "Failed to update type of concern"
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
          : "Concern activated successfully"
      );

      await fetchConcerns();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to change concern status"
      );
    }
  };

  return (
    <div className="toc-page">


      <header className="toc-header">
        <div className="toc-heading-icon" aria-hidden="true">
          <span>▤</span>
          <span>⚙</span>
        </div>

        <div className="toc-heading">
          <h2>Type of Concern</h2>
          <p>Manage concern categories and dashboard sections.</p>
        </div>

        <div className="toc-header-meta">
          <span className="toc-status-light" />
          {concerns.length} Concerns
        </div>
      </header>



      <section className="toc-panel">
        <div className="toc-panel-heading">
          <div className="toc-panel-icon">
            ＋
          </div>
          <div>
            <h3>Add New Concern</h3>
            <p>Create a concern category and assign its section.</p>
          </div>
          
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
            <label htmlFor="toc-section">Dashboard Section</label>
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

          <button
            type="submit"
            disabled={saving}
            className="toc-add-button"
          >
            <span>{saving ? "Saving..." : "＋ Add Concern"}</span>
          </button>
        </form>
      </section>

      {error && (
        <div className="toc-message toc-error" role="alert">
          <span className="toc-message-icon">!</span>
          <span>{error}</span>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="toc-message toc-success" role="status">
          <span className="toc-message-icon">✓</span>
          <span>{success}</span>
          <button
            type="button"
            aria-label="Dismiss success message"
            onClick={() => setSuccess("")}
          >
            ×
          </button>
        </div>
      )}

      <section className="toc-panel toc-list-panel">
        <div className="toc-list-heading">
          <div>
            <h3>Concern Categories</h3>
            <p>View, edit, activate, or deactivate concern categories.</p>
          </div>

          <button
            type="button"
            className="toc-refresh-button"
            onClick={fetchConcerns}
            disabled={loading}
          >
            <span className={loading ? "toc-spin" : ""}>↻</span>
            Refresh
          </button>
        </div>

        <div className="toc-table-wrapper">
          <table className="toc-table">
            <thead>
              <tr>
                <th className="toc-number-column">Sl No.</th>
                <th>Concern Name</th>
                <th>Section</th>
                <th>Status</th>
                <th className="toc-actions-column">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="toc-empty">
                    <span className="toc-loader" />
                    Loading concerns...
                  </td>
                </tr>
              ) : concerns.length === 0 ? (
                <tr>
                  <td colSpan="5" className="toc-empty">
                    <span className="toc-empty-icon">◇</span>
                    <strong>No concerns found</strong>
                    <span>Add a concern using the form above.</span>
                  </td>
                </tr>
              ) : (
                concerns.map((concern, index) => (
                  <tr key={concern._id}>
                    <td className="toc-number-cell">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td className="toc-name-cell">
                      {editingId === concern._id ? (
                        <input
                          className="toc-edit-input"
                          aria-label="Edit concern name"
                          value={editName}
                          onChange={(event) =>
                            setEditName(event.target.value)
                          }
                        />
                      ) : (
                        <span>{concern.name}</span>
                      )}
                    </td>

                    <td>
                      {editingId === concern._id ? (
                        <select
                          className="toc-edit-select"
                          aria-label="Edit concern section"
                          value={editSection}
                          onChange={(event) =>
                            setEditSection(event.target.value)
                          }
                        >
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                          <option value="Pending">Pending</option>
                        </select>
                      ) : (
                        <span
                          className={`toc-section toc-section-${(
                            concern.section || "open"
                          ).toLowerCase()}`}
                        >
                          {concern.section}
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`toc-status ${concern.isActive
                          ? "toc-status-active"
                          : "toc-status-inactive"
                          }`}
                      >
                        <span className="toc-status-dot" />
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
                              className={`toc-action-button ${concern.isActive
                                ? "toc-deactivate-button"
                                : "toc-activate-button"
                                }`}
                              onClick={() => toggleActive(concern)}
                            >
                              {concern.isActive
                                ? "Deactivate"
                                : "Activate"}
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

        <div className="toc-table-footer">
          <span>
            Showing <strong>{concerns.length}</strong> concern
            {concerns.length === 1 ? "" : "s"}
          </span>
          <span className="toc-footer-indicator">
            <span /> System configuration
          </span>
        </div>
      </section>
    </div>
  );
};

export default TypeOfConcern;
