import { useState, useEffect } from "react";
import API from "../api";

function CommentNode({ comment, postId, onReply }) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");

  const submitReply = async () => {
    if (!text.trim()) return;
    try {
      await API.post(`/posts/${postId}/comment`, { text, parentCommentId: comment._id });
      setText("");
      setReplying(false);
      onReply();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginLeft: comment.parentCommentId ? 20 : 0, borderLeft: comment.parentCommentId ? "2px solid #eee" : "none", paddingLeft: comment.parentCommentId ? 12 : 0, marginTop: 8 }}>
      <p style={{ margin: "0 0 4px", fontSize: 14 }}>
        <strong>{comment.userId?.name}</strong>: {comment.text}
      </p>
      <button onClick={() => setReplying(!replying)} style={{ fontSize: 12, color: "#888" }}>Reply</button>
      {replying && (
        <div style={{ marginTop: 4 }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a reply..."
            style={{ padding: 4, marginRight: 4 }}
          />
          <button onClick={submitReply}>Send</button>
        </div>
      )}
      {comment.replies?.map(reply => (
        <CommentNode key={reply._id} comment={reply} postId={postId} onReply={onReply} />
      ))}
    </div>
  );
}

function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const fetchComments = async () => {
    try {
      const res = await API.get(`/posts/${postId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchComments(); }, [postId]);

  const submitComment = async () => {
    if (!text.trim()) return;
    try {
      await API.post(`/posts/${postId}/comment`, { text });
      setText("");
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 12 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a comment..."
          style={{ flex: 1, padding: 6 }}
        />
        <button onClick={submitComment}>Post</button>
      </div>
      {comments.map(c => (
        <CommentNode key={c._id} comment={c} postId={postId} onReply={fetchComments} />
      ))}
    </div>
  );
}

export default Comments;