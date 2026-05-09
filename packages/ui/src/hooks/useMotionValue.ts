import { useRef, useCallback, useState, useEffect } from 'react';

export interface UseMotionValueOptions {
  /** Initial value @default 0 */
  initial?: number;
  /** Spring stiffness for animated transitions @default 0.15 */
  stiffness?: number;
  /** Spring damping for animated transitions @default 0.8 */
  damping?: number;
}

export interface MotionValueReturn {
  /** Current interpolated value (updates on each frame) */
  value: number;
  /** Set a new target to animate towards */
  set: (target: number) => void;
  /** Jump instantly to a value without animation */
  jump: (target: number) => void;
  /** Whether the value is currently animating */
  isAnimating: boolean;
  /** The current target value */
  target: number;
}

/**
 * Hook to create a reactive, spring-animated number value.
 * Ideal for progress bars, counters, scroll-linked effects, or any
 * value that needs to smoothly transition between states.
 *
 * Uses requestAnimationFrame for buttery-smooth 60/120fps updates.
 *
 * @example
 * ```tsx
 * const progress = useMotionValue({ initial: 0 });
 *
 * // Animate to 100 on click
 * <button onClick={() => progress.set(100)}>Go!</button>
 * <div style={{ width: `${progress.value}%` }} />
 * ```
 */
export function useMotionValue(options: UseMotionValueOptions = {}): MotionValueReturn {
  const { initial = 0, stiffness = 0.15, damping = 0.8 } = options;

  const [currentValue, setCurrentValue] = useState(initial);
  const [isAnimating, setIsAnimating] = useState(false);
  const targetRef = useRef(initial);
  const velocityRef = useRef(0);
  const currentRef = useRef(initial);
  const rafRef = useRef<number>();

  const animate = useCallback(() => {
    const distance = targetRef.current - currentRef.current;
    const force = distance * stiffness;

    velocityRef.current = (velocityRef.current + force) * damping;
    currentRef.current += velocityRef.current;

    // Check if we're close enough to settle
    if (Math.abs(distance) < 0.01 && Math.abs(velocityRef.current) < 0.01) {
      currentRef.current = targetRef.current;
      setCurrentValue(targetRef.current);
      setIsAnimating(false);
      rafRef.current = undefined;
      return;
    }

    setCurrentValue(currentRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [stiffness, damping]);

  const set = useCallback((target: number) => {
    targetRef.current = target;
    if (!rafRef.current) {
      setIsAnimating(true);
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const jump = useCallback((target: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
    targetRef.current = target;
    currentRef.current = target;
    velocityRef.current = 0;
    setCurrentValue(target);
    setIsAnimating(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    value: currentValue,
    set,
    jump,
    isAnimating,
    target: targetRef.current,
  };
}
