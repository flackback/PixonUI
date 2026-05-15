import React, { useRef, useMemo, useCallback, useEffect, useLayoutEffect, useContext } from 'react';
import { usePixonAnimate } from '../../hooks/usePixonAnimate';
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
  shouldTrigger
} from '../../utils/motion';

export interface AnimateProps<T extends React.ElementType = 'div'> {
  layoutId?: string; layout?: boolean | 'position' | 'size'; custom?: any;
  variants?: Record<string, any>; initial?: Target; animate?: Target; exit?: Target;
  whileHover?: Target; whileTap?: Target; whileInView?: Target;
  viewport?: { once?: boolean; root?: any; rootMargin?: string; amount?: 'some' | 'all' | number; };
  transition?: Transition; as?: T; onAnimationComplete?: (definition: string) => void;
  children?: React.ReactNode; style?: React.CSSProperties; className?: string;
  id?: string;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// V4.7 Supreme Singleton Batching System
const measureQueue = new Map<HTMLElement, (rect: DOMRect) => void>();
let rafId: number | null = null;

function processLayoutQueues() {
  if (measureQueue.size === 0) {
    rafId = null;
    return;
  }
  
  const elements = Array.from(measureQueue.keys()).filter(el => el.isConnected);
  if (elements.length === 0) {
    measureQueue.clear();
    rafId = null;
    return;
  }

  try {
    const rects = elements.map(el => el.getBoundingClientRect());
    elements.forEach((el, i) => {
      const cb = measureQueue.get(el);
      if (cb) cb(rects[i]);
    });
  } catch (e) {
    console.warn('PixonUI Layout Error:', e);
  } finally {
    measureQueue.clear();
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

  // Sync internal and external refs
  useIsomorphicLayoutEffect(() => {
    if (typeof externalRef === 'function') externalRef(internalRef.current);
    else if (externalRef) externalRef.current = internalRef.current;
  }, [externalRef, internalRef]);

  const resolve = useCallback((target: any) => {
    if (!target) return null;
    const { variants: currentVariants } = latestProps.current;
    if (typeof target === 'string' && currentVariants?.[target]) return currentVariants[target];
    return target;
  }, []);

  const staggerIdx = vCtx?.index ?? propStaggerIdx ?? 0;

  const trigger = useCallback((target: Record<string, any>, label = 'animate', force = false) => {
    const el = internalRef.current;
    if (!el || !target) return null;

    const targetKey = JSON.stringify(target) + label;
    
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
    const effectiveTransition = (force && typeof force === 'object') ? { ...currentTransition, ...force } : currentTransition;
    const targetProps = Object.keys(target);
    
    // V4.7 Supreme: Support for per-property transitions
    const triggerProperty = (prop: string, val: any) => {
      const propTrans = (effectiveTransition as any)?.[prop] || effectiveTransition;
      const stag = calculateStagger(staggerIdx, 1, propTrans?.staggerChildren ? { amount: propTrans.staggerChildren } : {});
      
      const opts = {
        duration: (propTrans?.duration ?? 400) * 1000,
        delay: (propTrans?.delay ?? 0) * 1000 + stag,
        easing: propTrans?.easing || effectiveTransition?.easing || 'elite-out',
        spring: propTrans?.type === 'spring' ? { stiffness: propTrans.stiffness, damping: propTrans.damping, mass: propTrans.mass } : undefined,
        iterations: propTrans?.repeat === Infinity ? Infinity : (propTrans?.repeat || 1),
        direction: propTrans?.repeatType === 'mirror' ? 'alternate' : 'normal',
        endDelay: (propTrans?.repeatDelay ?? 0) * 1000,
        additive: label === 'whileHover' || label === 'whileTap',
      };
      
      return pixonAnimate({ [prop]: val }, opts);
    };

    // If we have per-property transitions, split the trigger
    const animations = targetProps.map(p => triggerProperty(p, target[p]));
    
    // Signal completion once (heuristic: using the first one or a timeout)
    if (currentOnComplete) {
      const mainAnim = animations[0];
      if (mainAnim) mainAnim.onfinish = () => {
        if (activeLabel.current === label) activeLabel.current = 'idle';
        currentOnComplete(label);
      };
    }

    return animations[0];
  }, [pixonAnimate, stableTransition, staggerIdx]);

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

  // Interaction: Hover
  const handleMouseEnter = () => whileHover && trigger(resolve(whileHover), 'whileHover');
  const handleMouseLeave = () => {
    if (whileHover) {
      const rAnim = resolve(targetAnimate || vCtx?.animate) || resolve(initial || vCtx?.initial);
      trigger(rAnim, 'animate', true);
    }
  };

  // Interaction: Tap
  const handleMouseDown = () => whileTap && trigger(resolve(whileTap), 'whileTap');
  const handleMouseUp = () => whileTap && trigger(resolve(targetAnimate || vCtx?.animate), 'animate', true);

  // Interaction: InView
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
      const a = trigger(resolve(exit), 'exit');
      a?.finished.then(() => pCtx?.onExitComplete?.()).catch(() => pCtx?.onExitComplete?.());
    }
  }, [isPresent, exit, pCtx, trigger]);

  // V4.7 Supreme FLIP Pipeline
  const lastLayoutFrame = useRef(0);
  useIsomorphicLayoutEffect(() => {
    const el = internalRef.current;
    if (!el || !layout || typeof window === 'undefined') return;

    measureQueue.set(el, (cur) => {
      // V4.7 Supreme: Skip layout if currently in an interactive state to prevent jitter
      if (['whileHover', 'whileTap'].includes(activeLabel.current || '')) return;
      
      const curAbs = { top: cur.top + window.scrollY, left: cur.left + window.scrollX, width: cur.width, height: cur.height };
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
          const a = trigger({ transform: [flip.transform, 'none'] }, 'layout');
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
  }, [layout, layoutId, lGrp, trigger]);

  return (
    <Component
      {...props}
      ref={internalRef}
      style={initialStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
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
