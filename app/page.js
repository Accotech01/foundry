function Landing() {
  return (
    <div>
      <div className="container" style={{ padding: "84px 24px 56px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 50, alignItems: "center" }}>
        <div>
          <span className="pill" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>Deal flow, on the record</span>
          <h1 style={{ fontWeight: 600, fontSize: 52, lineHeight: 1.08, margin: "18px 0 20px" }}>
            Where founders open the books, and investors read between the lines.
          </h1>
          <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.6, maxWidth: 480 }}>
            Post a structured pitch with real metrics. Browse a transparent ledger of asks, stages, and traction.
            Express interest, and let the conversation start from there.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
            <a href="/signup" className="btn-primary">Post your pitch →</a>
            <a href="/browse" className="btn-secondary">Browse pitches</a>
          </div>
        </div>
        <div style={{ background: "var(--ink)", borderRadius: 14, padding: 26, color: "#fff" }}>
          <div style={{ fontSize: 12, color: "#9FB3CC", marginBottom: 14, letterSpacing: 0.5 }}>LIVE LEDGER — TODAY</div>
          <div style={{ fontSize: 14, color: "#9FB3CC" }}>Browse the current ledger to see real, live listings once you're signed in.</div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #E7EAEE", background: "#FAFBFC" }}>
        <div className="container" style={{ padding: "56px 24px" }}>
          <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700, letterSpacing: 1 }}>HOW IT WORKS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28, marginTop: 18 }}>
            {[
              ["Founders post", "A structured listing: ask, stage, sector, and real metrics — not a pitch deck PDF nobody opens."],
              ["Investors browse", "Filter the ledger by sector, stage, and check size. Read the numbers before you read the story."],
              ["Interest, then introduction", "Express interest with a short note. Contact details unlock only once a founder accepts."],
            ].map(([title, body], i) => (
              <div key={i} className="card" style={{ padding: 22 }}>
                <div style={{ fontWeight: 600, fontSize: 17, margin: "4px 0 6px" }}>{title}</div>
                <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

module.exports.default = Landing;
