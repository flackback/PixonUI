import { useRef, useCallback, useState } from 'react';

export interface UseAnimateReturn<T extends HTMLElement = HTMLDivElement> {
  /** Ref to attach to the target element */
  ref: React.RefObject<T | null>;
  /** Imperatively trigger a CSS keyframe animation on the element */
  animate: (
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: number | KeyframeAnimationOptions
  ) => Animation | undefined;
  /** Quick shake effect */
  shake: (intensity?: number) => void;
  /** Quick pulse/heartbeat effect */
  pulse: (scale?: number) => void;
  /** Quick attention-grabbing wiggle */
  wiggle: () => void;
  /** Quick success flash (green border glow) */
  flash: (color?: string) => void;
  /** Whether an animation is currently playing */
  isAnimating: boolean;
}

/**
 * Hook for imperative, on-demand animations using the Web Animations API.
 * Perfect for one-shot effects like shake-on-error, pulse-on-success, etc.
 *
 * @example
 * ```tsx
 * const { ref, shake, pulse } = useAnimate();
 *
 * <button onClick={pulse} ref={ref}>Click me</button>
 * <input onInvalid={shake} ref={ref} />
 * ```
 */
export function useAnimate<T extends HTMLElement = HTMLDivElement>(): UseAnimateReturn<T> {
  const ref = useRef<T | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = useCallback((
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: number | KeyframeAnimationOptions
  ): Animation | undefined => {
    const el = ref.current;
    if (!el) return undefined;

    setIsAnimating(true);
    const animation = el.animate(keyframes, options);
    animation.onfinish = () => setIsAnimating(false);
    animation.oncancel = () => setIsAnimating(false);
    return animation;
  }, []);

  const shake = useCallback((intensity = 6) => {
    animate(
      [
        { transform: 'translate3d(0, 0, 0)' },
        { transform: `translate3d(-${intensity}px, 0, 0)` },
        { transform: `translate3d(${intensity}px, 0, 0)` },
        { transform: `translate3d(-${intensity * 0.6}px, 0, 0)` },
        { transform: `translate3d(${intensity * 0.6}px, 0, 0)` },
        { transform: `translate3d(-${intensity * 0.3}px, 0, 0)` },
        { transform: 'translate3d(0, 0, 0)' },
      ],
      { duration: 500, easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)' }
    );
  }, [animate]);

  const pulse = useCallback((scale = 1.08) => {
    animate(
      [
        { transform: 'scale(1)' },
        { transform: `scale(${scale})` },
        { transform: 'scale(1)' },
      ],
      { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    );
  }, [animate]);

  const wiggle = useCallback(() => {
    animate(
      [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-3deg)' },
        { transform: 'rotate(3deg)' },
        { transform: 'rotate(-2deg)' },
        { transform: 'rotate(2deg)' },
        { transform: 'rotate(0deg)' },
      ],
      { duration: 500, easing: 'ease-in-out' }
    );
  }, [animate]);

  const flash = useCallback((color = 'rgba(34, 197, 94, 0.4)') => {
    animate(
      [
        { boxShadow: `0 0 0 0 ${color}` },
        { boxShadow: `0 0 0 6px ${color}` },
        { boxShadow: `0 0 0 0 transparent` },
      ],
      { duration: 600, easing: 'ease-out' }
    );
  }, [animate]);

  return { ref, animate, shake, pulse, wiggle, flash, isAnimating };
}
