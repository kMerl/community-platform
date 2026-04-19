import { useEffect, useState } from "react";

import API from "../api";

const formatTime = (value) =>
  new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

function Notifications({ onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const openNotification = async (notification) => {
    try {
      await API.patch(`/notifications/${notification._id}/read`);
    } catch (err) {
      console.error(err);
    } finally {
      onNavigate(notification.link);
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } catch (err) {
      setError(err.response?.data?.message || "Could not update notifications");
    }
  };

  return (
    <main className="page-shell notifications-page">
      <section className="section-heading">
        <div>
          <span className="eyebrow">Notifications</span>
          <h2>Updates for you</h2>
        </div>
        <button className="ghost-button compact" type="button" onClick={markAllRead}>
          Mark all read
        </button>
      </section>

      {error ? <div className="form-error">{error}</div> : null}

      {loading ? (
        <div className="empty-card">Loading notifications...</div>
      ) : notifications.length ? (
        <div className="notification-list">
          {notifications.map((notification) => (
            <button
              className={`notification-item ${notification.read ? "" : "unread"}`}
              type="button"
              key={notification._id}
              onClick={() => openNotification(notification)}
            >
              <span className="notification-dot" aria-hidden="true" />
              <span>
                <strong>{notification.text}</strong>
                <small>{formatTime(notification.createdAt)}</small>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-card">No notifications yet.</div>
      )}
    </main>
  );
}

export default Notifications;
