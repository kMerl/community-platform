import { useEffect, useRef, useState } from "react";

import API from "../api";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

function Home({ auth, onLogout, onNavigate, onRequireLogin }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const feedRef = useRef(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const scrollToFeed = () => {
    feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Community discussion</span>
          <h1>A focused forum for posts, replies, and community voting.</h1>
          <p>
            Browse the latest posts, open any thread for the full discussion,
            and participate once you sign in.
          </p>
          <div className="hero-actions">
            {auth.isAuthenticated ? (
              <>
                <button className="primary-button" onClick={scrollToFeed}>
                  Open feed
                </button>
                <button className="ghost-button" onClick={() => onNavigate(`/profile/${auth.user._id}`)}>
                  My profile
                </button>
                <button className="ghost-button" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="primary-button" onClick={() => onNavigate("/register")}>
                  Register
                </button>
                <button className="ghost-button" onClick={() => onNavigate("/login")}>
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="content-grid" ref={feedRef}>
        <div className="content-main">
          {auth.isAuthenticated && (
            <CreatePost
              currentUser={auth.user}
              onCreated={fetchPosts}
            />
          )}

          <div className="section-heading">
            <div>
              <span className="eyebrow">Feed</span>
              <h2>{auth.isAuthenticated ? "Your home timeline" : "Public preview feed"}</h2>
            </div>
          </div>

          {loading ? (
            <div className="empty-card">Loading the latest conversations...</div>
          ) : posts.length ? (
            <div className="feed-list">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  auth={auth}
                  post={post}
                  onNavigate={onNavigate}
                  onRefresh={fetchPosts}
                  onRequireLogin={onRequireLogin}
                />
              ))}
            </div>
          ) : (
            <div className="empty-card">The feed is ready for its first post.</div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Home;
