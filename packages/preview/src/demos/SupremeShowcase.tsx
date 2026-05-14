import React, { useRef, useState, useEffect } from 'react';
import { timeline } from '@pixonui/react';
import { Layers, MousePointer2, Wind, Zap, MousePointerClick } from 'lucide-react';

const cleanup = (a: Animation, e: HTMLElement) => {
  a.finished.then(() => {
    if (a.playState === 'finished' && e.isConnected) {
      a.commitStyles();
      a.cancel();
    }
  }).catch(() => {});
};

const LiquidTabs = () => {
  const [active, setActive] = useState(0);
  const indRef = useRef<HTMLDivElement>(null);
  const tabs = ['Design', 'Motion', 'Code', 'Speed'];

  const move = (i: number, e: React.MouseEvent) => {
    setActive(i);
    const { offsetLeft: l, offsetWidth: w } = e.currentTarget as HTMLElement;
    if (indRef.current) {
      const a = indRef.current.animate([{ left: `${l}px`, width: `${w}px` }], {
        duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards', composite: 'add'
      });
      cleanup(a, indRef.current);
    }
  };

  return (
    <div className="p-8 bg-zinc-950 rounded-[40px] border border-white/5 space-y-6">
      <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">
        <Layers className="w-3 h-3" /> Liquid Momentum
      </div>
      <div className="relative flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/5 w-fit">
        <div ref={indRef} className="absolute h-[calc(100%-16px)] bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] z-0" style={{ width: '80px', left: '8px', top: '8px' }} />
        {tabs.map((t, i) => (
          <button key={t} onClick={(e) => move(i, e)} className={`relative z-10 px-6 py-2 rounded-xl text-sm font-medium transition-colors duration-300 ${active === i ? 'text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};

const QuantumStack = () => {
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  
  const reset = () => cards.current.forEach(c => {
    if (c) cleanup(c.animate([{ transform: 'translateZ(0) rotateX(0) rotateY(0) scale(1)', filter: 'brightness(1)' }], { duration: 600, easing: 'ease-out', fill: 'forwards', composite: 'add' }), c);
  });

  const move = (e: React.MouseEvent) => {
    cards.current.forEach(c => {
      if (!c) return;
      const { left: l, top: t, width: w, height: h } = c.getBoundingClientRect();
      const dx = e.clientX - (l + w / 2), dy = e.clientY - (t + h / 2), dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const p = (200 - dist) / 200;
        c.animate([{ transform: `translateZ(${p * 40}px) rotateX(${dy * 0.1 * p}deg) rotateY(${-dx * 0.1 * p}deg) scale(${1 + p * 0.05})`, filter: `brightness(${1 + p * 0.5})` }], 
          { duration: 300, easing: 'ease-out', fill: 'forwards', composite: 'add' }
        );
      }
    });
  };

  return (
    <div onMouseMove={move} onMouseLeave={reset} className="p-12 bg-zinc-900 rounded-[40px] border border-white/5 space-y-8 relative overflow-hidden group">
      <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em] relative z-10">
        <MousePointer2 className="w-3 h-3" /> Additive Interference
      </div>
      <div className="flex justify-center gap-4 py-10 perspective-[1000px]">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} ref={el => cards.current[i] = el} className="w-32 h-44 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl border border-white/10 shadow-2xl will-change-transform" />
        ))}
      </div>
    </div>
  );
};

const ParticleBurst = () => {
  const container = useRef<HTMLDivElement>(null);
  const explode = (e: React.MouseEvent) => {
    if (!container.current) return;
    const { left: rl, top: rt } = container.current.getBoundingClientRect();
    const x = e.clientX - rl, y = e.clientY - rt, tl = timeline();
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'absolute w-2 h-2 rounded-full bg-purple-500 pointer-events-none z-50';
      Object.assign(p.style, { left: `${x}px`, top: `${y}px` });
      container.current.appendChild(p);
      const ang = (Math.PI * 2 * i) / 15 + (Math.random() - 0.5), vel = 100 + Math.random() * 150;
      tl.add(p, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(ang) * vel}px, ${Math.sin(ang) * vel}px) scale(0)`, opacity: 0 }], 
        { duration: 800 + Math.random() * 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    }
    tl.play().finished.then(() => container.current?.querySelectorAll('.bg-purple-500').forEach(el => el.remove()));
  };

  return (
    <div ref={container} className="p-12 bg-zinc-950 rounded-[40px] border border-white/5 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
      <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]"><Zap className="w-3 h-3" /> Zero-Leak Engine</div>
      <button onClick={explode} className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 z-10">
        <MousePointerClick className="w-4 h-4" /> Explodir WAAPI
      </button>
      <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mt-4">Limpeza automática após término</div>
    </div>
  );
};

export const SupremeShowcase = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto p-4">
    <div className="md:col-span-2 text-center space-y-4 mb-10">
      <h2 className="text-5xl font-black text-white tracking-tighter">SUPREME ARCHITECT</h2>
      <p className="text-zinc-400 max-w-2xl mx-auto text-sm">Web Animations API: Zero Main-Thread, 100% GPU, Zero Memory Leaks.</p>
    </div>
    <div className="space-y-8"><LiquidTabs /><ParticleBurst /></div>
    <div className="flex flex-col">
      <QuantumStack />
      <div className="mt-8 p-8 bg-purple-500/5 rounded-[40px] border border-purple-500/10 text-xs text-zinc-400 space-y-2">
        <h4 className="text-purple-400 font-bold mb-2 flex items-center gap-2"><Wind className="w-4 h-4" /> Por que é superior?</h4>
        <p>• <b>Interrupções Fluidas:</b> 'composite: add' evita saltos bruscos.</p>
        <p>• <b>Higiene Ativa:</b> commitStyles() garante persistência sem 'flicker'.</p>
      </div>
    </div>
  </div>
);
