import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimationControls, AnimeGridStagger } from '@pixonui/react';

export default function AnimePathDemo() {
  const vortexControls = useAnimationControls();
  const neuralControls = useAnimationControls();
  const [activeView, setActiveView] = useState<'vortex' | 'synth' | 'neural' | 'animejs'>('vortex');

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-12 font-sans selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="font-black text-xl italic tracking-tighter">P</span>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
                PixonUI Motion Showcase
              </h1>
              <p className="text-white/40 text-sm font-medium tracking-wide uppercase">Hyper-Hover Engine V4.8</p>
            </div>
          </div>

          <div className="flex gap-4 p-1.5 bg-white/5 rounded-2xl border border-white/10 w-fit backdrop-blur-xl">
            {(['vortex', 'synth', 'neural', 'animejs'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 capitalize ${
                  activeView === view 
                    ? 'bg-white text-black shadow-xl scale-105' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {view === 'animejs' ? 'animejs' : view}
              </button>
            ))}
          </div>
        </header>

        {/* Content Section */}
        <div className="relative min-h-[600px]">
          {activeView === 'vortex' && <EventHorizon controls={vortexControls} />}
          {activeView === 'synth' && <FluidSynth />}
          {activeView === 'neural' && <NeuralSynapse controls={neuralControls} />}
          {activeView === 'animejs' && <AnimeJsGrid />}
        </div>

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-white/20 text-xs tracking-widest uppercase font-bold">
            All animations powered by WAAPI & Direct-Trigger Pipeline
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-white font-bold text-lg leading-none">60</p>
              <p className="text-white/20 text-[10px] uppercase font-black tracking-tighter">FPS Target</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg leading-none">0ms</p>
              <p className="text-white/20 text-[10px] uppercase font-black tracking-tighter">Input Lag</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/**
 * NEW SEQUENCE 01: Event Horizon
 * 100% Pixon: motion + controls + instant set loop.
 */
function EventHorizon({ controls }: { controls: any }) {
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  const particles = React.useMemo(
    () =>
      Array.from({ length: 96 }).map((_, i) => ({
        baseAngle: (i / 96) * Math.PI * 2 * 3,
        radius: 72 + (i % 16) * 10,
        speed: 0.7 + (i % 9) * 0.08,
        wobble: (i % 7) * 0.18,
      })),
    []
  );

  useEffect(() => {
    const animate = (time: number) => {
      if (typeof document !== 'undefined' && document.hidden) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const pointer = pointerRef.current;
      const rect = rectRef.current;
      const cx = (rect?.width ?? 0) / 2;
      const cy = (rect?.height ?? 0) / 2;

      controls.set((idx: number) => {
        const p = particles[idx]!;
        const phase = time * 0.001 * p.speed + p.baseAngle;
        let x = Math.cos(phase) * p.radius + Math.cos(phase * 1.7) * (p.wobble * 8);
        let y = Math.sin(phase) * p.radius + Math.sin(phase * 1.3) * (p.wobble * 8);
        let scale = 0.65 + (Math.sin(phase * 2.1) * 0.5 + 0.5) * 0.5;
        let opacity = 0.2 + (Math.cos(phase * 1.9) * 0.5 + 0.5) * 0.55;

        if (pointer.active && rect) {
          const px = cx + x;
          const py = cy + y;
          const dx = px - pointer.x;
          const dy = py - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 170) {
            const force = (170 - dist) / 170;
            const safeDist = Math.max(0.001, dist);
            x += (dx / safeDist) * force * 22;
            y += (dy / safeDist) * force * 22;
            scale += force * 0.6;
            opacity = Math.min(1, opacity + force * 0.45);
          }
        }

        return { x, y, scale, opacity };
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [controls, particles]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full aspect-video md:aspect-[21/9] bg-[#030712] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center group"
      onMouseEnter={(e) => {
        rectRef.current = e.currentTarget.getBoundingClientRect();
        pointerRef.current.x = e.clientX - rectRef.current.left;
        pointerRef.current.y = e.clientY - rectRef.current.top;
        pointerRef.current.active = true;
      }}
      onMouseMove={(e) => {
        const rect = rectRef.current;
        if (!rect) return;
        pointerRef.current.x = e.clientX - rect.left;
        pointerRef.current.y = e.clientY - rect.top;
        pointerRef.current.active = true;
      }}
      onMouseLeave={() => {
        pointerRef.current.active = false;
      }}
    >
      <div className="absolute w-40 h-40 bg-cyan-500/20 blur-[80px] rounded-full animate-pulse" />
      <div className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_20px_white]" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            animate={controls}
            initial={{ x: 0, y: 0, scale: 1, opacity: 0.3 }}
            staggerIdx={i}
            className="absolute left-1/2 top-1/2 w-1 h-1 -ml-0.5 -mt-0.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            style={{ willChange: 'transform, opacity' }}
          />
        ))}
      </div>

      <div className="absolute bottom-8 left-8">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] mb-1">Interactive Vortex</p>
        <p className="text-cyan-400/60 text-[8px] font-bold uppercase tracking-widest">Move mouse to distort gravity field</p>
      </div>
    </motion.div>
  );
}

/**
 * NEW SEQUENCE 02: Fluid Synth
 * Glassmorphic data visualization equalizer.
 */
function FluidSynth() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full h-[600px] bg-gradient-to-b from-[#0f172a] to-[#020617] rounded-[3rem] overflow-hidden border border-white/5 flex items-center justify-center gap-2 px-12 group"
    >
      {Array.from({ length: 32 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0.35, opacity: 0.35 }}
          animate={{
            scaleY: [0.35, 0.45, 0.78, 0.98, 0.7, 0.48, 0.35],
            opacity: [0.22, 0.32, 0.58, 0.9, 0.62, 0.34, 0.22],
          }}
          transition={{
            duration: 6.5 + ((i % 7) * 0.22),
            delay: i * 0.09,
            repeat: Infinity,
            repeatType: 'loop',
            repeatDelay: 1.1 + ((i % 5) * 0.08),
            easing: 'ease-in-out',
          }}
          whileHover={{
            scaleY: 1.2,
            scaleX: 1.18,
            opacity: 1,
            transition: { type: 'spring', stiffness: 180, damping: 28 }
          }}
          className="flex-1 min-w-[8px] max-w-[20px] rounded-full border border-white/10 bg-white/10 origin-bottom"
          style={{
            height: '320px',
            willChange: 'transform, opacity',
          }}
        />
      ))}

      <div className="absolute top-12 left-12">
        <h2 className="text-2xl font-black text-white/10 italic">FLUID SYNTH</h2>
      </div>
      <div className="absolute bottom-8 right-12 text-right">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">Kinetic Equalizer</p>
        <p className="text-fuchsia-500/60 text-[8px] font-bold uppercase tracking-widest">Auto loop compositor-first</p>
      </div>
    </motion.div>
  );
}

/**
 * NEW SEQUENCE 03: Neural Synapse
 * 100% Pixon: motion + controls + instant set loop.
 */
function NeuralSynapse({ controls }: { controls: any }) {
  const rectRef = useRef<DOMRect | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const rafRef = useRef<number | null>(null);

  const nodes = React.useMemo(
    () =>
      Array.from({ length: 72 }).map((_, i) => ({
        row: Math.floor(i / 12),
        col: i % 12,
        phase: (i % 11) * 0.35,
        speed: 0.9 + (i % 7) * 0.12,
      })),
    []
  );

  useEffect(() => {
    const animate = (time: number) => {
      if (typeof document !== 'undefined' && document.hidden) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const rect = rectRef.current;
      const pointer = pointerRef.current;

      controls.set((idx: number) => {
        const n = nodes[idx]!;
        const t = time * 0.001 * n.speed + n.phase;
        let x = Math.sin(t * 1.3 + n.col * 0.35) * 3.2;
        let y = Math.cos(t * 1.1 + n.row * 0.42) * 3.2;
        let scale = 0.84 + (Math.sin(t) * 0.5 + 0.5) * 0.42;
        let opacity = 0.2 + (Math.cos(t * 1.2) * 0.5 + 0.5) * 0.35;

        if (pointer.active && rect) {
          const cellW = rect.width / 12;
          const cellH = rect.height / 6;
          const px = (n.col + 0.5) * cellW;
          const py = (n.row + 0.5) * cellH;
          const dx = px - pointer.x;
          const dy = py - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 170) {
            const force = (170 - dist) / 170;
            const safe = Math.max(0.001, dist);
            x += (dx / safe) * force * 16;
            y += (dy / safe) * force * 16;
            scale += force * 1.1;
            opacity = Math.min(1, opacity + force * 0.55);
          }
        }

        return { x, y, scale, opacity };
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [controls, nodes]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full aspect-video md:aspect-[21/9] bg-[#020617] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center group p-20"
      onMouseEnter={(e) => {
        rectRef.current = e.currentTarget.getBoundingClientRect();
        pointerRef.current.x = e.clientX - rectRef.current.left;
        pointerRef.current.y = e.clientY - rectRef.current.top;
        pointerRef.current.active = true;
      }}
      onMouseMove={(e) => {
        const rect = rectRef.current;
        if (!rect) return;
        pointerRef.current.x = e.clientX - rect.left;
        pointerRef.current.y = e.clientY - rect.top;
        pointerRef.current.active = true;
      }}
      onMouseLeave={() => {
        pointerRef.current.active = false;
      }}
    >
      <div className="grid grid-cols-12 gap-10">
        {nodes.map((_, i) => (
          <motion.div
            key={i}
            animate={controls}
            initial={{ x: 0, y: 0, scale: 1, opacity: 0.2 }}
            staggerIdx={i}
            className="w-3 h-3 rounded-full border border-cyan-300/20 bg-cyan-300/20"
            style={{ willChange: 'transform, opacity' }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h3 className="text-9xl font-black text-white/[0.01] tracking-[1em] uppercase group-hover:tracking-[0.5em] transition-all duration-1000">
          NEURAL
        </h3>
      </div>

      <div className="absolute bottom-8 left-12">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] mb-1">Synapse Mesh</p>
        <p className="text-blue-400/60 text-[8px] font-bold uppercase tracking-widest">Responsive light nodes</p>
      </div>
    </motion.div>
  );
}

/**
 * Anime.js Advanced Grid Staggering (WAAPI via PixonUI)
 * Replica do pen: https://codepen.io/juliangarnier/pen/GgRzgqp
 */
function AnimeJsGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full aspect-video md:aspect-[21/9] bg-[#f8fafc] rounded-[3rem] overflow-hidden border border-black/5 shadow-2xl flex items-center justify-center"
    >
      <div className="absolute top-10 left-12">
        <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.5em] mb-1">Anime.js</p>
        <p className="text-black/70 text-xs font-bold tracking-tight">Advanced Grid Staggering (PixonUI WAAPI)</p>
      </div>

      <AnimeGridStagger
        rows={41}
        dotColor="#d1d5db"
        cursorColor="#374151"
        className="scale-[0.72] sm:scale-[0.84] md:scale-100 origin-center"
      />

      <div className="absolute bottom-10 right-12 text-right">
        <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.5em]">Auto Loop</p>
        <p className="text-black/60 text-[10px] font-semibold">Replicado sem Anime.js</p>
      </div>
    </motion.div>
  );
}
