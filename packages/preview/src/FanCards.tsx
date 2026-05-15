import React, { useRef, useLayoutEffect } from 'react';
import { motion } from '@pixonui/react';
import { Sparkles } from 'lucide-react';
import { lerp } from './utils';

const FLOAT_ANIM = { y: [0, -15, 0], rotate: [0, 1, 0, -1, 0] };
const FLOAT_TRANS = [
  { duration: 4, easing: 'ease-in-out' } as any,
  { duration: 5, easing: 'ease-in-out' } as any,
  { duration: 6, easing: 'ease-in-out' } as any,
];
const ENTRANCE = { initial: { opacity: 0, scale: 0.8 }, whileInView: { opacity: 1, scale: 1 } };
const VIEWPORT = { once: true };
const CARD_TRANSITIONS = [
  { duration: 1, delay: 0 },
  { duration: 1, delay: 0.1 },
  { duration: 1, delay: 0.2 },
];

export const FanCards = React.memo(({ scrollRef }: { scrollRef: { current: number } }) => {
  const elsRef = useRef<(HTMLDivElement | null)[]>([null, null, null]);

  useLayoutEffect(() => {
    let rafId: number;
    const tick = () => {
      const p = scrollRef.current;
      // Start expansion at 0.15 scroll and end at 0.45
      const expandP = Math.max(0, Math.min(1, (p - 0.15) / 0.3));
      
      elsRef.current.forEach((card, i) => {
        if (!card) return;
        const r = lerp(expandP, 0, 1, 0, i === 0 ? -18 : i === 2 ? 18 : 0);
        const x = lerp(expandP, 0, 1, 0, i === 0 ? -220 : i === 2 ? 220 : 0);
        const y = lerp(expandP, 0, 1, 0, i === 0 || i === 2 ? 60 : -20);
        const z = lerp(expandP, 0, 1, 0, i === 1 ? 40 : -40);
        
        card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${r}deg)`;
        card.style.opacity = String(lerp(expandP, 0, 0.2, 0.6, 1));
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [scrollRef]);

  return (
    <div className="relative flex justify-center h-[500px] perspective-2000">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          ref={(el: HTMLDivElement | null) => { elsRef.current[i] = el; }}
          initial={ENTRANCE.initial}
          whileInView={ENTRANCE.whileInView}
          viewport={VIEWPORT}
          transition={CARD_TRANSITIONS[i]}
          className="absolute w-72 h-96 bg-zinc-900/40 border border-white/5 rounded-[50px] shadow-2xl backdrop-blur-3xl flex items-center justify-center p-10 text-zinc-300 origin-bottom overflow-hidden group"
          style={{
            zIndex: 10 - i,
            transformStyle: 'preserve-3d',
            willChange: 'transform'
          }}
        >
          {/* Neon Glow Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <motion.div
            animate={FLOAT_ANIM}
            transition={FLOAT_TRANS[i]}
            className="w-full h-full border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center gap-8 relative z-10"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 shadow-inner border border-white/5" />
            <div className="w-3/4 h-3 bg-white/5 rounded-full" />
            <div className="w-1/2 h-3 bg-white/5 rounded-full opacity-50" />
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white text-black rounded-3xl shadow-2xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Sparkles className="w-8 h-8" />
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
});

FanCards.displayName = 'FanCards';
