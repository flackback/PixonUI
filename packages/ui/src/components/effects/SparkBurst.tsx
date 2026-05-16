import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

type Spark = {
  id: string;
  angle: number;
  dist: number;
  size: number;
};

export interface SparkBurstProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Number of sparks spawned per burst. */
  sparks?: number;
  /** Max distance in px a spark travels. */
  radius?: number;
  /** Duration in ms. */
  duration?: number;
  /** Spark color. */
  color?: string;
}

export function SparkBurst({
  children,
  sparks = 14,
  radius = 28,
  duration = 650,
  color = 'currentColor',
  className,
  ...props
}: SparkBurstProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(true);
  const [items, setItems] = useState<Spark[]>([]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const spawn = useCallback(() => {
    const now = performance.now();
    const next: Spark[] = Array.from({ length: sparks }).map((_, i) => {
      const angle = (i / sparks) * Math.PI * 2 + Math.random() * 0.25;
      const dist = radius * (0.6 + Math.random() * 0.5);
      const size = 2 + Math.random() * 3;
      return { id: `${now}-${i}-${Math.random().toString(16).slice(2)}`, angle, dist, size };
    });
    setItems((prev) => [...prev, ...next]);
  }, [radius, sparks]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      props.onPointerDown?.(e);
      if (e.defaultPrevented) return;
      spawn();
    },
    [props, spawn]
  );

  const centerStyle = useMemo(() => ({ left: '50%', top: '50%' }), []);

  return (
    <div
      ref={hostRef}
      className={cn('relative inline-block', className)}
      onPointerDown={onPointerDown}
      {...props}
    >
      {children}

      <div className="pointer-events-none absolute inset-0">
        {items.map((s) => (
          <span
            key={s.id}
            className="absolute"
            style={{
              ...centerStyle,
              width: s.size,
              height: s.size,
              marginLeft: -s.size / 2,
              marginTop: -s.size / 2,
              borderRadius: 9999,
              backgroundColor: color,
              willChange: 'transform, opacity',
            }}
            ref={(node) => {
              if (!node) return;
              // Run once per mount
              if ((node as any)._pixonSparkAnimated) return;
              (node as any)._pixonSparkAnimated = true;

              const dx = Math.cos(s.angle) * s.dist;
              const dy = Math.sin(s.angle) * s.dist;

              const anim = node.animate(
                [
                  { transform: 'translate3d(0px, 0px, 0) scale(1)', opacity: 1 },
                  { transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.2)`, opacity: 0 },
                ],
                { duration, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
              );

              anim.onfinish = () => {
                if (!mountedRef.current) return;
                setItems((prev) => prev.filter((p) => p.id !== s.id));
              };
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default SparkBurst;
