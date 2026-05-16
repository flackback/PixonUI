import React, { useRef, useLayoutEffect } from 'react';
import { timeline, motion, useMotionValueValue, useScroll, useTransform } from '@pixonui/react';
import { MousePointer2, Zap, Wind, Sparkles, Move } from 'lucide-react';

/**
 * Supreme Parallax - Performance optimized via WAAPI mutators
 */
export const ScrollParallaxMaster = () => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  // Transform values based on scroll
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const r = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.4], [1, 0]);
  const bgOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scrollProgress = useMotionValueValue(scrollYProgress);

  return (
    <div ref={container} className="relative h-[400px] w-full bg-zinc-900 rounded-[40px] border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="absolute top-4 left-6 flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">
        <Move className="w-3 h-3" /> Scroll Parallax Master
      </div>
      
      {/* Background Layer */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent)] transition-opacity duration-700"
        style={{ opacity: bgOpacity }}
      />
      
      {/* Parallax Elements */}
      <motion.div 
        className="absolute w-40 h-40 bg-purple-500/20 blur-3xl rounded-full"
        style={{ y: y1 }}
      />
      
      <motion.div 
        className="relative z-10 text-center space-y-4"
        style={{ opacity }}
      >
        <h3 className="text-4xl font-black text-white italic tracking-tighter">
          SCROLL<br/>DEPTH
        </h3>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
          {Math.round(scrollProgress * 100)}% Progress
        </p>
      </motion.div>

      <motion.div 
        className="absolute bottom-10 right-10 w-20 h-20 border-2 border-white/10 rounded-2xl flex items-center justify-center"
        style={{ y: y2, rotate: r }}
      >
        <Sparkles className="text-white/20 w-8 h-8" />
      </motion.div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-white/0 via-white/20 to-white/0 animate-bounce" />
      </div>
    </div>
  );
};

/**
 * Anime Kinetic Text - High energy stagger reveal
 */
export const AnimeKineticText = () => {
  const container = useRef<HTMLDivElement>(null);

  const runAnime = () => {
    if (!container.current) return;
    const letters = container.current.querySelectorAll('.letter');
    const tl = timeline();
    
    // Reset
    letters.forEach(l => (l as HTMLElement).style.opacity = '0');

    tl.add(Array.from(letters), [
      { transform: 'translateY(100px) skewY(20deg) scale(0.5)', opacity: 0 },
      { transform: 'translateY(0) skewY(0deg) scale(1)', opacity: 1 }
    ], { 
      duration: 800, 
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      stagger: 50 
    });

    tl.play();
  };

  useLayoutEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) runAnime();
    }, { threshold: 0.5 });
    
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  const text = "SUPREME";

  return (
    <div 
      ref={container} 
      onClick={runAnime}
      className="p-12 bg-black rounded-[40px] border border-white/5 flex flex-col items-center justify-center gap-8 cursor-pointer group active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">
        <Zap className="w-3 h-3" /> Kinetic Typography
      </div>
      
      <div className="flex gap-1 overflow-hidden">
        {text.split('').map((char, i) => (
          <span 
            key={i} 
            className="letter text-6xl font-black text-white inline-block will-change-transform"
            style={{ opacity: 0 }}
          >
            {char}
          </span>
        ))}
      </div>
      
      <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Clique para Re-trigger
      </div>
    </div>
  );
};

/**
 * Physical Momentum Demo
 */
export const PhysicsShowcase = () => {
  return (
    <div className="p-8 bg-zinc-950 rounded-[40px] border border-white/5 space-y-6">
       <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">
        <Wind className="w-3 h-3" /> Velocity Preserving Springs
      </div>
      
      <div className="flex gap-4">
        <motion.div
          whileHover={{ scale: 1.2, y: -10 }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 10,
            velocity: 100 // Teste do novo parâmetro de velocidade
          }}
          className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl cursor-pointer"
        >
          <Sparkles className="text-black w-6 h-6" />
        </motion.div>

        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 8,
            velocity: -50 
          }}
          className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl cursor-pointer"
        >
          <MousePointer2 className="text-white w-6 h-6" />
        </motion.div>
      </div>
      
      <p className="text-[10px] text-zinc-600 font-mono">
        Interaja para sentir o momentum físico preservado via WAAPI.
      </p>
    </div>
  );
};
