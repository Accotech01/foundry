"use client";
const { useState } = require("react");
const { useRouter } = require("next/navigation");

const SECTORS = ["AgTech", "Fintech", "HealthTech", "CleanTech", "FoodTech"];
const STAGES = [["IDEA", "Idea"], ["MVP", "MVP"], ["SEED", "Seed"], ["SERIES_A", "Series A"]];

function PostPitch() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", tagline: "", sector: SECTORS[0], stage: "IDEA", fundingAsk: "", equityPct: "", location: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/pitches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Something went wrong."); return; }
    router.push("/dashboard?submitted=1");
  };

  const inputWrap = (label, child) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
      {child}
    </div>
  );

  return (
    <div className="container" style={{ maxWidth: 680, padding: "40px 24px 80px" }}>
      <h1 style={{ fontWeight: 600, fontSize: 30 }}>Post a pitch</h1>
      <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 28 }}>
        Lead with real numbers. Investors filter by sector and stage first — make sure those are accurate.
      </p>

      <form onSubmit={submit}>
        {inputWrap("Company name", <input className="input" value={form.title} onChange={set("title")} required placeholder="e.g. Verdant Labs" />)}
        {inputWrap("One-line tagline", <input className="input" value={form.tagline} onChange={set("tagline")} required placeholder="What you do, in one sentence" />)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {inputWrap("Sector", <select className="input" value={form.sector} onChange={set("sector")}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select>)}
          {inputWrap("Stage", <select className="input" value={form.stage} onChange={set("stage")}>{STAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {inputWrap("Funding ask (USD)", <input className="input" type="number" value={form.fundingAsk} onChange={set("fundingAsk")} required placeholder="250000" />)}
          {inputWrap("Equity offered (%)", <input className="input" type="number" value={form.equityPct} onChange={set("equityPct")} placeholder="10" />)}
        </div>
        {inputWrap("Location", <input className="input" value={form.location} onChange={set("location")} placeholder="City, country" />)}
        {inputWrap("Full description", <textarea className="input" style={{ minHeight: 110, resize: "vertical" }} value={form.description} onChange={set("description")} required placeholder="Traction, team, what the raise funds, and why now." />)}

        {error && <div className="error-text">{error}</div>}
        <button className="btn-primary" disabled={loading}>{loading ? "Publishing…" : "Publish pitch →"}</button>
      </form>
    </div>
  );
}

module.exports.default = PostPitch;
