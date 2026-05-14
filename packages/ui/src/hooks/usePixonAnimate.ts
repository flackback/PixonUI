import { useRef, useCallback, useState, useEffect } from 'react';
import { SpringConfig, SpringType, prepareKeyframes, compileSpringKeyframes, captureElementState } from '../utils/motion';

export interface PixonAnimateOptions extends KeyframeAnimationOptions {
  spring?: SpringConfig;
  springType?: SpringType;
}

export interface UsePixonAnimateReturn<T extends HTMLElement = HTMLDivElement> {
  ref: React.RefObject<T>;
  animate: (keyframes: Keyframe[] | PropertyIndexedKeyframes | Record<string, any>, options?: PixonAnimateOptions) => Animation | null;
  isAnimating: boolean;
  pause: () => void;
  play: () => void;
  reverse: () => void;
  cancel: () => void;
  pulse: (scale?: number) => Animation | null;
  shake: (distance?: number) => Animation | null;
  jelly: () => Animation | null;
  swing: (angle?: number) => Animation | null;
  drop: (height?: number) => Animation | null;
}

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
    let finalKfs = prepareKeyframes(kfs), dur = waapi.duration ?? 400, easing = waapi.easing ?? 'cubic-bezier(.16,1,.3,1)';
    if (finalKfs.length === 1) finalKfs = [captureElementState(el, Object.keys(finalKfs[0] as Keyframe)), finalKfs[0] as Keyframe];
    if (spring && finalKfs.length >= 2) {
      const { keyframes: sKeys, duration: sDur } = compileSpringKeyframes(finalKfs[0] as Keyframe, finalKfs.at(-1) as Keyframe, spring, springType);
      dur = sDur; easing = 'linear'; finalKfs = sKeys;
    }
    setIsAnimating(true);
    if (el.style) el.style.willChange = 'transform, opacity';
    const a = el.animate(finalKfs as Keyframe[], { duration: dur, easing, fill: 'forwards', composite: opts.composite ?? 'add', ...waapi });
    animRef.current = a;
    a.finished.then(() => {
      if (a.playState === 'finished' && el.isConnected) {
        a.commitStyles(); a.cancel(); if (el.style) el.style.willChange = 'auto';
        setIsAnimating(false);
      }
    }).catch(() => setIsAnimating(false));
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
