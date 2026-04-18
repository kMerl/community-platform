import { useEffect, useState } from "react";

import API from "../api";

const formatTime = (value) =>
  new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

function CommentNode({ auth, comment, postId, onReply }) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitReply = async () => {
    if (!auth.isAuthenticated || !text.trim()) return;

    try {
      setSubmitting(true);
      await API.post(`/posts/${postId}/comment`, {
        text,
        parentCommentId: comment._id,
      });
      setText("");
      setReplying(false);
      onReply();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`comment-node ${comment.parentCommentId ? "comment-reply" : ""}`}>
      <div className="comment-card">
        <div className="comment-meta">
          <strong>{comment.userId?.name || "Community member"}</strong>
          <span>{formatTime(comment.createdAt)}</span>
        </div>
        <p>{comment.text}</p>
        {auth.isAuthenticated ? (
          <button className="text-button" type="button" onClick={() => setReplying((prev) => !prev)}>
            {replying ? "Cancel" : "Reply"}
          </button>
        ) : null}
      </div>

      {replying ? (
        <div className="reply-box">
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a reply..."
          />
          <button className="ghost-button compact" type="button" onClick={submitReply} disabled={submitting}>
            {submitting ? "Sending..." : "Send reply"}
          </button>
        </div>
      ) : null}

      {comment.replies?.length ? (
        <div className="reply-stack">
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply._id}
              auth={auth}
              comment={reply}
              postId={postId}
              onReply={onReply}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Comments({ auth, postId, alwaysOpen = false }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await API.get(`/posts/${postId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (alwaysOpen) {
      fetchComments();
    }
  }, [alwaysOpen, postId]);

  const submitComment = async () => {
    if (!auth.isAuthenticated || !text.trim()) return;

    try {
      setSubmitting(true);
      await API.post(`/posts/${postId}/comment`, { text });
      setText("");
      fetchComments();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comments-panel">
      <div className="comments-head">
        <div>
          <span className="eyebrow">Discussion</span>
          <h3>{comments.length ? `${comments.length} top-level comments` : "Start the conversation"}</h3>
        </div>
      </div>

      {auth.isAuthenticated ? (
        <div className="comment-composer">
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a thoughtful comment..."
          />
          <button className="primary-button compact" type="button" onClick={submitComment} disabled={submitting}>
            {submitting ? "Posting..." : "Comment"}
          </button>
        </div>
      ) : (
        <div className="comment-signin-hint">Login to join the discussion.</div>
      )}

      <div className="comment-list">
        {comments.length ? (
          comments.map((comment) => (
            <CommentNode
              key={comment._id}
              auth={auth}
              comment={comment}
              postId={postId}
              onReply={fetchComments}
            />
          ))
        ) : (
          <div className="empty-subtle">No comments yet.</div>
        )}
      </div>
    </div>
  );
}

export default Comments;
