import axios from "axios";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = {
  uploading:{ label:"Uploading file…",        pct:30, color:"#1E40AF" },
  embedding:{ label:"Generating embeddings…", pct:65, color:"#06B6D4" },
  saving:   { label:"Saving to database…",    pct:88, color:"#06B6D4" },
  ready:    { label:"Ready to query!",        pct:100,color:"#10B981" },
};

export default function Upload({ onUploadComplete }) {
  const [file,   setFile]   = useState(null);
  const [stage,  setStage]  = useState(null);
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => { if(files[0]){ setFile(files[0]); setStage(null); setError(null); setResult(null); }},
    accept:{"application/pdf":[".pdf"]}, multiple:false,
  });

  const upload = async () => {
    if (!file) return;
    const fd = new FormData(); fd.append("pdf", file);
    try {
      setStage("uploading"); setError(null);
      const res = await axios.post("http://localhost:5000/upload", fd);
      setStage("embedding"); await new Promise(r=>setTimeout(r,500));
      setStage("saving");    await new Promise(r=>setTimeout(r,400));
      setStage("ready");
      setResult(res.data);
      if (onUploadComplete) onUploadComplete();
    } catch(e) {
      setStage("error"); setError(e.response?.data?.error || e.message);
    }
  };

  const reset = () => { setFile(null); setStage(null); setResult(null); setError(null); };

  const si = stage && STAGES[stage];
  const processing = ["uploading","embedding","saving"].includes(stage);

  return (
    <motion.div
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:.4, delay:.15 }}
      style={{
        background:"var(--card)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
        border:"1px solid var(--border)", borderRadius:14,
        padding:"22px 24px", marginBottom:20,
        boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <h2 style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:2 }}>Upload Document</h2>
          <p style={{ fontSize:12, color:"var(--muted)" }}>PDF files only · Max 20 MB per file</p>
        </div>
        {stage==="ready" && (
          <motion.div initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:6, background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.25)", fontSize:11.5, fontWeight:700, color:"#10B981" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Indexed
          </motion.div>
        )}
      </div>

      {/* Drop zone */}
      <div {...getRootProps()} style={{
        borderRadius:10,
        border:`2px dashed ${isDragActive?"#1E40AF":file?"rgba(16,185,129,.5)":"var(--border)"}`,
        background: isDragActive?"rgba(30,64,175,.05)":file?"rgba(16,185,129,.03)":"var(--bg)",
        padding:"28px 20px", textAlign:"center", cursor:"pointer",
        transition:"all .18s",
      }}>
        <input {...getInputProps()}/>
        <div style={{
          width:44, height:44, margin:"0 auto 12px",
          background: file?"rgba(16,185,129,.1)":"var(--card)",
          border:`1px solid ${file?"rgba(16,185,129,.3)":"var(--border)"}`,
          borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center",
          color: file?"#10B981":"var(--muted)", transition:"all .18s",
        }}>
          {file
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          }
        </div>
        {file ? (
          <>
            <p style={{ fontSize:13.5, fontWeight:600, color:"var(--text)" }}>{file.name}</p>
            <p style={{ fontSize:11.5, color:"var(--muted)", marginTop:3 }}>{(file.size/1024/1024).toFixed(2)} MB</p>
          </>
        ) : (
          <>
            <p style={{ fontSize:13.5, fontWeight:600, color:"var(--text)" }}>{isDragActive?"Release to upload":"Drag & drop a PDF here"}</p>
            <p style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>or click to browse files</p>
          </>
        )}
      </div>

      {/* Progress bar */}
      <AnimatePresence>
        {si && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
            style={{ marginTop:14, overflow:"hidden" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, color:"var(--muted)", fontWeight:500 }}>{si.label}</span>
              <span style={{ fontSize:12, color:"var(--muted-dim)" }}>{si.pct}%</span>
            </div>
            <div style={{ height:4, background:"var(--border)", borderRadius:99, overflow:"hidden" }}>
              <motion.div
                animate={{ width:`${si.pct}%` }}
                transition={{ duration:.5, ease:"easeOut" }}
                style={{ height:"100%", background:si.color, borderRadius:99 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            style={{ marginTop:12, padding:"10px 14px", borderRadius:8, background:"rgba(239,68,68,.07)", border:"1px solid rgba(239,68,68,.2)", fontSize:12.5, color:"#EF4444" }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result card */}
      <AnimatePresence>
        {result && stage==="ready" && (
          <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            style={{ marginTop:14, padding:"13px 16px", borderRadius:10, background:"rgba(16,185,129,.06)", border:"1px solid rgba(16,185,129,.2)", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:9, background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#10B981", flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{result.fileName}</p>
              <p style={{ fontSize:11.5, color:"var(--muted)", marginTop:2 }}>{result.pages} pages · {result.totalChunks} chunks indexed</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div style={{ display:"flex", gap:9, marginTop:16 }}>
        <motion.button
          onClick={upload}
          disabled={!file || processing}
          whileHover={!file||processing?{}:{scale:1.015,y:-1}}
          whileTap={!file||processing?{}:{scale:.985}}
          style={{
            padding:"9px 20px", borderRadius:9, border:"none",
            background:"linear-gradient(135deg,#1E40AF,#1D4ED8)",
            color:"#fff", fontSize:13.5, fontWeight:700, cursor:!file||processing?"not-allowed":"pointer",
            opacity:!file||processing?.5:1,
            display:"flex", alignItems:"center", gap:8,
            boxShadow:"0 2px 10px rgba(30,64,175,.35)",
            fontFamily:"inherit", transition:"opacity .15s",
          }}
        >
          {processing
            ? <><span style={{ width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"_s .7s linear infinite" }}/>Processing…</>
            : <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload PDF
              </>
          }
        </motion.button>
        {file && (
          <button onClick={reset}
            style={{ padding:"9px 14px", borderRadius:9, border:"1px solid var(--border)", background:"transparent", color:"var(--muted)", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="var(--card)";e.currentTarget.style.color="var(--text)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--muted)";}}>
            Clear
          </button>
        )}
      </div>
      <style>{`@keyframes _s{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
}
