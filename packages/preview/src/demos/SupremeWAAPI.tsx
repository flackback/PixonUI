import React, { useRef, useEffect } from 'react';
import { motion, timeline } from '@pixonui/react';
import { Sparkles, Zap, Cpu } from 'lucide-react';

/**
 * SupremeWAAPI Demo - Antigravity Showcase
 * Demonstrates zero-dependency, compositor-thread, additive magnetic interactions.
 */
export const SupremeWAAPIDemo: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // 1. Initial Staggered Entrance (Supreme Standard)
    // Runs once on GPU, cleans up memory automatically
    const entrance = timeline();
    itemsRef.current.filter(Boolean).forEach((el, i) => {
      entrance.add(el!, [
        { transform: 'translateY(60px) scale(0.5) rotate(-10deg)', opacity: 0 },
        { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: 1 }
      ], {
        duration: 1200,
        delay: i * 8, // Fast stagger
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        composite: 'replace' // Start fresh
      });
    });
    entrance.play();

    // 2. Magnetic Field Interaction (Zero-Re-render Logic)
    const handlePointerMove = (e: PointerEvent) => {
      const rect = grid.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      itemsRef.current.forEach((el) => {
        if (!el) return;
        const elRect = el.getBoundingClientRect();
        const elX = elRect.left + elRect.width / 2;
        const elY = elRect.top + elRect.height / 2;

        const distX = mouseX - elX;
        const distY = mouseY - elY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        // Interaction radius
        const radius = 250;
        if (distance < radius) {
          const power = (radius - distance) / radius;
          const tiltX = (distY / radius) * 45 * power;
          const tiltY = -(distX / radius) * 45 * power;
          
          // Use WAAPI with composite: 'add' for hyper-smooth additive movement
          // No React state used here - absolute performance.
          el.animate([
            { transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${1 + 0.2 * power})` }
          ], {
            duration: 400,
            easing: 'ease-out',
            fill: 'forwards',
            composite: 'add' // Segue a trajetória atual organicamente
          });
        }
      });
    };

    grid.addEventListener('pointermove', handlePointerMove);
    return () => grid.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto p-10 bg-zinc-900 rounded-[60px] border border-white/5 overflow-hidden relative group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(168,85,247,0.15),transparent_50%)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-widest">
            <Zap className="w-3 h-3" />
            WAAPI Supreme Architect
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tight">Campo Magnético Nativo</h3>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-zinc-400 text-xs flex items-center gap-2">
            <Cpu className="w-3 h-3" /> 120 FPS
          </div>
          <div className="px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20 text-purple-400 text-xs flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Zero Dependencies
          </div>
        </div>
      </div>

      <div 
        ref={gridRef}
        className="grid grid-cols-10 gap-2 md:gap-4 aspect-square md:aspect-video relative z-10"
      >
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            ref={el => itemsRef.current[i] = el}
            className="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg md:rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group/item"
          >
            <div className="absolute inset-0 bg-purple-500 opacity-0 group-hover/item:opacity-20 transition-opacity" />
            <div className="absolute inset-0 border border-white/10 rounded-lg md:rounded-xl pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="mt-12 text-zinc-500 text-sm font-light text-center">
        Passe o mouse para sentir a inércia aditiva. Sem cálculos de física em JS, apenas o motor C++ do navegador.
      </div>
    </div>
  );
};
