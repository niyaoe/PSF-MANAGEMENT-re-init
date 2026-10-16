import { useState } from "react";
import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import "./DashboardLayout.css";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const navigation = [
    { label: "Dashboard", path: "/dashboard", icon: "▦" },
    ...(user?.role === "admin"
      ? [
          { label: "User Management", path: "/users", icon: "♙" },
          { label: "Branch Management", path: "/branches", icon: "⌂" },
          { label: "Excel Import", path: "/import", icon: "⇧" },
          {
            label: "Type of Concern",
            path: "/type-of-concerns",
            icon: "☷",
          },
        ]
      : []),
    {
      label: "User History",
      path: "/user-history",
      icon: "◷",
    },
  ];

  const sidebarExpanded = sidebarPinned || sidebarHovered;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div
      className={`psfl-layout ${
        sidebarExpanded ? "psfl-layout-expanded" : "psfl-layout-collapsed"
      } ${mobileMenuOpen ? "psfl-mobile-menu-visible" : ""}`}
    >
      {mobileMenuOpen && (
        <button
          type="button"
          className="psfl-overlay"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`psfl-sidebar ${
          mobileMenuOpen ? "psfl-sidebar-open" : ""
        } ${sidebarExpanded ? "psfl-sidebar-expanded" : "psfl-sidebar-collapsed"}`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="psfl-brand">
          <div className="psfl-brand-logo">P</div>

          <div className="psfl-brand-copy">
            <strong>PSF Manager</strong>
            <span>Customer follow-up</span>
          </div>

          <button
            type="button"
            className="psfl-close-menu"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="psfl-sidebar-toolbar">
          <span className="psfl-nav-caption">WORKSPACE</span>

          <button
            type="button"
            className={`psfl-pin-button ${
              sidebarPinned ? "psfl-pin-active" : ""
            }`}
            onClick={() => setSidebarPinned((pinned) => !pinned)}
            aria-label={sidebarPinned ? "Unpin sidebar" : "Pin sidebar open"}
            title={sidebarPinned ? "Unpin sidebar" : "Pin sidebar open"}
          >
            <span aria-hidden="true">📌</span>
          </button>
        </div>

        <nav className="psfl-navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              title={item.label}
              className={({ isActive }) =>
                `psfl-nav-link ${isActive ? "psfl-nav-link-active" : ""}`
              }
            >
              <span className="psfl-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="psfl-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="psfl-sidebar-bottom">
          <div className="psfl-user-profile" title={user?.name || "User"}>
            <div className="psfl-avatar">
              {(user?.name || "U").trim().charAt(0).toUpperCase()}
            </div>

            <div className="psfl-user-details">
              <strong>{user?.name || "User"}</strong>
              <span>{user?.role || "Employee"}</span>
            </div>
          </div>

          <button
            type="button"
            className="psfl-logout-button"
            onClick={handleLogout}
            title="Sign out"
          >
            <span className="psfl-logout-icon" aria-hidden="true">
              ↪
            </span>
            <span className="psfl-logout-label">Sign out</span>
          </button>
        </div>
      </aside>

      <div className="psfl-workspace">
        <header className="psfl-topbar">
          <button
            type="button"
            className="psfl-menu-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="psfl-topbar-heading">
            <span className="psfl-breadcrumb">PSF Management</span>
            <span className="psfl-breadcrumb-separator">/</span>
            <strong>
              {navigation.find((item) => item.path === location.pathname)
                ?.label || "Workspace"}
            </strong>
          </div>

          <div className="psfl-topbar-user">
            <div className="psfl-status-dot" />
            <span>{user?.name || "User"}</span>
          </div>
        </header>

        <main className="psfl-page-content">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
