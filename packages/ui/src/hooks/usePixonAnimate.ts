import { useRef, useCallback, useState } from 'react';
import { SpringConfig, SpringType, prepareKeyframes, compileSpringKeyframes, captureElementState, sanitizeEasing } from '../utils/motion';

export interface PixonAnimateOptions extends KeyframeAnimationOptions {
  spring?: SpringConfig & { velocity?: number };
  springType?: SpringType;
}

export interface UsePixonAnimateReturn<T extends HTMLElement = HTMLDivElement> {
  /** React ref to attach to the target element */
  ref: React.RefObject<T>;
  /** Core animation function using WAAPI */
  animate: (keyframes: Keyframe[] | PropertyIndexedKeyframes | Record<string, any>, options?: PixonAnimateOptions) => Animation | null;
  /** Whether an animation is currently playing */
  isAnimating: boolean;
  /** Pause the current animation */
  pause: () => void;
  /** Resume the current animation */
  play: () => void;
  /** Reverse the current animation */
  reverse: () => void;
  /** Cancel and commit current styles */
  cancel: () => void;
  /** Quick 'pulse' interaction */
  pulse: (scale?: number) => Animation | null;
  /** Quick 'shake' interaction */
  shake: (distance?: number) => Animation | null;
  /** Quick 'jelly' interaction */
  jelly: () => Animation | null;
  /** Quick 'swing' interaction */
  swing: (angle?: number) => Animation | null;
  /** Quick 'drop' interaction */
  drop: (height?: number) => Animation | null;
}

/**
 * usePixonAnimate: Custom hook for imperative WAAPI control.
 * Features automated memory cleanup and style committing.
 */
export function usePixonAnimate<T extends HTMLElement = HTMLDivElement>(): UsePixonAnimateReturn<T> {
  const ref = useRef<T | null>(null), animRef = useRef<Animation | null>(null), [isAnimating, setIsAnimating] = useState(false);

  const cancel = useCallback(() => {
    if (animRef.current) {
      try { if (animRef.current.playState === 'running' && ref.current) animRef.current.commitStyles(); } catch(e){}
      try { animRef.current.cancel(); } catch(e){}
      animRef.current = null; setIsAnimating(false);
    }
  }, []);

  const animate = useCallback((kfs: any, opts: PixonAnimateOptions = {}): Animation | null => {
    const el = ref.current; if (!el) return null;
    cancel();
    const { spring, springType, ...waapi } = opts;
    let finalKfs = prepareKeyframes(kfs), dur = waapi.duration ?? 400, easing = waapi.easing ?? 'elite-out';
    
    if (finalKfs.length === 1) {
      finalKfs = [captureElementState(el, Object.keys(finalKfs[0] as Keyframe)), finalKfs[0] as Keyframe];
    }
    
    if (spring && finalKfs.length >= 2) {
      const { keyframes: sKeys, duration: sDur } = compileSpringKeyframes(finalKfs[0] as Keyframe, finalKfs.at(-1) as Keyframe, spring, springType);
      dur = sDur; easing = 'linear'; finalKfs = sKeys;
    }
    
    setIsAnimating(true);
    
    // Only hint compositor-friendly properties to will-change
    const compositorProps = Object.keys(finalKfs[0] as Keyframe).filter(p => 
      ['transform', 'opacity', 'filter', 'backdrop-filter'].includes(p)
    );
    const willChangeHint = compositorProps.join(', ');
    if (el.style && willChangeHint && el.style.willChange !== willChangeHint) {
      el.style.willChange = willChangeHint;
    }
    
    const a = el.animate(finalKfs as Keyframe[], { 
      fill: 'both', 
      composite: opts.composite ?? 'replace', // Default to replace for variant stability (Supreme Fix)
      ...waapi,
      duration: dur, 
      easing: sanitizeEasing(easing), 
    });
    
    animRef.current = a;
    a.finished.then(() => {
      if (a.playState === 'finished' && el.isConnected) {
        // Only commit if this is still the active animation
        if (animRef.current === a) {
          a.commitStyles(); 
          a.cancel(); 
          // Delay resetting will-change to avoid thrashing during rapid re-animations
          setTimeout(() => {
            if (el.isConnected && (!animRef.current || animRef.current.playState === 'finished')) {
              el.style.willChange = 'auto';
            }
          }, 150);
          setIsAnimating(false);
          animRef.current = null;
        }
      }
    }).catch(() => {
      if (el.style && animRef.current === a) el.style.willChange = 'auto';
      setIsAnimating(false);
    });
    
    return a;
  }, [cancel]);

  const p = (n: any, k: string) => typeof n === 'number' ? n : n?.[k];

  return {
    ref, animate, isAnimating,
    pause: () => animRef.current?.pause(),
    play: () => animRef.current?.play(),
    reverse: () => animRef.current?.reverse(),
    cancel,
    pulse: (s = 1.1) => animate([{ transform: 'scale(1)' }, { transform: `scale(${p(s,'scale')})` }], { spring: { stiffness: 220, damping: 12 }, springType: 'impulse' }),
    shake: (d = 8) => animate([{ transform: 'translateX(0)' }, { transform: `translateX(-${p(d,'distance')}px)` }], { spring: { stiffness: 450, damping: 15 }, springType: 'impulse' }),
    jelly: () => animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.3,.7)' }], { spring: { stiffness: 280, damping: 10 }, springType: 'impulse' }),
    swing: (a = 25) => animate([{ transform: 'rotate(0)' }, { transform: `rotate(-${p(a,'angle')}deg)` }], { spring: { stiffness: 180, damping: 8 }, springType: 'impulse' }),
    drop: (h = 40) => animate([{ transform: 'translateY(0)' }, { transform: `translateY(${p(h,'height')}px)` }], { spring: { stiffness: 200, damping: 10 }, springType: 'impulse' }),
  };
}
