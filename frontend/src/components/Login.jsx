import { useState, useId, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle, { getInitialDark } from "./ThemeToggle";
import BackgroundAnimation from "./BackgroundAnimation";

function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
}

/* Theme-aware C — rebuilds on every render after theme toggle */
const getC = () => {
  if (typeof document === "undefined") return getDarkC();
  const dark = document.documentElement.getAttribute("data-theme") !== "light";
  return dark ? getDarkC() : getLightC();
};

const getDarkC = () => ({
  primary:"#e8c547", accent:"#ff7b94", success:"#2e7d32",
  bg:"#1d0a0d", text:"#faedf0", muted:"#c5abb1",
  border:"rgba(232, 197, 71, 0.25)", card:"rgba(54, 20, 25, 0.96)",
  inputBg:"rgba(41, 15, 19, 0.7)", danger:"#d32f2f",
});

const getLightC = () => ({
  primary:"#962430", accent:"#bd532b", success:"#2e7d32",
  bg:"#faf5f6", text:"#2e1014", muted:"#8f7478",
  border:"rgba(150, 36, 48, 0.16)", card:"rgba(244, 235, 236, 0.92)",
  inputBg:"rgba(250, 245, 246, 0.6)", danger:"#b71c1c",
});

/* Module-level C for sub-components (they re-render when Login re-renders) */
let C = getC();

/* ── Icons ─────────────────────────────────────────────────────── */
const Ic = {
  mail:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  lock:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  user:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  eye:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  alert:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  google:(
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  shield:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  arrow:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  check:<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

function Spinner(){return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{animation:"_ls .7s linear infinite",flexShrink:0}}><style>{`@keyframes _ls{to{transform:rotate(360deg)}}`}</style><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3"/><path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;}

/* ── Floating label field ──────────────────────────────────────── */
function Field({id,name,label,type="text",value,onChange,error,autoComplete,icon,rightSlot,disabled}){
  const [foc,setFoc]=useState(false);
  const lifted=foc||(value && value.length>0);
  const bc=error?C.danger:foc?C.accent:C.border;
  const sh=error?"0 0 0 3px rgba(239,68,68,.1)":foc?"0 0 0 3px rgba(6,182,212,.12)":"none";
  const ic=error?C.danger:foc?C.accent:"#94A3B8";
  const lc=error?C.danger:foc&&lifted?C.accent:lifted?C.muted:"#94A3B8";
  return(
    <div style={{position:"relative"}}>
      <div style={{position:"relative",display:"flex",alignItems:"center",border:`1.5px solid ${bc}`,borderRadius:9,background:error?"rgba(239,68,68,.03)":C.inputBg,boxShadow:sh,transition:"border-color .15s,box-shadow .15s"}}>
        <div style={{position:"absolute",left:13,color:ic,pointerEvents:"none",transition:"color .15s",display:"flex"}}>{icon}</div>
        <input id={id} name={name || id} type={type} value={value || ""} onChange={onChange} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
          autoComplete={autoComplete} disabled={disabled} placeholder=" "
          style={{width:"100%",height:54,paddingLeft:40,paddingRight:rightSlot?44:14,paddingTop:lifted?14:0,paddingBottom:lifted?2:0,border:"none",outline:"none",background:"transparent",fontSize:13.5,fontWeight:500,color:C.text,fontFamily:"inherit",opacity:disabled?.5:1}}/>
        <label htmlFor={id} style={{position:"absolute",left:40,top:lifted?8:"50%",transform:lifted?"none":"translateY(-50%)",fontSize:lifted?10:13.5,fontWeight:lifted?600:400,letterSpacing:lifted?".04em":"normal",textTransform:lifted?"uppercase":"none",color:lc,pointerEvents:"none",transition:"all .15s",userSelect:"none"}}>{label}</label>
        {rightSlot&&<div style={{position:"absolute",right:12,display:"flex",alignItems:"center"}}>{rightSlot}</div>}
      </div>
      <AnimatePresence>
        {error&&<motion.div initial={{opacity:0,y:-4,height:0}} animate={{opacity:1,y:0,height:"auto"}} exit={{opacity:0,y:-4,height:0}} transition={{duration:.15}} style={{display:"flex",alignItems:"flex-start",gap:5,marginTop:6}}>{Ic.alert}<span style={{fontSize:12,fontWeight:500,color:C.danger}}>{error}</span></motion.div>}
      </AnimatePresence>
    </div>
  );
}

/* ── Checkbox ──────────────────────────────────────────────────── */
function CB({checked,onChange,label}){
  return(
    <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none"}}>
      <div onClick={()=>onChange(!checked)} style={{width:16,height:16,border:`1.5px solid ${checked?C.primary:C.border}`,borderRadius:4,background:checked?C.primary:C.card,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"all .15s"}}>
        <AnimatePresence>{checked&&<motion.span key="c" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} transition={{duration:.1}}>{Ic.check}</motion.span>}</AnimatePresence>
      </div>
      <span style={{fontSize:13,color:C.muted}}>{label}</span>
    </label>
  );
}

/* ── Bullet ────────────────────────────────────────────────────── */
function Bullet({text}){
  return(
    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
      <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(245,158,11,.12)",border:"1px solid rgba(245,158,11,.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
        <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <span style={{fontSize:13,color:"rgba(255,255,255,.68)",lineHeight:1.5}}>{text}</span>
    </div>
  );
}

/* ── Google account picker modal ────────────────────────────────── */
function GooglePicker({onSelect,onClose}){
  const [accounts, setAccounts] = useState(() => {
    const defaults = [
      {name:"Alex Carter",   email:"alex@campus.edu",    avatar:"AC", color:"#e05a47"},
      {name:"Jamie Patel",   email:"jamie@gmail.com",    avatar:"JP", color:"#d48c3b"},
      {name:"Morgan Singh",  email:"morgan@outlook.com", avatar:"MS", color:"#8c52ff"},
    ];
    try {
      const saved = localStorage.getItem("cgpt:accounts");
      return saved ? JSON.parse(saved) : defaults;
    } catch {
      return defaults;
    }
  });

  const addAccount = () => {
    const customEmail = window.prompt("Enter your Google Account email:");
    if (customEmail) {
      const trimmed = customEmail.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        window.alert("Please enter a valid email address.");
        return;
      }
      if (accounts.some(acc => acc.email.toLowerCase() === trimmed.toLowerCase())) {
        window.alert("This account is already in your list.");
        return;
      }
      const customName = trimmed.split("@")[0].split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const newAcc = {
        name: customName || "Google User",
        email: trimmed,
        avatar: (customName ? customName.split(" ").map(w=>w[0]).join("") : "GU").slice(0, 2).toUpperCase(),
        color: ["#e05a47", "#d48c3b", "#8c52ff", "#10b981", "#3b82f6"][accounts.length % 5]
      };
      const updated = [...accounts, newAcc];
      setAccounts(updated);
      try {
        localStorage.setItem("cgpt:accounts", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      onSelect(newAcc);
    }
  };

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={onClose}>
      <motion.div initial={{scale:.9,opacity:0,y:10}} animate={{scale:1,opacity:1,y:0}} exit={{scale:.9,opacity:0,y:10}}
        transition={{type:"spring",stiffness:320,damping:24}}
        onClick={e=>e.stopPropagation()}
        style={{background:"var(--card, #fff)",border:"1px solid var(--border)",borderRadius:16,width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,.25)",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"22px 24px 16px",borderBottom:"1px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            {Ic.google}
            <span style={{fontSize:15,fontWeight:700,color:"var(--text)"}}>Sign in with Google</span>
          </div>
          <p style={{fontSize:12.5,color:"var(--muted)"}}>Choose an account to continue to CampusGPT</p>
        </div>
        {/* Accounts */}
        <div style={{padding:"8px 0", maxHeight:"220px", overflowY:"auto"}}>
          {accounts.map((a,i)=>(
            <motion.button key={i} onClick={()=>onSelect(a)}
              whileHover={{background:"var(--card-hover)"}}
              style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 24px",border:"none",background:"transparent",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"background .12s"}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:a.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>{a.avatar}</div>
              <div>
                <p style={{fontSize:13.5,fontWeight:600,color:"var(--text)",marginBottom:2}}>{a.name}</p>
                <p style={{fontSize:12,color:"var(--muted)"}}>{a.email}</p>
              </div>
            </motion.button>
          ))}
        </div>
        
        {/* Add Account button */}
        <div style={{ borderTop:"1px solid var(--border)", padding:"4px 0" }}>
          <motion.button onClick={addAccount}
            whileHover={{background:"var(--card-hover)"}}
            style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 24px",border:"none",background:"transparent",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"background .12s"}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:"var(--card)",border:"1.5px dashed var(--border)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <p style={{fontSize:13.5,fontWeight:500,color:"var(--muted)"}}>Use another account</p>
          </motion.button>
        </div>

        {/* Footer */}
        <div style={{padding:"12px 24px 16px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8}}>
          <button onClick={onClose}
            style={{padding:"7px 16px",borderRadius:7,border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── PrimaryBtn ────────────────────────────────────────────────── */
function PrimaryBtn({type="button",onClick,loading,children}){
  return(
    <motion.button type={type} onClick={onClick} disabled={loading}
      whileHover={!loading?{scale:1.015,y:-1}:{}} whileTap={!loading?{scale:.985}:{}}
      transition={{type:"spring",stiffness:400,damping:25}}
      style={{width:"100%",height:44,background:"linear-gradient(135deg,var(--primary),var(--accent))",color:"#fff",border:"none",borderRadius:9,fontSize:13.5,fontWeight:700,cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 2px 12px var(--primary-glow)",fontFamily:"inherit",marginTop:4}}>
      {loading?<><Spinner/><span>Please wait…</span></>:children}
    </motion.button>
  );
}

/* ── Left brand panel ──────────────────────────────────────────── */
function LeftPanel(){
  const feats=["RAG-powered answers from your own documents","Instant semantic search across all uploads","Gemini 2.5 Flash — fast, accurate, private","MongoDB Atlas vector store, enterprise-ready"];
  return(
    <div style={{display:"flex",flexDirection:"column",justifyContent:"space-between",height:"100%",padding:"36px 40px",boxSizing:"border-box",position:"relative",zIndex:2}}>
      {/* Logo row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,var(--primary),var(--accent))",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 22px var(--primary-glow)"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M12 3L2 7l10 4 10-4-10-4z"/><path d="M2 17l10 4 10-4"/><path d="M2 12l10 4 10-4"/></svg>
          </div>
          <span style={{color:"#fff",fontWeight:700,fontSize:15.5,letterSpacing:"-.01em"}}>CampusGPT</span>
          <span style={{fontSize:9.5,fontWeight:700,color:"#F59E0B",textTransform:"uppercase",letterSpacing:".08em",border:"1px solid rgba(245,158,11,.4)",borderRadius:4,padding:"2px 6px"}}>Beta</span>
        </div>
        {/* ThemeToggle on dark bg */}
        <ThemeToggle onLight={false}/>
      </div>

      {/* Headline */}
      <div>
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.55,delay:.1}}
          style={{fontSize:32,fontWeight:900,color:"#fff",lineHeight:1.2,letterSpacing:"-.028em",marginBottom:14}}>
          Your documents,{" "}<span style={{background:"linear-gradient(90deg,var(--primary),var(--text))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>answered instantly.</span>
        </motion.h1>
        <motion.p initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.5,delay:.2}}
          style={{fontSize:13.5,color:"rgba(255,255,255,.58)",lineHeight:1.65,maxWidth:310,marginBottom:26}}>
          Upload any PDF. Ask anything. Get precise, sourced answers powered by Gemini AI.
        </motion.p>
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.5,delay:.28}}
          style={{display:"flex",flexDirection:"column",gap:11}}>
          {feats.map((f,i)=><Bullet key={i} text={f}/>)}
        </motion.div>
        <div style={{marginTop:28,paddingTop:20,borderTop:"1px solid rgba(255,255,255,.08)"}}>
          <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"rgba(255,255,255,.28)",marginBottom:10}}>Trusted at</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px 20px"}}>
            {["MIT","Stanford","Harvard","Berkeley","Carnegie Mellon"].map(n=>(
              <span key={n} style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.25)"}}>{n}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div style={{borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:20}}>
        <p style={{fontSize:13,color:"rgba(255,255,255,.5)",fontStyle:"italic",lineHeight:1.6,marginBottom:12}}>
          "CampusGPT cut my study time in half — I can query entire textbooks in seconds."
        </p>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,var(--primary),var(--accent))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>A</div>
          <div>
            <div style={{fontSize:12.5,fontWeight:700,color:"#fff"}}>Alex Carter</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.38)"}}>CS PhD · Stanford University</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Validation ────────────────────────────────────────────────── */
const vLogin=(e,p)=>{
  const r={};
  if(!e) r.email="Email is required.";
  else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) r.email="Enter a valid email.";
  if(!p) r.password="Password is required.";
  else if(p.length<8) r.password="Must be at least 8 characters.";
  return r;
};
const vSignup=(n,e,p,c)=>{
  const r=vLogin(e,p);
  if(!n||n.trim().length<2) r.name="Full name required.";
  if(!c) r.confirm="Please confirm your password.";
  else if(c!==p) r.confirm="Passwords do not match.";
  return r;
};

/* ── Sign In Form ──────────────────────────────────────────────── */
function SignIn({onLogin,toSignup}){
  const ei=useId(),pi=useId();
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [rem,setRem]=useState(false);
  const [err,setErr]=useState({});
  const [loading,setLoading]=useState(false);
  const [sErr,setSErr]=useState("");
  const ce=f=>setErr(p=>({...p,[f]:""}));
  const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    /* global google */
    if (!clientID) return;
    const initGsi = () => {
      if (typeof google !== "undefined" && document.getElementById("google-signin-btn")) {
        google.accounts.id.initialize({
          client_id: clientID,
          callback: async (response) => {
            setLoading(true);
            try {
              const payload = decodeJwt(response.credential);
              if (payload && payload.email) {
                const res = await axios.post("http://localhost:5000/auth/google-mock", { name: payload.name, email: payload.email });
                onLogin(res.data);
              }
            } catch (err) {
              console.error("Google login error:", err);
              setSErr("Google authentication failed.");
            } finally {
              setLoading(false);
            }
          }
        });
        google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          {
            theme: document.documentElement.getAttribute("data-theme") === "light" ? "outline" : "filled_black",
            size: "large",
            width: 336,
            text: "continue_with",
            shape: "rectangular"
          }
        );
      }
    };

    initGsi();
    const t = setTimeout(initGsi, 1000);
    return () => clearTimeout(t);
  }, [onLogin, clientID]);

  const submit=async e=>{
    e.preventDefault(); setSErr("");
    const errs=vLogin(email,pw); setErr(errs);
    if(Object.keys(errs).length) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/auth/login", { email, password: pw });
      onLogin(res.data);
    } catch(err) {
      console.error("Sign in failed:", err);
      setSErr(err.response?.data?.error || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return(
    <>
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:20,fontWeight:800,color:C.text,letterSpacing:"-.025em",marginBottom:4}}>Welcome back</h2>
        <p style={{fontSize:13.5,color:C.muted}}>Sign in to your CampusGPT workspace</p>
      </div>
      <AnimatePresence>
        {sErr&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:.18}} style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:9,padding:"10px 13px",borderRadius:8,background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.2)"}}>
            {Ic.alert}<span style={{fontSize:12.5,color:C.danger}}>{sErr}</span>
          </div>
        </motion.div>}
      </AnimatePresence>
      <form onSubmit={submit} noValidate style={{display:"flex",flexDirection:"column",gap:14}}>
        <Field id={ei} name="email" label="Email address" type="email" value={email} onChange={e=>{setEmail(e.target.value);ce("email");setSErr("");}} error={err.email} autoComplete="email" icon={Ic.mail} disabled={loading}/>
        <Field id={pi} name="password" label="Password" type={showPw?"text":"password"} value={pw} onChange={e=>{setPw(e.target.value);ce("password");setSErr("");}} error={err.password} autoComplete="current-password" icon={Ic.lock} disabled={loading}
          rightSlot={<button type="button" tabIndex={-1} onClick={()=>setShowPw(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",padding:4,display:"flex",alignItems:"center"}}>{showPw?Ic.eyeOff:Ic.eye}</button>}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:2}}>
          <CB checked={rem} onChange={setRem} label="Remember me"/>
          <a href="#" onClick={e=>e.preventDefault()} style={{fontSize:13,fontWeight:600,color:C.primary,textDecoration:"none"}}>Forgot password?</a>
        </div>
        <PrimaryBtn type="submit" loading={loading}><span>Sign in</span>{Ic.arrow}</PrimaryBtn>
      </form>
      <div style={{display:"flex",alignItems:"center",gap:12,margin:"18px 0"}}>
        <div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:12,color:"#94A3B8"}}>or</span><div style={{flex:1,height:1,background:C.border}}/>
      </div>
      <div style={{ display:"flex", justifyContent:"center", width:"100%" }}>
        {clientID ? (
          <div id="google-signin-btn" style={{ width:"100%", minHeight:44 }}></div>
        ) : (
          <button type="button" onClick={() => {
            window.alert("Google Sign-In Setup Guide:\n\n1. Go to Google Cloud Console.\n2. Create an OAuth Client ID under Credentials.\n3. Add 'http://localhost:5173' to Authorized JavaScript Origins.\n4. Create a .env file in 'frontend/' and add:\nVITE_GOOGLE_CLIENT_ID=your_client_id_here\n\n5. Save and reload the page.");
          }}
            style={{width:"100%",height:44,background:C.card,color:C.text,border:`1.5px dashed ${C.border}`,borderRadius:9,fontSize:12.5,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 1px 4px rgba(0,0,0,.06)",fontFamily:"inherit"}}>
            {Ic.google} Setup Google Sign-In
          </button>
        )}
      </div>
      <p style={{textAlign:"center",marginTop:18,fontSize:13,color:C.muted}}>
        New to CampusGPT?{" "}
        <button onClick={toSignup} style={{fontWeight:700,color:C.primary,background:"none",border:"none",cursor:"pointer",fontSize:13,fontFamily:"inherit",padding:0}}>Create an account</button>
      </p>
    </>
  );
}

/* ── Sign Up Form ──────────────────────────────────────────────── */
function SignUp({onLogin,toSignin}){
  const ni=useId(),ei=useId(),pi=useId(),ci=useId();
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [conf,setConf]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [showCf,setShowCf]=useState(false);
  const [err,setErr]=useState({});
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const [sErr,setSErr]=useState("");
  const ce=f=>setErr(p=>({...p,[f]:""}));

  const submit=async e=>{
    e.preventDefault(); setSErr("");
    const errs=vSignup(name,email,pw,conf); setErr(errs);
    if(Object.keys(errs).length) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/auth/signup", { name, email, password: pw });
      setDone(true);
      await new Promise(r=>setTimeout(r,900));
      onLogin(res.data);
    } catch(err) {
      console.error("Sign up failed:", err);
      setSErr(err.response?.data?.error || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  if(done) return(
    <div style={{textAlign:"center",padding:"48px 0"}}>
      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:280,damping:18}}
        style={{width:56,height:56,borderRadius:"50%",background:"rgba(16,185,129,.1)",border:"2px solid rgba(16,185,129,.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </motion.div>
      <h3 style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:6}}>Account created!</h3>
      <p style={{fontSize:13,color:C.muted}}>Signing you in now…</p>
    </div>
  );

  return(
    <>
      <div style={{marginBottom:22}}>
        <h2 style={{fontSize:20,fontWeight:800,color:C.text,letterSpacing:"-.025em",marginBottom:4}}>Create your account</h2>
        <p style={{fontSize:13.5,color:C.muted}}>Start querying your documents with AI</p>
      </div>
      <AnimatePresence>
        {sErr&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:.18}} style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:9,padding:"10px 13px",borderRadius:8,background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.2)"}}>
            {Ic.alert}<span style={{fontSize:12.5,color:C.danger}}>{sErr}</span>
          </div>
        </motion.div>}
      </AnimatePresence>
      <form onSubmit={submit} noValidate style={{display:"flex",flexDirection:"column",gap:12}}>
        <Field id={ni} name="name" label="Full name" type="text" value={name} onChange={e=>{setName(e.target.value);ce("name");setSErr("");}} error={err.name} autoComplete="name" icon={Ic.user} disabled={loading}/>
        <Field id={ei} name="email" label="Email address" type="email" value={email} onChange={e=>{setEmail(e.target.value);ce("email");setSErr("");}} error={err.email} autoComplete="email" icon={Ic.mail} disabled={loading}/>
        <Field id={pi} name="password" label="Password" type={showPw?"text":"password"} value={pw} onChange={e=>{setPw(e.target.value);ce("password");setSErr("");}} error={err.password} autoComplete="new-password" icon={Ic.lock} disabled={loading}
          rightSlot={<button type="button" tabIndex={-1} onClick={()=>setShowPw(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",padding:4,display:"flex",alignItems:"center"}}>{showPw?Ic.eyeOff:Ic.eye}</button>}/>
        <Field id={ci} name="confirmPassword" label="Confirm password" type={showCf?"text":"password"} value={conf} onChange={e=>{setConf(e.target.value);ce("confirm");setSErr("");}} error={err.confirm} autoComplete="new-password" icon={Ic.lock} disabled={loading}
          rightSlot={<button type="button" tabIndex={-1} onClick={()=>setShowCf(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",padding:4,display:"flex",alignItems:"center"}}>{showCf?Ic.eyeOff:Ic.eye}</button>}/>
        <p style={{fontSize:11.5,color:"#94A3B8",marginTop:2,lineHeight:1.5}}>By signing up you agree to our Terms of Service and Privacy Policy.</p>
        <PrimaryBtn type="submit" loading={loading}><span>Create account</span>{Ic.arrow}</PrimaryBtn>
      </form>
      <p style={{textAlign:"center",marginTop:18,fontSize:13,color:C.muted}}>
        Already have an account?{" "}
        <button onClick={toSignin} style={{fontWeight:700,color:C.primary,background:"none",border:"none",cursor:"pointer",fontSize:13,fontFamily:"inherit",padding:0}}>Sign in</button>
      </p>
    </>
  );
}

/* ── Root ──────────────────────────────────────────────────────── */
export default function Login({onLogin}){
  const [mode,setMode]=useState("signin");
  // Re-render when theme changes so C updates
  const [, setTick]=useState(0);
  useEffect(()=>{
    const h=()=>setTick(t=>t+1);
    window.addEventListener("cgpt:theme",h);
    return ()=>window.removeEventListener("cgpt:theme",h);
  },[]);
  // Update module-level C so all sub-components pick up new theme
  C = getC();

  return(
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{`
        @media(max-width:900px){.ll{display:none!important}}
        @media(max-width:900px){.lr{width:100%!important}}
        @media(max-width:900px){.lm{display:flex!important}}
      `}</style>

      {/* LEFT */}
      <div className="ll" style={{width:"52%",flexShrink:0,display:"flex"}}>
        <BackgroundAnimation><LeftPanel/></BackgroundAnimation>
      </div>

      {/* RIGHT — uses CSS vars so dark/light toggle works */}
      <div className="lr" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.bg,padding:"48px 24px",position:"relative",minHeight:"100vh",boxSizing:"border-box",transition:"background .2s"}}>
        {/* Mobile logo */}
        <div className="lm" style={{display:"none",marginBottom:28,alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,var(--primary),var(--accent))",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M12 3L2 7l10 4 10-4-10-4z"/><path d="M2 17l10 4 10-4"/><path d="M2 12l10 4 10-4"/></svg>
          </div>
          <span style={{fontWeight:700,fontSize:15,color:C.text}}>CampusGPT</span>
        </div>

        {/* Theme toggle — positioned absolutely on right panel */}
        <div style={{position:"absolute",top:16,right:16}}>
          <ThemeToggle onLight={C.bg !== "#100C1C"}/>
        </div>

        <motion.div key={mode} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.35,ease:[.25,.46,.45,.94]}} style={{width:"100%",maxWidth:400}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"32px 32px 26px",boxShadow:"0 4px 32px rgba(0,0,0,.12),0 1px 4px rgba(0,0,0,.06)",transition:"background .2s,border-color .2s"}}>
            {mode==="signin"
              ? <SignIn onLogin={onLogin} toSignup={()=>setMode("signup")}/>
              : <SignUp onLogin={onLogin} toSignin={()=>setMode("signin")}/>
            }
          </div>
          {/* Security footer */}
          <div style={{marginTop:16,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5,color:"#94A3B8"}}>
              {Ic.shield} 256-bit TLS encryption · SOC 2 Type II
            </div>
            <p style={{fontSize:11,color:"#C0CADB",textAlign:"center"}}>
              Protected by reCAPTCHA Enterprise. Sessions expire after 30 days.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
