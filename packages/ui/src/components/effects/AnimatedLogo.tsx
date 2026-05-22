import React from 'react';
import { Animotion } from './Animotion';
import { cn } from '../../utils/cn';
import type { AnimationStudioTrack } from './AnimationStudio.types';

export interface AnimatedLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  tracks: AnimationStudioTrack[];
  durationMs: number;
  loop?: boolean;
  autoplay?: boolean;
  yoyo?: boolean;
}

export function AnimatedLogo({
  tracks,
  durationMs,
  loop = true,
  autoplay = true,
  yoyo = false,
  className,
  children,
  ...props
}: AnimatedLogoProps) {
  const iterations = yoyo ? (loop ? Infinity : 2) : (loop ? Infinity : 1);
  const direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse' = yoyo ? 'alternate' : 'normal';

  return (
    <Animotion
      tracks={tracks}
      durationMs={durationMs}
      loop={loop}
      iterations={iterations}
      autoplay={autoplay}
      direction={direction}
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      {children}
    </Animotion>
  );
}
