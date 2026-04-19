import { useEffect, useState } from "react";

import API from "../api";

function ThreadLineMark() {
  return (
    <span className="threadline-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function NavIcon({ type }) {
  const common = {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  if (type === "profile") {
    return (
      <svg {...common}>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  if (type === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg {...common}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-5" />
      </svg>
    );
  }

  if (type === "bell") {
    return (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  if (type === "message") {
    return (
      <svg {...common}>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function AppNav({ auth, routeName, onNavigate, onSearchFocus }) {
  const isModerator = auth.user?.role === "moderator";
  const profilePath = auth.isAuthenticated ? `/profile/${auth.user._id}` : "/login";
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);
  const [hasModerationQueue, setHasModerationQueue] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchBadges = async () => {
      if (!auth.isAuthenticated) {
        setHasUnreadAlerts(false);
        setHasModerationQueue(false);
        return;
      }

      try {
        const notificationRes = await API.get("/notifications");
        if (active) {
          setHasUnreadAlerts(notificationRes.data.some((item) => !item.read));
        }
      } catch {
        if (active) setHasUnreadAlerts(false);
      }

      if (isModerator) {
        try {
          const moderationRes = await API.get("/posts/flagged");
          if (active) {
            setHasModerationQueue(moderationRes.data.length > 0);
          }
        } catch {
          if (active) setHasModerationQueue(false);
        }
      } else if (active) {
        setHasModerationQueue(false);
      }
    };

    fetchBadges();

    return () => {
      active = false;
    };
  }, [auth.isAuthenticated, auth.user?._id, isModerator, routeName]);

  return (
    <aside className="app-rail" aria-label="Primary navigation">
      <button className="rail-brand" type="button" onClick={() => onNavigate("/")}>
        <ThreadLineMark />
        <span>ThreadLine</span>
      </button>

      <nav className="rail-links">
        <button
          className={routeName === "home" ? "active" : ""}
          type="button"
          onClick={() => onNavigate("/")}
          title="Home"
        >
          <NavIcon type="home" />
          <span>Home</span>
        </button>
        <button
          className={routeName === "profile" ? "active" : ""}
          type="button"
          onClick={() => onNavigate(profilePath)}
          title="Profile"
        >
          <NavIcon type="profile" />
          <span>Profile</span>
        </button>
        <button type="button" onClick={onSearchFocus} title="Search">
          <NavIcon type="search" />
          <span>Search</span>
        </button>
        {auth.isAuthenticated ? (
          <button
            className={routeName === "messages" ? "active" : ""}
            type="button"
            onClick={() => onNavigate("/messages")}
            title="Messages"
          >
            <NavIcon type="message" />
            <span>Messages</span>
          </button>
        ) : null}
        {auth.isAuthenticated ? (
          <button
            className={routeName === "notifications" ? "active" : ""}
            type="button"
            onClick={() => onNavigate("/notifications")}
            title="Notifications"
          >
            <NavIcon type="bell" />
            {hasUnreadAlerts ? <span className="nav-dot" aria-hidden="true" /> : null}
            <span>Alerts</span>
          </button>
        ) : null}
        {isModerator ? (
          <button
            className={routeName === "moderation" ? "active" : ""}
            type="button"
            onClick={() => onNavigate("/moderation")}
            title="Moderation"
          >
            <NavIcon type="shield" />
            {hasModerationQueue ? <span className="nav-dot" aria-hidden="true" /> : null}
            <span>Moderation</span>
          </button>
        ) : null}
      </nav>
    </aside>
  );
}

export default AppNav;
