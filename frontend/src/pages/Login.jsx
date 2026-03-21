import {useState}   from 'react';
import API from "../api"

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async() => {
        const res = await API.post("auth/login", {
            email,
            password
        });

        localStorage.setItem("token", res.data.token);
        alert("Logged in Successfully");
    };

    return(
        <div>
            <h2>Login</h2>
            <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" onChange={e => setPassword(e.target.value)}/>
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login;