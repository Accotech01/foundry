"use client";
const { useState } = require("react");
const { useRouter } = require("next/navigation");

function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "FOUNDER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signup", { method: "POST", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Something went wrong."); return; }
    router.push(form.role === "FOUNDER" ? "/post" : "/browse");
    router.refresh();
  };

  return (
    <div className="container" style={{ maxWidth: 440, padding: "60px 24px" }}>
      <h1 style={{ fontWeight: 600, fontSize: 28 }}>Create your account</h1>
      <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 24 }}>Tell us who you are — this decides what you can do on Foundry Row.</p>

      <form onSubmit={submit}>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {["FOUNDER", "INVESTOR"].map((r) => (
            <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8, border: form.role === r ? "2px solid var(--ink)" : "1px solid var(--line)",
                background: form.role === r ? "#0B1F3A0D" : "#fff", fontWeight: 600, fontSize: 13.5, textTransform: "capitalize",
              }}>
              {r === "FOUNDER" ? "I'm a founder" : "I'm an investor"}
            </button>
          ))}
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Full name</label>
        <input className="input" value={form.name} onChange={set("name")} required style={{ marginBottom: 16 }} />

        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Email</label>
        <input className="input" type="email" value={form.email} onChange={set("email")} required style={{ marginBottom: 16 }} />

        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Password</label>
        <input className="input" type="password" value={form.password} onChange={set("password")} required minLength={8} style={{ marginBottom: 8 }} />

        {error && <div className="error-text">{error}</div>}

        <button className="btn-primary" disabled={loading} style={{ marginTop: 16, width: "100%", justifyContent: "center" }}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 16 }}>
        Already have an account? <a href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Log in</a>
      </p>
    </div>
  );
}

module.exports.default = Signup;
