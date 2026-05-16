import React, { useCallback, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import { usePixonAnimate } from '../../hooks/usePixonAnimate';

export interface MagneticEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Max translation in px. */
  strength?: number;
}

export function MagneticEffect({ children, strength = 10, className, ...props }: MagneticEffectProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const { ref, animate, cancel } = usePixonAnimate<HTMLDivElement>();
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });

  const setTarget = useCallback((x: number, y: number) => {
    targetRef.current.x = x;
    targetRef.current.y = y;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const tx = targetRef.current.x;
      const ty = targetRef.current.y;
      animate(
        { transform: `translate3d(${tx}px, ${ty}px, 0)` },
        { duration: 250, easing: 'elite-out', spring: { stiffness: 500, damping: 24 }, springType: 'standard', additive: false, fill: 'both' }
      );
    });
  }, [animate]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      props.onPointerMove?.(e);
      if (e.defaultPrevented) return;
      const el = hostRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2 || 1);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2 || 1);
      setTarget(Math.max(-1, Math.min(1, dx)) * strength, Math.max(-1, Math.min(1, dy)) * strength);
    },
    [props, setTarget, strength]
  );

  const onPointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      props.onPointerLeave?.(e);
      if (e.defaultPrevented) return;
      cancel();
      setTarget(0, 0);
    },
    [props, cancel, setTarget]
  );

  return (
    <div
      ref={hostRef}
      className={cn('inline-block', className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...props}
    >
      <div ref={ref} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
}

export default MagneticEffect;
