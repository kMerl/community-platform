import { useEffect, useState } from "react";

import API from "../api";
import PostCard from "../components/PostCard";

function EditProfileModal({ profile, open, onClose, onSaved }) {
  const [name, setName] = useState(profile?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(profile?.name || "");
      setBio(profile?.bio || "");
      setError("");
    }
  }, [open, profile]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await API.patch("/auth/me", { name, bio });
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-card" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <span className="eyebrow">Edit profile</span>
        <h2>Update your public details.</h2>
        {error ? <div className="form-error">{error}</div> : null}
        <label className="modal-field">
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required />
        </label>
        <label className="modal-field">
          <span>Bio</span>
          <textarea
            rows={4}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={280}
            placeholder="Write a short introduction"
          />
        </label>
        <div className="modal-meta">{bio.length}/280</div>
        <div className="hero-actions">
          <button className="primary-button compact" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button className="ghost-button compact" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Profile({ auth, onLogout, onNavigate, userId, onUserUpdated }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const isOwnProfile = auth.isAuthenticated && auth.user?._id === userId;

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, postsRes] = await Promise.all([
        API.get(`/posts/profile/${userId}`),
        API.get(`/posts?author=${userId}`),
      ]);

      setProfile(profileRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="empty-card">Loading profile...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="page-shell">
        <div className="empty-card">Profile not found.</div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="profile-hero">
        <div className="profile-badge">
          {profile.name?.slice(0, 1)?.toUpperCase() || "U"}
        </div>
        <div className="profile-copy">
          <span className="eyebrow">User profile</span>
          <h1>{profile.name}</h1>
          {profile.bio ? <p>{profile.bio}</p> : null}
          <p>{profile.email}</p>
        </div>
        <div className="profile-actions">
          <button className="ghost-button compact" onClick={() => onNavigate("/")}>
            Home
          </button>
          {isOwnProfile ? (
            <button className="ghost-button compact" onClick={() => setEditing(true)}>
              Edit profile
            </button>
          ) : null}
          {!isOwnProfile ? (
            <button
              className="primary-button compact"
              onClick={() => onNavigate(auth.isAuthenticated ? `/messages/${profile._id}` : "/login")}
            >
              Message
            </button>
          ) : null}
          {!isOwnProfile && auth.isAuthenticated ? (
            <button className="ghost-button compact" onClick={() => onNavigate(`/profile/${auth.user._id}`)}>
              My profile
            </button>
          ) : null}
          {auth.isAuthenticated ? (
            <button className="ghost-button compact" onClick={onLogout}>
              Logout
            </button>
          ) : (
            <button className="primary-button compact" onClick={() => onNavigate("/login")}>
              Login
            </button>
          )}
        </div>
      </section>

      <section className="profile-metrics">
        <div className="metric-card">
          <strong>{profile.reputation}</strong>
          <span>Reputation</span>
        </div>
        <div className="metric-card">
          <strong>{profile.stats.postCount}</strong>
          <span>Posts</span>
        </div>
        <div className="metric-card">
          <strong>{profile.stats.commentCount}</strong>
          <span>Comments + replies</span>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <span className="eyebrow">Activity</span>
          <h2>Posts by {profile.name}</h2>
        </div>
      </section>

      <div className="feed-list">
        {posts.length ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              auth={auth}
              post={post}
              onNavigate={onNavigate}
              onRefresh={fetchProfileData}
              onRequireLogin={() => onNavigate("/login")}
            />
          ))
        ) : (
          <div className="empty-card">No posts published yet.</div>
        )}
      </div>

      <EditProfileModal
        profile={profile}
        open={editing}
        onClose={() => setEditing(false)}
        onSaved={(updatedUser) => {
          setProfile((current) => ({
            ...current,
            ...updatedUser,
            stats: current?.stats || profile?.stats,
          }));
          onUserUpdated?.(updatedUser);
        }}
      />
    </main>
  );
}

export default Profile;
