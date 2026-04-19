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
  const [threadUser, setThreadUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchConversation = async () => {
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
      <section className="message-header">
        <button className="ghost-button compact" type="button" onClick={() => onNavigate(`/profile/${userId}`)}>
          Back to profile
        </button>
        <div>
          <span className="eyebrow">Direct message</span>
          <h1>{threadUser?.name || "Conversation"}</h1>
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

      <section className="message-thread" aria-label={`Messages with ${threadUser?.name || "user"}`}>
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
      </section>

      <form className="message-composer" onSubmit={sendMessage}>
        <textarea
          rows={3}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Message ${threadUser?.name || "this user"}`}
          maxLength={1000}
        />
        <button className="primary-button" type="submit" disabled={sending || !text.trim()}>
          {sending ? "Sending..." : "Send message"}
        </button>
      </form>
    </main>
  );
}

export default Messages;
