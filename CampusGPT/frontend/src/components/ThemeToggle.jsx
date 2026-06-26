import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EVT = "cgpt:theme";

export function applyTheme(dark) {
  const r = document.documentElement;
  r.setAttribute("data-theme", dark ? "dark" : "light");
  dark ? r.classList.add("dark") : r.classList.remove("dark");
  localStorage.setItem("theme", dark ? "dark" : "light");
}

export function getInitialDark() {
  if (typeof window === "undefined") return true;
  const s = localStorage.getItem("theme");
  return s ? s === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle({ onLight = false }) {
  const [dark, setDark] = useState(getInitialDark);

  // Stay synced if another toggle changes theme
  useEffect(() => {
    const h = (e) => setDark(e.detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    applyTheme(next);
    window.dispatchEvent(new CustomEvent(EVT, { detail: next }));
  };

  const border = onLight ? "1px solid var(--border, #E2E8F0)"       : "1px solid rgba(255,255,255,0.2)";
  const bg     = onLight ? "var(--card, #fff)"                      : "rgba(255,255,255,0.1)";
  const color  = onLight ? "var(--muted, #64748B)"                  : "rgba(255,255,255,0.75)";
  const bgHov  = onLight ? "var(--card-hover, #F1F5F9)"             : "rgba(255,255,255,0.18)";
  const colHov = onLight ? "var(--text, #0F172A)"                   : "#fff";

  return (
    <motion.button
      onClick={toggle}
      aria-label={dark ? "Switch to light" : "Switch to dark"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
      style={{
        width:32, height:32,
        display:"flex", alignItems:"center", justifyContent:"center",
        borderRadius:8, border, background:bg, color,
        cursor:"pointer", flexShrink:0, outline:"none",
        transition:"background .15s, color .15s, border .15s",
      }}
      onMouseEnter={e=>{ e.currentTarget.style.background=bgHov; e.currentTarget.style.color=colHov; }}
      onMouseLeave={e=>{ e.currentTarget.style.background=bg;    e.currentTarget.style.color=color;  }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {dark ? (
          <motion.span key="sun"
            initial={{opacity:0,rotate:-50,scale:0.6}} animate={{opacity:1,rotate:0,scale:1}} exit={{opacity:0,rotate:50,scale:0.6}}
            transition={{duration:0.18}} style={{display:"flex",alignItems:"center"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </motion.span>
        ) : (
          <motion.span key="moon"
            initial={{opacity:0,rotate:50,scale:0.6}} animate={{opacity:1,rotate:0,scale:1}} exit={{opacity:0,rotate:-50,scale:0.6}}
            transition={{duration:0.18}} style={{display:"flex",alignItems:"center"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
