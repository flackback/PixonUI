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

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current - delay) / duration, 1);
      
      if (progress >= 0) {
        const current = progress * value;
        setDisplayValue(current);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
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
