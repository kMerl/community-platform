import { useState } from "react";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";

function App() {

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [page, setPage] = useState("login");

  const handleLogin = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPage("login");
  };

  if (token) {
    return <Home onLogout={handleLogout}/>;
  }

  return (
      <div>
        {page == "login" ? (
          <Login onLogin={handleLogin} onSwitch={() => setPage("register")} />
        ) : ( 
          <Register onLogin={handleLogin} onSwitch={() => setPage("login")} />
        )}
      </div>
  );
}

export default App;
