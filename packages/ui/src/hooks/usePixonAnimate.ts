import { useRef, useCallback, useState, useEffect } from 'react';
import { generateSpringTrajectory, SpringConfig } from '../utils/motion';

export interface PixonAnimateOptions extends KeyframeAnimationOptions {
  /** If provided, compiles a custom physical spring instead of standard easing */
  spring?: SpringConfig;
}

export interface UsePixonAnimateReturn<T extends HTMLElement = HTMLDivElement> {
  ref: React.RefObject<T | null>;
  /** Trigger a high-performance, WAAPI-driven spring/easing animation */
  animate: (
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: PixonAnimateOptions
  ) => Animation | null;
  /** Whether an animation is currently active */
  isAnimating: boolean;
  /** Pause the active animation */
  pause: () => void;
  /** Play the active animation */
  play: () => void;
  /** Reverse the animation flow */
  reverse: () => void;
  /** Instantly cancel and clean up the animation */
  cancel: () => void;
  /** Quick premium spring-bounce pulse */
  pulse: (scale?: number) => void;
  /** Quick elastic shake */
  shake: (distance?: number) => void;
}

/**
 * Enterprise-grade custom hook for imperative, on-demand physical animations.
 * Combines WAAPI hardware performance with spring physics mathematical precision.
 * Runs 100% on the compositor thread.
 */
export function usePixonAnimate<T extends HTMLElement = HTMLDivElement>(): UsePixonAnimateReturn<T> {
  const ref = useRef<T | null>(null);
  const activeAnimRef = useRef<Animation | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const cancel = useCallback(() => {
    if (activeAnimRef.current) {
      activeAnimRef.current.cancel();
      activeAnimRef.current = null;
      setIsAnimating(false);
    }
  }, []);

  const animate = useCallback((
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: PixonAnimateOptions = {}
  ): Animation | null => {
    const el = ref.current;
    if (!el) return null;

    cancel(); // Clear any previous running animations

    const { spring, ...waapiOptions } = options;
    let finalKeyframes = keyframes;
    let finalDuration = waapiOptions.duration ?? 400;
    let finalEasing = waapiOptions.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';

    if (spring && Array.isArray(keyframes) && keyframes.length >= 2) {
      const first = keyframes[0]!;
      const last = keyframes[keyframes.length - 1]!;

      // Generate a perfect spring trajectory progress (0 to 1)
      const { progress, duration } = generateSpringTrajectory(0, 1, spring);
      finalDuration = duration;
      finalEasing = 'linear'; // Linearly interpolated spring keyframes

      // Compile spring keyframes for all animating properties
      const springKeys: Keyframe[] = [];
      const numericProps: string[] = [];

      Object.keys(last).forEach((key) => {
        if (key === 'offset' || key === 'easing') return;
        if (typeof first[key] === 'number' && typeof last[key] === 'number') {
          numericProps.push(key);
        }
      });

      // Special handling of translation and scale strings if defined
      const parseTranslateX = (v: any) => {
        if (typeof v === 'number') return v;
        const match = String(v).match(/translate3d\(([-\d.]+)px/);
        return match && match[1] ? parseFloat(match[1]) : 0;
      };

      const parseScale = (v: any) => {
        if (typeof v === 'number') return v;
        const match = String(v).match(/scale\(([-\d.]+)\)/);
        return match && match[1] ? parseFloat(match[1]) : 1;
      };

      const hasTranslate = first.transform && String(first.transform).includes('translate3d');
      const hasScale = first.transform && String(first.transform).includes('scale');

      const txStart = hasTranslate ? parseTranslateX(first.transform) : 0;
      const txEnd = hasTranslate ? parseTranslateX(last.transform) : 0;
      const scStart = hasScale ? parseScale(first.transform) : 1;
      const scEnd = hasScale ? parseScale(last.transform) : 1;

      progress.forEach((p) => {
        const key: Keyframe = {};
        numericProps.forEach((prop) => {
          const startVal = first[prop] as number;
          const endVal = last[prop] as number;
          key[prop] = startVal + (endVal - startVal) * p;
        });

        const transforms: string[] = [];
        if (hasTranslate) {
          transforms.push(`translate3d(${txStart + (txEnd - txStart) * p}px, 0, 0)`);
        }
        if (hasScale) {
          transforms.push(`scale(${scStart + (scEnd - scStart) * p})`);
        }
        if (transforms.length) {
          key.transform = transforms.join(' ');
        }

        springKeys.push(key);
      });

      finalKeyframes = springKeys;
    }

    setIsAnimating(true);
    const animation = el.animate(finalKeyframes as Keyframe[], {
      duration: finalDuration,
      easing: finalEasing,
      fill: 'forwards',
      ...waapiOptions,
    });

    activeAnimRef.current = animation;

    animation.onfinish = () => setIsAnimating(false);
    animation.oncancel = () => setIsAnimating(false);

    return animation;
  }, [cancel]);

  const pause = useCallback(() => {
    activeAnimRef.current?.pause();
  }, []);

  const play = useCallback(() => {
    activeAnimRef.current?.play();
  }, []);

  const reverse = useCallback(() => {
    activeAnimRef.current?.reverse();
  }, []);

  const pulse = useCallback((scale = 1.1) => {
    animate(
      [
        { transform: 'scale(1)' },
        { transform: `scale(${scale})` }
      ],
      {
        spring: { stiffness: 220, damping: 12 }, // Lively spring
      }
    );
  }, [animate]);

  const shake = useCallback((distance = 8) => {
    animate(
      [
        { transform: 'translate3d(0px, 0, 0)' },
        { transform: `translate3d(-${distance}px, 0, 0)` }
      ],
      {
        spring: { stiffness: 450, damping: 15 }, // High frequency snappy spring
      }
    );
  }, [animate]);

  useEffect(() => {
    return () => {
      if (activeAnimRef.current) activeAnimRef.current.cancel();
    };
  }, []);

  return {
    ref,
    animate,
    isAnimating,
    pause,
    play,
    reverse,
    cancel,
    pulse,
    shake,
  };
}
