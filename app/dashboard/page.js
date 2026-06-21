"use client";
const { useState, useEffect } = require("react");
const { useSearchParams } = require("next/navigation");

function fmtMoney(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  return `$${Math.round(n / 1000)}k`;
}
const STAGE_LABEL = { IDEA: "Idea", MVP: "MVP", SEED: "Seed", SERIES_A: "Series A" };
const PITCH_STATUS_LABEL = {
  PENDING_REVIEW: { label: "In review", color: "var(--gold)", bg: "var(--gold-soft)" },
  OPEN: { label: "Open", color: "var(--accent)", bg: "var(--accent-soft)" },
  IN_TALKS: { label: "In talks", color: "var(--gold)", bg: "var(--gold-soft)" },
  CLOSED: { label: "Closed", color: "var(--muted-2)", bg: "#EEF0F3" },
  REJECTED: { label: "Rejected", color: "#B23B3B", bg: "#FBEAEA" },
};

function Dashboard() {
  const searchParams = useSearchParams();
  const justSubmitted = searchParams.get("submitted") === "1";
  const [user, setUser] = useState(undefined);
  const [pitches, setPitches] = useState([]);
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
    fetch("/api/interests").then((r) => (r.ok ? r.json() : [])).then(setInterests);
  }, []);

  useEffect(() => {
    if (user?.role === "FOUNDER") {
      fetch("/api/pitches?mine=true").then((r) => r.json()).then(setPitches);
    }
  }, [user]);

  const respond = async (id, status) => {
    await fetch(`/api/interests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setInterests((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  if (user === undefined) return <div className="container" style={{ padding: 60 }}>Loading…</div>;
  if (!user) return <div className="container" style={{ padding: 60 }}>Please <a href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>log in</a> to view your dashboard.</div>;

  if (user.role === "FOUNDER") {
    return (
      <div className="container" style={{ padding: "40px 24px 80px" }}>
        <h1 style={{ fontWeight: 600, fontSize: 30 }}>Founder dashboard</h1>
        <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 20 }}>Your listings and the interest they've drawn.</p>
        {justSubmitted && (
          <div className="card" style={{ padding: "12px 16px", marginBottom: 20, background: "var(--gold-soft)", borderColor: "var(--gold-soft)", fontSize: 13.5 }}>
            Your pitch was submitted and is now awaiting review. It'll appear in the public ledger once approved.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            ["Total views", pitches.reduce((s, p) => s + (p.viewCount || 0), 0)],
            ["Interest received", interests.length],
            ["Conversion rate", (() => {
              const views = pitches.reduce((s, p) => s + (p.viewCount || 0), 0);
              return views ? `${((interests.length / views) * 100).toFixed(1)}%` : "—";
            })()],
          ].map(([label, val]) => (
            <div key={label} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 12, color: "var(--muted-2)" }}>{label}</div>
              <div style={{ fontWeight: 600, fontSize: 22, fontFamily: "Fraunces, serif", marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ overflow: "hidden", marginBottom: 32 }}>
          {pitches.length === 0 && <div style={{ padding: 24, color: "var(--muted-2)", fontSize: 14 }}>You haven't posted a pitch yet. <a href="/post" style={{ color: "var(--accent)", fontWeight: 600 }}>Post one now.</a></div>}
          {pitches.map((p) => {
            const sm = PITCH_STATUS_LABEL[p.status];
            return (
              <a key={p.id} href={`/pitches/${p.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E7EAEE" }}>
                <div>
                  <div style={{ fontWeight: 600, fontFamily: "Fraunces, serif", fontSize: 16 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>{p.sector} · {STAGE_LABEL[p.stage]} · {p.viewCount || 0} views · {p._count?.interests ?? 0} interest</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="pill" style={{ color: sm.color, background: sm.bg }}>{sm.label}</span>
                  <div style={{ fontWeight: 600, color: "var(--accent)", fontFamily: "Fraunces, serif" }}>{fmtMoney(p.fundingAsk)}</div>
                </div>
              </a>
            );
          })}
        </div>

        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Investor interest received</div>
        <div style={{ display: "grid", gap: 10 }}>
          {interests.length === 0 && <div style={{ color: "var(--muted-2)", fontSize: 14 }}>No interest yet.</div>}
          {interests.map((it) => (
            <div key={it.id} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{it.investor?.name}{it.investor?.investorProfile?.firmName ? ` — ${it.investor.investorProfile.firmName}` : ""}</div>
                <div style={{ fontSize: 13, color: "var(--muted-2)", margin: "2px 0" }}>on <strong style={{ color: "#3A4150" }}>{it.pitch?.title}</strong>{it.message ? ` — "${it.message}"` : ""}</div>
              </div>
              {it.status === "PENDING" ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => respond(it.id, "DECLINED")} className="btn-secondary" style={{ padding: "7px 12px", fontSize: 13 }}>Decline</button>
                  <button onClick={() => respond(it.id, "ACCEPTED")} className="btn-primary" style={{ padding: "7px 12px", fontSize: 13 }}>Accept</button>
                </div>
              ) : it.status === "ACCEPTED" ? (
                <a href={`/messages/${it.id}`} className="btn-primary" style={{ padding: "7px 12px", fontSize: 13 }}>Message</a>
              ) : (
                <span className="pill" style={{ color: "var(--muted-2)", background: "#EEF0F3" }}>Declined</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 24px 80px" }}>
      <h1 style={{ fontWeight: 600, fontSize: 30 }}>Investor dashboard</h1>
      <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 28 }}>Interest you've sent and its status.</p>

      <div style={{ display: "grid", gap: 10 }}>
        {interests.length === 0 && <div style={{ color: "var(--muted-2)", fontSize: 14 }}>You haven't expressed interest in any pitches yet. <a href="/browse" style={{ color: "var(--accent)", fontWeight: 600 }}>Browse the ledger.</a></div>}
        {interests.map((it) => (
          <div key={it.id} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href={`/pitches/${it.pitchId}`} style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontFamily: "Fraunces, serif", fontSize: 15.5 }}>{it.pitch?.title}</div>
              <div style={{ fontSize: 13, color: "var(--muted-2)" }}>{it.pitch?.sector} · {fmtMoney(it.pitch?.fundingAsk || 0)} ask</div>
            </a>
            {it.status === "ACCEPTED" ? (
              <a href={`/messages/${it.id}`} className="btn-primary" style={{ padding: "7px 12px", fontSize: 13 }}>Message</a>
            ) : (
              <span className="pill" style={{
                color: it.status === "DECLINED" ? "var(--muted-2)" : "var(--gold)",
                background: it.status === "DECLINED" ? "#EEF0F3" : "var(--gold-soft)",
              }}>
                {it.status === "PENDING" ? "Pending" : "Declined"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

module.exports.default = Dashboard;
module.exports.dynamic = "force-dynamic";
