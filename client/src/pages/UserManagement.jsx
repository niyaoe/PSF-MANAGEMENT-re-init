import { useEffect, useState } from "react";
import api from "../services/api";
import BackButton from "../components/BackButton";
import "../styles/userManagement.css";

const UserManagement = () => {
  const [branches, setBranches] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [selectedBranches, setSelectedBranches] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserBranches, setSelectedUserBranches] = useState([]);

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
    fetchUsers();
  }, []);

  const handleBranchChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions);

    const branchIds = selectedOptions.map((option) => option.value);

    setSelectedBranches(branchIds);
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      const response = await api.get("/users");

      setUsers(response.data.users);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/users", {
        name,
        email,
        password,
        role,
        branchIds: selectedBranches,
      });

      setMessage(response.data.message);

      setName("");
      setEmail("");
      setPassword("");
      setRole("employee");
      setSelectedBranches([]);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-aero-page">
      <div className="user-aero-header">
        <BackButton className="user-aero-back-button" />
        <div className="user-aero-header-content">
          <h1 className="user-aero-title">User Management</h1>

          <p className="user-aero-subtitle">
            Create users and manage their branch assignments
          </p>
        </div>
      </div>
      {message && <p className="aero-message">{message}</p>}

      {/* Create User */}
      <div className="user-aero-panel">
        <h2 className="user-aero-panel-title">Create User</h2>

        <form className="user-aero-create-form" onSubmit={handleSubmit}>
          <div className="user-aero-form-group">
            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
              required
            />
          </div>

          <div className="user-aero-form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              required
            />
          </div>

          <div className="user-aero-form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              required
            />
          </div>

          <div className="user-aero-form-group">
            <label>Role</label>

            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
              }}
            >
              <option value="employee">Employee</option>

              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="user-aero-form-group user-aero-branch-group">
            <label>Branches</label>

            <select
              className="user-aero-branch-select"
              multiple
              value={selectedBranches}
              onChange={handleBranchChange}
              required
            >
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>

            <p className="user-aero-help">
              Hold Ctrl and select multiple branches.
            </p>
          </div>

          <button
            className="user-aero-create-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
      

      {/* Users List */}
      <div className="user-aero-panel">
        

        <h2 className="user-aero-panel-title">Users</h2>

        {usersLoading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="user-aero-table-wrapper">
            <table className="user-aero-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Branches</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>

                    <td>{user.email}</td>

                    <td>{user.role}</td>

                    <td>
                      {user.branchIds.map((branch) => branch.name).join(", ")}
                    </td>

                    <td>{user.isActive ? "Active" : "Inactive"}</td>

                    <td>
                      <button
                        className="user-aero-edit-button"
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);

                          setSelectedUserBranches(
                            user.branchIds.map((branch) => branch._id),
                          );
                        }}
                      >
                        Edit Branches
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Branches Modal */}
      {selectedUser && (
        <div className="user-aero-modal-overlay">
          <div className="user-aero-modal">
            {/* Aero Window Title Bar */}
            <div className="user-aero-modal-titlebar">
              <div className="user-aero-modal-title">Edit User Branches</div>

              <button
                className="user-aero-modal-close"
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedUserBranches([]);
                }}
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="user-aero-modal-content">
              <h2>Edit Branches</h2>

              <p>
                User: <strong>{selectedUser.name}</strong>
              </p>

              <div className="user-aero-form-group">
                <label>Select Branches</label>

                <select
                  className="user-aero-modal-select"
                  multiple
                  value={selectedUserBranches}
                  onChange={(event) => {
                    const selectedOptions = Array.from(
                      event.target.selectedOptions,
                    );

                    const branchIds = selectedOptions.map(
                      (option) => option.value,
                    );

                    setSelectedUserBranches(branchIds);
                  }}
                >
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name} ({branch.code})
                    </option>
                  ))}
                </select>

                <p className="user-aero-help">
                  Hold Ctrl and select multiple branches.
                </p>
              </div>

              <div className="user-aero-modal-actions">
                <button
                  className="user-aero-modal-button"
                  type="button"
                  disabled={selectedUserBranches.length === 0}
                  onClick={async () => {
                    try {
                      setMessage("");

                      const response = await api.put(
                        `/users/${selectedUser._id}/branches`,
                        {
                          branchIds: selectedUserBranches,
                        },
                      );

                      setMessage(response.data.message);

                      setSelectedUser(null);

                      setSelectedUserBranches([]);

                      await fetchUsers();
                    } catch (error) {
                      setMessage(
                        error.response?.data?.message ||
                          "Failed to update user branches",
                      );
                    }
                  }}
                >
                  Save Branches
                </button>

                <button
                  className="aero-button"
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);

                    setSelectedUserBranches([]);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
