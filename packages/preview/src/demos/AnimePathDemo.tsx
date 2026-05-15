import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimationControls, Surface } from '@pixonui/react';

export default function AnimePathDemo() {
  const vortexControls = useAnimationControls();
  const synthControls = useAnimationControls();
  const neuralControls = useAnimationControls();
  
  const [activeView, setActiveView] = useState<'vortex' | 'synth' | 'neural'>('vortex');

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
            {(['vortex', 'synth', 'neural'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 capitalize ${
                  activeView === view 
                    ? 'bg-white text-black shadow-xl scale-105' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </header>

        {/* Content Section */}
        <div className="relative min-h-[600px]">
          {activeView === 'vortex' && <EventHorizon controls={vortexControls} />}
          {activeView === 'synth' && <FluidSynth controls={synthControls} />}
          {activeView === 'neural' && <NeuralSynapse controls={neuralControls} />}
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
 * Physics-based gravitational vortex with 150 particles.
 */
function EventHorizon({ controls }: { controls: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full aspect-video md:aspect-[21/9] bg-[#030712] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center group"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        controls.set((idx: number) => {
          const angle = (idx / 150) * Math.PI * 2 * 3; // Swirl multiplier
          const baseRadius = 80 + (idx % 20) * 12;
          const px = cx + Math.cos(angle) * baseRadius;
          const py = cy + Math.sin(angle) * baseRadius;

          const dist = Math.sqrt((mx - px)**2 + (my - py)**2);
          if (dist < 200) {
            const force = (200 - dist) / 200;
            const pushX = (px - mx) * force * 0.8;
            const pushY = (py - my) * force * 0.8;
            return { 
              x: px - cx + pushX, 
              y: py - cy + pushY, 
              scale: 0.5 + force * 2,
              opacity: 0.2 + force * 0.8,
              filter: `blur(${force * 8}px) brightness(${1 + force * 2})`
            };
          }
          return null;
        });
      }}
      onClick={() => {
        controls.start({
          x: 0, y: 0, scale: 4, opacity: 0,
          transition: { type: 'spring', stiffness: 100, damping: 20, delay: (i: any) => i * 0.001 }
        }).then(() => setTimeout(() => controls.start("initial"), 500));
      }}
    >
      <div className="absolute w-40 h-40 bg-cyan-500/20 blur-[80px] rounded-full animate-pulse" />
      <div className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_20px_white]" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {Array.from({ length: 150 }).map((_, i) => {
          const angle = (i / 150) * Math.PI * 2 * 3;
          const radius = 80 + (i % 20) * 12;
          const startX = Math.cos(angle) * radius;
          const startY = Math.sin(angle) * radius;

          return (
            <motion.div
              key={i}
              animate={controls}
              initial="initial"
              staggerIdx={i}
              variants={{
                initial: { x: startX, y: startY, scale: 1, opacity: 0.3, filter: 'blur(1px)' }
              }}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            />
          );
        })}
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
function FluidSynth({ controls }: { controls: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full h-[600px] bg-gradient-to-b from-[#0f172a] to-[#020617] rounded-[3rem] overflow-hidden border border-white/5 flex items-center justify-center gap-2 px-12 group"
    >
      {Array.from({ length: 32 }).map((_, i) => (
        <motion.div
          key={i}
          animate={controls}
          initial="initial"
          staggerIdx={i}
          variants={{
            initial: { height: 40 + Math.random() * 100, opacity: 0.3, backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
          whileHover={{
            height: 400,
            opacity: 1,
            backgroundColor: 'rgba(34,211,238,0.8)',
            boxShadow: '0 0 40px rgba(34,211,238,0.4)',
            scaleX: 1.5,
            transition: { type: 'spring', stiffness: 400, damping: 15 }
          }}
          className="flex-1 min-w-[8px] max-w-[20px] rounded-full backdrop-blur-md border border-white/10"
        />
      ))}

      <div className="absolute top-12 left-12">
        <h2 className="text-2xl font-black text-white/10 italic">FLUID SYNTH</h2>
      </div>
      <div className="absolute bottom-8 right-12 text-right">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">Kinetic Equalizer</p>
        <p className="text-fuchsia-500/60 text-[8px] font-bold uppercase tracking-widest">Hover to trigger physical morphing</p>
      </div>
    </motion.div>
  );
}

/**
 * NEW SEQUENCE 03: Neural Synapse
 * Interactive light-grid with ripple propagation.
 */
function NeuralSynapse({ controls }: { controls: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      className="relative w-full aspect-video md:aspect-[21/9] bg-[#020617] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center group p-20"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        controls.set((idx: number) => {
          const row = Math.floor(idx / 12);
          const col = idx % 12;
          const px = col * 60 + 100;
          const py = row * 60 + 80;

          const dist = Math.sqrt((mx - px)**2 + (my - py)**2);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            return {
              scale: 1 + force * 1.5,
              opacity: 0.1 + force * 0.9,
              backgroundColor: force > 0.8 ? 'rgba(255,255,255,1)' : 'rgba(34,211,238,0.5)',
              boxShadow: `0 0 ${force * 30}px rgba(34,211,238,0.5)`
            };
          }
          return { scale: 1, opacity: 0.1, backgroundColor: 'rgba(255,255,255,0.1)', boxShadow: 'none' };
        });
      }}
    >
      <div className="grid grid-cols-12 gap-10">
        {Array.from({ length: 72 }).map((_, i) => (
          <motion.div
            key={i}
            animate={controls}
            initial="initial"
            staggerIdx={i}
            variants={{
              initial: { scale: 1, opacity: 0.1, backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
            className="w-3 h-3 rounded-full border border-white/10"
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
