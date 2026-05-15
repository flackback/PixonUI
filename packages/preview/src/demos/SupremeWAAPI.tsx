import React, { useRef, useEffect, useCallback } from 'react';
import { usePixonAnimate } from '@pixonui/react';
import { Sparkles, Zap, Cpu, MousePointer2 } from 'lucide-react';

const GRID_SIZE = 10;
const TOTAL_ITEMS = GRID_SIZE * GRID_SIZE;

const MagneticItem = ({ index }: { index: number }) => {
  const { ref, animate } = usePixonAnimate<HTMLDivElement>();
  const lastUpdate = useRef(0);

  const handleInteraction = useCallback((mouseX: number, mouseY: number) => {
    const el = ref.current;
    if (!el) return;
    
    const now = performance.now();
    if (now - lastUpdate.current < 16) return; // Cap at ~60Hz for logic, WAAPI handles 120Hz interpolation
    
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 300;
    
    if (dist < radius) {
      const power = (radius - dist) / radius;
      const moveX = (dx / radius) * 100 * power;
      const moveY = (dy / radius) * 100 * power;
      const rotateX = (dy / radius) * 45 * power;
      const rotateY = -(dx / radius) * 45 * power;
      
      animate({
        x: moveX,
        y: moveY,
        rotateX,
        rotateY,
        scale: 1 + 0.3 * power,
        filter: `blur(${power * 2}px) brightness(${1 + power})`
      }, {
        duration: 800,
        spring: { stiffness: 300, damping: 20 },
        composite: 'replace'
      });
      lastUpdate.current = now;
    } else {
      // Return to origin with spring
      animate({
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        filter: 'blur(0px) brightness(1)'
      }, {
        duration: 1000,
        spring: { stiffness: 100, damping: 30 },
        composite: 'replace'
      });
    }
  }, [animate, ref]);

  useEffect(() => {
    const move = (e: MouseEvent) => handleInteraction(e.clientX, e.clientY);
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [handleInteraction]);

  return (
    <div
      ref={ref}
      className="aspect-square bg-zinc-800/50 rounded-xl border border-white/5 shadow-inner relative overflow-hidden group/item"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover/item:opacity-50 transition-opacity">
        <div className="w-1 h-1 bg-white rounded-full" />
      </div>
    </div>
  );
};

export const SupremeWAAPIDemo: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-12 bg-zinc-950 rounded-[60px] border border-white/5 overflow-hidden relative group shadow-3xl">
      {/* Liquid background effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)] animate-pulse" />
      </div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 relative z-10 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-purple-400 font-mono text-[10px] uppercase tracking-[0.4em]">
            <Zap className="w-4 h-4 fill-purple-500/20" /> Liquid Momentum
          </div>
          <h3 className="text-5xl font-black text-white tracking-tighter italic">
            CAMPO <span className="text-zinc-700">MAGNÉTICO</span>
          </h3>
        </div>
        
        <div className="flex gap-3">
          <div className="px-5 py-2 bg-white/5 rounded-2xl border border-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 backdrop-blur-xl">
            <Cpu className="w-4 h-4" /> 120 FPS Native
          </div>
          <div className="px-5 py-2 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 backdrop-blur-xl">
            <Sparkles className="w-4 h-4" /> Physics Driven
          </div>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-3 aspect-square md:aspect-[21/9] relative z-10 perspective-1000">
        {Array.from({ length: TOTAL_ITEMS }).map((_, i) => (
          <MagneticItem key={i} index={i} />
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-4 text-zinc-600">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em]">
          <MousePointer2 className="w-4 h-4 animate-bounce" /> Interaction Ready
        </div>
        <p className="max-w-md text-center text-xs leading-relaxed opacity-50">
          Inércia líquida processada via motor WAAPI. Cada célula reage individualmente à sua presença, mantendo a integridade física através de molas de alta fidelidade.
        </p>
      </div>
    </div>
  );
};

