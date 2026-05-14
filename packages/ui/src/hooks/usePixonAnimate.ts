import { useRef, useCallback, useState, useEffect } from 'react';
import { 
  SpringConfig, 
  SpringType, 
  prepareKeyframes, 
  compileSpringKeyframes, 
  captureElementState 
} from '../utils/motion';

export interface PixonAnimateOptions extends KeyframeAnimationOptions {
  /** If provided, compiles a custom physical spring instead of standard easing */
  spring?: SpringConfig;
  /** Explicitly choose solver: 'standard' (to-target) or 'impulse' (return-to-origin) */
  springType?: SpringType;
}

export interface UsePixonAnimateReturn<T extends HTMLElement = HTMLDivElement> {
  ref: React.RefObject<T>;
  /** Trigger a high-performance, WAAPI-driven spring/easing animation */
  animate: (
    keyframes: Keyframe[] | PropertyIndexedKeyframes | Record<string, any>,
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
  pulse: (scale?: number) => Animation | null;
  /** Quick elastic shake */
  shake: (distance?: number) => Animation | null;
  /** Quick organic jelly squish & stretch */
  jelly: () => Animation | null;
  /** Quick pendulum swing */
  swing: (angle?: number) => Animation | null;
  /** Quick downward drop and bounce */
  drop: (height?: number) => Animation | null;
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
      try {
        // Commit current animated styles to the element before canceling, preventing jumps!
        if (activeAnimRef.current.playState === 'running' && ref.current) {
          activeAnimRef.current.commitStyles();
        }
      } catch (e) {
        // Fallback for browsers or test environments where commitStyles is not supported
      }
      try {
        activeAnimRef.current.cancel();
      } catch (e) {}
      activeAnimRef.current = null;
      setIsAnimating(false);
    }
  }, []);

  const animate = useCallback((
    keyframes: Keyframe[] | PropertyIndexedKeyframes | Record<string, any>,
    options: PixonAnimateOptions = {}
  ): Animation | null => {
    const el = ref.current;
    if (!el) return null;

    cancel(); // Clear any previous running animations smoothly (committing current state)

    const { spring, springType, ...waapiOptions } = options;
    
    // 1. Prepare and parse keyframes (shortcuts & array expansion)
    let finalKeyframes = prepareKeyframes(keyframes);
    let finalDuration = waapiOptions.duration ?? 400;
    let finalEasing = waapiOptions.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';

    // 2. State Stability: Support single keyframe auto-capture of starting state
    if (finalKeyframes.length === 1) {
      const last = finalKeyframes[0]!;
      const first = captureElementState(el, Object.keys(last));
      finalKeyframes = [first, last];
    }

    // 3. Encapsulated Physics: Compile spring trajectory if requested
    if (spring && finalKeyframes.length >= 2) {
      const first = finalKeyframes[0]!;
      const last = finalKeyframes[finalKeyframes.length - 1]!;

      const { keyframes: springKeys, duration } = compileSpringKeyframes(
        first, 
        last, 
        spring, 
        springType
      );

      finalDuration = duration;
      finalEasing = 'linear';
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

    const handleFinish = () => setIsAnimating(false);
    const handleCancel = () => setIsAnimating(false);

    animation.addEventListener('finish', handleFinish);
    animation.addEventListener('cancel', handleCancel);

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

  const pulse = useCallback((scaleOrOptions: number | { scale?: number } = 1.1) => {
    const scale = typeof scaleOrOptions === 'number' 
      ? scaleOrOptions 
      : (scaleOrOptions?.scale ?? 1.1);

    return animate(
      [
        { transform: 'scale(1)' },
        { transform: `scale(${scale})` }
      ],
      {
        spring: { stiffness: 220, damping: 12 }, // Lively spring
        springType: 'impulse',
      }
    );
  }, [animate]);

  const shake = useCallback((distanceOrOptions: number | { distance?: number; x?: number } = 8) => {
    const distance = typeof distanceOrOptions === 'number'
      ? distanceOrOptions
      : (distanceOrOptions?.distance ?? distanceOrOptions?.x ?? 8);

    return animate(
      [
        { transform: 'translateX(0px)' },
        { transform: `translateX(-${distance}px)` }
      ],
      {
        spring: { stiffness: 450, damping: 15 }, // High frequency snappy spring
        springType: 'impulse',
      }
    );
  }, [animate]);

  const jelly = useCallback(() => {
    return animate(
      [
        { transform: 'scale(1, 1)' },
        { transform: 'scale(1.3, 0.7)' }
      ],
      {
        spring: { stiffness: 280, damping: 10 }, // Fast bouncy jelly spring
        springType: 'impulse',
      }
    );
  }, [animate]);

  const swing = useCallback((angleOrOptions: number | { angle?: number } = 25) => {
    const angle = typeof angleOrOptions === 'number'
      ? angleOrOptions
      : (angleOrOptions?.angle ?? 25);

    return animate(
      [
        { transform: 'rotate(0deg)' },
        { transform: `rotate(-${angle}deg)` }
      ],
      {
        spring: { stiffness: 180, damping: 8 }, // Bouncy decaying pendulum
        springType: 'impulse',
      }
    );
  }, [animate]);

  const drop = useCallback((heightOrOptions: number | { height?: number } = 40) => {
    const height = typeof heightOrOptions === 'number'
      ? heightOrOptions
      : (heightOrOptions?.height ?? 40);

    return animate(
      [
        { transform: 'translateY(0px)' },
        { transform: `translateY(${height}px)` }
      ],
      {
        spring: { stiffness: 200, damping: 10 }, // Damped impact spring
        springType: 'impulse',
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
    jelly,
    swing,
    drop,
  };
}
