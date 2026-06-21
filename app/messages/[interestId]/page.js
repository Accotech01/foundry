"use client";
const { useState, useEffect, useRef } = require("react");

function Conversation({ params }) {
  const [user, setUser] = useState(undefined);
  const [messages, setMessages] = useState(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = () => {
    fetch(`/api/interests/${params.interestId}/messages`).then(async (r) => {
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Unable to load this conversation."); return; }
      setMessages(data);
      setError("");
    });
  };

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
    load();
    const interval = setInterval(load, 5000); // light polling so both sides see new messages
    return () => clearInterval(interval);
  }, [params.interestId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const res = await fetch(`/api/interests/${params.interestId}/messages`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }),
    });
    setSending(false);
    if (res.ok) { setBody(""); load(); }
  };

  if (user === undefined || messages === null && !error) return <div className="container" style={{ padding: 60 }}>Loading…</div>;
  if (error) return <div className="container" style={{ padding: 60, color: "var(--muted)" }}>{error}</div>;

  return (
    <div className="container" style={{ maxWidth: 680, padding: "32px 24px 40px" }}>
      <a href="/dashboard" style={{ display: "inline-flex", color: "var(--muted)", fontSize: 13.5, marginBottom: 18 }}>← Back to dashboard</a>
      <h1 style={{ fontWeight: 600, fontSize: 26, marginBottom: 18 }}>Conversation</h1>

      <div className="card" style={{ padding: 18, minHeight: 320, maxHeight: 460, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && <div style={{ color: "var(--muted-2)", fontSize: 14 }}>No messages yet — say hello.</div>}
        {messages.map((m) => {
          const mine = m.sender.id === user.id;
          return (
            <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
              <div style={{
                background: mine ? "var(--ink)" : "#EEF0F3", color: mine ? "#fff" : "#1A2233",
                borderRadius: 10, padding: "9px 13px", fontSize: 14, lineHeight: 1.5,
              }}>
                {m.body}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted-2)", marginTop: 3, textAlign: mine ? "right" : "left" }}>
                {mine ? "You" : m.sender.name} · {new Date(m.createdAt).toLocaleString()}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <input className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message…" />
        <button className="btn-primary" disabled={sending}>{sending ? "Sending…" : "Send"}</button>
      </form>
    </div>
  );
}

module.exports.default = Conversation;
