import { useEffect, useState } from "react";
import api from "../services/api";
import BackButton from "../components/BackButton";
import "../styles/branchManagement.css";

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBranches = async () => {
    try {
      const response = await api.get("/branches");

      setBranches(response.data.branches);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load branches");
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/branches", {
        name,
        code,
      });

      setMessage(response.data.message);

      setName("");
      setCode("");

      await fetchBranches();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create branch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="branch-aero-page">
      {/* Page Header */}

      <div className="branch-aero-header">
        <BackButton className="branch-aero-back-button" />

        <div className="branch-aero-header-content">
          <h1 className="branch-aero-title">Branch Management</h1>

          <p className="branch-aero-subtitle">Create and manage PSF branches</p>
        </div>
      </div>

      {/* Create Branch */}

      <div className="branch-aero-panel">
        <h2 className="branch-aero-panel-title">Create Branch</h2>

        <form className="branch-aero-form" onSubmit={handleSubmit}>
          <div className="branch-aero-form-group">
            <label>Branch Name</label>

            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
              required
            />
          </div>

          <div className="branch-aero-form-group">
            <label>Branch Code</label>

            <input
              type="text"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
              }}
              required
            />
          </div>

          <button
            className="branch-aero-create-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Branch"}
          </button>
        </form>
      </div>

      {/* Message */}

      {message && <p className="branch-aero-message">{message}</p>}

      {/* Existing Branches */}

      <div className="branch-aero-panel">
        <h2 className="branch-aero-panel-title">Existing Branches</h2>

        {branches.length === 0 ? (
          <p>No branches found.</p>
        ) : (
          <div className="branch-aero-table-wrapper">
            <table className="branch-aero-table">
              <thead>
                <tr>
                  <th>Branch Name</th>

                  <th>Code</th>

                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {branches.map((branch) => (
                  <tr key={branch._id}>
                    <td>{branch.name}</td>

                    <td>{branch.code}</td>

                    <td>{branch.isActive ? "Active" : "Inactive"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchManagement;
