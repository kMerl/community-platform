import { useEffect, useMemo, useState } from "react";

import API from "./api";
import AppNav from "./components/AppNav";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import Notifications from "./pages/Notifications";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Search from "./pages/Search";

const getRouteFromHash = () => {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const [path, queryString = ""] = hash.split("?");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const query = new URLSearchParams(queryString);

  if (cleanPath.startsWith("/post/")) {
    return { name: "post", id: cleanPath.split("/")[2], commentId: query.get("comment") };
  }

  if (cleanPath.startsWith("/profile/")) {
    return { name: "profile", id: cleanPath.split("/")[2] };
  }

  if (cleanPath.startsWith("/messages/")) {
    return { name: "messages", id: cleanPath.split("/")[2] };
  }

  if (cleanPath === "/moderation") return { name: "moderation" };
  if (cleanPath === "/notifications") return { name: "notifications" };
  if (cleanPath === "/messages") return { name: "messages" };
  if (cleanPath === "/search") return { name: "search" };
  if (cleanPath === "/login") return { name: "login" };
  if (cleanPath === "/register") return { name: "register" };

  return { name: "home" };
};

const navigate = (path) => {
  window.location.hash = path;
};

function LoginPromptModal({ open, onClose, onNavigate }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <span className="eyebrow">Authentication required</span>
        <h2>Login to vote on posts.</h2>
        <p>
          Create an account or sign in to upvote, downvote, comment, and manage your own profile.
        </p>
        <div className="hero-actions">
          <button className="primary-button compact" onClick={() => onNavigate("/login")}>
            Login
          </button>
          <button className="ghost-button compact" onClick={() => onNavigate("/register")}>
            Register
          </button>
          <button className="ghost-button compact" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [route, setRoute] = useState(getRouteFromHash);
  const [authReady, setAuthReady] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  useEffect(() => {
    const syncRoute = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", syncRoute);
    syncRoute();

    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setAuthReady(true);
        return;
      }

      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    };

    fetchUser();
  }, [token]);

  const authValue = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
    }),
    [token, user],
  );

  const handleAuthSuccess = ({ token: nextToken, user: nextUser }) => {
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const handleUserUpdated = (nextUser) => {
    setUser(nextUser);
  };

  const openLoginPrompt = () => setLoginPromptOpen(true);
  const closeLoginPrompt = () => setLoginPromptOpen(false);
  const focusSearch = () => {
    navigate("/search");
  };

  const withNav = (content) => (
    <>
      <AppNav
        auth={authValue}
        routeName={route.name}
        onNavigate={navigate}
        onSearchFocus={focusSearch}
      />
      {content}
    </>
  );

  if (!authReady) {
    return (
      <div className="app-loading-shell">
        <div className="loading-orb" />
        <p>Building your community space...</p>
      </div>
    );
  }

  if (route.name === "login") {
    return (
      <Login
        auth={authValue}
        onAuthSuccess={handleAuthSuccess}
        onNavigate={navigate}
      />
    );
  }

  if (route.name === "register") {
    return (
      <Register
        auth={authValue}
        onAuthSuccess={handleAuthSuccess}
        onNavigate={navigate}
      />
    );
  }

  if (route.name === "post" && route.id) {
    return withNav(
      <PostDetail
        auth={authValue}
        onLogout={handleLogout}
        onNavigate={navigate}
        postId={route.id}
        highlightCommentId={route.commentId}
      />,
    );
  }

  if (route.name === "profile" && route.id) {
    return withNav(
      <Profile
        auth={authValue}
        onLogout={handleLogout}
        onNavigate={navigate}
        userId={route.id}
        onUserUpdated={handleUserUpdated}
      />,
    );
  }

  if (route.name === "messages") {
    if (!authValue.isAuthenticated) {
      navigate("/login");
      return null;
    }

    return withNav(
      <Messages
        auth={authValue}
        onLogout={handleLogout}
        onNavigate={navigate}
        userId={route.id || ""}
      />,
    );
  }

  if (route.name === "moderation") {
    if (!authValue.isAuthenticated) {
      navigate("/login");
      return null;
    }

    return withNav(
      <ModeratorDashboard
        auth={authValue}
        onLogout={handleLogout}
        onNavigate={navigate}
      />,
    );
  }

  if (route.name === "notifications") {
    if (!authValue.isAuthenticated) {
      navigate("/login");
      return null;
    }

    return withNav(
      <Notifications
        auth={authValue}
        onNavigate={navigate}
      />,
    );
  }

  if (route.name === "search") {
    return withNav(
      <Search
        auth={authValue}
        onNavigate={navigate}
        onRequireLogin={openLoginPrompt}
      />,
    );
  }

  return (
    <>
      {withNav(
        <Home
          auth={authValue}
          onLogout={handleLogout}
          onNavigate={navigate}
          onRequireLogin={openLoginPrompt}
        />,
      )}
      <LoginPromptModal
        open={loginPromptOpen}
        onClose={closeLoginPrompt}
        onNavigate={(path) => {
          closeLoginPrompt();
          navigate(path);
        }}
      />
    </>
  );
}

export default App;
