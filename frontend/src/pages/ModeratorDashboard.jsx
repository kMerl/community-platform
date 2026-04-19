import { useCallback, useEffect, useState } from "react";

import API from "../api";
import PostCard from "../components/PostCard";

function ModeratorDashboard({ auth, onNavigate, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [activeSection, setActiveSection] = useState("queue");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState("");

  const fetchFlaggedPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const endpoint = activeSection === "removed" ? "/posts/removed" : "/posts/flagged";
      const res = await API.get(endpoint);
      setPosts(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || "Could not load moderation queue");
    } finally {
      setLoading(false);
    }
  }, [activeSection]);

  useEffect(() => {
    fetchFlaggedPosts();
  }, [fetchFlaggedPosts]);

  const moderatePost = async (postId, action) => {
    try {
      setWorkingId(postId);
      await API.post(`/posts/${postId}/${action}`);
      setPosts((current) => current.filter((post) => post._id !== postId));
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || "Moderation action failed");
    } finally {
      setWorkingId("");
    }
  };

  if (auth.user?.role !== "moderator") {
    return (
      <main className="page-shell with-rail">
        <section className="moderation-hero">
          <span className="eyebrow">Moderation</span>
          <h1>Moderator access required.</h1>
          <p>This dashboard is only available to accounts with the moderator role.</p>
          <div className="hero-actions start">
            <button className="primary-button" type="button" onClick={() => onNavigate("/")}>
              Home
            </button>
            <button className="ghost-button" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell with-rail">
      <section className="moderation-hero slim">
        <span className="eyebrow">Moderation queue</span>
        <h1>Review flagged posts.</h1>
        <div className="moderation-tabs">
          <button
            className={activeSection === "queue" ? "active" : ""}
            type="button"
            onClick={() => setActiveSection("queue")}
          >
            Queue
          </button>
          <button
            className={activeSection === "removed" ? "active" : ""}
            type="button"
            onClick={() => setActiveSection("removed")}
          >
            Removed
          </button>
          <button className="ghost-button compact" type="button" onClick={fetchFlaggedPosts}>
            Refresh
          </button>
        </div>
      </section>

      {error ? <div className="form-error">{error}</div> : null}

      {loading ? (
        <div className="empty-card">Loading flagged posts...</div>
      ) : posts.length ? (
        <div className="moderation-list">
          {posts.map((post) => (
            <section className="moderation-item" key={post._id}>
              <div className="moderation-item-head">
                <div>
                  <span className="eyebrow">
                    {activeSection === "removed" ? "Removed" : `Flagged ${post.flags?.length || 0} times`}
                  </span>
                  <h2>{post.title}</h2>
                </div>
                <div className="moderation-actions">
                  <button
                    className="ghost-button compact"
                    type="button"
                    onClick={() => moderatePost(post._id, "approve")}
                    disabled={workingId === post._id}
                  >
                    {activeSection === "removed" ? "Restore" : "Approve"}
                  </button>
                  {activeSection === "queue" ? (
                    <button
                      className="danger-button compact"
                      type="button"
                      onClick={() => moderatePost(post._id, "remove")}
                      disabled={workingId === post._id}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              {activeSection === "queue" && post.flags?.length ? (
                <div className="flag-list">
                  {post.flags.map((flag, index) => (
                    <span key={`${post._id}-${index}`}>{flag.reason || "Needs moderator review"}</span>
                  ))}
                </div>
              ) : null}

              <PostCard
                auth={auth}
                post={post}
                onNavigate={onNavigate}
                onRefresh={fetchFlaggedPosts}
                onRequireLogin={() => onNavigate("/login")}
              />
            </section>
          ))}
        </div>
      ) : (
        <div className="empty-card">
          {activeSection === "removed" ? "No removed posts." : "No flagged posts are waiting for review."}
        </div>
      )}
    </main>
  );
}

export default ModeratorDashboard;
