import { useEffect, useState } from "react";
import api from "../services/api";
import "./UserManagement.css";

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

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("employee");
  const [editPassword, setEditPassword] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const [savingUser, setSavingUser] = useState(false);

  const fetchBranches = async () => {
    try {
      const response = await api.get("/branches");
      setBranches(response.data.branches || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load branches");
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get("/users");
      setUsers(response.data.users || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchUsers();
  }, []);

  const handleBranchChange = (event) => {
    const branchIds = Array.from(event.target.selectedOptions).map(
      (option) => option.value,
    );
    setSelectedBranches(branchIds);
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

  const openUserEditor = (user) => {
    setSelectedUser(user);

    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditRole(user.role || "employee");
    setEditPassword("");
    setEditIsActive(user.isActive);

    setSelectedUserBranches((user.branchIds || []).map((branch) => branch._id));
  };

  const closeUserEditor = () => {
    setSelectedUser(null);
    setSelectedUserBranches([]);
    setEditName("");
    setEditEmail("");
    setEditRole("employee");
    setEditPassword("");
    setEditIsActive(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setMessage("");
      setSavingUser(true);

      const updateData = {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        branchIds: selectedUserBranches,
        isActive: editIsActive,
      };

      // Only send password if the admin entered a new one
      if (editPassword.trim()) {
        updateData.password = editPassword;
      }

      const response = await api.put(`/users/${selectedUser._id}`, updateData);

      setMessage(response.data.message || "User updated successfully");

      closeUserEditor();
      await fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update user");
    } finally {
      setSavingUser(false);
    }
  };

  return (
    <div className="user-aero-page">
      {/* Page heading */}
      <header className="user-aero-header">
        <div className="user-aero-heading-icon" aria-hidden="true">
          <span>♙</span>
          <span>♙</span>
        </div>

        <div className="user-aero-header-content">
          <h1 className="user-aero-title">User Management</h1>
          <p className="user-aero-subtitle">
            Create users and manage branch assignments
          </p>
        </div>

        <div className="user-aero-header-meta">
          <span className="user-aero-status-light" />
          Admin workspace
        </div>
      </header>

      {/* Feedback */}
      {message && (
        <div className="user-aero-message" role="status">
          <span className="user-aero-message-icon" aria-hidden="true">
            ✓
          </span>
          <span>{message}</span>
          <button
            type="button"
            className="user-aero-message-close"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Create user */}
      <section className="user-aero-panel">
        <div className="user-aero-panel-heading">
          <div className="user-aero-panel-icon" aria-hidden="true">
            +
          </div>
          <div>
            <h2 className="user-aero-panel-title">Create User</h2>
            <p className="user-aero-panel-subtitle">
              Enter account details and assign branches
            </p>
          </div>
        </div>

        <form className="user-aero-create-form" onSubmit={handleSubmit}>
          <div className="user-aero-form-group">
            <label htmlFor="user-name">Full name</label>
            <input
              id="user-name"
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="user-aero-form-group">
            <label htmlFor="user-email">Email address</label>
            <input
              id="user-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="user-aero-form-group">
            <label htmlFor="user-password">Password</label>
            <input
              id="user-password"
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="user-aero-form-group">
            <label htmlFor="user-role">User role</label>
            <select
              id="user-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="user-aero-form-group user-aero-branch-group">
            <label htmlFor="user-branches">Branch assignments</label>
            <select
              id="user-branches"
              className="user-aero-branch-select"
              multiple
              value={selectedBranches}
              onChange={handleBranchChange}
              required
              aria-describedby="user-branches-help"
            >
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
            <p id="user-branches-help" className="user-aero-help">
              Hold Ctrl on desktop to select multiple branches.
            </p>
          </div>

          <div className="user-aero-create-actions">
            <button
              className="user-aero-create-button"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="user-aero-button-spinner" />
                  Creating...
                </>
              ) : (
                <>
                  <span aria-hidden="true">＋</span>
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Users list */}
      <section className="user-aero-panel user-aero-users-panel">
        <div className="user-aero-panel-heading user-aero-users-heading">
          <div className="user-aero-panel-icon" aria-hidden="true">
            ♙
          </div>

          <div>
            <h2 className="user-aero-panel-title">Users</h2>
            <p className="user-aero-panel-subtitle">
              View accounts and update branch assignments
            </p>
          </div>

          <div className="user-aero-users-tools">
            <span className="user-aero-count">
              {users.length} {users.length === 1 ? "user" : "users"}
            </span>

            <button
              type="button"
              className="user-aero-refresh-button"
              onClick={fetchUsers}
              disabled={usersLoading}
              title="Refresh users"
              aria-label="Refresh users"
            >
              ↻
            </button>
          </div>
        </div>

        {usersLoading ? (
          <div className="user-aero-state">
            <span className="user-aero-loader" />
            <span>Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="user-aero-state user-aero-empty">
            <span className="user-aero-empty-icon" aria-hidden="true">
              ♙
            </span>
            <strong>No users found</strong>
            <span>Create a user using the form above.</span>
          </div>
        ) : (
          <div className="user-aero-table-wrapper">
            <table className="user-aero-table">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Branches</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-aero-identity">
                        <span className="user-aero-avatar" aria-hidden="true">
                          {(user.name || "?").charAt(0).toUpperCase()}
                        </span>
                        <span className="user-aero-identity-name">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    <td className="user-aero-email">{user.email}</td>

                    <td>
                      <span
                        className={`user-aero-role user-aero-role-${user.role}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <div className="user-aero-branch-list">
                        {(user.branchIds || []).length > 0
                          ? user.branchIds
                              .map((branch) => branch.name)
                              .join(", ")
                          : "No branches assigned"}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`user-aero-user-status ${
                          user.isActive
                            ? "user-aero-status-active"
                            : "user-aero-status-inactive"
                        }`}
                      >
                        <span />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="user-aero-edit-button"
                        type="button"
                        onClick={() => openUserEditor(user)}
                      >
                        <span aria-hidden="true">✎</span>
                        Edit user
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="user-aero-table-footer">
          <span>
            Showing {users.length} {users.length === 1 ? "account" : "accounts"}
          </span>
          <span className="user-aero-footer-indicator">
            <span />
            User directory
          </span>
        </div>
      </section>

      {/* Edit branches modal */}
      {/* Edit User Modal */}
      {selectedUser && (
        <div
          className="user-aero-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeUserEditor();
            }
          }}
        >
          <section
            className="user-aero-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-aero-modal-heading"
          >
            <header className="user-aero-modal-titlebar">
              <div className="user-aero-modal-titlebar-icon">♙</div>

              <div className="user-aero-modal-window-title">Edit User</div>

              <button
                className="user-aero-modal-close"
                type="button"
                onClick={closeUserEditor}
                disabled={savingUser}
                title="Close"
                aria-label="Close dialog"
              >
                ×
              </button>
            </header>

            <div className="user-aero-modal-content">
              <div className="user-aero-modal-intro">
                <span className="user-aero-modal-avatar">
                  {(selectedUser.name || "?").charAt(0).toUpperCase()}
                </span>

                <div>
                  <h2 id="user-aero-modal-heading">User details</h2>
                  <p>
                    Update account information for{" "}
                    <strong>{selectedUser.name}</strong>.
                  </p>
                </div>
              </div>

              <div className="user-aero-form-group">
                <label htmlFor="edit-user-name">Full name</label>
                <input
                  id="edit-user-name"
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  required
                />
              </div>

              <div className="user-aero-form-group">
                <label htmlFor="edit-user-email">Email address</label>
                <input
                  id="edit-user-email"
                  type="email"
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  required
                />
              </div>

              <div className="user-aero-form-group">
                <label htmlFor="edit-user-password">New password</label>
                <input
                  id="edit-user-password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={editPassword}
                  onChange={(event) => setEditPassword(event.target.value)}
                  autoComplete="new-password"
                />
                <p className="user-aero-help">
                  Enter a password only if you want to change it.
                </p>
              </div>

              <div className="user-aero-form-group">
                <label htmlFor="edit-user-role">User role</label>
                <select
                  id="edit-user-role"
                  value={editRole}
                  onChange={(event) => setEditRole(event.target.value)}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="user-aero-form-group">
                <label htmlFor="edit-user-branches">Branch assignments</label>

                <select
                  id="edit-user-branches"
                  className="user-aero-modal-select"
                  multiple
                  value={selectedUserBranches}
                  onChange={(event) => {
                    const branchIds = Array.from(
                      event.target.selectedOptions,
                    ).map((option) => option.value);

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
                  Hold Ctrl on desktop to select multiple branches.
                </p>
              </div>

              <div className="user-aero-modal-summary">
                {selectedUserBranches.length}{" "}
                {selectedUserBranches.length === 1
                  ? "branch selected"
                  : "branches selected"}
              </div>

              <div className="user-aero-form-group">
                <label htmlFor="edit-user-status">Account status</label>
                <select
                  id="edit-user-status"
                  value={editIsActive ? "active" : "inactive"}
                  onChange={(event) =>
                    setEditIsActive(event.target.value === "active")
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <footer className="user-aero-modal-actions">
                <button
                  className="user-aero-secondary-button"
                  type="button"
                  onClick={closeUserEditor}
                  disabled={savingUser}
                >
                  Cancel
                </button>

                <button
                  className="user-aero-modal-button"
                  type="button"
                  disabled={
                    savingUser ||
                    !editName.trim() ||
                    !editEmail.trim() ||
                    selectedUserBranches.length === 0
                  }
                  onClick={handleUpdateUser}
                >
                  {savingUser ? "Updating..." : "Update User"}
                </button>
              </footer>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
