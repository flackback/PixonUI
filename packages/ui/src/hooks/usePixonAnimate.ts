import { useRef, useCallback, useSyncExternalStore, useEffect } from 'react';
import type { 
  SpringConfig, 
  SpringType} from '../utils/motion';
import { 
  prepareKeyframes, 
  compileSpringKeyframes, 
  captureElementState, 
  sanitizeEasing,
  getSpringVelocityAt,
  elementStateRegistry,
  normalizeTimeMs,
} from '../utils/motion';
import { ensureTransformChannels, supportsTypedCustomProperties, type TransformChannel } from '../motion/transformChannels';
import { prepareChannelKeyframes } from '../motion/keyframes';
import { tweenCustomProperties } from '../motion/varTween';

const STYLE_RESET_SKIP_PROPS = new Set(['transform', 'filter', 'backdropFilter', 'backdrop-filter']);

function sanitizeRuntimeKeyframe(kf: Keyframe): Keyframe {
  const out: Record<string, any> = {};
  for (const key of Object.keys(kf || {})) {
    const value = (kf as any)[key];
    if (value === undefined || value === null) continue;
    if (key === 'transform' || key === 'filter' || key === 'backdropFilter' || key === 'backdrop-filter') {
      const text = typeof value === 'string' ? value.trim() : String(value).trim();
      out[key] = text === '' ? 'none' : text;
      continue;
    }
    out[key] = value;
  }
  return out as Keyframe;
}

export interface PixonAnimateOptions extends Omit<KeyframeAnimationOptions, 'easing'> {
  /** Accepts WAAPI easing strings or a cubic-bezier tuple `[x1,y1,x2,y2]` (Framer-like). */
  easing?: string | number[];
  spring?: SpringConfig & { velocity?: number };
  springType?: SpringType;
  /** Whether to stack this animation on top of others using WAAPI additive compositing */
  additive?: boolean;
  onComplete?: () => void;
  /** Use CSS variable transform channels instead of animating `transform` directly. */
  transformMode?: 'transform' | 'channels';
  /** Target transform channel (only used when transformMode = 'channels'). */
  channel?: TransformChannel;
}

export interface UsePixonAnimateReturn<T extends HTMLElement = HTMLDivElement> {
  ref: React.RefObject<T>;
  animate: (keyframes: any, options?: PixonAnimateOptions) => Animation | null;
  isAnimating: boolean;
  pause: () => void;
  play: () => void;
  cancel: () => void;
  pulse: (scale?: number) => Animation | null;
  shake: (distance?: number) => Animation | null;
  jelly: () => Animation | null;
}

// Global store to track animation state without React render loops
// V4.7 Supreme: Using WeakMap to prevent memory leaks for unmounted elements
const animationStateStore = new WeakMap<HTMLElement, { activeCount: number; subscribers: Set<() => void> }>();

function getStore(el: HTMLElement) {
  if (!animationStateStore.has(el)) {
    animationStateStore.set(el, { activeCount: 0, subscribers: new Set() });
  }
  return animationStateStore.get(el)!;
}

function updateStore(el: HTMLElement, nextIsAnimating: boolean) {
  const store = getStore(el);
  const prevIsAnimating = store.activeCount > 0;
  store.activeCount = nextIsAnimating ? Math.max(1, store.activeCount) : 0;
  const nowIsAnimating = store.activeCount > 0;
  if (prevIsAnimating !== nowIsAnimating) store.subscribers.forEach(s => s());
}

function bumpStore(el: HTMLElement, delta: number) {
  const store = getStore(el);
  const prevIsAnimating = store.activeCount > 0;
  store.activeCount = Math.max(0, store.activeCount + delta);
  const nowIsAnimating = store.activeCount > 0;
  if (prevIsAnimating !== nowIsAnimating) store.subscribers.forEach(s => s());
}

/**
 * usePixonAnimate V4.7 Supreme
 * Features: Velocity-Aware Interruption, Additive Compositing, and Memory Sanitization.
 */
export function usePixonAnimate<T extends HTMLElement = HTMLDivElement>(): UsePixonAnimateReturn<T> {
  const ref = useRef<T | null>(null);
  const animRef = useRef<Animation | null>(null);
  const channelMainRef = useRef<Map<TransformChannel, Animation>>(new Map());
  const activeAnimsRef = useRef<Set<Animation>>(new Set());
  const varTweensRef = useRef<Map<Animation, { cancel: () => void }>>(new Map());
  const activeElementRef = useRef<T | null>(null);
  const lastInterruption = useRef<{ time: number, velocity: number }>({ time: 0, velocity: 0 });

  // Reactive subscription to the external state store
  const isAnimating = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      const el = ref.current;
      if (!el) return () => {};
      const store = getStore(el);
      store.subscribers.add(onStoreChange);
      return () => store.subscribers.delete(onStoreChange);
    }, []),
    () => (ref.current ? getStore(ref.current).activeCount > 0 : false),
    () => false // SSR
  );

  useEffect(() => {
    return () => {
      const el = activeElementRef.current || ref.current;
      // Cancel everything we created for this element (including additive ones).
      activeAnimsRef.current.forEach((a) => {
        try { a.cancel(); } catch { /* noop */ }
      });
      varTweensRef.current.forEach((t) => {
        try { t.cancel(); } catch { /* noop */ }
      });
      varTweensRef.current.clear();
      activeAnimsRef.current.clear();
      animRef.current = null;
      if (el) {
        updateStore(el, false);
        try { el.style.willChange = ''; } catch { /* noop */ }
      }
      activeElementRef.current = null;
    };
  }, []);

  const cancel = useCallback(() => {
    const el = ref.current;
    const mains: Animation[] = [];
    if (animRef.current) mains.push(animRef.current);
    channelMainRef.current.forEach((a) => mains.push(a));

    // De-dupe
    const unique = Array.from(new Set(mains));
    for (const a of unique) {
      // V4.7 Velocity Extraction Logic (only meaningful for the "primary" animation).
      if (a === animRef.current && a.playState === 'running' && a.currentTime !== null) {
        const p = (a.currentTime as number) / ((a.effect?.getTiming().duration as number) || 400);
        lastInterruption.current = { time: performance.now(), velocity: (1 - p) * 10 };
      }

      try { if (a.playState === 'running' && el) a.commitStyles(); } catch { /* noop */ }
      try { a.cancel(); } catch { /* noop */ }
      const vt = varTweensRef.current.get(a);
      if (vt) {
        try { vt.cancel(); } catch { /* noop */ }
        varTweensRef.current.delete(a);
      }
      if (activeAnimsRef.current.delete(a) && el) bumpStore(el, -1);
    }

    animRef.current = null;
    channelMainRef.current.clear();
    if (el && getStore(el).activeCount === 0) {
      try { el.style.willChange = ''; } catch { /* noop */ }
    }
  }, []);

  const animate = useCallback((kfs: any, opts: PixonAnimateOptions = {}): Animation | null => {
    const el = ref.current;
    if (!el) return null;
    activeElementRef.current = el;

    // Determine if this should be additive (stacking) or standard (replacing)
    const isAdditive = opts.additive || opts.composite === 'add';
    // Remove synchronous cancel() to allow WAAPI native smooth replacement

    const { spring, springType, transformMode = 'transform', channel = 'base', ...waapi } = opts;

    const wantsChannels = transformMode === 'channels';
    const canTypedVars = wantsChannels && supportsTypedCustomProperties();
    const usingChannels = wantsChannels && canTypedVars;

    if (wantsChannels) {
      ensureTransformChannels();
      try { el.classList.add('px-transform'); } catch { /* noop */ }
    }

    let finalKfs = wantsChannels ? prepareChannelKeyframes(kfs, channel) : prepareKeyframes(kfs);
    
    // V4.7 Supreme: Prepend current state if there's a delay to ensure 'fill: both' holds the start state
    if (waapi.delay && finalKfs.length === 1) {
      const currentState = captureElementState(el, Object.keys(finalKfs[0]!));
      finalKfs = [currentState, finalKfs[0]!];
    }

    let dur = normalizeTimeMs(waapi.duration ?? 400, 400, { prop: 'duration', source: 'usePixonAnimate' });
    let easing = waapi.easing ?? 'elite-out';
    const normalizedDelay = normalizeTimeMs(waapi.delay ?? 0, 0, { prop: 'delay', source: 'usePixonAnimate' });
    const normalizedEndDelay = normalizeTimeMs((waapi as any).endDelay ?? 0, 0, { prop: 'endDelay', source: 'usePixonAnimate' });
    
    // Auto-capture starting state if missing
    if (finalKfs.length === 1 && !isAdditive) {
      finalKfs = [captureElementState(el, Object.keys(finalKfs[0] as Keyframe)), finalKfs[0] as Keyframe];
    }

    finalKfs = finalKfs.map((kf) => sanitizeRuntimeKeyframe(kf as Keyframe));
    
    // Apply Momentum-Aware Spring Physics
    if (spring && finalKfs.length >= 2) {
      const initialVelocity = opts.spring?.velocity ?? lastInterruption.current.velocity;
      const lastKeyframe = finalKfs[finalKfs.length - 1] as Keyframe;
      const { keyframes: sKeys, duration: sDur } = compileSpringKeyframes(
        finalKfs[0] as Keyframe, 
        lastKeyframe as Keyframe, 
        { ...spring, velocity: initialVelocity }, 
        springType
      );
      dur = sDur;
      easing = 'linear';
      finalKfs = sKeys;
      lastInterruption.current.velocity = 0; // Reset after consumption
    }
    
    const prevMain = (!isAdditive
      ? (wantsChannels ? (channelMainRef.current.get(channel) ?? null) : animRef.current)
      : null);
    
    const targetProps = Object.keys(finalKfs[0] as Keyframe);
    const compositorProps = targetProps.filter(p => ['transform', 'opacity', 'filter', 'backdrop-filter'].includes(p));
    
    const styleTarget = el as any;
    if (styleTarget instanceof HTMLElement || styleTarget instanceof SVGElement) {
      targetProps.forEach(p => {
        if (STYLE_RESET_SKIP_PROPS.has(p)) return;
        const style = styleTarget.style as any;
        if (isNaN(Number(p)) && p in style && style[p] !== '') style[p] = '';
      });
    }
    
    const sanitizedEasing = sanitizeEasing(easing);

    // Fallback: browsers without typed custom properties can't animate CSS vars via WAAPI.
    // We run a tiny rAF tween for the vars and optionally a WAAPI animation for non-var props.
    let varTween: ReturnType<typeof tweenCustomProperties> | null = null;
    let a: Animation | null = null;

    if (wantsChannels && !usingChannels) {
      const hasVars = (finalKfs as any[]).some((kf) => Object.keys(kf || {}).some((k) => k.startsWith('--')));
      if (hasVars) {
        const delayMs = normalizedDelay;
        const iters = typeof waapi.iterations === 'number' ? waapi.iterations : 1;
        varTween = tweenCustomProperties(el as any, finalKfs as any, {
          duration: dur,
          delay: delayMs,
          easing: sanitizedEasing,
          iterations: iters,
          direction: (waapi.direction as any) ?? 'normal',
          fill: (waapi.fill as any) ?? 'both',
        });
      }

      const stripVars = (kf: any) => {
        const out: any = {};
        for (const k of Object.keys(kf || {})) {
          if (!k.startsWith('--')) out[k] = kf[k];
        }
        return out;
      };
      const nonVarKfs = (finalKfs as any[]).map(stripVars);
      const hasNonVar = nonVarKfs.some((kf) => Object.keys(kf || {}).length > 0);

      if (hasNonVar) {
        a = el.animate(nonVarKfs as Keyframe[], {
          fill: 'both',
          composite: isAdditive ? 'add' : (opts.composite ?? 'replace'),
          ...waapi,
          duration: dur,
          delay: normalizedDelay,
          endDelay: normalizedEndDelay,
          easing: sanitizedEasing,
        });
      } else {
        // Timer-only WAAPI animation so callers can await `.finished`.
        a = el.animate([{ opacity: 1 }, { opacity: 1 }], {
          fill: 'both',
          ...waapi,
          duration: dur,
          delay: normalizedDelay,
          endDelay: normalizedEndDelay,
          easing: 'linear',
        });
      }
    } else {
      a = el.animate(finalKfs as Keyframe[], {
        fill: 'both',
        composite: isAdditive ? 'add' : (opts.composite ?? 'replace'),
        ...waapi,
        duration: dur,
        delay: normalizedDelay,
        endDelay: normalizedEndDelay,
        easing: sanitizedEasing,
      });
    }

    if (!a) return null;
    if (varTween) varTweensRef.current.set(a, varTween);

    // V4.7 Supreme: Update global registry with final target to avoid DOM reads in next cycle
    const finalState = finalKfs[finalKfs.length - 1] as Keyframe;
    const cached = elementStateRegistry.get(el);
    if (cached) Object.assign(cached, finalState);
    else elementStateRegistry.set(el, { ...finalState });

    activeAnimsRef.current.add(a);
    bumpStore(el, +1);

    // Hint compositor only when needed, and keep it while any animation is running.
    if (compositorProps.length > 0) {
      try { el.style.willChange = compositorProps.join(', '); } catch { /* noop */ }
    }

    if (!isAdditive) {
      if (wantsChannels) channelMainRef.current.set(channel, a);
      else animRef.current = a;
      // Replace semantics: cancel previous main animation after the new one is created
      // to avoid piling up running WAAPI instances on hover-in/out storms.
      if (prevMain && prevMain !== a) {
        try { if (prevMain.playState === 'running') prevMain.commitStyles(); } catch { /* noop */ }
        try { prevMain.cancel(); } catch { /* noop */ }
        if (activeAnimsRef.current.delete(prevMain)) bumpStore(el, -1);
      }
    }

    const finalize = (completed: boolean) => {
      if (!activeAnimsRef.current.has(a)) return;
      activeAnimsRef.current.delete(a);
      bumpStore(el, -1);
      if (wantsChannels) {
        if (channelMainRef.current.get(channel) === a) channelMainRef.current.delete(channel);
      } else {
        if (animRef.current === a) animRef.current = null;
      }
      const vt = varTweensRef.current.get(a);
      if (vt) {
        if (!completed) {
          try { vt.cancel(); } catch { /* noop */ }
        }
        varTweensRef.current.delete(a);
      }
      if (completed && opts.onComplete) opts.onComplete();
      if (getStore(el).activeCount === 0) {
        try { el.style.willChange = ''; } catch { /* noop */ }
      }
    };

    const done = varTween ? a.finished.then(() => varTween.finished) : a.finished;
    done.then(() => finalize(true)).catch(() => finalize(false));
    
    return a;
  }, [cancel]);

  const p = (n: any, k: string) => typeof n === 'number' ? n : n?.[k];

  return {
    ref, 
    animate, 
    isAnimating,
    pause: () => animRef.current?.pause(),
    play: () => animRef.current?.play(),
    cancel,
    pulse: (s = 1.05) => animate([{ transform: 'scale(1)' }, { transform: `scale(${p(s,'scale')})` }], { spring: { stiffness: 300, damping: 10 }, springType: 'impulse' }),
    shake: (d = 4) => animate([{ transform: 'translateX(0)' }, { transform: `translateX(-${p(d,'distance')}px)` }], { spring: { stiffness: 500, damping: 20 }, springType: 'impulse' }),
    jelly: () => animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.2,.8)' }], { spring: { stiffness: 400, damping: 12 }, springType: 'impulse' }),
  };
}
