import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
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

// Optimized Bento Card that listens to global events to avoid parent re-renders
const BentoCard = memo(({ title, icon, className, index }: any) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: any) => {
      setMouse(e.detail);
    };
    window.addEventListener('pixon-mouse-3d', handler);
    return () => window.removeEventListener('pixon-mouse-3d', handler);
  }, []);

  return (
    <PixonMotion
      initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        rotateY: mouse.x * 12,
        rotateX: -mouse.y * 12,
      }}
      transition={{ 
        delay: 0.3 + index * 0.1, 
        type: 'spring', 
        stiffness: 200, 
        damping: 20 
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        "relative overflow-hidden p-6 rounded-[2rem] flex flex-col justify-between min-h-[160px] shadow-sm border border-black/5 dark:border-white/5",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="p-3 bg-white/20 dark:bg-black/20 rounded-xl backdrop-blur-md">
          {icon}
        </div>
        <MousePointer2 className="w-4 h-4 opacity-20" />
      </div>
      <div className="text-xl font-black tracking-tight">{title}</div>
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
