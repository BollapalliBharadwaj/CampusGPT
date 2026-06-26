import { motion } from "framer-motion";

const PRIMARY = "#1E40AF";
const ACCENT  = "#06B6D4";

function GridOverlay() {
  return (
    <svg
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.04, pointerEvents:"none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="bg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.7" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg-grid)" />
    </svg>
  );
}

const GEO = [
  { type:"hex",    size:90,  left:"8%",  top:"10%", delay:0,  dur:22, opacity:0.13 },
  { type:"hex",    size:55,  left:"76%", top:"65%", delay:4,  dur:26, opacity:0.09 },
  { type:"diamond",size:70,  left:"14%", top:"70%", delay:2,  dur:30, opacity:0.08 },
  { type:"diamond",size:38,  left:"80%", top:"16%", delay:7,  dur:18, opacity:0.10 },
  { type:"circle", size:76,  left:"62%", top:"80%", delay:5,  dur:24, opacity:0.07 },
  { type:"circle", size:34,  left:"26%", top:"46%", delay:1,  dur:34, opacity:0.06 },
  { type:"tri",    size:58,  left:"86%", top:"42%", delay:9,  dur:28, opacity:0.08 },
];

function GeometricShapes() {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {GEO.map((s, i) => (
        <motion.div
          key={i}
          style={{ position:"absolute", left:s.left, top:s.top }}
          animate={{ y:[0,-16,8,0], rotate: s.type==="diamond" ? [45,56,40,45] : [0,7,-4,0], opacity:[s.opacity, s.opacity*1.5, s.opacity*0.65, s.opacity] }}
          transition={{ duration:s.dur, delay:s.delay, repeat:Infinity, ease:"easeInOut", repeatType:"mirror" }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 100 100" fill="none">
            {s.type === "hex"    && <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke={ACCENT} strokeWidth="2" fill="none" />}
            {s.type === "diamond"&& <rect x="14" y="14" width="72" height="72" stroke={PRIMARY} strokeWidth="2" fill="none" transform="rotate(45 50 50)" />}
            {s.type === "circle" && <circle cx="50" cy="50" r="42" stroke={ACCENT} strokeWidth="2" fill="none" />}
            {s.type === "tri"    && <polygon points="50,8 92,88 8,88" stroke={PRIMARY} strokeWidth="2" fill="none" />}
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function Particles() {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {Array.from({ length:26 }, (_, i) => ({
        id: i,
        x: `${(i * 37 + 5) % 100}%`,
        y: `${(i * 53 + 10) % 100}%`,
        delay: (i * 0.4) % 8,
        dur: 6 + (i % 5) * 2,
        size: i % 3 === 0 ? 2.5 : 1.5,
        op: i % 4 === 0 ? 0.55 : 0.28,
        color: i % 2 === 0 ? ACCENT : PRIMARY,
      })).map(d => (
        <motion.div
          key={d.id}
          style={{ position:"absolute", left:d.x, top:d.y, width:d.size, height:d.size, borderRadius:"50%", background:d.color }}
          animate={{ opacity:[d.op, d.op*2.2, d.op], scale:[1,1.7,1] }}
          transition={{ duration:d.dur, delay:d.delay, repeat:Infinity, ease:"easeInOut", repeatType:"mirror" }}
        />
      ))}
    </div>
  );
}

export default function BackgroundAnimation({ children }) {
  return (
    <div style={{ position:"relative", width:"100%", height:"100%", overflow:"hidden", background:"#0B1628" }}>
      {/* Soft gradient blobs */}
      <motion.div style={{
        position:"absolute", width:480, height:400, borderRadius:"50%",
        background:`radial-gradient(circle, rgba(30,64,175,0.5) 0%, transparent 70%)`,
        top:-80, left:-100, filter:"blur(40px)", pointerEvents:"none",
      }}
        animate={{ x:[0,30,-20,0], y:[0,-20,30,0] }}
        transition={{ duration:20, repeat:Infinity, ease:"easeInOut", repeatType:"mirror" }}
      />
      <motion.div style={{
        position:"absolute", width:380, height:320, borderRadius:"50%",
        background:`radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)`,
        bottom:-60, right:-80, filter:"blur(40px)", pointerEvents:"none",
      }}
        animate={{ x:[0,-25,18,0], y:[0,20,-30,0] }}
        transition={{ duration:26, delay:4, repeat:Infinity, ease:"easeInOut", repeatType:"mirror" }}
      />
      <motion.div style={{
        position:"absolute", width:280, height:240, borderRadius:"50%",
        background:`radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)`,
        top:"35%", left:"40%", filter:"blur(30px)", pointerEvents:"none",
      }}
        animate={{ x:[0,20,-15,0], y:[0,-15,20,0] }}
        transition={{ duration:32, delay:8, repeat:Infinity, ease:"easeInOut", repeatType:"mirror" }}
      />

      <GridOverlay />
      <GeometricShapes />
      <Particles />

      <div style={{ position:"relative", zIndex:10, height:"100%" }}>{children}</div>
    </div>
  );
}
