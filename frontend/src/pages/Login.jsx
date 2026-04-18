import { useState } from "react";

import API from "../api";
import Home from "./Home";

function Login({ auth, onAuthSuccess, onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      onAuthSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stacked-page">
      <section className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">Welcome back</span>
          <h1>Login to keep the discussion going.</h1>
          <p>
            Open your feed, jump into replies, and track the posts you care about.
          </p>

          {error ? <div className="form-error">{error}</div> : null}

          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label>
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              <span>Show password</span>
            </label>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="auth-switch">
            No account yet?{" "}
            <button type="button" className="text-button" onClick={() => onNavigate("/register")}>
              Create one
            </button>
          </p>
        </div>
      </section>

      <Home auth={auth} onLogout={() => {}} onNavigate={onNavigate} onRequireLogin={() => {}} />
    </div>
  );
}

export default Login;
