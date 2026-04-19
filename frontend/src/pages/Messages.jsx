import { useEffect, useRef, useState } from "react";

import API from "../api";

const formatMessageTime = (value) =>
  new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

function Messages({ auth, onLogout, onNavigate, userId }) {
  const [conversations, setConversations] = useState([]);
  const [threadUser, setThreadUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await API.get("/messages");
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchConversation = async () => {
      if (!userId) {
        setThreadUser(null);
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await API.get(`/messages/${userId}`);
        setThreadUser(res.data.user);
        setMessages(res.data.messages);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    fetchConversation();
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const cleanText = text.trim();

    if (!cleanText) return;

    try {
      setSending(true);
      setError("");
      const res = await API.post(`/messages/${userId}`, { text: cleanText });
      setMessages((current) => [...current, res.data]);
      setText("");
      fetchConversations();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <div className="empty-card">Opening messages...</div>
      </main>
    );
  }

  return (
    <main className="page-shell message-page">
      <section className="message-header improved">
        <div className="message-person">
          <span className="profile-badge message-avatar">
            {threadUser?.name?.slice(0, 1)?.toUpperCase() || "M"}
          </span>
          <div>
            <span className="eyebrow">Messages</span>
            <h1>{threadUser?.name || "Inbox"}</h1>
          </div>
        </div>
        <div>
          {threadUser ? (
            <button className="ghost-button compact" type="button" onClick={() => onNavigate(`/profile/${userId}`)}>
              Profile
            </button>
          ) : null}
        </div>
        <div className="message-nav-actions">
          <button className="ghost-button compact" type="button" onClick={() => onNavigate("/")}>
            Home
          </button>
          <button className="ghost-button compact" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </section>

      {error ? <div className="form-error">{error}</div> : null}

      <section className="message-layout">
        <aside className="conversation-list" aria-label="Message conversations">
          {conversations.length ? (
            conversations.map((conversation) => (
              <button
                className={conversation.user?._id === userId ? "active" : ""}
                type="button"
                key={conversation.user?._id}
                onClick={() => onNavigate(`/messages/${conversation.user._id}`)}
              >
                <span className="avatar-badge small">
                  {conversation.user?.name?.slice(0, 1)?.toUpperCase() || "U"}
                </span>
                <span>
                  <strong>{conversation.user?.name || "User"}</strong>
                  <small>{conversation.lastMessage?.text || "Open conversation"}</small>
                </span>
              </button>
            ))
          ) : (
            <div className="empty-subtle">No conversations yet.</div>
          )}
        </aside>

        <div className="message-console">
          {threadUser ? (
            <>
              <div className="message-thread" aria-label={`Messages with ${threadUser?.name || "user"}`}>
                {messages.length ? (
                  messages.map((message) => {
                    const mine = message.sender?._id === auth.user?._id || message.sender === auth.user?._id;

                    return (
                      <article className={`message-bubble ${mine ? "mine" : ""}`} key={message._id}>
                        <p>{message.text}</p>
                        <span>{mine ? "You" : message.sender?.name || threadUser?.name} - {formatMessageTime(message.createdAt)}</span>
                      </article>
                    );
                  })
                ) : (
                  <div className="empty-card">No messages yet. Start the conversation.</div>
                )}
                <div ref={bottomRef} />
              </div>

              <form className="message-composer improved" onSubmit={sendMessage}>
                <textarea
                  rows={2}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder={`Message ${threadUser?.name || "this user"}`}
                  maxLength={1000}
                />
                <button className="primary-button" type="submit" disabled={sending || !text.trim()}>
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          ) : (
            <div className="message-empty-state">
              <span className="eyebrow">Inbox</span>
              <h2>Select a conversation.</h2>
              <p>Use profile pages or user search to start a new direct message.</p>
              <button className="primary-button compact" type="button" onClick={() => onNavigate("/search")}>
                Search users
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Messages;
