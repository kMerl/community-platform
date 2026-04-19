import { useState, useEffect } from "react";
import API from "../api";

function OTPVerification({ email, onSuccess, onNavigate, onResendOTP }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Countdown timer for resend OTP
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      setSuccessMessage("Email verified successfully!");
      // Call onSuccess after a brief delay to show success message
      setTimeout(() => {
        onSuccess(res);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccessMessage("");
    setResendLoading(true);
    setResendCooldown(30);

    try {
      await onResendOTP();
      setSuccessMessage("OTP resent to your email");
      setOtp("");
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleOTPChange = (e) => {
    const value = e.target.value;
    // Only allow numeric input and limit to 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  return (
    <main className="auth-page register-tone">
      <section className="auth-panel">
        <button
          className="text-button auth-home-link"
          type="button"
          onClick={() => onNavigate("/")}
        >
          Back home
        </button>
        <div className="auth-card">
          <span className="eyebrow">Verify your email</span>
          <h1>OTP Verification</h1>
          <p>
            We've sent a 6-digit OTP to <strong>{email}</strong>. Please enter it
            below to verify your email and complete registration.
          </p>

          {error ? <div className="form-error">{error}</div> : null}
          {successMessage ? (
            <div style={{ padding: "10px", marginBottom: "15px", backgroundColor: "#d4edda", color: "#155724", borderRadius: "4px" }}>
              {successMessage}
            </div>
          ) : null}

          <form className="auth-form" onSubmit={handleVerifyOTP}>
            <label>
              <span>Enter OTP</span>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={handleOTPChange}
                maxLength="6"
                required
                style={{ letterSpacing: "8px", fontSize: "24px", textAlign: "center" }}
              />
            </label>

            <button
              className="primary-button"
              type="submit"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
              Didn't receive the OTP?
            </p>
            <button
              type="button"
              className="text-button"
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              style={{ color: resendCooldown > 0 ? "#ccc" : "#007bff" }}
            >
              {resendLoading ? "Resending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </div>

          <p className="auth-switch" style={{ marginTop: "20px" }}>
            Don't want to register?{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate("/login")}
            >
              Go back to login
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default OTPVerification;
