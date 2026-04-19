import { useMemo, useState } from "react";

import API from "../api";
import PostCard from "../components/PostCard";

function Search({ auth, onNavigate, onRequireLogin }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const runSearch = async (event) => {
    event.preventDefault();

    if (!trimmedQuery) return;

    try {
      setLoading(true);
      setSearched(true);
      const [usersRes, postsRes] = await Promise.all([
        API.get(`/auth/users?search=${encodeURIComponent(trimmedQuery)}`),
        API.get("/posts"),
      ]);

      const lowered = trimmedQuery.toLowerCase();
      setUsers(usersRes.data);
      setPosts(
        postsRes.data.filter((post) =>
          `${post.title || ""} ${post.content || ""}`.toLowerCase().includes(lowered),
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell search-page">
      <section className="search-hero">
        <span className="eyebrow">Search ThreadLine</span>
        <h1>Find people and posts.</h1>
        <form className="search-page-form" onSubmit={runSearch}>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users, titles, or post content"
          />
          <button className="primary-button" type="submit" disabled={loading || !trimmedQuery}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </section>

      <section className="search-results-grid">
        <div>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Users</span>
              <h2>{searched ? `${users.length} found` : "Search users"}</h2>
            </div>
          </div>
          <div className="user-result-list">
            {users.map((user) => (
              <button className="user-result" type="button" key={user._id} onClick={() => onNavigate(`/profile/${user._id}`)}>
                <span className="avatar-badge">{user.name?.slice(0, 1)?.toUpperCase() || "U"}</span>
                <span>
                  <strong>{user.name}</strong>
                  <small>{user.bio || `${user.reputation || 0} reputation`}</small>
                </span>
              </button>
            ))}
            {searched && !users.length ? <div className="empty-card">No users matched.</div> : null}
          </div>
        </div>

        <div>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Posts</span>
              <h2>{searched ? `${posts.length} found` : "Search posts"}</h2>
            </div>
          </div>
          <div className="feed-list">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                auth={auth}
                post={post}
                onNavigate={onNavigate}
                onRefresh={() => {}}
                onRequireLogin={onRequireLogin}
              />
            ))}
            {searched && !posts.length ? <div className="empty-card">No posts matched.</div> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Search;
