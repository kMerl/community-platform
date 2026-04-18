import { useEffect, useState } from "react";

import API from "../api";
import PostCard from "../components/PostCard";

function PostDetail({ auth, onLogout, onNavigate, postId }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/posts/${postId}`);
      setPost(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load this post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  return (
    <main className="page-shell">
      <section className="section-heading">
        <div>
          <span className="eyebrow">Thread view</span>
          <h2>Post detail</h2>
        </div>
        <div className="hero-actions">
          <button className="ghost-button compact" onClick={() => onNavigate("/")}>
            Back to feed
          </button>
          {auth.isAuthenticated ? (
            <>
              <button className="ghost-button compact" onClick={() => onNavigate(`/profile/${auth.user._id}`)}>
                My profile
              </button>
              <button className="ghost-button compact" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="primary-button compact" onClick={() => onNavigate("/login")}>
              Login
            </button>
          )}
        </div>
      </section>

      {loading ? <div className="empty-card">Loading post...</div> : null}
      {error ? <div className="empty-card">{error}</div> : null}

      {post ? (
        <div className="detail-layout">
          <PostCard
            auth={auth}
            post={post}
            onNavigate={onNavigate}
            onRefresh={fetchPost}
            forceExpandedComments
            detailMode
            onRequireLogin={() => onNavigate("/login")}
          />
        </div>
      ) : null}
    </main>
  );
}

export default PostDetail;
