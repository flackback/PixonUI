import React, { useEffect, useState, useRef } from 'react';
import { cn } from '../../utils/cn';
import { useInView } from '../../hooks/useInView';

export interface NumberTickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  duration?: number;
  delay?: number;
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  duration = 2000,
  delay = 0,
  decimalPlaces = 0,
  className,
  ...props
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const { ref, hasAnimated } = useInView({ threshold: 0.1 });
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hasAnimated) return;
    startTimeRef.current = null;

    let cancelled = false;
    let rafId: number | null = null;

    const animate = (timestamp: number) => {
      if (cancelled) return;
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current - delay) / duration, 1);
      
      if (progress >= 0) {
        const current = progress * value;
        setDisplayValue(current);
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      if (cancelled) return;
      rafId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [hasAnimated, value, duration, delay]);

  return (
    <span
      ref={ref}
      className={cn("tabular-nums tracking-tighter", className)}
      {...props}
    >
      {displayValue.toFixed(decimalPlaces)}
    </span>
  );
}
