"use client";

const { useRouter, usePathname } = require("next/navigation");

function NavBar({ user }) {
  const router = useRouter();
  const pathname = usePathname();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const tabs = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse pitches" },
    ...(user?.role === "FOUNDER" ? [{ href: "/post", label: "Post a pitch" }] : []),
    ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Moderation queue" }] : []),
  ];

  return (
    <div style={{ borderBottom: "1px solid var(--line)", background: "#FFFFFFCC", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 20 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20 }}>
            <div style={{ width: 22, height: 22, borderRadius: 4, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 8, height: 8, background: "var(--accent)", borderRadius: 2 }} />
            </div>
            Foundry&nbsp;Row
          </a>
          <div style={{ display: "flex", gap: 22 }}>
            {tabs.map((t) => (
              <a key={t.href} href={t.href}
                style={{
                  fontSize: 14.5, fontWeight: 500,
                  color: pathname === t.href ? "var(--ink)" : "var(--muted)",
                  padding: "6px 0", borderBottom: pathname === t.href ? "2px solid var(--accent)" : "2px solid transparent",
                }}>
                {t.label}
              </a>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user ? (
            <>
              <span style={{ fontSize: 13.5, color: "var(--muted)" }}>{user.name} · <span style={{ textTransform: "capitalize" }}>{user.role.toLowerCase()}</span></span>
              <button onClick={logout} className="btn-secondary" style={{ padding: "8px 14px", fontSize: 13.5 }}>Log out</button>
            </>
          ) : (
            <>
              <a href="/login" className="btn-secondary" style={{ padding: "8px 14px", fontSize: 13.5 }}>Log in</a>
              <a href="/signup" className="btn-primary" style={{ padding: "8px 14px", fontSize: 13.5 }}>Sign up</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

module.exports.default = NavBar;
