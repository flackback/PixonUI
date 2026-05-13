import { useRef, useCallback, useState, useEffect } from 'react';
import { generateSpringTrajectory, generateSpringImpulseTrajectory, parseStyleShortcuts, parseComplexTransform, buildComplexTransform, SpringConfig } from '../utils/motion';

export interface PixonAnimateOptions extends KeyframeAnimationOptions {
  /** If provided, compiles a custom physical spring instead of standard easing */
  spring?: SpringConfig;
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
      activeAnimRef.current.cancel();
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

    const { spring, ...waapiOptions } = options;
    
    // Support array property values (multi-keyframes)
    let processedKeyframes = keyframes;
    if (!Array.isArray(keyframes) && typeof keyframes === 'object' && keyframes !== null) {
      let maxArrayLength = 0;
      const keys = Object.keys(keyframes);
      
      keys.forEach(key => {
        const val = (keyframes as Record<string, any>)[key];
        if (Array.isArray(val)) {
          maxArrayLength = Math.max(maxArrayLength, val.length);
        }
      });

      if (maxArrayLength > 0) {
        const list: Record<string, any>[] = [];
        for (let i = 0; i < maxArrayLength; i++) {
          const kf: Record<string, any> = {};
          keys.forEach(key => {
            const val = (keyframes as Record<string, any>)[key];
            if (Array.isArray(val)) {
              const index = maxArrayLength > 1 
                ? Math.min(val.length - 1, Math.round((i / (maxArrayLength - 1)) * (val.length - 1)))
                : 0;
              kf[key] = val[index];
            } else {
              kf[key] = val;
            }
          });
          list.push(kf);
        }
        processedKeyframes = list;
      }
    } else if (Array.isArray(keyframes) && keyframes.length === 1 && typeof keyframes[0] === 'object' && keyframes[0] !== null) {
      const firstKf = keyframes[0];
      const hasArrayVal = Object.values(firstKf).some(val => Array.isArray(val));
      if (hasArrayVal) {
        let maxArrayLength = 0;
        const keys = Object.keys(firstKf);
        
        keys.forEach(key => {
          const val = (firstKf as Record<string, any>)[key];
          if (Array.isArray(val)) {
            maxArrayLength = Math.max(maxArrayLength, val.length);
          }
        });

        if (maxArrayLength > 0) {
          const list: Record<string, any>[] = [];
          for (let i = 0; i < maxArrayLength; i++) {
            const kf: Record<string, any> = {};
            keys.forEach(key => {
              const val = (firstKf as Record<string, any>)[key];
              if (Array.isArray(val)) {
                const index = maxArrayLength > 1 
                  ? Math.min(val.length - 1, Math.round((i / (maxArrayLength - 1)) * (val.length - 1)))
                  : 0;
                kf[key] = val[index];
              } else {
                kf[key] = val;
              }
            });
            list.push(kf);
          }
          processedKeyframes = list;
        }
      }
    }

    // Parse shorthand style shortcuts
    let parsedKeyframes: Keyframe[] | PropertyIndexedKeyframes;
    if (Array.isArray(processedKeyframes)) {
      parsedKeyframes = processedKeyframes.map(kf => parseStyleShortcuts(kf));
    } else {
      parsedKeyframes = [parseStyleShortcuts(processedKeyframes as Record<string, any>)];
    }

    let finalKeyframes = parsedKeyframes;
    let finalDuration = waapiOptions.duration ?? 400;
    let finalEasing = waapiOptions.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';

    // Support single keyframe auto-capture of starting state from computed styles
    if (Array.isArray(finalKeyframes) && finalKeyframes.length === 1) {
      const last = finalKeyframes[0]!;
      const first: Keyframe = {};
      const computed = window.getComputedStyle(el);

      Object.keys(last).forEach((key) => {
        if (key === 'offset' || key === 'easing' || key === 'composite') return;
        if (key === 'transform') {
          first.transform = computed.transform || 'none';
        } else if (key === 'filter') {
          first.filter = computed.filter || 'none';
        } else {
          const styleVal = computed[key as any];
          if (styleVal !== undefined && styleVal !== '') {
            const num = parseFloat(styleVal);
            first[key] = isNaN(num) ? styleVal : num;
          }
        }
      });
      
      finalKeyframes = [first, last];
    }

    if (spring && Array.isArray(finalKeyframes) && finalKeyframes.length >= 2) {
      const first = finalKeyframes[0]!;
      const last = finalKeyframes[finalKeyframes.length - 1]!;

      // Determine spring solver type (standard vs impulse response for pulse/shake)
      const isImpulse = (options as any).springType === 'impulse';
      const { progress, duration } = isImpulse
        ? generateSpringImpulseTrajectory(spring)
        : generateSpringTrajectory(0, 1, spring);

      finalDuration = duration;
      finalEasing = 'linear'; // Linearly interpolated spring keyframes

      // Compile spring keyframes for all animating properties
      const springKeys: Keyframe[] = [];
      const numericProps: string[] = [];
      const otherProps: string[] = [];

      Object.keys(last).forEach((key) => {
        if (key === 'offset' || key === 'easing' || key === 'transform') return;
        const valStart = first[key];
        const valEnd = last[key];
        if (typeof valStart === 'number' && typeof valEnd === 'number') {
          numericProps.push(key);
        } else {
          otherProps.push(key);
        }
      });

      const startParsed = parseComplexTransform(first.transform as string || '');
      const endParsed = parseComplexTransform(last.transform as string || '');

      progress.forEach((p) => {
        const key: Keyframe = {};
        numericProps.forEach((prop) => {
          const startVal = first[prop] as number;
          const endVal = last[prop] as number;
          key[prop] = startVal + (endVal - startVal) * p;
        });

        const complexTransform = buildComplexTransform(startParsed, endParsed, p);
        if (complexTransform) {
          key.transform = complexTransform;
        }

        otherProps.forEach((prop) => {
          key[prop] = p < 0.5 ? first[prop] : last[prop];
        });

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
        // @ts-ignore
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
        // @ts-ignore
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
        // @ts-ignore
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
        // @ts-ignore
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
        // @ts-ignore
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
