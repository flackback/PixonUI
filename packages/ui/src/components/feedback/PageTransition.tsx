import React from 'react';
import { PixonSSRAnimate } from '../effects/SSRAnimate';
import { cn } from '../../utils/cn';

export interface PageTransitionProps extends React.HTMLAttributes<HTMLDivElement> {
  preset?: 'fade' | 'slide-up' | 'scale' | 'blur' | 'none';
  duration?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

export function PageTransition({
  preset = 'fade',
  duration = 300,
  as = 'div',
  className,
  children,
  ...props
}: PageTransitionProps) {
  const presets = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    'slide-up': {
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.96 },
      animate: { opacity: 1, scale: 1 },
    },
    blur: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
    },
    none: {
      initial: {},
      animate: {},
    }
  };

  const currentPreset = presets[preset];

  return (
    <PixonSSRAnimate
      initial={currentPreset.initial}
      animate={currentPreset.animate}
      transition={{ duration, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      className={cn('will-change-transform opacity-0', className)}
      as={as}
      {...props}
    >
      {children}
    </PixonSSRAnimate>
  );
}
export default PageTransition;
