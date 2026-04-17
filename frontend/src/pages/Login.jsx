import { useState } from "react";
import API from "../api";

function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      onLogin(res.data.token); // call App's handler
      alert("Logged in Successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLoginSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: 4 }}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: 4 }}>Password</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
            required
          />
          <div style={{ marginTop: 4 }}>
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword" style={{ marginLeft: 4 }}>Show Password</label>
          </div>
        </div>
        <button type="submit" style={{ width: "100%", padding: 10 }}>Login</button>
      </form>
      <p style={{ marginTop: 12 }}>
        No account? <span onClick={onSwitch} style={{ color: "blue", cursor: "pointer" }}>Register</span>
      </p>
    </div>
  );
}

export default Login;