import React, { useRef, useEffect, memo } from 'react';
import { PixonMotion, motion } from '../../../ui/src/components/effects/Animate';
import { Surface } from '../../../ui/src/primitives/Surface';
import { Button } from '../../../ui/src/components/button/Button';
import { Badge } from '../../../ui/src/primitives/Badge';
import { cn } from '../../../ui/src/utils/cn';
import { Zap, Check, ArrowRight, Layers, Cpu, Globe, MousePointer2 } from 'lucide-react';

/**
 * Pixon Elite Motion Experience (V4.4 Extreme Stability)
 * Uses a zero-render event architecture to ensure buttery smoothness.
 */
export default function EliteMotionExperience() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      // Global event to avoid parent re-renders
      window.dispatchEvent(new CustomEvent('pixon-mouse-3d', { detail: { x, y } }));
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex flex-col items-center justify-center overflow-hidden font-sans p-4 md:p-12"
      style={{ perspective: '2000px' }}
    >
      <InteractiveDotGrid />
      {/* Hero Content - NOW STATIC (Doesn't re-render on mouse move) */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-8">
          <PixonMotion
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <Badge variant="outline" className="py-2 px-6 bg-white/40 dark:bg-white/5 backdrop-blur-2xl border-white dark:border-white/10 text-slate-900 dark:text-white font-bold tracking-widest uppercase text-[10px] shadow-sm">
              <Cpu className="w-3 h-3 mr-2 text-cyan-500" />
              Engine V4.4 Hardened
            </Badge>
          </PixonMotion>

          <h1 className="text-6xl md:text-8xl font-black text-slate-950 dark:text-white leading-[0.95] tracking-tighter">
            <motion.span 
              initial={{ opacity: 0, rotateX: 45, y: 50 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              transition={{ duration: 0.8, easing: 'elite-out' }}
              className="inline-block"
            >
              Arquitetura
            </motion.span>
            <br />
            <motion.span 
              initial={{ opacity: 0, rotateX: 45, y: 50 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, easing: 'elite-out' }}
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Fluida.
            </motion.span>
          </h1>

          <PixonMotion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed"
          >
            Esqueça o jitter. O PixonUI utiliza um sistema de loteamento atômico 
            para entregar animações perfeitas, sem nunca travar a sua UI.
          </PixonMotion>

          <div className="flex gap-4">
            <PixonMotion whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="h-14 px-8 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-bold group">
                Explorar Engine
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </PixonMotion>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <BentoCard index={1} title="Off-Thread" icon={<Zap className="w-5 h-5" />} className="col-span-2 bg-gradient-to-br from-white/80 to-slate-50/50 dark:from-white/10 dark:to-white/5" />
          <BentoCard index={2} title="Native" icon={<Layers className="w-5 h-5" />} className="bg-cyan-500 text-white" />
          <BentoCard index={3} title="Global" icon={<Globe className="w-5 h-5" />} className="bg-slate-900 text-white dark:bg-white dark:text-slate-900" />
          <BentoCard index={4} title="Deterministic" icon={<Check className="w-5 h-5" />} className="col-span-2 bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white dark:border-white/10" />
        </div>
      </div>

      <PixonMotion
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
        className="fixed bottom-10 px-8 h-16 bg-white/60 dark:bg-black/60 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-full flex items-center gap-8 shadow-2xl z-50"
      >
        <NavItem label="Core" active />
        <NavItem label="Physics" />
        <NavItem label="Layout" />
        <NavItem label="SSR" />
      </PixonMotion>
    </div>
  );
}

function InteractiveDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const targetMouseRef = useRef({ xN: 0, yN: 0 });
  const currentMouseRef = useRef({ xN: 0, yN: 0 });
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));

      sizeRef.current = { w, h, dpr };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMouse3d = (e: any) => {
      const d = e?.detail;
      if (!d) return;
      targetMouseRef.current.xN = typeof d.x === 'number' ? d.x : 0;
      targetMouseRef.current.yN = typeof d.y === 'number' ? d.y : 0;
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(draw);
    };

    const draw = (t: number) => {
      rafRef.current = null;
      if (!startRef.current) startRef.current = t;
      const time = (t - startRef.current) / 1000;

      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) return;

      // Smooth mouse follow
      const cur = currentMouseRef.current;
      const target = targetMouseRef.current;
      const alpha = 0.12;
      cur.xN += (target.xN - cur.xN) * alpha;
      cur.yN += (target.yN - cur.yN) * alpha;

      ctx.clearRect(0, 0, w, h);

      const grid = 28;
      const ox = (cur.xN * 0.5 + 0.5) * grid * 0.9;
      const oy = (cur.yN * 0.5 + 0.5) * grid * 0.9;

      // Ice-white background texture tint (very subtle)
      ctx.fillStyle = 'rgba(120, 140, 160, 0.045)';
      ctx.fillRect(0, 0, w, h);

      const dotColor = 'rgba(90, 100, 115, 0.22)';
      const lineColor = 'rgba(90, 100, 115, 0.14)';

      const mx = ((cur.xN * 0.5) + 0.5) * w;
      const my = ((cur.yN * 0.5) + 0.5) * h;
      const influenceR = 240;

      for (let y = -grid; y <= h + grid; y += grid) {
        for (let x = -grid; x <= w + grid; x += grid) {
          const nx = x + ox;
          const ny = y + oy;

          // Subtle flow field based on time+position (cheap noise)
          const s = Math.sin((nx * 0.012) + time * 0.9) + Math.cos((ny * 0.010) - time * 0.7);
          const driftX = s * 0.65;
          const driftY = Math.cos((nx * 0.010) - time * 0.8) * 0.55;

          // Mouse warp: push slightly away from cursor
          const dx = nx - mx;
          const dy = ny - my;
          const dist = Math.hypot(dx, dy);
          const k = dist < influenceR ? (1 - dist / influenceR) : 0;
          const warpX = dist > 0 ? (dx / dist) * k * 2.2 : 0;
          const warpY = dist > 0 ? (dy / dist) * k * 2.2 : 0;

          const px = nx + driftX + warpX;
          const py = ny + driftY + warpY;

          // dots
          ctx.fillStyle = dotColor;
          ctx.beginPath();
          ctx.arc(px, py, 1.15, 0, Math.PI * 2);
          ctx.fill();

          // tiny lines ("bilinhas") every other cell, with mouse-reactive angle
          if (((x / grid) ^ (y / grid)) & 1) {
            const angle = (s * 0.55) + (cur.xN * 0.35) + (k * 0.8);
            const len = 6 + k * 3;
            const x2 = px + Math.cos(angle) * len;
            const y2 = py + Math.sin(angle) * len;
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      // Continue while moving or drifting (always drift a bit, but keep FPS reasonable)
      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pixon-mouse-3d', onMouse3d, { passive: true } as any);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resize as any);
      window.removeEventListener('pixon-mouse-3d', onMouse3d as any);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 opacity-80 dark:opacity-30"
    />
  );
}

// Optimized Bento Card that listens to global events to avoid parent re-renders
const BentoCard = memo(({ title, icon, className, index }: any) => {
  const tiltRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ rx: 0, ry: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;

    el.style.willChange = 'transform';
    (el.style as any).transformStyle = 'preserve-3d';

    const onMouse3d = (e: any) => {
      const d = e?.detail;
      if (!d) return;
      targetRef.current.x = typeof d.x === 'number' ? d.x : 0;
      targetRef.current.y = typeof d.y === 'number' ? d.y : 0;

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    function tick() {
      rafRef.current = null;
      const node = tiltRef.current;
      if (!node) return;

      const { x, y } = targetRef.current;
      const cur = currentRef.current;

      // Smooth follow without React renders (critical damping-ish lerp).
      const targetRy = x * 12;
      const targetRx = -y * 12;
      const alpha = 0.18;

      cur.ry += (targetRy - cur.ry) * alpha;
      cur.rx += (targetRx - cur.rx) * alpha;

      node.style.transform = `rotateX(${cur.rx.toFixed(3)}deg) rotateY(${cur.ry.toFixed(3)}deg)`;

      // Keep animating while there's visible error to avoid snapping.
      if (Math.abs(targetRy - cur.ry) > 0.01 || Math.abs(targetRx - cur.rx) > 0.01) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    window.addEventListener('pixon-mouse-3d', onMouse3d, { passive: true } as any);
    return () => {
      window.removeEventListener('pixon-mouse-3d', onMouse3d as any);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  return (
    <PixonMotion
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: 0.3 + index * 0.1, 
        type: 'spring', 
        stiffness: 200, 
        damping: 20 
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        "relative overflow-hidden p-6 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5",
        className
      )}
    >
      <div ref={tiltRef} className="flex min-h-[160px] flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-white/20 dark:bg-black/20 rounded-xl backdrop-blur-md">
            {icon}
          </div>
          <MousePointer2 className="w-4 h-4 opacity-20" />
        </div>
        <div className="text-xl font-black tracking-tight">{title}</div>
      </div>
    </PixonMotion>
  );
});

const NavItem = ({ label, active }: { label: string, active?: boolean }) => (
  <PixonMotion
    whileHover={{ y: -2, color: '#06b6d4' }}
    className={cn(
      "text-xs font-black uppercase tracking-[0.2em] cursor-pointer transition-colors",
      active ? "text-cyan-500" : "text-slate-500 dark:text-slate-400"
    )}
  >
    {label}
  </PixonMotion>
);
