import React, { useRef, useState } from 'react';
import { timeline } from '@pixonui/react';
import { Layers, MousePointer2, Wind, Zap, MousePointerClick, Sparkles } from 'lucide-react';
import { ScrollParallaxMaster, AnimeKineticText, PhysicsShowcase } from './NextGenSupremeDemos';

const cleanup = (a: Animation, e: HTMLElement) => {
  a.finished.then(() => { if (a.playState === 'finished' && e.isConnected) { a.commitStyles(); a.cancel(); } }).catch(() => {});
};

const LiquidTabs = () => {
  const [active, setActive] = useState(0), indRef = useRef<HTMLDivElement>(null), tabs = ['Design', 'Motion', 'Code', 'Speed'];
  const move = (i: number, e: React.MouseEvent) => {
    setActive(i);
    const el = e.currentTarget as HTMLElement, ind = indRef.current;
    if (ind) {
      const { offsetLeft: l, offsetWidth: w } = el;
      // Use replace for absolute positioning, but with a highly elastic easing
      ind.animate([{ transform: `translateX(${l}px) scaleX(${w / 80})` }], {
        duration: 600, 
        easing: 'cubic-bezier(0.2, 1.4, 0.4, 1)', 
        fill: 'both'
      });
    }
  };

  return (
    <div className="p-8 bg-zinc-950 rounded-[40px] border border-white/5 space-y-6">
      <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]"><Layers className="w-3 h-3" /> Liquid Momentum</div>
      <div className="relative flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/5 w-fit">
        <div ref={indRef} className="absolute left-0 top-2 h-[calc(100%-16px)] w-20 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] z-0 origin-left" />
        {tabs.map((t, i) => (
          <button key={t} onClick={(e) => move(i, e)} className={`relative z-10 px-6 py-2 rounded-xl text-sm font-medium transition-colors duration-300 ${active === i ? 'text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>{t}</button>
        ))}
      </div>
    </div>
  );
};

const QuantumStack = () => {
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const reset = () => cards.current.forEach(c => { if (c) cleanup(c.animate([{ transform: 'translateZ(0) rotateX(0) rotateY(0) scale(1)', filter: 'brightness(1)' }], { duration: 600, easing: 'ease-out', fill: 'forwards', composite: 'add' }), c); });
  const move = (e: React.MouseEvent) => {
    cards.current.forEach(c => {
      if (!c) return;
      const { left: l, top: t, width: w, height: h } = c.getBoundingClientRect();
      const dx = e.clientX - (l + w / 2), dy = e.clientY - (t + h / 2), dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const p = (200 - dist) / 200;
        // Use replace for real-time tracking to avoid stacking explosions
        c.animate([{ 
          transform: `translateZ(${p * 40}px) rotateX(${dy * 0.1 * p}deg) rotateY(${-dx * 0.1 * p}deg) scale(${1 + p * 0.05})`, 
          filter: `brightness(${1 + p * 0.5})` 
        }], { duration: 200, easing: 'ease-out', fill: 'both' });
      }
    });
  };
  return (
    <div onMouseMove={move} onMouseLeave={reset} className="p-12 bg-zinc-900 rounded-[40px] border border-white/5 space-y-8 relative overflow-hidden group h-full">
      <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em] relative z-10"><MousePointer2 className="w-3 h-3" /> Additive Interference</div>
      <div className="flex justify-center gap-4 py-10 perspective-[1000px]">
        {[0, 1, 2].map(i => <div key={i} ref={el => cards.current[i] = el} className="w-24 h-32 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl border border-white/10 shadow-2xl will-change-transform" />)}
      </div>
    </div>
  );
};

export const SupremeShowcase = () => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-7xl mx-auto p-6">
    {/* Header */}
    <div className="md:col-span-12 text-left space-y-2 mb-8">
      <div className="flex items-center gap-2 text-purple-500 font-mono text-xs uppercase tracking-[0.3em] font-bold">
        <Sparkles className="w-4 h-4" /> Omni-Motion Engine
      </div>
      <h2 className="text-7xl font-black text-white tracking-tighter leading-none">SUPREME<br/>ARCHITECT</h2>
      <p className="text-zinc-500 max-w-xl text-lg font-medium">Native WAAPI Overlord: Zero JS loops, Zero Main-Thread bloat. Just pure GPU momentum.</p>
    </div>

    {/* Row 1 */}
    <div className="md:col-span-8 h-full"><ScrollParallaxMaster /></div>
    <div className="md:col-span-4 h-full"><QuantumStack /></div>

    {/* Row 2 */}
    <div className="md:col-span-4 h-full"><LiquidTabs /></div>
    <div className="md:col-span-8 h-full"><AnimeKineticText /></div>

    {/* Row 3 */}
    <div className="md:col-span-5 h-full"><PhysicsShowcase /></div>
    <div className="md:col-span-7 h-full">
      <div className="p-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[40px] text-white space-y-6 shadow-2xl shadow-purple-500/20">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] font-bold opacity-80">
          <Wind className="w-4 h-4" /> Engine Specs
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <div className="text-3xl font-black">120 FPS</div>
            <div className="text-[10px] uppercase tracking-widest opacity-60">Locked Performance</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black">0.0ms</div>
            <div className="text-[10px] uppercase tracking-widest opacity-60">Main Thread Jitter</div>
          </div>
        </div>
        <div className="space-y-2 text-sm font-medium opacity-90 border-t border-white/20 pt-6">
          <p>• <b>Additive Blending:</b> Transições sem saltos via 'composite: add'.</p>
          <p>• <b>Physics Engine:</b> Momento real via molas cinéticas nativas.</p>
          <p>• <b>Type Safe:</b> 100% inferência automática para componentes motion.</p>
        </div>
      </div>
    </div>
  </div>
);
