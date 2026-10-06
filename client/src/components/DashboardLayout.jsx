import { Link, useNavigate, useLocation } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  // const location = useLocation();

  const storedUser = localStorage.getItem("user");

  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="aero-app">
      <header className="aero-header">
        <div className="aero-title-area">
          <img className="aero-logo" src="/logo.png" alt="PSF Management" />
          <h1 className="aero-title">PSF Management</h1>
        </div>

        <div className="aero-user-area">
          <span>Welcome, {user?.name}</span>

          <span>Role: {user?.role}</span>

          <button className="aero-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="aero-nav">
        <Link to="/dashboard">Dashboard</Link>

        {user?.role === "admin" && (
          <>
            <Link to="/users">Users</Link>

            <Link to="/branches">Branches</Link>

            <Link to="/import">Excel Import</Link>
          </>
        )}
      </nav>

      <main className="aero-main">
        {/* {location.pathname !== "/dashboard" && (
          <button
            className="aero-back-button"
            type="button"
            onClick={() => {
              navigate(-1);
            }}
          >
            ← Back
          </button>
        )} */}

        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
