import React, { useMemo } from 'react';
import { Motion } from '../feedback/Motion';
import { useInView } from '../../hooks/useInView';
import { useTextScramble } from '../../hooks/useTextScramble';
import { cn } from '../../utils/cn';

export interface ScrambleRevealProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  text: string;
  /** Enables viewport-triggered reveal. */
  viewport?: boolean;
  /** Animate only the first time it enters the viewport. */
  once?: boolean;
  /** IntersectionObserver threshold. */
  viewportThreshold?: number;
  /** IntersectionObserver rootMargin. */
  viewportMargin?: string;
  /** Duration (ms) for the entrance motion. */
  motionDuration?: number;
  /** Duration (ms) for the scramble phase. */
  scrambleDuration?: number;
  /** Delay (ms) before starting. */
  delay?: number;
}

export function ScrambleReveal({
  text,
  viewport = true,
  once = true,
  viewportThreshold = 0.1,
  viewportMargin,
  motionDuration = 500,
  scrambleDuration = 900,
  delay = 0,
  className,
  ...props
}: ScrambleRevealProps) {
  const { ref, isInView, hasAnimated } = useInView({
    threshold: viewportThreshold,
    rootMargin: viewportMargin,
    enabled: viewport,
  });

  const shouldShow = viewport ? (once ? hasAnimated : isInView) : true;

  const scrambleEnabled = useMemo(() => shouldShow, [shouldShow]);
  const out = useTextScramble(text, scrambleDuration, scrambleEnabled);

  return (
    <span ref={ref} className={cn('inline-block', className)} {...props}>
      <Motion
        as="span"
        viewport={false}
        visible={shouldShow}
        duration={motionDuration}
        delay={delay}
        easing="apple"
        from={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
        to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        className="inline-block will-change-transform"
      >
        {out}
      </Motion>
    </span>
  );
}

export default ScrambleReveal;
