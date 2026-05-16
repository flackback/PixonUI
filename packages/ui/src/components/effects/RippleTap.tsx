import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

type Ripple = {
  id: string;
  x: number;
  y: number;
  size: number;
};

export interface RippleTapProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Ripple color (defaults to currentColor). */
  color?: string;
  /** Duration in ms. */
  duration?: number;
  /** Ripple opacity at start. */
  opacity?: number;
}

export function RippleTap({
  children,
  color = 'currentColor',
  duration = 650,
  opacity = 0.22,
  className,
  ...props
}: RippleTapProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(true);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      props.onPointerDown?.(e);
      if (e.defaultPrevented) return;
      const el = hostRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxX = Math.max(x, rect.width - x);
      const maxY = Math.max(y, rect.height - y);
      const size = Math.ceil(Math.sqrt(maxX * maxX + maxY * maxY) * 2);
      const id = `${performance.now()}-${Math.random().toString(16).slice(2)}`;

      setRipples((prev) => [...prev, { id, x, y, size }]);
    },
    [props]
  );

  return (
    <div
      ref={hostRef}
      className={cn('relative inline-block overflow-hidden', className)}
      onPointerDown={onPointerDown}
      {...props}
    >
      {children}

      <div className="pointer-events-none absolute inset-0">
        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute rounded-full"
            style={{
              left: r.x - r.size / 2,
              top: r.y - r.size / 2,
              width: r.size,
              height: r.size,
              backgroundColor: color,
              opacity,
              transform: 'scale(0)',
              willChange: 'transform, opacity',
            }}
            ref={(node) => {
              if (!node) return;
              if ((node as any)._pixonRippleAnimated) return;
              (node as any)._pixonRippleAnimated = true;

              const anim = node.animate(
                [
                  { transform: 'scale(0)', opacity },
                  { transform: 'scale(1)', opacity: 0 },
                ],
                { duration, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
              );

              anim.onfinish = () => {
                if (!mountedRef.current) return;
                setRipples((prev) => prev.filter((p) => p.id !== r.id));
              };
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default RippleTap;

