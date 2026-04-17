import { useState } from "react";
import API from "../api";

function Register({ onLogin, onSwitch }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async () => {
        try {
            const res = await API.post("/auth/register", { name, emai, password });
            onLogin(res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
            <h2>Register</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }} />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }} />
            <button onClick={handleRegister} style={{ width: "100%", padding: 10 }}>Register</button>
            <p style={{ marginTop: 12 }}>Have an account? <span onClick={onSwitch} style={{ color: "blue", cursor: "pointer" }}>Login</span></p>
        </div>
  );
}

export default Register;