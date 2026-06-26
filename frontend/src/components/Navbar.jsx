import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import axios from "axios";

// Poll /health every 30s to show real AI status
export function useAIStatus() {
  const [status, setStatus] = useState("checking"); // "checking" | "online" | "offline"

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await axios.get("http://localhost:5000/health", { timeout: 6000 });
        if (!cancelled) setStatus(res.data.online ? "online" : "offline");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    };

    check(); // immediate first check
    const interval = setInterval(check, 30000); // re-check every 30s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return status;
}

export default function Navbar({ user, onLogout, aiStatus }) {
  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const localStatus = useAIStatus();
  const currentStatus = aiStatus || localStatus;

  const statusConfig = {
    checking: {
      bg: "rgba(100,100,120,.10)",
      border: "rgba(100,100,120,.22)",
      color: "var(--muted)",
      dot: "var(--muted-dim)",
      label: "Checking…",
      pulse: false,
    },
    online: {
      bg: "rgba(22,101,52,.12)",
      border: "rgba(22,101,52,.25)",
      color: "#16A34A",
      dot: "#16A34A",
      label: "AI Online",
      pulse: true,
    },
    offline: {
      bg: "rgba(185,28,28,.10)",
      border: "rgba(185,28,28,.22)",
      color: "#DC2626",
      dot: "#DC2626",
      label: "AI Offline",
      pulse: false,
    },
  };

  const s = statusConfig[currentStatus];

  return (
    <header style={{
      height: "var(--navbar-h)",
      background: "var(--surface)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
      padding: "0 20px", gap: 12, flexShrink: 0,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{
          width: 30, height: 30,
          background: "linear-gradient(135deg,var(--primary),var(--accent))",
          borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,.3)",
          flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 3L2 7l10 4 10-4-10-4z"/><path d="M2 17l10 4 10-4"/><path d="M2 12l10 4 10-4"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: "-.02em", color: "var(--text)" }}>CampusGPT</span>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Real AI Status — updates every 30s */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "4px 11px", borderRadius: 7,
        background: s.bg, border: `1px solid ${s.border}`,
        fontSize: 12, color: s.color, fontWeight: 600,
        transition: "all .3s",
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: s.dot, display: "inline-block", flexShrink: 0,
          animation: s.pulse ? "pulseRing 1.6s ease-in-out infinite" : "none",
        }}/>
        {s.label}
      </div>

      {/* Theme toggle */}
      <ThemeToggle onLight/>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)" }}>
        <div style={{
          width: 26, height: 26,
          background: "linear-gradient(135deg,var(--primary),var(--accent))",
          borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10.5, fontWeight: 800, color: "#fff", flexShrink: 0,
        }}>
          {initials}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.name}
        </span>
      </div>

      <button onClick={onLogout}
        style={{ padding: "6px 13px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all .15s", fontFamily: "inherit" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(185,28,28,.08)"; e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.borderColor = "rgba(185,28,28,.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
        Sign out
      </button>
    </header>
  );
}
