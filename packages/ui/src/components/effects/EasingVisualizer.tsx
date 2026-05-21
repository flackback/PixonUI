import React, { useEffect, useMemo, useState } from 'react';
import { calculateSpringCurve, EASING_CURVES } from './AnimationStudio.utils';

interface EasingVisualizerProps {
  easing: string;
  mass?: number;
  stiffness?: number;
  damping?: number;
}

export const EasingVisualizer = ({
  easing,
  mass = 1,
  stiffness = 100,
  damping = 10,
}: EasingVisualizerProps) => {
  const [playTime, setPlayTime] = useState(0);

  useEffect(() => {
    let animId: number;
    const start = performance.now();
    const update = (now: number) => {
      const elapsed = now - start;
      const progress = (elapsed % 1800) / 1800; // 1.8s loop
      setPlayTime(progress);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [easing, mass, stiffness, damping]);

  const easingFn = useMemo(() => {
    if (easing === 'spring-custom') {
      return calculateSpringCurve(mass, stiffness, damping);
    }
    return EASING_CURVES[easing] || EASING_CURVES.linear || ((val: number) => val);
  }, [easing, mass, stiffness, damping]);

  const pointsCount = 40;
  const pathPoints = [];
  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount;
    const val = easingFn(t);
    const x = 10 + t * 80;
    const y = 90 - val * 65; 
    pathPoints.push(`${x},${y}`);
  }

  const pathD = `M ${pathPoints.join(' L ')}`;
  const currentVal = easingFn(playTime);
  const dotX = 10 + playTime * 80;
  const dotY = 90 - currentVal * 65;

  return (
    <div className="flex flex-col gap-2 bg-zinc-100/50 dark:bg-black/35 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-2.5 shadow-inner mt-2">
      <div className="relative w-full h-24 overflow-hidden rounded-xl bg-zinc-950/20 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="10" y1="15" x2="90" y2="15" className="stroke-zinc-300/30 dark:stroke-white/5 stroke-[0.5]" strokeDasharray="2,2" />
          <line x1="10" y1="90" x2="90" y2="90" className="stroke-zinc-300/30 dark:stroke-white/5 stroke-[0.5]" strokeDasharray="2,2" />
          <line x1="10" y1="15" x2="10" y2="90" className="stroke-zinc-300/30 dark:stroke-white/5 stroke-[0.5]" strokeDasharray="2,2" />
          <line x1="90" y1="15" x2="90" y2="90" className="stroke-zinc-300/30 dark:stroke-white/5 stroke-[0.5]" strokeDasharray="2,2" />
          
          <path
            d={pathD}
            fill="none"
            className="stroke-purple-500 dark:stroke-purple-400 stroke-2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx={dotX}
            cy={dotY}
            r="4.5"
            className="fill-purple-600 dark:fill-purple-400 stroke-white dark:stroke-zinc-900 stroke-2 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
          />
        </svg>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-zinc-950/40 p-2 rounded-xl border border-white/5">
          <div 
            className="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
            style={{
              transform: `scale(${0.35 + currentVal * 0.65}) translateY(${(1 - currentVal) * -8}px)`,
              opacity: 0.4 + currentVal * 0.6,
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1 select-none">
        <span>Preview physics</span>
        <span className="tabular-nums">{Math.round(playTime * 100)}%</span>
      </div>
    </div>
  );
};
