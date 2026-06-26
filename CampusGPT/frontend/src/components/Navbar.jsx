import ThemeToggle from "./ThemeToggle";

export default function Navbar({ user, onLogout }) {
  const initials = user?.name
    ? user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()
    : "U";

  return (
    <header style={{
      height:"var(--navbar-h)",
      background:"var(--surface)",
      backdropFilter:"blur(16px)",
      WebkitBackdropFilter:"blur(16px)",
      borderBottom:"1px solid var(--border)",
      display:"flex", alignItems:"center",
      padding:"0 20px", gap:12, flexShrink:0,
      position:"sticky", top:0, zIndex:100,
    }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
        <div style={{
          width:30, height:30,
          background:"linear-gradient(135deg,#1E40AF,#06B6D4)",
          borderRadius:8,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 2px 8px rgba(30,64,175,.35)",
          flexShrink:0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 3L2 7l10 4 10-4-10-4z"/><path d="M2 17l10 4 10-4"/><path d="M2 12l10 4 10-4"/>
          </svg>
        </div>
        <span style={{ fontWeight:700, fontSize:14.5, letterSpacing:"-.02em", color:"var(--text)" }}>CampusGPT</span>
      </div>

      <div style={{ flex:1 }}/>

      {/* Status */}
      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 11px", borderRadius:7, background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.2)", fontSize:12, color:"#10B981", fontWeight:600 }}>
        <span className="pulse-dot"/>
        AI Online
      </div>

      {/* Theme toggle — onLight because navbar uses CSS var surface */}
      <ThemeToggle onLight/>

      {/* Avatar */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 8px", borderRadius:8, background:"var(--card)", border:"1px solid var(--border)" }}>
        <div style={{ width:26, height:26, background:"linear-gradient(135deg,#1E40AF,#06B6D4)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10.5, fontWeight:800, color:"#fff", flexShrink:0 }}>
          {initials}
        </div>
        <span style={{ fontSize:13, fontWeight:600, color:"var(--text)", maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {user?.name}
        </span>
      </div>

      <button onClick={onLogout}
        style={{ padding:"6px 13px", borderRadius:7, border:"1px solid var(--border)", background:"transparent", color:"var(--muted)", fontSize:12, fontWeight:500, cursor:"pointer", transition:"all .15s", fontFamily:"inherit" }}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,.07)";e.currentTarget.style.color="#EF4444";e.currentTarget.style.borderColor="rgba(239,68,68,.3)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--muted)";e.currentTarget.style.borderColor="var(--border)";}}>
        Sign out
      </button>
    </header>
  );
}
