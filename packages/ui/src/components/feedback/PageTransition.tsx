import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

export interface PageTransitionProps extends React.HTMLAttributes<HTMLDivElement> {
  preset?: 'fade' | 'slide-up' | 'scale' | 'blur';
  duration?: number;
}

export function PageTransition({
  preset = 'fade',
  duration = 300,
  className,
  children,
  ...props
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const presets = {
    fade: {
      initial: 'opacity-0',
      animate: 'opacity-100',
    },
    'slide-up': {
      initial: 'opacity-0 translate-y-8',
      animate: 'opacity-100 translate-y-0',
    },
    scale: {
      initial: 'opacity-0 scale-95',
      animate: 'opacity-100 scale-100',
    },
    blur: {
      initial: 'opacity-0 blur-sm',
      animate: 'opacity-100 blur-0',
    },
  };

  const currentPreset = presets[preset];

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? currentPreset.animate : currentPreset.initial,
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
      {...props}
    >
      {children}
    </div>
  );
}
