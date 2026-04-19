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
    <main className="home-shell">
      <section className="home-hero">
        <nav className="home-nav" aria-label="Home navigation">
          <button className="brand-button" type="button" onClick={() => onNavigate("/")}>
            Community
          </button>
          <div className="home-nav-actions">
            {auth.isAuthenticated ? (
              <>
                <button className="ghost-button" onClick={() => onNavigate(`/profile/${auth.user._id}`)}>
                  My profile
                </button>
                <button className="ghost-button" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="ghost-button" onClick={() => onNavigate("/login")}>
                  Login
                </button>
                <button className="primary-button" onClick={() => onNavigate("/register")}>
                  Register
                </button>
              </>
            )}
          </div>
        </nav>

        <div className="hero-layer">
          <div className="hero-copy">
            <span className="eyebrow">Community discussion</span>
            <h1>A lively place for posts, replies, votes, and real conversation.</h1>
            <p>
              Browse public discussions, meet the people behind each post, and join in when
              you are ready. The feed is waiting just below the welcome screen.
            </p>
            <div className="hero-actions start">
              <button className="primary-button" onClick={scrollToFeed}>
                Explore feed
              </button>
              {!auth.isAuthenticated ? (
                <button className="ghost-button" onClick={() => onNavigate("/register")}>
                  Create account
                </button>
              ) : (
                <button className="ghost-button" onClick={() => onNavigate(`/profile/${auth.user._id}`)}>
                  View profile
                </button>
              )}
            </div>
          </div>

          <div className="hero-graphic" aria-hidden="true">
            <div className="graphic-band coral" />
            <div className="graphic-band mint" />
            <div className="discussion-preview">
              <div className="preview-top">
                <span />
                <span />
                <span />
              </div>
              <div className="preview-post large" />
              <div className="preview-post medium" />
              <div className="preview-post small" />
              <div className="preview-footer">
                <span />
                <span />
              </div>
            </div>
            <div className="vote-tile up">+24</div>
            <div className="vote-tile chat">18 replies</div>
          </div>
        </div>
      </section>

      <section className="feed-section" ref={feedRef}>
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
