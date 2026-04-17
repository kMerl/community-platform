import { useState } from "react";
import API from "../api";
import Comments from "./Comments";

function PostCard({ post, onUpdate }) {
  const [showComments, setShowComments] = useState(false);

  const vote = async (voteType) => {
    try {
      await API.post(`/posts/${post._id}/vote`, { voteType });
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const flag = async () => {
    try {
      await API.post(`/posts/${post._id}/flag`, { reason: "inappropriate" });
      alert("Post flagged");
    } catch (err) {
      alert(err.response?.data?.message || "Already flagged");
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ margin: "0 0 4px" }}>{post.title}</h3>
      <p style={{ color: "#555", margin: "0 0 8px", fontSize: 13 }}>by {post.author?.name}</p>
      <p style={{ margin: "0 0 12px" }}>{post.content}</p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => vote(1)}>▲ Upvote</button>
        <span>{post.votes ?? 0} votes</span>
        <button onClick={() => vote(-1)}>▼ Downvote</button>
        <button onClick={flag} style={{ marginLeft: "auto", color: "#999" }}>🚩 Flag</button>
        <button onClick={() => setShowComments(!showComments)}>
          💬 {showComments ? "Hide" : "Comments"}
        </button>
      </div>
      {showComments && <Comments postId={post._id} />}
    </div>
  );
}

export default PostCard;