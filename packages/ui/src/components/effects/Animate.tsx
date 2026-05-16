import React, { useRef, useMemo, useCallback, useEffect, useLayoutEffect, useContext } from 'react';
import { usePixonAnimate, type PixonAnimateOptions } from '../../hooks/usePixonAnimate';
import { PresenceContext } from './AnimatePresence';
import { VariantContext } from './VariantContext';
import { LayoutGroupContext } from './LayoutGroup';
import { 
  captureElementState, 
  calcFlip, 
  calculateStagger, 
  SpringConfig, 
  Transition,
  Target,
  shouldTrigger,
  elementStateRegistry
} from '../../utils/motion';

type AnimateOwnProps<T extends React.ElementType = 'div'> = {
  layoutId?: string; layout?: boolean | 'position' | 'size'; custom?: any;
  variants?: Record<string, any>; initial?: Target; animate?: Target; exit?: Target;
  whileHover?: Target; whileTap?: Target; whileInView?: Target;
  viewport?: { once?: boolean; root?: any; rootMargin?: string; amount?: 'some' | 'all' | number; };
  transition?: Transition; as?: T; onAnimationComplete?: (definition: string) => void;
  children?: React.ReactNode; style?: React.CSSProperties; className?: string;
  id?: string;
};

export type AnimateProps<T extends React.ElementType = 'div'> =
  AnimateOwnProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof AnimateOwnProps<T> | 'ref'>;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const TRANSFORMISH_PROPS = new Set([
  'transform',
  'x', 'y', 'z',
  'translateX', 'translateY', 'translateZ',
  'rotate', 'rotateX', 'rotateY', 'rotateZ',
  'scale', 'scaleX', 'scaleY', 'scaleZ',
  'skewX', 'skewY',
  'perspective',
]);

// V4.7 Supreme Singleton Batching System
const measureQueue = new WeakMap<HTMLElement, (rect: DOMRect) => void>();
// Keep track of elements in queue for iteration in processLayoutQueues
const elementsInQueue = new Set<HTMLElement>();
let rafId: number | null = null;

function processLayoutQueues() {
  if (elementsInQueue.size === 0) {
    rafId = null;
    return;
  }
  
  const elements = Array.from(elementsInQueue).filter(el => el.isConnected);
  if (elements.length === 0) {
    elementsInQueue.clear();
    rafId = null;
    return;
  }

  try {
    const rects = elements.map(el => el.getBoundingClientRect());
    elements.forEach((el, i) => {
      const cb = measureQueue.get(el);
      if (cb) cb(rects[i]!);
    });
  } catch (e) {
    console.warn('PixonUI Layout Error:', e);
  } finally {
    elementsInQueue.clear();
    rafId = null;
  }
}

function requestLayoutProcess() {
  if (rafId === null) {
    rafId = requestAnimationFrame(processLayoutQueues);
  }
}

/**
 * Pixon Animate V4.7 Supreme
 * The ultimate compositor-first animation component.
 * Features: Liquid Interruption, Additive Interactions, and Loop-Immune Layout.
 */
export const PixonMotion = React.forwardRef(<T extends React.ElementType = 'div'>(
  { as, children, initial, animate: targetAnimate, exit, variants, transition, whileHover, whileTap, whileInView, viewport, layout, layoutId, onAnimationComplete, staggerIdx: propStaggerIdx, ...props }: AnimateProps<T> & { staggerIdx?: number },
  externalRef: React.ForwardedRef<any>
) => {
  const Component = (as || 'div') as any;
  const { ref: internalRef, animate: pixonAnimate } = usePixonAnimate<any>();
  const activeInteractionRef = useRef<string | null>(null);
  const vCtx = useContext(VariantContext);
  const pCtx = useContext(PresenceContext);
  const lGrp = useContext(LayoutGroupContext);
  const isPresent = pCtx?.isPresent ?? true;
  
  const activeLabel = useRef<string | null>(null);
  const prevRect = useRef<DOMRect | null>(null);
  const layoutTriggeredRef = useRef(false);
  const lastTargetKey = useRef<string>('');
  const hasInViewTriggered = useRef(false);

  // V4.7 Supreme: Prop & Callback Stabilization
  const stableTransition = useMemo(() => JSON.stringify(transition), [transition]);
  const stableTarget = useMemo(() => JSON.stringify(targetAnimate), [targetAnimate]);
  const latestProps = useRef({ onAnimationComplete, variants, transition });
  latestProps.current = { onAnimationComplete, variants, transition };

  const resolve = useCallback((target: any) => {
    if (!target) return null;
    const { variants: currentVariants } = latestProps.current;
    if (typeof target === 'string' && currentVariants?.[target]) {
      const resolved = currentVariants[target];
      if (resolved && typeof resolved === 'object' && !Array.isArray(resolved)) {
        return { ...resolved, _variantName: target };
      }
      return resolved;
    }
    return target;
  }, []);

  const staggerIdx = vCtx?.index ?? propStaggerIdx ?? 0;

  const trigger = useCallback((propTarget: any, label = 'animate', force: boolean | Partial<Transition> = false) => {
    const el = internalRef.current;
    const target = resolve(propTarget);
    if (!el || !target) return null;

    const targetKey = (typeof target === 'string' ? target : (target._variantName || JSON.stringify(target))) + label;
    
    // V4.7 Supreme Gate: Intelligent Filtering
    const isInteractive = ['whileHover', 'whileTap', 'whileInView'].includes(label);
    const isPassive = ['animate', 'initial', 'exit'].includes(label);
    const labelChanged = activeLabel.current !== label;
    
    if (!force && label !== 'layout') {
      // Passive states are strictly stabilized UNLESS the label itself changed
      if (isPassive && !labelChanged && (lastTargetKey.current === targetKey || !shouldTrigger(el, targetKey))) return null;
      
      // Interactive states are stabilized only if redundant in the same sequence
      if (isInteractive && !labelChanged && activeLabel.current === label) return null;
    }
    
    lastTargetKey.current = targetKey;
    activeLabel.current = label;

    const { transition: currentTransition, onAnimationComplete: currentOnComplete } = latestProps.current;
    const effectiveTransition = (force && typeof force === 'object')
      ? { ...(typeof currentTransition === 'object' && currentTransition ? currentTransition : {}), ...force }
      : currentTransition;
    const targetProps = Object.keys(target);
    const wantsAdditive = label === 'whileHover' || label === 'whileTap';
    const allTransformish = targetProps.every((p) => TRANSFORMISH_PROPS.has(p));
    
    // V4.7 Supreme: Intelligent Property Batching
    // Only split if properties have explicit individual transitions
    const sharedTransition = typeof effectiveTransition === 'object' && Object.keys(effectiveTransition).every(k => !targetProps.includes(k));
    
    if (sharedTransition) {
      const stag = calculateStagger(staggerIdx, 1, (effectiveTransition as any)?.staggerChildren ? { amount: (effectiveTransition as any).staggerChildren } : {});
      const opts: PixonAnimateOptions = {
        // Framer-like API: duration/delay are in seconds
        duration: (effectiveTransition?.duration ?? 0.4) * 1000,
        delay: (effectiveTransition?.delay ?? 0) * 1000 + stag,
        easing: effectiveTransition?.easing || 'elite-out',
        spring: effectiveTransition?.type === 'spring' ? { stiffness: effectiveTransition.stiffness, damping: effectiveTransition.damping, mass: effectiveTransition.mass } : undefined,
        iterations: effectiveTransition?.repeat === Infinity ? Infinity : (effectiveTransition?.repeat || 1),
        direction: effectiveTransition?.repeatType === 'mirror' ? 'alternate' : 'normal',
        endDelay: (effectiveTransition?.repeatDelay ?? 0) * 1000,
        additive: wantsAdditive && allTransformish,
      };
      const animations = [pixonAnimate(target, opts)];
      
      if (currentOnComplete) {
        const a = animations[0];
        if (a) a.onfinish = () => {
          if (activeLabel.current === label) activeLabel.current = 'idle';
          currentOnComplete(label);
        };
      }
      return animations;
    }

    // Fallback to per-property splitting if complex transitions are defined
    const triggerProperty = (prop: string, val: any) => {
      const propTrans = (effectiveTransition as any)?.[prop] || effectiveTransition;
      const stag = calculateStagger(staggerIdx, 1, propTrans?.staggerChildren ? { amount: propTrans.staggerChildren } : {});
      
      const opts: PixonAnimateOptions = {
        // Framer-like API: duration/delay are in seconds
        duration: (propTrans?.duration ?? 0.4) * 1000,
        delay: (propTrans?.delay ?? 0) * 1000 + stag,
        easing: propTrans?.easing || effectiveTransition?.easing || 'elite-out',
        spring: propTrans?.type === 'spring' ? { stiffness: propTrans.stiffness, damping: propTrans.damping, mass: propTrans.mass } : undefined,
        iterations: propTrans?.repeat === Infinity ? Infinity : (propTrans?.repeat || 1),
        direction: propTrans?.repeatType === 'mirror' ? 'alternate' : 'normal',
        endDelay: (propTrans?.repeatDelay ?? 0) * 1000,
        additive: wantsAdditive && TRANSFORMISH_PROPS.has(prop),
      };
      
      return pixonAnimate({ [prop]: val }, opts);
    };

    const animations = targetProps.map(p => triggerProperty(p, target[p]));
    
    if (currentOnComplete) {
      const mainAnim = animations[0];
      if (mainAnim) {
        mainAnim.onfinish = () => {
          if (activeLabel.current === label) activeLabel.current = 'idle';
          currentOnComplete(label);
        };
      }
    }

    return animations;
  }, [staggerIdx, pixonAnimate, shouldTrigger]);

  // Sync internal and external refs
  useIsomorphicLayoutEffect(() => {
    if (typeof externalRef === 'function') externalRef(internalRef.current);
    else if (externalRef) externalRef.current = internalRef.current;
  }, [externalRef, internalRef]);

  // V4.7 Supreme: Aggressive State Seeding to eliminate layout thrashing
  useEffect(() => {
    const el = internalRef.current;
    if (el) {
      const seed = { 
        ...resolve(initial || vCtx?.initial), 
        ...resolve(targetAnimate || vCtx?.animate) 
      };
      if (Object.keys(seed).length > 0) {
        const cached = elementStateRegistry.get(el) || {};
        elementStateRegistry.set(el, { ...seed, ...cached });
      }
    }
  }, [initial, targetAnimate, vCtx?.initial, vCtx?.animate, resolve]);

  // Initial Styles Injection
  const initialStyles = useMemo(() => {
    const start = resolve(initial || vCtx?.initial);
    if (!start) return props.style;
    return { ...props.style, ...start };
  }, []);

  // Main Animation Trigger & Controller Subscription
  useEffect(() => {
    if (!isPresent) return;
    
    // Support for useAnimationControls
    if (targetAnimate && typeof targetAnimate === 'object' && '_subscribe' in targetAnimate) {
      const subscriber = (t: any, trans: any) => {
        // Resolve function targets using staggerIdx
        const resolvedTarget = typeof t === 'function' ? t(staggerIdx) : t;
        return trigger(resolvedTarget, 'animate', trans || true);
      };
      (subscriber as any)._idx = staggerIdx;
      return (targetAnimate as any)._subscribe(subscriber);
    }

    const rAnim = resolve(targetAnimate || vCtx?.animate);
    if (rAnim && !whileInView) trigger(rAnim, 'animate');
  }, [isPresent, stableTarget, vCtx?.animate, trigger, whileInView]);

  // Reactive Interaction: Listen to parent
  useEffect(() => {
    if (vCtx?.interactive && variants?.[vCtx.interactive]) {
      trigger(variants[vCtx.interactive], vCtx.interactive);
    } else if (!vCtx?.interactive && activeLabel.current?.startsWith('while')) {
      // Revert to base state
      const rAnim = resolve(targetAnimate || vCtx?.animate) || resolve(initial || vCtx?.initial);
      if (rAnim) trigger(rAnim, 'animate', true);
    }
  }, [vCtx?.interactive, trigger, targetAnimate, initial]);

  // V4.8 Hyper-Hover: Native Listener Pipeline to bypass React SyntheticEvents
  useEffect(() => {
    const el = internalRef.current;
    if (!el) return;

    const onEnter = () => {
      if (whileHover) {
        activeInteractionRef.current = typeof whileHover === 'string' ? whileHover : 'whileHover';
        el.style.willChange = 'transform, opacity';
        trigger(resolve(whileHover), 'whileHover');
      }
    };

    const onLeave = () => {
      activeInteractionRef.current = null;
      if (whileHover) {
        const rAnim = resolve(targetAnimate || vCtx?.animate) || resolve(initial || vCtx?.initial);
        if (rAnim) trigger(rAnim, 'animate', true);
      }
    };

    const onDown = () => {
      if (whileTap) {
        activeInteractionRef.current = typeof whileTap === 'string' ? whileTap : 'whileTap';
        trigger(resolve(whileTap), 'whileTap');
      }
    };

    const onUp = () => {
      activeInteractionRef.current = null;
      if (whileTap) trigger(resolve(targetAnimate || vCtx?.animate), 'animate', true);
    };

    if (whileHover) {
      el.addEventListener('mouseenter', onEnter, { passive: true });
      el.addEventListener('mouseleave', onLeave, { passive: true });
    }
    if (whileTap) {
      el.addEventListener('mousedown', onDown, { passive: true });
      window.addEventListener('mouseup', onUp, { passive: true });
    }

    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [whileHover, whileTap, trigger, resolve, targetAnimate, vCtx?.animate, initial, vCtx?.initial]);

  // Interaction: InView (Lazy)
  useEffect(() => {
    if (!whileInView || !internalRef.current || hasInViewTriggered.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        trigger(resolve(whileInView), 'whileInView');
        if (viewport?.once) {
          hasInViewTriggered.current = true;
          observer.disconnect();
        }
      } else if (!viewport?.once) {
        trigger(resolve(initial || vCtx?.initial), 'initial');
      }
    }, { root: viewport?.root, rootMargin: viewport?.rootMargin, threshold: viewport?.amount === 'all' ? 1 : (typeof viewport?.amount === 'number' ? viewport.amount : 0.1) });

    observer.observe(internalRef.current);
    return () => observer.disconnect();
  }, [whileInView, viewport, trigger, initial, vCtx?.initial]);

  // Exit Animation
  useEffect(() => {
    if (!isPresent && exit) {
      const animations = trigger(resolve(exit), 'exit');
      if (animations && Array.isArray(animations)) {
        Promise.all(animations.filter(Boolean).map(a => a!.finished)).finally(() => {
          pCtx?.onExitComplete?.();
        });
      } else {
        pCtx?.onExitComplete?.();
      }
    }
  }, [isPresent, exit, pCtx, trigger]);

  // V4.7 Supreme FLIP Pipeline
  const lastLayoutFrame = useRef(0);
  useIsomorphicLayoutEffect(() => {
    const el = internalRef.current;
    if (!el || !layout || typeof window === 'undefined') return;

    elementsInQueue.add(el);
    measureQueue.set(el, (cur) => {
      // V4.7 Supreme: Skip layout if currently in an interactive state to prevent jitter
      if (['whileHover', 'whileTap'].includes(activeLabel.current || '')) return;
      
      const curAbs = DOMRect.fromRect({
        x: cur.left + window.scrollX,
        y: cur.top + window.scrollY,
        width: cur.width,
        height: cur.height,
      });
      const now = performance.now();

      if (layoutId && lGrp && !layoutTriggeredRef.current) {
        const first = lGrp.getRect(layoutId);
        const owner = lGrp.getOwner(layoutId);
        if (first && owner && owner !== el && (now - lastLayoutFrame.current > 32)) {
          lastLayoutFrame.current = now;
          layoutTriggeredRef.current = true;
          const originalOpacity = owner.style.opacity;
          owner.style.opacity = '0';
          const flip = calcFlip(first, curAbs);
          el.style.transformOrigin = 'top left';
          const animations = trigger({ transform: [flip.transform, 'none'] }, 'layout');
          const a = Array.isArray(animations) ? animations.find(Boolean) : null;
          a?.finished.then(() => {
            if (el.isConnected) { el.style.transform = 'none'; el.style.transformOrigin = ''; }
            if (owner.isConnected) owner.style.opacity = originalOpacity;
            layoutTriggeredRef.current = false;
          });
        }
        lGrp.setRect(layoutId, curAbs as any);
      } else if (prevRect.current && activeLabel.current !== 'layout' && (now - lastLayoutFrame.current > 32)) {
        const first = prevRect.current;
        const dx = Math.abs(first.left - curAbs.left), dy = Math.abs(first.top - curAbs.top);
        const dw = Math.abs(first.width - curAbs.width), dh = Math.abs(first.height - curAbs.height);
        
        // Threshold check + Frame lock (Supreme Guard)
        if (dx > 1 || dy > 1 || dw > 1 || dh > 1) {
          lastLayoutFrame.current = now;
          const flip = calcFlip(first, curAbs);
          trigger({ transform: [flip.transform, 'none'] }, 'layout');
        }
      }
      prevRect.current = curAbs;
    });

    requestLayoutProcess();
    
    return () => {
      elementsInQueue.delete(el);
      const anims = (el as any).getAnimations?.() || [];
      anims.forEach((a: any) => a.cancel());
    };
  }, [layout, layoutId, lGrp, trigger]);

  return (
    <Component
      {...props}
      ref={internalRef}
      style={initialStyles}
    >
      <VariantContext.Provider value={{
        initial: initial || vCtx?.initial,
        animate: targetAnimate || vCtx?.animate,
        exit: exit || vCtx?.exit,
        interactive: activeInteractionRef.current || vCtx?.interactive,
        index: staggerIdx,
        registerChild: vCtx?.registerChild || (() => 0)
      }}>
        {children}
      </VariantContext.Provider>
    </Component>
  );
}) as <T extends React.ElementType = 'div'>(props: AnimateProps<T> & { ref?: React.ForwardedRef<any> }) => React.ReactElement;

export const motion = {
  div: (props: AnimateProps<'div'>) => <PixonMotion as="div" {...props} />,
  section: (props: AnimateProps<'section'>) => <PixonMotion as="section" {...props} />,
  nav: (props: AnimateProps<'nav'>) => <PixonMotion as="nav" {...props} />,
  header: (props: AnimateProps<'header'>) => <PixonMotion as="header" {...props} />,
  main: (props: AnimateProps<'main'>) => <PixonMotion as="main" {...props} />,
  aside: (props: AnimateProps<'aside'>) => <PixonMotion as="aside" {...props} />,
  button: (props: AnimateProps<'button'>) => <PixonMotion as="button" {...props} />,
  span: (props: AnimateProps<'span'>) => <PixonMotion as="span" {...props} />,
  a: (props: AnimateProps<'a'>) => <PixonMotion as="a" {...props} />,
  h1: (props: AnimateProps<'h1'>) => <PixonMotion as="h1" {...props} />,
  h2: (props: AnimateProps<'h2'>) => <PixonMotion as="h2" {...props} />,
  p: (props: AnimateProps<'p'>) => <PixonMotion as="p" {...props} />,
  img: (props: AnimateProps<'img'>) => <PixonMotion as="img" {...props} />,
  li: (props: AnimateProps<'li'>) => <PixonMotion as="li" {...props} />,
  ul: (props: AnimateProps<'ul'>) => <PixonMotion as="ul" {...props} />,
  // SVG Elements
  svg: (props: AnimateProps<'svg'>) => <PixonMotion as="svg" {...props} />,
  path: (props: AnimateProps<'path'>) => <PixonMotion as="path" {...props} />,
  circle: (props: AnimateProps<'circle'>) => <PixonMotion as="circle" {...props} />,
  rect: (props: AnimateProps<'rect'>) => <PixonMotion as="rect" {...props} />,
};

/**
 * useAnimationControls V4.7 Supreme
 * Centralized imperative control for complex orchestrated animations.
 */
export function useAnimationControls() {
  const subscribers = useRef(new Set<(target: any, transition?: any) => Promise<any>>());
  
  return useMemo(() => ({
    start: async (target: any, transition?: any) => {
      const promises = Array.from(subscribers.current).map(s => s(target, transition));
      return Promise.all(promises);
    },
    set: (target: any) => {
      subscribers.current.forEach(s => {
        const resolved = typeof target === 'function' ? target((s as any)._idx) : target;
        s(resolved, { duration: 0 });
      });
    },
    stop: () => {
      subscribers.current.forEach(s => s({}, { duration: 0 }));
    },
    _subscribe: (callback: any) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }
  }), []);
}
