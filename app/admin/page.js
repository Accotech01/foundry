"use client";
const { useState, useEffect } = require("react");

function fmtMoney(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  return `$${Math.round(n / 1000)}k`;
}

function AdminQueue() {
  const [user, setUser] = useState(undefined);
  const [pitches, setPitches] = useState([]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") fetch("/api/admin/pitches").then((r) => r.json()).then(setPitches);
  }, [user]);

  const decide = async (id, status) => {
    await fetch(`/api/admin/pitches/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setPitches((prev) => prev.filter((p) => p.id !== id));
  };

  if (user === undefined) return <div className="container" style={{ padding: 60 }}>Loading…</div>;
  if (!user || user.role !== "ADMIN") return <div className="container" style={{ padding: 60 }}>Admin access required.</div>;

  return (
    <div className="container" style={{ padding: "40px 24px 80px" }}>
      <h1 style={{ fontWeight: 600, fontSize: 30 }}>Moderation queue</h1>
      <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 28 }}>
        {pitches.length} pitch{pitches.length === 1 ? "" : "es"} waiting for review before going live.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        {pitches.length === 0 && <div style={{ color: "var(--muted-2)", fontSize: 14 }}>Nothing waiting. The queue is clear.</div>}
        {pitches.map((p) => (
          <div key={p.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 18, fontFamily: "Fraunces, serif" }}>{p.title}</div>
                <div style={{ fontSize: 13.5, color: "var(--muted)", margin: "4px 0" }}>{p.tagline}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted-2)" }}>
                  {p.sector} · {p.stage} · submitted by {p.founder?.name} ({p.founder?.email})
                </div>
              </div>
              <div style={{ fontWeight: 600, color: "var(--accent)", fontFamily: "Fraunces, serif", fontSize: 18 }}>{fmtMoney(p.fundingAsk)}</div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 12 }}>{p.description}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={() => decide(p.id, "REJECTED")} className="btn-secondary" style={{ padding: "8px 14px", fontSize: 13.5 }}>Reject</button>
              <button onClick={() => decide(p.id, "OPEN")} className="btn-primary" style={{ padding: "8px 14px", fontSize: 13.5 }}>Approve & publish</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

module.exports.default = AdminQueue;
