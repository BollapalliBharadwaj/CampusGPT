import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const QUICK = [
  { label:"Summarize this document",  icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg> },
  { label:"What are the key topics?", icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
  { label:"Generate 5 MCQs",          icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { label:"List interview questions",  icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { label:"Explain like I'm 5",        icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
];

function EmptyState({ onPrompt, noDoc }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", textAlign:"center" }}>
      <motion.div
        initial={{ scale:.7, opacity:0 }}
        animate={{ scale:1, opacity:1 }}
        transition={{ type:"spring", stiffness:260, damping:20, delay:.1 }}
        style={{
          width:60, height:60, margin:"0 auto 18px",
          background:"linear-gradient(135deg,rgba(30,64,175,.12),rgba(6,182,212,.12))",
          border:"1px solid rgba(30,64,175,.2)",
          borderRadius:16,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"#1E40AF",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M12 3L2 7l10 4 10-4-10-4z"/><path d="M2 17l10 4 10-4"/><path d="M2 12l10 4 10-4"/>
        </svg>
      </motion.div>

      <motion.h3 initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.18}}
        style={{ fontSize:15, fontWeight:700, color:"var(--text)", marginBottom:6 }}>
        {noDoc ? "Select a document" : "Ready to answer"}
      </motion.h3>
      <motion.p initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:.24}}
        style={{ fontSize:13, color:"var(--muted)", maxWidth:300, lineHeight:1.6 }}>
        {noDoc
          ? "Choose a document from the sidebar to start asking questions."
          : "Ask anything about your selected document, or try one of these quick prompts:"}
      </motion.p>

      {!noDoc && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.32}}
          style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginTop:20 }}>
          {QUICK.map((q,i)=>(
            <motion.button key={i} onClick={()=>onPrompt(q.label)}
              whileHover={{scale:1.03, y:-1}}
              whileTap={{scale:.97}}
              style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"7px 14px", borderRadius:8,
                border:"1px solid var(--border)",
                background:"var(--card)",
                color:"var(--muted)",
                fontSize:12, fontWeight:500,
                cursor:"pointer", transition:"all .15s",
                backdropFilter:"blur(8px)",
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#1E40AF";e.currentTarget.style.color="#1E40AF";e.currentTarget.style.background="rgba(30,64,175,.06)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--muted)";e.currentTarget.style.background="var(--card)";}}>
              {q.icon}{q.label}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function ChatWindow({ selectedDocId, onQuestionAsked }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);
  useEffect(()=>{ setMessages([]); },[selectedDocId]);

  const ask = async (q) => {
    const text = q || question;
    if (!text.trim() || !selectedDocId) return;
    setLoading(true);
    setMessages(p=>[...p,{role:"user",text}]);
    setQuestion("");
    try {
      const res = await axios.post("http://localhost:5000/chat",{question:text,documentId:selectedDocId});
      setMessages(p=>[...p,{role:"ai",text:res.data.answer,sources:res.data.sources}]);
      if(onQuestionAsked) onQuestionAsked();
    } catch(e) {
      setMessages(p=>[...p,{role:"ai",text:e.response?.data?.error||"Something went wrong.",sources:[]}]);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity:0, y:14 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:.4, delay:.22 }}
      style={{
        background:"var(--card)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
        border:"1px solid var(--border)", borderRadius:14,
        display:"flex", flexDirection:"column",
        /* Fill remaining viewport height */
        height:"calc(100vh - var(--navbar-h) - 330px)",
        minHeight:440,
        boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
        overflow:"hidden",
      }}
    >
      {/* ── Header ── */}
      <div style={{
        padding:"13px 18px",
        borderBottom:"1px solid var(--border)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexShrink:0,
        background:"var(--surface)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:32, height:32,
            background:"linear-gradient(135deg,#1E40AF,#06B6D4)",
            borderRadius:9,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 2px 8px rgba(30,64,175,.3)",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 3L2 7l10 4 10-4-10-4z"/><path d="M2 17l10 4 10-4"/><path d="M2 12l10 4 10-4"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize:13.5, fontWeight:700, color:"var(--text)", lineHeight:1.2 }}>AI Assistant</p>
            <p style={{ fontSize:11, color:"var(--muted)" }}>Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {selectedDocId && (
            <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:6, background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.2)", fontSize:11, fontWeight:600, color:"#10B981" }}>
              <span style={{ width:5,height:5,borderRadius:"50%",background:"#10B981",display:"inline-block" }}/>
              Doc loaded
            </div>
          )}
          {messages.length > 0 && (
            <button onClick={()=>setMessages([])}
              style={{ padding:"4px 10px", borderRadius:6, border:"1px solid var(--border)", background:"transparent", color:"var(--muted)", fontSize:11, fontWeight:500, cursor:"pointer", transition:"all .15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="var(--card)";e.currentTarget.style.color="var(--text)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--muted)";}}>
              Clear chat
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 18px", display:"flex", flexDirection:"column" }}>
        <AnimatePresence mode="wait">
          {messages.length === 0 && !loading
            ? <EmptyState key="empty" onPrompt={q=>{setQuestion(q);ask(q);}} noDoc={!selectedDocId}/>
            : (
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                {messages.map((m,i)=><ChatMessage key={i} msg={m}/>)}
                {loading && <ChatMessage isLoading/>}
                <div ref={bottomRef}/>
              </div>
            )
          }
        </AnimatePresence>
      </div>

      {/* ── Input ── */}
      <ChatInput value={question} onChange={setQuestion} onSubmit={()=>ask()} loading={loading} disabled={!selectedDocId}/>
    </motion.div>
  );
}
