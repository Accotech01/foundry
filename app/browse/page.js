"use client";
const { useState, useEffect } = require("react");

const SECTORS = ["AgTech", "Fintech", "HealthTech", "CleanTech", "FoodTech"];
const STAGES = ["IDEA", "MVP", "SEED", "SERIES_A"];
const STAGE_LABEL = { IDEA: "Idea", MVP: "MVP", SEED: "Seed", SERIES_A: "Series A" };

const statusMeta = {
  OPEN: { label: "Open", color: "var(--accent)", bg: "var(--accent-soft)" },
  IN_TALKS: { label: "In talks", color: "var(--gold)", bg: "var(--gold-soft)" },
  CLOSED: { label: "Closed", color: "var(--muted-2)", bg: "#EEF0F3" },
};

function fmtMoney(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  return `$${Math.round(n / 1000)}k`;
}

function Browse() {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("All");
  const [stage, setStage] = useState("All");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sector !== "All") params.set("sector", sector);
    if (stage !== "All") params.set("stage", stage);
    setLoading(true);
    fetch(`/api/pitches?${params}`)
      .then((r) => r.json())
      .then((data) => { setPitches(Array.isArray(data) ? data : []); setLoading(false); });
  }, [q, sector, stage]);

  return (
    <div className="container" style={{ padding: "40px 24px 80px" }}>
      <h1 style={{ fontWeight: 600, fontSize: 30 }}>The ledger</h1>
      <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 24 }}>
        {loading ? "Loading…" : `${pitches.length} pitches open for review`}
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or tagline" style={{ flex: 1, minWidth: 220 }} />
        <select className="input" style={{ width: "auto" }} value={sector} onChange={(e) => setSector(e.target.value)}>
          <option>All</option>
          {SECTORS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input" style={{ width: "auto" }} value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="All">All</option>
          {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
        </select>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "20px 1.6fr 100px 110px 120px 90px", gap: 16, padding: "12px 20px", background: "#FAFBFC", borderBottom: "1px solid #E7EAEE", fontSize: 11.5, fontWeight: 700, color: "var(--muted-2)", letterSpacing: 0.5 }}>
          <div /><div>PITCH</div><div>SECTOR</div><div>STAGE</div><div>ASK</div><div>STATUS</div>
        </div>
        {!loading && pitches.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted-2)", fontSize: 14 }}>No pitches match these filters yet.</div>
        )}
        {pitches.map((p) => {
          const sm = statusMeta[p.status];
          return (
            <a key={p.id} href={`/pitches/${p.id}`}
              style={{ display: "grid", gridTemplateColumns: "20px 1.6fr 100px 110px 120px 90px", alignItems: "center", gap: 16, padding: "18px 20px", borderBottom: "1px solid #E7EAEE" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: sm.color, justifySelf: "center" }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 17, fontFamily: "Fraunces, serif" }}>{p.title}</div>
                <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 2 }}>{p.tagline}</div>
              </div>
              <span className="pill" style={{ background: "#EEF0F3", color: "#3A4150" }}>{p.sector}</span>
              <span style={{ fontSize: 13.5, color: "#3A4150" }}>{STAGE_LABEL[p.stage]}</span>
              <span style={{ fontWeight: 600, fontSize: 15.5, color: "var(--accent)", fontFamily: "Fraunces, serif" }}>{fmtMoney(p.fundingAsk)}</span>
              <span className="pill" style={{ color: sm.color, background: sm.bg }}>{sm.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

module.exports.default = Browse;
