import { useEffect, useRef, useState } from "react";

import API from "../api";
import Comments from "./Comments";

const formatTime = (value) =>
  new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

function PostCard({
  auth,
  post,
  onRefresh,
  onNavigate,
  onRequireLogin,
  forceExpandedComments = false,
  detailMode = false,
  highlightCommentId = "",
}) {
  const [showComments, setShowComments] = useState(forceExpandedComments);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setShowComments(forceExpandedComments);
  }, [forceExpandedComments]);

  useEffect(() => {
    const onWindowClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, []);

  const vote = async (voteType) => {
    if (!auth.isAuthenticated) {
      onRequireLogin?.();
      return;
    }

    try {
      await API.post(`/posts/${post._id}/vote`, { voteType });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const flag = async () => {
    if (!auth.isAuthenticated) {
      onRequireLogin?.();
      return;
    }

    try {
      await API.post(`/posts/${post._id}/flag`, { reason: "Flagged by community member" });
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openPost = () => onNavigate(`/post/${post._id}`);
  const authorInitial = post.author?.name?.slice(0, 1)?.toUpperCase() || "U";

  return (
    <article className={`post-card ${detailMode ? "post-card-detail" : ""}`}>
      <div className="post-topline">
        <button className="author-chip" type="button" onClick={() => onNavigate(`/profile/${post.author?._id || post.author}`)}>
          <span className="avatar-badge small">
            {authorInitial}
          </span>
          <span>
            <strong>{post.author?.name || "Unknown author"}</strong>
            <small>{formatTime(post.createdAt)}</small>
          </span>
        </button>

        <div className="menu-wrap" ref={menuRef}>
          <button
            className="icon-button"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
          {menuOpen ? (
            <div className="menu-panel">
              <button type="button" onClick={flag}>
                Flag post
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <button className="post-body-button" type="button" onClick={openPost}>
        <h3>{post.title}</h3>
        <p>{post.content}</p>
      </button>

      <div className="post-actions">
        <div className="vote-strip">
          <button
            type="button"
            className={`vote-button ${post.viewerVote === 1 ? "active-up" : ""}`}
            onClick={() => vote(1)}
            aria-label="Upvote"
          >
            <span aria-hidden="true">↑</span>
          </button>
          <span>{post.votes ?? 0}</span>
          <button
            type="button"
            className={`vote-button ${post.viewerVote === -1 ? "active-down" : ""}`}
            onClick={() => vote(-1)}
            aria-label="Downvote"
          >
            <span aria-hidden="true">↓</span>
          </button>
        </div>

        <div className="post-action-links">
          <button
            className="text-button"
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
          >
            {showComments ? "Hide comments" : `${post.commentCount || 0} comments`}
          </button>

          {!detailMode ? (
            <button className="ghost-button compact" type="button" onClick={openPost}>
              Open
            </button>
          ) : null}
        </div>
      </div>

      {showComments ? (
        <Comments
          auth={auth}
          postId={post._id}
          alwaysOpen
          highlightCommentId={highlightCommentId}
          onNavigate={onNavigate}
        />
      ) : null}
    </article>
  );
}

export default PostCard;
