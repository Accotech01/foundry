"use client";
const { useState } = require("react");
const { useRouter } = require("next/navigation");

function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Something went wrong."); return; }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="container" style={{ maxWidth: 420, padding: "60px 24px" }}>
      <h1 style={{ fontWeight: 600, fontSize: 28 }}>Log in</h1>
      <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 24 }}>Welcome back to the ledger.</p>

      <form onSubmit={submit}>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Email</label>
        <input className="input" type="email" value={form.email} onChange={set("email")} required style={{ marginBottom: 16 }} />

        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Password</label>
        <input className="input" type="password" value={form.password} onChange={set("password")} required style={{ marginBottom: 8 }} />

        {error && <div className="error-text">{error}</div>}

        <button className="btn-primary" disabled={loading} style={{ marginTop: 16, width: "100%", justifyContent: "center" }}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 16 }}>
        New here? <a href="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>Create an account</a>
      </p>
      <p style={{ fontSize: 12.5, color: "var(--muted-2)", marginTop: 24 }}>
        Demo accounts (after seeding): amara@verdantlabs.dev / mariam@heliosvc.com — password "password123"
      </p>
    </div>
  );
}

module.exports.default = Login;
