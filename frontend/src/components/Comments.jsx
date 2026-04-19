import { useCallback, useEffect, useState } from "react";

import API from "../api";

const formatTime = (value) =>
  new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

function ReplyNode({ auth, comment, postId, onReply, highlightCommentId, onNavigate }) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isHighlighted = highlightCommentId === comment._id;

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
    <div className={`reply-row ${isHighlighted ? "highlighted" : ""}`} id={`comment-${comment._id}`}>
      <div className="comment-meta">
        <div className="comment-author">
          <button
            className="comment-author-button"
            type="button"
            onClick={() => comment.userId?._id && onNavigate?.(`/profile/${comment.userId._id}`)}
          >
            <span className="avatar-badge small">
              {comment.userId?.name?.slice(0, 1)?.toUpperCase() || "C"}
            </span>
            <span>
              <strong>{comment.userId?.name || "Community member"}</strong>
              <small>{formatTime(comment.createdAt)}</small>
            </span>
          </button>
        </div>
      </div>
      <p>{comment.text}</p>
      {auth.isAuthenticated ? (
        <button className="text-button" type="button" onClick={() => setReplying((prev) => !prev)}>
          {replying ? "Cancel" : "Reply"}
        </button>
      ) : null}

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
            <ReplyNode
              key={reply._id}
              auth={auth}
              comment={reply}
              postId={postId}
              onReply={onReply}
              highlightCommentId={highlightCommentId}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CommentThread({ auth, comment, postId, onReply, highlightCommentId, onNavigate }) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isHighlighted = highlightCommentId === comment._id;

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
    <article className={`comment-thread-card ${isHighlighted ? "highlighted" : ""}`} id={`comment-${comment._id}`}>
      <div className="comment-meta">
        <div className="comment-author">
          <button
            className="comment-author-button"
            type="button"
            onClick={() => comment.userId?._id && onNavigate?.(`/profile/${comment.userId._id}`)}
          >
            <span className="avatar-badge small">
              {comment.userId?.name?.slice(0, 1)?.toUpperCase() || "C"}
            </span>
            <span>
              <strong>{comment.userId?.name || "Community member"}</strong>
              <small>{formatTime(comment.createdAt)}</small>
            </span>
          </button>
        </div>
      </div>
      <p>{comment.text}</p>
      {auth.isAuthenticated ? (
        <button className="text-button" type="button" onClick={() => setReplying((prev) => !prev)}>
          {replying ? "Cancel" : "Reply"}
        </button>
      ) : null}

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
        <div className="thread-replies">
          {comment.replies.map((reply) => (
            <ReplyNode
              key={reply._id}
              auth={auth}
              comment={reply}
              postId={postId}
              onReply={onReply}
              highlightCommentId={highlightCommentId}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function Comments({ auth, postId, alwaysOpen = false, highlightCommentId = "", onNavigate }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await API.get(`/posts/${postId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [postId]);

  useEffect(() => {
    if (alwaysOpen) {
      fetchComments();
    }
  }, [alwaysOpen, postId, fetchComments]);

  useEffect(() => {
    if (!highlightCommentId || !comments.length) return;

    window.setTimeout(() => {
      document.getElementById(`comment-${highlightCommentId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 120);
  }, [comments, highlightCommentId]);

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
          <h3>{comments.length ? `${comments.length} comment threads` : "Start the conversation"}</h3>
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
            <CommentThread
              key={comment._id}
              auth={auth}
              comment={comment}
              postId={postId}
              onReply={fetchComments}
              highlightCommentId={highlightCommentId}
              onNavigate={onNavigate}
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
