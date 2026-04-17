import { useState } from "react";
import API from "../api";

function CreatePost({ onCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) return;
    try {
      await API.post("/posts", { title, content });
      setTitle("");
      setContent("");
      onCreated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 24 }}>
      <h3 style={{ margin: "0 0 12px" }}>Create Post</h3>
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
        style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
      />
      <button onClick={handleSubmit}>Post</button>
    </div>
  );
}

export default CreatePost;