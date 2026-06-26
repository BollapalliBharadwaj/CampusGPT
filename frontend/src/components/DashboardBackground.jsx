import { useEffect, useRef } from "react";

export default function DashboardBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, raf = null, t = 0;

    const isDark = () =>
      document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark" ||
      document.documentElement.getAttribute("data-theme") !== "light";

    // Oxblood red + sage green orbs
    const ORBS = [
      { px:0.12, py:0.18, r:0.32, vx:0.00010, vy:0.00007, cd:"rgba(139,26,26,0.22)",   cl:"rgba(139,26,26,0.08)"  },
      { px:0.80, py:0.55, r:0.26, vx:-0.00008,vy:0.00011, cd:"rgba(59,122,87,0.18)",    cl:"rgba(59,122,87,0.07)"  },
      { px:0.45, py:0.88, r:0.22, vx:0.00009, vy:-0.00010,cd:"rgba(180,50,30,0.14)",    cl:"rgba(180,50,30,0.06)"  },
      { px:0.90, py:0.12, r:0.18, vx:-0.00012,vy:0.00008, cd:"rgba(59,122,87,0.12)",    cl:"rgba(59,122,87,0.05)"  },
      { px:0.25, py:0.65, r:0.20, vx:0.00007, vy:-0.00009,cd:"rgba(139,26,26,0.10)",    cl:"rgba(139,26,26,0.04)"  },
      { px:0.60, py:0.30, r:0.15, vx:-0.00006,vy:0.00012, cd:"rgba(59,122,87,0.08)",    cl:"rgba(59,122,87,0.04)"  },
    ];

    const DOTS = Array.from({length:35},(_,i)=>({
      px:Math.random(), py:Math.random(),
      size:Math.random()*1.8+0.6,
      vx:(Math.random()-0.5)*0.00008, vy:(Math.random()-0.5)*0.00008,
      baseAlpha:Math.random()*0.4+0.15,
      phase:Math.random()*Math.PI*2,
      speed:0.018+Math.random()*0.015,
    }));

    const LINES = Array.from({length:8},()=>({
      x1:Math.random(), y1:Math.random(),
      x2:Math.random(), y2:Math.random(),
      vx1:(Math.random()-0.5)*0.00005, vy1:(Math.random()-0.5)*0.00005,
      vx2:(Math.random()-0.5)*0.00005, vy2:(Math.random()-0.5)*0.00005,
    }));

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      t++;
      ctx.clearRect(0,0,W,H);
      const dark = isDark();

      // ── Grid ──
      ctx.strokeStyle = dark ? "rgba(255,255,255,0.025)" : "rgba(20,8,4,0.04)";
      ctx.lineWidth = 0.6;
      const G = 52;
      for(let x=0;x<W;x+=G){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=G){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

      // ── Gradient orbs ──
      ORBS.forEach(o=>{
        o.px+=o.vx; o.py+=o.vy;
        if(o.px<-0.15)o.px=1.15; if(o.px>1.15)o.px=-0.15;
        if(o.py<-0.15)o.py=1.15; if(o.py>1.15)o.py=-0.15;
        const cx=o.px*W, cy=o.py*H, r=o.r*Math.max(W,H);
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
        g.addColorStop(0, dark?o.cd:o.cl);
        g.addColorStop(1,"transparent");
        ctx.fillStyle=g;
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
      });

      // ── Subtle connection lines ──
      LINES.forEach(l=>{
        l.x1+=l.vx1; l.y1+=l.vy1; l.x2+=l.vx2; l.y2+=l.vy2;
        ["x1","y1","x2","y2"].forEach(k=>{
          if(l[k]<0||l[k]>1) l["v"+k]*=-1;
        });
        const alpha = dark?0.055:0.03;
        ctx.strokeStyle = dark?`rgba(200,80,60,${alpha})`:`rgba(139,26,26,${alpha})`;
        ctx.lineWidth=0.8;
        ctx.beginPath();
        ctx.moveTo(l.x1*W,l.y1*H);
        ctx.lineTo(l.x2*W,l.y2*H);
        ctx.stroke();
      });

      // ── Pulsing dots ──
      DOTS.forEach(d=>{
        d.px+=d.vx; d.py+=d.vy;
        if(d.px<0)d.px=1; if(d.px>1)d.px=0;
        if(d.py<0)d.py=1; if(d.py>1)d.py=0;
        const pulse=Math.sin(t*d.speed+d.phase)*0.5+0.5;
        const a=d.baseAlpha*(0.4+0.6*pulse)*(dark?1:0.45);
        ctx.fillStyle=dark?`rgba(180,80,60,${a})`:`rgba(139,26,26,${a})`;
        ctx.beginPath();
        ctx.arc(d.px*W,d.py*H,d.size*(0.8+0.4*pulse),0,Math.PI*2);
        ctx.fill();
      });

      raf=requestAnimationFrame(draw);
    };

    draw();
    return ()=>{ cancelAnimationFrame(raf); ro.disconnect(); };
  },[]);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", inset:0, width:"100%", height:"100%",
      zIndex:0, pointerEvents:"none", display:"block",
    }}/>
  );
}
