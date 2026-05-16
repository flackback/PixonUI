import { useRef, useCallback, useSyncExternalStore, useEffect } from 'react';
import { 
  SpringConfig, 
  SpringType, 
  prepareKeyframes, 
  compileSpringKeyframes, 
  captureElementState, 
  sanitizeEasing,
  getSpringVelocityAt,
  elementStateRegistry
} from '../utils/motion';

export interface PixonAnimateOptions extends KeyframeAnimationOptions {
  spring?: SpringConfig & { velocity?: number };
  springType?: SpringType;
  /** Whether to stack this animation on top of others using WAAPI additive compositing */
  additive?: boolean;
  onComplete?: () => void;
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
  const activeAnimsRef = useRef<Set<Animation>>(new Set());
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
        try { a.cancel(); } catch {}
      });
      activeAnimsRef.current.clear();
      animRef.current = null;
      if (el) {
        updateStore(el, false);
        try { el.style.willChange = ''; } catch {}
      }
      activeElementRef.current = null;
    };
  }, []);

  const cancel = useCallback(() => {
    if (animRef.current) {
      const a = animRef.current;
      // V4.7 Velocity Extraction Logic
      if (a.playState === 'running' && a.currentTime !== null) {
        // Simple heuristic: distance-based velocity estimate for the next spring
        const p = (a.currentTime as number) / (a.effect?.getTiming().duration as number || 400);
        lastInterruption.current = { time: performance.now(), velocity: (1 - p) * 10 }; 
      }
      
      try { if (a.playState === 'running' && ref.current) a.commitStyles(); } catch(e){}
      // Cancel the current "main" animation.
      try { a.cancel(); } catch(e){}
      const wasActive = activeAnimsRef.current.delete(a);
      animRef.current = null;
      if (wasActive && ref.current) {
        bumpStore(ref.current, -1);
        if (getStore(ref.current).activeCount === 0) {
          try { ref.current.style.willChange = ''; } catch {}
        }
      }
    }
  }, []);

  const animate = useCallback((kfs: any, opts: PixonAnimateOptions = {}): Animation | null => {
    const el = ref.current;
    if (!el) return null;
    activeElementRef.current = el;

    // Determine if this should be additive (stacking) or standard (replacing)
    const isAdditive = opts.additive || opts.composite === 'add';
    // Remove synchronous cancel() to allow WAAPI native smooth replacement

    const { spring, springType, ...waapi } = opts;
    let finalKfs = prepareKeyframes(kfs);
    
    // V4.7 Supreme: Prepend current state if there's a delay to ensure 'fill: both' holds the start state
    if (waapi.delay && finalKfs.length === 1) {
      const currentState = captureElementState(el, Object.keys(finalKfs[0]!));
      finalKfs = [currentState, finalKfs[0]!];
    }

    let dur = waapi.duration ?? 400;
    let easing = waapi.easing ?? 'elite-out';
    
    // Auto-capture starting state if missing
    if (finalKfs.length === 1 && !isAdditive) {
      finalKfs = [captureElementState(el, Object.keys(finalKfs[0] as Keyframe)), finalKfs[0] as Keyframe];
    }
    
    // Apply Momentum-Aware Spring Physics
    if (spring && finalKfs.length >= 2) {
      const initialVelocity = opts.spring?.velocity ?? lastInterruption.current.velocity;
      const { keyframes: sKeys, duration: sDur } = compileSpringKeyframes(
        finalKfs[0] as Keyframe, 
        finalKfs.at(-1) as Keyframe, 
        { ...spring, velocity: initialVelocity }, 
        springType
      );
      dur = sDur;
      easing = 'linear';
      finalKfs = sKeys;
      lastInterruption.current.velocity = 0; // Reset after consumption
    }
    
    const prevMain = (!isAdditive ? animRef.current : null);
    
    const targetProps = Object.keys(finalKfs[0] as Keyframe);
    const compositorProps = targetProps.filter(p => ['transform', 'opacity', 'filter', 'backdrop-filter'].includes(p));
    
    const styleTarget = el as any;
    if (styleTarget instanceof HTMLElement || styleTarget instanceof SVGElement) {
      targetProps.forEach(p => {
        const style = styleTarget.style as any;
        if (isNaN(Number(p)) && p in style && style[p] !== '') style[p] = '';
      });
    }
    
    const a = el.animate(finalKfs as Keyframe[], { 
      fill: 'both', 
      composite: isAdditive ? 'add' : (opts.composite ?? 'replace'),
      ...waapi,
      duration: dur, 
      easing: sanitizeEasing(easing), 
    });

    // V4.7 Supreme: Update global registry with final target to avoid DOM reads in next cycle
    const finalState = finalKfs.at(-1) as Keyframe;
    const cached = elementStateRegistry.get(el) || {};
    elementStateRegistry.set(el, { ...cached, ...finalState });

    activeAnimsRef.current.add(a);
    bumpStore(el, +1);

    // Hint compositor only when needed, and keep it while any animation is running.
    if (compositorProps.length > 0) {
      try { el.style.willChange = compositorProps.join(', '); } catch {}
    }

    if (!isAdditive) {
      animRef.current = a;
      // Replace semantics: cancel previous main animation after the new one is created
      // to avoid piling up running WAAPI instances on hover-in/out storms.
      if (prevMain && prevMain !== a) {
        try { if (prevMain.playState === 'running') prevMain.commitStyles(); } catch {}
        try { prevMain.cancel(); } catch {}
        if (activeAnimsRef.current.delete(prevMain)) bumpStore(el, -1);
      }
    }

    const finalize = (completed: boolean) => {
      if (!activeAnimsRef.current.has(a)) return;
      activeAnimsRef.current.delete(a);
      bumpStore(el, -1);
      if (animRef.current === a) animRef.current = null;
      if (completed && opts.onComplete) opts.onComplete();
      if (getStore(el).activeCount === 0) {
        try { el.style.willChange = ''; } catch {}
      }
    };

    a.finished.then(() => finalize(true)).catch(() => finalize(false));
    
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
