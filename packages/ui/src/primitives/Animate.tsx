import React, { useEffect, useState } from 'react';
import { cn } from '../utils/cn';

export type AnimatePreset = 'fade' | 'fade-up' | 'fade-down' | 'scale' | 'slide-bottom' | 'slide-top';

interface AnimateProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  preset?: AnimatePreset;
  show?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
  onAnimationComplete?: () => void;
}

const presets: Record<AnimatePreset, { initial: string; animate: string }> = {
  fade: {
    initial: 'opacity-0',
    animate: 'opacity-100',
  },
  'fade-up': {
    initial: 'opacity-0 translate-y-4',
    animate: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    initial: 'opacity-0 -translate-y-4',
    animate: 'opacity-100 translate-y-0',
  },
  scale: {
    initial: 'opacity-0 scale-95',
    animate: 'opacity-100 scale-100',
  },
  'slide-bottom': {
    initial: 'opacity-0 translate-y-full',
    animate: 'opacity-100 translate-y-0',
  },
  'slide-top': {
    initial: 'opacity-0 -translate-y-full',
    animate: 'opacity-100 translate-y-0',
  },
};

export function Animate({
  children,
  preset = 'fade',
  show = true,
  delay = 0,
  duration = 200,
  className,
  onAnimationComplete,
  style,
  ...props
}: AnimateProps) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (show) {
      setMounted(true);
      const timer = setTimeout(() => {
        setActive(true);
        if (onAnimationComplete) {
          setTimeout(onAnimationComplete, duration);
        }
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setActive(false);
      const timer = setTimeout(() => setMounted(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, delay, duration, onAnimationComplete]);

  if (!mounted && !show) return null;

  const currentPreset = presets[preset];

  return (
    <div
      className={cn(
        'transition-all ease-out',
        active ? currentPreset.animate : currentPreset.initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
