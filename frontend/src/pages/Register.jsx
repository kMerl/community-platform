import { useState } from "react";
import OTPVerification from "../components/OTPVerification";
import API from "../api";

function Register({ onAuthSuccess, onNavigate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/register", { name, email, password });
      setRegisteredEmail(email);
      setShowOTPVerification(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await API.post("/auth/send-otp", { email: registeredEmail });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  if (showOTPVerification) {
    return (
      <OTPVerification
        email={registeredEmail}
        onSuccess={(res) => {
          onAuthSuccess(res.data);
        }}
        onNavigate={onNavigate}
        onResendOTP={handleResendOTP}
      />
    );
  }

  return (
    <main className="auth-page register-tone">
      <section className="auth-panel">
        <button className="text-button auth-home-link" type="button" onClick={() => onNavigate("/")}>
          Back home
        </button>
        <div className="auth-card">
          <span className="eyebrow">Join the space</span>
          <h1>Create an account and start posting right away.</h1>
          <p>
            Your profile, your feed, your nested discussions, all wired in from day one.
          </p>

          {error ? <div className="form-error">{error}</div> : null}

          <form className="auth-form" onSubmit={handleRegister}>
            <label>
              <span>Name</span>
              <input
                placeholder="Display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

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
                type="password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="auth-switch">
            Already registered?{" "}
            <button type="button" className="text-button" onClick={() => onNavigate("/login")}>
              Login here
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
