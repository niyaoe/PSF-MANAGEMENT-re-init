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
      {/* Logo */}

      {/* Title */}

      {/* Login Form */}

      <form className="login-aero-panel" onSubmit={handleLogin}>
        <div className="login-title-content">
          <img
            className="login-aero-logo"
            src="/logo.png"
            alt="PSF Management"
          />
          <h1 className="login-aero-title">PSF Management</h1>
        </div>

        <div className="login-aero-form-group">
          <label>Email</label>

          <input
            className="login-aero-input"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            required
          />
        </div>

        <div className="login-aero-form-group">
          <label>Password</label>

          <input
            className="login-aero-input"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            required
          />
        </div>

        <button className="login-aero-button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Message */}

      {message && <p className="login-aero-message">{message}</p>}
    </div>
  );
};

export default Login;
