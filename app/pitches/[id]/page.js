"use client";
const { useState, useEffect } = require("react");

const STAGE_LABEL = { IDEA: "Idea", MVP: "MVP", SEED: "Seed", SERIES_A: "Series A" };
const statusMeta = {
  PENDING_REVIEW: { label: "In review", color: "var(--gold)", bg: "var(--gold-soft)" },
  OPEN: { label: "Open", color: "var(--accent)", bg: "var(--accent-soft)" },
  IN_TALKS: { label: "In talks", color: "var(--gold)", bg: "var(--gold-soft)" },
  CLOSED: { label: "Closed", color: "var(--muted-2)", bg: "#EEF0F3" },
  REJECTED: { label: "Rejected", color: "#B23B3B", bg: "#FBEAEA" },
};
function fmtMoney(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  return `$${Math.round(n / 1000)}k`;
}

function PitchDetail({ params }) {
  const [pitch, setPitch] = useState(null);
  const [user, setUser] = useState(undefined);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/pitches/${params.id}`).then((r) => r.json()).then(setPitch);
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
  }, [params.id]);

  if (!pitch) return <div className="container" style={{ padding: 60 }}>Loading…</div>;
  if (pitch.error) return <div className="container" style={{ padding: 60 }}>Pitch not found.</div>;

  const sm = statusMeta[pitch.status];
  const alreadySent = user && pitch.interests?.some((i) => i.investorId === user.id);

  const expressInterest = async () => {
    setError("");
    const res = await fetch("/api/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pitchId: pitch.id, message: note }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Something went wrong."); return; }
    setSent(true);
  };

  return (
    <div className="container" style={{ maxWidth: 880, padding: "32px 24px 80px" }}>
      <a href="/browse" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 13.5, marginBottom: 18 }}>← Back to ledger</a>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span className="pill" style={{ background: "#EEF0F3", color: "#3A4150" }}>{pitch.sector}</span>
            <span className="pill" style={{ background: "#EEF0F3", color: "#3A4150" }}>{STAGE_LABEL[pitch.stage]}</span>
            <span className="pill" style={{ color: sm.color, background: sm.bg }}>{sm.label}</span>
          </div>
          <h1 style={{ fontWeight: 600, fontSize: 36, margin: 0 }}>{pitch.title}</h1>
          <p style={{ fontSize: 16, color: "var(--muted)", marginTop: 8 }}>{pitch.tagline}</p>
          <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 13.5, color: "var(--muted-2)" }}>
            <span>{pitch.founder?.name}</span>
            {pitch.location && <span>{pitch.location}</span>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 600, fontSize: 30, color: "var(--accent)", fontFamily: "Fraunces, serif" }}>{fmtMoney(pitch.fundingAsk)}</div>
          {pitch.equityPct && <div style={{ fontSize: 12.5, color: "var(--muted-2)" }}>for {pitch.equityPct}% equity</div>}
        </div>
      </div>

      <div style={{ fontWeight: 600, fontSize: 18, margin: "28px 0 8px" }}>About this pitch</div>
      <p style={{ fontSize: 15, lineHeight: 1.7 }}>{pitch.description}</p>

      <div style={{ marginTop: 32 }} className="card">
        <div style={{ padding: 22 }}>
          {pitch.status === "CLOSED" ? (
            <div style={{ color: "var(--muted-2)", fontSize: 14 }}>This round has closed.</div>
          ) : user === undefined ? null : !user ? (
            <div style={{ fontSize: 14 }}>
              <a href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Log in</a> as an investor to express interest in this pitch.
            </div>
          ) : user.role !== "INVESTOR" ? (
            <div style={{ color: "var(--muted)", fontSize: 14 }}>Only investor accounts can express interest.</div>
          ) : sent || alreadySent ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--accent)", fontWeight: 600, fontSize: 14.5 }}>
              ✓ Interest sent. {pitch.founder?.name} will be notified, and contact details unlock if accepted.
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>Express interest</div>
              <textarea className="input" style={{ minHeight: 70, resize: "vertical" }} value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note to the founder — what about this caught your eye?" />
              {error && <div className="error-text">{error}</div>}
              <button onClick={expressInterest} className="btn-primary" style={{ marginTop: 12 }}>Send interest →</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

module.exports.default = PitchDetail;
