
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setMessage("Login successful");
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-aero-page">
      <form className="login-aero-panel" onSubmit={handleLogin}>
        <div className="login-title-content">
          <img
            className="login-aero-logo"
            src="/logo.png"
            alt="PSF Management"
          />

          <h1 className="login-aero-title">PSF Management</h1>
          {/* <p className="login-aero-subtitle">
            Post Sale Follow-up Management System
          </p> */}
        </div>

        <div className="login-aero-form-group">
          <label htmlFor="login-email">Email</label>

          <input
            id="login-email"
            className="login-aero-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="login-aero-form-group">
          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            className="login-aero-input"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <label className="login-aero-show-password">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
          />
          <span>Show password</span>
        </label>

        <button
          className="login-aero-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && (
          <p
            className={`login-aero-message ${
              message === "Login successful" ? "login-aero-success" : ""
            }`}
            role="status"
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
