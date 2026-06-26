import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CARDS = [
  {
    key:"docs", label:"Total Documents", color:"var(--primary)", bg:"var(--primary-dim)", border:"var(--border)",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  {
    key:"chunks", label:"Indexed Chunks", color:"var(--accent-light)", bg:"var(--accent-dim)", border:"rgba(155,44,44,0.22)",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  {
    key:"questions", label:"Questions Asked", color:"var(--success)", bg:"rgba(46,125,50,0.1)", border:"rgba(46,125,50,0.2)",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    key:"status", label:"AI Status", color:"var(--success)", bg:"rgba(46,125,50,0.1)", border:"rgba(46,125,50,0.2)",
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
];

function StatCard({ label, value, color, bg, border, icon, loading, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity:0, y:16 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:.4, delay }}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        background:"var(--card)",
        backdropFilter:"blur(14px)",
        WebkitBackdropFilter:"blur(14px)",
        border:`1px solid ${hov ? border : "var(--border)"}`,
        borderRadius:14,
        padding:"20px 20px 18px",
        display:"flex", flexDirection:"column", gap:14,
        transition:"all .22s",
        boxShadow: hov ? `0 8px 28px ${color}22, 0 2px 8px rgba(0,0,0,0.08)` : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hov ? "translateY(-2px)" : "none",
        cursor:"default",
        position:"relative", overflow:"hidden",
      }}
    >
      {/* Subtle top accent line */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:2,
        background: hov ? `linear-gradient(90deg,transparent,${color},transparent)` : "transparent",
        transition:"background .3s",
        borderRadius:"14px 14px 0 0",
      }}/>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:11.5, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em" }}>{label}</span>
        <div style={{ width:34, height:34, borderRadius:9, background:bg, border:`1px solid ${border}`, display:"flex", alignItems:"center", justifyContent:"center", color, transition:"transform .2s", transform:hov?"scale(1.08)":"scale(1)" }}>
          {icon}
        </div>
      </div>

      {loading
        ? <div className="skeleton" style={{ height:26, width:"55%", borderRadius:6 }}/>
        : <motion.span
            key={String(value)}
            initial={{ opacity:0, y:6 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:.25 }}
            style={{ fontSize:26, fontWeight:800, color:"var(--text)", letterSpacing:"-.03em", lineHeight:1 }}
          >
            {value}
          </motion.span>
      }
    </motion.div>
  );
}

export default function Stats({ questionCount, aiStatus }) {
  const [docs,   setDocs]   = useState(null);
  const [chunks, setChunks] = useState(null);
  const [loading,setLoading]= useState(true);

  useEffect(()=>{
    Promise.all([
      axios.get("http://localhost:5000/documents"),
      axios.get("http://localhost:5000/vectors"),
    ]).then(([d,v])=>{ setDocs(d.data.length); setChunks(v.data.length); })
      .catch(()=>{ setDocs(0); setChunks(0); })
      .finally(()=>setLoading(false));
  },[]);

  const statusOnline = aiStatus === "online";
  const statusChecking = aiStatus === "checking";

  const statusLabel = statusChecking ? "Checking…" : statusOnline ? "Online" : "Offline";
  const statusColor = statusChecking ? "var(--muted)" : statusOnline ? "var(--success)" : "var(--danger)";
  const statusBg = statusChecking ? "var(--primary-dim)" : statusOnline ? "rgba(46,125,50,0.12)" : "rgba(211,47,47,0.12)";
  const statusBorder = statusChecking ? "var(--border)" : statusOnline ? "rgba(46,125,50,0.25)" : "rgba(211,47,47,0.25)";

  const vals = { docs:docs??"—", chunks:chunks??"—", questions:questionCount??0, status:statusLabel };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
      {CARDS.map(({key, ...c}, i)=>{
        let cardColor = c.color;
        let cardBg = c.bg;
        let cardBorder = c.border;
        if (key === "status") {
          cardColor = statusColor;
          cardBg = statusBg;
          cardBorder = statusBorder;
        }
        return (
          <StatCard
            key={key}
            {...c}
            color={cardColor}
            bg={cardBg}
            border={cardBorder}
            value={vals[key]}
            loading={key!=="status"&&key!=="questions"&&loading}
            delay={i*0.07}
          />
        );
      })}
    </div>
  );
}
