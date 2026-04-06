import { useState } from "react";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";

function App() {

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [page, setPage] = useState("login");

  const hadleLogin = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPage("login");
  };

  return (
      <div>
        <Login />
        <Home />
      </div>
  );
}

export default App;
