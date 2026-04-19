import { useState } from "react";

import API from "../api";

function CreatePost({ currentUser, onCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      await API.post("/posts", { title, content });
      setTitle("");
      setContent("");
      onCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="composer-card" onSubmit={handleSubmit}>
      <div className="composer-head">
        <div className="composer-author">
          <div className="avatar-badge">
            {currentUser?.name?.slice(0, 1)?.toUpperCase() || "Y"}
          </div>
          <div>
            <span className="eyebrow">Create post</span>
            <h3>Share something worth discussing</h3>
          </div>
        </div>
      </div>

      <input
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Drop your idea, question, or update here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />

      <div className="composer-actions">
        <button className="primary-button compact" type="submit" disabled={submitting}>
          {submitting ? "Posting..." : "Publish"}
        </button>
      </div>
    </form>
  );
}

export default CreatePost;
