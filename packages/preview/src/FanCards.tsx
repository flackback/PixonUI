import React, { useRef, useLayoutEffect } from 'react';
import { motion } from '@pixonui/react';
import { Sparkles } from 'lucide-react';

function lerp(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + (outMax - outMin) * t;
}

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
      for (let i = 0; i < 3; i++) {
        const card = elsRef.current[i];
        if (!card) continue;
        const r = lerp(p, 0.2, 0.5, 0, i === 0 ? -20 : i === 2 ? 20 : 0);
        const x = lerp(p, 0.2, 0.5, 0, i === 0 ? -180 : i === 2 ? 180 : 0);
        const y = lerp(p, 0.2, 0.5, 0, i === 2 ? 40 : 0);
        if (i === 1) {
          card.style.transform = 'none';
        } else {
          card.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
        }
      }
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
          className="absolute w-72 h-96 bg-white border border-zinc-200 rounded-[50px] shadow-[0_30px_70px_rgba(0,0,0,0.12)] flex items-center justify-center p-10 text-zinc-300 origin-bottom"
          style={{
            zIndex: 10 - i,
            transformStyle: 'preserve-3d',
            willChange: 'transform'
          }}
        >
          <motion.div
            animate={FLOAT_ANIM}
            transition={FLOAT_TRANS[i]}
            className="w-full h-full border-2 border-dashed border-zinc-100 rounded-[40px] flex flex-col items-center justify-center gap-8 relative"
          >
            <div className="w-20 h-20 rounded-full bg-zinc-50 shadow-inner" />
            <div className="w-3/4 h-3 bg-zinc-50 rounded-full" />
            <div className="w-1/2 h-3 bg-zinc-50 rounded-full opacity-50" />
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-zinc-900 rounded-3xl shadow-2xl flex items-center justify-center text-white rotate-12">
              <Sparkles className="w-8 h-8" />
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
});

FanCards.displayName = 'FanCards';
