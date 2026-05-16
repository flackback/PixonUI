import React, { useRef, useMemo, useCallback, useEffect, useLayoutEffect, useContext } from 'react';
import { usePixonAnimate, type PixonAnimateOptions } from '../../hooks/usePixonAnimate';
import { useScroll, useSpring as useMotionSpring, useTransform } from '../../motion/hooks';
import { PresenceContext } from './AnimatePresence';
import { VariantContext } from './VariantContext';
import { LayoutGroupContext } from './LayoutGroup';
import { 
  captureElementState, 
  calcFlip, 
  calculateStagger, 
  normalizeTimeMs,
  Transition,
  Target,
  shouldTrigger,
  elementStateRegistry
} from '../../utils/motion';
import { applyStyleObject, applyStyleObjectImmediate } from '../../motion/applyStyles';
import {
  revealOnScroll as createRevealOnScrollPreset,
  parallax as createParallaxPreset,
  staggerChildren as createStaggerChildrenPreset,
  type ParallaxOptions,
  type RevealOnScrollOptions,
  type StaggerChildrenOptions,
} from '../../motion/presets';

type AnimateOwnProps<T extends React.ElementType = 'div'> = {
  layoutId?: string; layout?: boolean | 'position' | 'size'; custom?: any;
  variants?: Record<string, any>; initial?: Target; animate?: Target; exit?: Target;
  whileHover?: Target; whileTap?: Target; whileInView?: Target;
  revealOnScroll?: boolean | RevealOnScrollOptions;
  parallax?: boolean | ParallaxOptions;
  staggerChildren?: boolean | StaggerChildrenOptions;
  viewport?: { once?: boolean; root?: any; rootMargin?: string; amount?: 'some' | 'all' | number; };
  transition?: Transition; as?: T; onAnimationComplete?: (definition: string) => void;
  children?: React.ReactNode; style?: Record<string, any>; className?: string;
  id?: string;
  staggerIdx?: number;
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

function stripTransformishStyle(style?: React.CSSProperties | undefined) {
  if (!style) return style;
  const out: any = {};
  for (const k of Object.keys(style)) {
    if (!TRANSFORMISH_PROPS.has(k)) out[k] = (style as any)[k];
  }
  return out as React.CSSProperties;
}

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
/**
 * @deprecated Use `motion.*` (ex: `motion.div`) as the primary API.
 * This wrapper will be removed after the next major release.
 */
export const PixonMotion = React.forwardRef(<T extends React.ElementType = 'div'>(
  { as, children, initial, animate: targetAnimate, exit, variants, transition, whileHover, whileTap, whileInView, revealOnScroll, parallax, staggerChildren, viewport, layout, layoutId, onAnimationComplete, staggerIdx: propStaggerIdx, ...props }: AnimateProps<T> & { staggerIdx?: number },
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
  const styleCleanupRef = useRef<null | (() => void)>(null);
  const inheritedIndexRef = useRef<number | null>(null);
  const localChildCounterRef = useRef(0);
  const prevAnimateRef = useRef<any>(targetAnimate || vCtx?.animate);

  if (inheritedIndexRef.current === null) {
    inheritedIndexRef.current = vCtx?.registerChild ? vCtx.registerChild() : 0;
  }

  const contextAnimate = targetAnimate || vCtx?.animate;
  if (prevAnimateRef.current !== contextAnimate) {
    localChildCounterRef.current = 0;
    prevAnimateRef.current = contextAnimate;
  }

  const revealCfgKey = useMemo(() => JSON.stringify(revealOnScroll ?? null), [revealOnScroll]);
  const revealCfg = useMemo(() => {
    if (!revealOnScroll) return null;
    return createRevealOnScrollPreset(typeof revealOnScroll === 'object' ? revealOnScroll : {});
  }, [revealCfgKey]);

  const staggerPresetKey = useMemo(() => JSON.stringify(staggerChildren ?? null), [staggerChildren]);
  const staggerPreset = useMemo(() => {
    if (!staggerChildren) return null;
    return createStaggerChildrenPreset(typeof staggerChildren === 'object' ? staggerChildren : {});
  }, [staggerPresetKey]);

  const parallaxCfgKey = useMemo(() => JSON.stringify(parallax ?? null), [parallax]);
  const parallaxCfg = useMemo(() => {
    if (!parallax) return null;
    return createParallaxPreset(typeof parallax === 'object' ? parallax : {});
  }, [parallaxCfgKey]);

  const { scrollXProgress, scrollYProgress } = useScroll({ enabled: !!parallaxCfg });
  const parallaxRange = useMemo<[number, number]>(() => {
    if (!parallaxCfg) return [0, 0];
    return [parallaxCfg.range[0], parallaxCfg.range[1]];
  }, [parallaxCfg]);

  const parallaxRaw = useTransform(
    parallaxCfg?.axis === 'x' ? scrollXProgress : scrollYProgress,
    [0, 1],
    parallaxRange
  );
  const parallaxSpringCfg = useMemo(() => parallaxCfg?.smooth ?? {}, [parallaxCfg]);
  const parallaxSmooth = useMotionSpring(parallaxRaw, parallaxSpringCfg);
  const parallaxMv = parallaxCfg?.smooth ? parallaxSmooth : parallaxRaw;
  const parallaxStyle = useMemo(() => {
    if (!parallaxCfg) return null;
    return parallaxCfg.axis === 'x' ? ({ x: parallaxMv } as const) : ({ y: parallaxMv } as const);
  }, [parallaxCfg, parallaxMv]);

  useEffect(() => {
    if (!parallaxCfg) return;
    if (parallaxCfg.source === 'container') {
      console.warn('[Pixon Motion] `parallax.source: "container"` currently falls back to page scroll in `motion.*`.');
    }
  }, [parallaxCfg]);

  const resolvedInitial = useMemo<Target | undefined>(() => {
    if (initial !== undefined) return initial;
    if (!revealCfg) return initial;
    return { opacity: 0, y: revealCfg.distance, scale: revealCfg.scale } as Target;
  }, [initial, revealCfg]);

  const resolvedWhileInView = useMemo<Target | undefined>(() => {
    if (whileInView !== undefined) return whileInView;
    if (!revealCfg) return whileInView;
    return { opacity: 1, y: 0, scale: 1 } as Target;
  }, [whileInView, revealCfg]);

  const resolvedViewport = useMemo(() => {
    if (!revealCfg) return viewport;
    return {
      once: revealCfg.once,
      amount: revealCfg.amount,
      rootMargin: revealCfg.rootMargin,
      ...(viewport || {}),
    };
  }, [viewport, revealCfg]);

  const resolvedTransition = useMemo<Transition | undefined>(() => {
    const base: Transition = {
      ...(staggerPreset ? {
        staggerChildren: staggerPreset.stagger,
        delayChildren: staggerPreset.delayChildren,
        staggerFrom: staggerPreset.from,
        staggerGrid: staggerPreset.grid,
      } : {}),
      ...(revealCfg ? {
        duration: revealCfg.duration,
        easing: revealCfg.easing,
        delay: revealCfg.delay,
      } : {}),
      ...(transition || {}),
    };
    return Object.keys(base).length > 0 ? base : undefined;
  }, [transition, revealCfg, staggerPreset]);

  // V4.7 Supreme: Prop & Callback Stabilization
  const stableTransition = useMemo(() => JSON.stringify(resolvedTransition), [resolvedTransition]);
  const stableTarget = useMemo(() => JSON.stringify(targetAnimate), [targetAnimate]);
  const latestProps = useRef({ onAnimationComplete, variants, transition });
  latestProps.current = { onAnimationComplete, variants, transition: resolvedTransition };

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

  // Element-local stagger index must win over inherited context index.
  // Otherwise siblings that pass `staggerIdx` collapse to the same index (usually 0).
  const staggerIdx = propStaggerIdx ?? inheritedIndexRef.current ?? vCtx?.index ?? 0;

  const trigger = useCallback((propTarget: any, label = 'animate', force: boolean | Partial<Transition> = false) => {
    const el = internalRef.current;
    const resolved = resolve(propTarget);
    if (!el || !resolved) return null;

    // Framer-like targets may include `transition` inside the target object.
    // This key is metadata and must not be treated as an animatable CSS prop.
    const inlineTransition =
      resolved && typeof resolved === 'object' && !Array.isArray(resolved)
        ? (resolved as any).transition
        : undefined;
    const target =
      resolved && typeof resolved === 'object' && !Array.isArray(resolved)
        ? Object.fromEntries(Object.entries(resolved).filter(([k]) => k !== 'transition'))
        : resolved;
    if (!target || (typeof target === 'object' && Object.keys(target).length === 0)) return null;

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
      ? {
          ...(typeof currentTransition === 'object' && currentTransition ? currentTransition : {}),
          ...(inlineTransition && typeof inlineTransition === 'object' ? inlineTransition : {}),
          ...force
        }
      : {
          ...(typeof currentTransition === 'object' && currentTransition ? currentTransition : {}),
          ...(inlineTransition && typeof inlineTransition === 'object' ? inlineTransition : {}),
        };
    const resolveDelayMs = (delayVal: any, prop = 'delay') => {
      if (typeof delayVal === 'function') {
        const out = delayVal(staggerIdx);
        return normalizeTimeMs(out, 0, { prop, source: 'motion.transition' });
      }
      return normalizeTimeMs(delayVal ?? 0, 0, { prop, source: 'motion.transition' });
    };

    const resolveStaggerMs = (transitionConfig: any) => {
      const inheritedStaggerChildren = vCtx?.staggerChildren;
      const inheritedDelayChildren = vCtx?.delayChildren;
      const inheritedFrom = vCtx?.staggerFrom;
      const inheritedGrid = vCtx?.staggerGrid;

      const amount = transitionConfig?.staggerChildren ?? inheritedStaggerChildren ?? 0;
      const delayChildren = transitionConfig?.delayChildren ?? inheritedDelayChildren ?? 0;
      const from = transitionConfig?.staggerFrom ?? inheritedFrom ?? 'first';
      const grid = transitionConfig?.staggerGrid ?? inheritedGrid;
      const totalChildren = Math.max(1, vCtx?.totalChildren ?? 1);

      return calculateStagger(staggerIdx, totalChildren, {
        delay: delayChildren,
        amount,
        from,
        grid,
      });
    };
    const targetProps = Object.keys(target);
    const wantsAdditive = label === 'whileHover' || label === 'whileTap';
    const channel: PixonAnimateOptions['channel'] =
      label === 'layout' ? 'layout' : wantsAdditive ? 'gesture' : 'base';
    
    // V4.7 Supreme: Intelligent Property Batching
    // Only split if properties have explicit individual transitions
    const sharedTransition = typeof effectiveTransition === 'object' && Object.keys(effectiveTransition).every(k => !targetProps.includes(k));
    
    if (sharedTransition) {
      const stag = resolveStaggerMs(effectiveTransition);
      const opts: PixonAnimateOptions = {
        duration: normalizeTimeMs(effectiveTransition?.duration ?? 400, 400, { prop: 'duration', source: 'motion.transition' }),
        delay: resolveDelayMs(effectiveTransition?.delay, 'delay') + stag,
        easing: effectiveTransition?.easing || 'elite-out',
        spring: effectiveTransition?.type === 'spring'
          ? { stiffness: effectiveTransition.stiffness, damping: effectiveTransition.damping, mass: effectiveTransition.mass, velocity: (effectiveTransition as any).velocity }
          : undefined,
        iterations: effectiveTransition?.repeat === Infinity ? Infinity : (effectiveTransition?.repeat || 1),
        direction: effectiveTransition?.repeatType === 'mirror' ? 'alternate' : 'normal',
        endDelay: normalizeTimeMs(effectiveTransition?.repeatDelay ?? 0, 0, { prop: 'repeatDelay', source: 'motion.transition' }),
        additive: false,
        transformMode: 'channels',
        channel,
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
      const stag = resolveStaggerMs(propTrans);
      
      const opts: PixonAnimateOptions = {
        duration: normalizeTimeMs(propTrans?.duration ?? 400, 400, { prop: `${prop}.duration`, source: 'motion.transition' }),
        delay: resolveDelayMs(propTrans?.delay, `${prop}.delay`) + stag,
        easing: propTrans?.easing || effectiveTransition?.easing || 'elite-out',
        spring: propTrans?.type === 'spring'
          ? { stiffness: propTrans.stiffness, damping: propTrans.damping, mass: propTrans.mass, velocity: (propTrans as any).velocity }
          : undefined,
        iterations: propTrans?.repeat === Infinity ? Infinity : (propTrans?.repeat || 1),
        direction: propTrans?.repeatType === 'mirror' ? 'alternate' : 'normal',
        endDelay: normalizeTimeMs(propTrans?.repeatDelay ?? 0, 0, { prop: `${prop}.repeatDelay`, source: 'motion.transition' }),
        additive: false,
        transformMode: 'channels',
        channel,
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
        ...resolve(resolvedInitial || vCtx?.initial), 
        ...resolve(targetAnimate || vCtx?.animate) 
      };
      if (Object.keys(seed).length > 0) {
        const cached = elementStateRegistry.get(el) || {};
        elementStateRegistry.set(el, { ...seed, ...cached });
      }
    }
  }, [resolvedInitial, targetAnimate, vCtx?.initial, vCtx?.animate, resolve]);

  // Initial styles: avoid passing transform shorthands to React `style`.
  const initialStyles = useMemo(() => stripTransformishStyle(props.style as any), [props.style]);

  // Apply transform-channel styles (MotionValues + shorthands) without React re-renders.
  useIsomorphicLayoutEffect(() => {
    const el = internalRef.current as any;
    if (!el) return;

    styleCleanupRef.current?.();
    const merged = {
      ...(resolve(resolvedInitial || vCtx?.initial) || {}),
      ...(parallaxStyle || {}),
      ...(props.style || {}),
    };
    const applied = applyStyleObject(el, merged as any, 'base');
    styleCleanupRef.current = applied.cleanup;

    return () => {
      styleCleanupRef.current?.();
      styleCleanupRef.current = null;
    };
  }, [props.style, resolvedInitial, vCtx?.initial, resolve, parallaxStyle]);

  // Main Animation Trigger & Controller Subscription
  useEffect(() => {
    if (!isPresent) return;
    
    // Support for useAnimationControls
    if (targetAnimate && typeof targetAnimate === 'object' && '_subscribe' in targetAnimate) {
      const subscriber = (t: any, trans: any) => {
        // Resolve function targets using staggerIdx
        const resolvedTarget = typeof t === 'function' ? t(staggerIdx) : t;
        if (trans && typeof trans === 'object' && (trans as any).__instant) {
          const el = internalRef.current as any;
          if (el && resolvedTarget && typeof resolvedTarget === 'object') {
            applyStyleObjectImmediate(el, resolvedTarget, 'base');
          }
          return Promise.resolve(null);
        }
        return trigger(resolvedTarget, 'animate', trans || true);
      };
      (subscriber as any)._idx = staggerIdx;
      return (targetAnimate as any)._subscribe(subscriber);
    }

    const rAnim = resolve(targetAnimate || vCtx?.animate);
    if (rAnim && !resolvedWhileInView) trigger(rAnim, 'animate');
  }, [isPresent, stableTarget, vCtx?.animate, trigger, resolvedWhileInView]);

  // Reactive Interaction: Listen to parent
  useEffect(() => {
    if (vCtx?.interactive && variants?.[vCtx.interactive]) {
      trigger(variants[vCtx.interactive], vCtx.interactive);
    } else if (
      !vCtx?.interactive &&
      (activeLabel.current === 'whileHover' || activeLabel.current === 'whileTap')
    ) {
      // Revert only transient gesture states (hover/tap) to base state.
      // Do not reset whileInView on parent re-renders, otherwise elements
      // can jump back to `initial` (e.g. opacity: 0) while scrolling.
      const rAnim = resolve(targetAnimate || vCtx?.animate) || resolve(resolvedInitial || vCtx?.initial);
      if (rAnim) trigger(rAnim, 'animate', true);
    }
  }, [vCtx?.interactive, trigger, targetAnimate, resolvedInitial]);

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
        const rAnim = resolve(targetAnimate || vCtx?.animate) || resolve(resolvedInitial || vCtx?.initial);
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
  }, [whileHover, whileTap, trigger, resolve, targetAnimate, vCtx?.animate, resolvedInitial, vCtx?.initial]);

  // Interaction: InView (Lazy)
  useEffect(() => {
    if (!resolvedWhileInView || !internalRef.current || hasInViewTriggered.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        trigger(resolve(resolvedWhileInView), 'whileInView');
        if (resolvedViewport?.once) {
          hasInViewTriggered.current = true;
          observer.disconnect();
        }
      } else if (!resolvedViewport?.once) {
        trigger(resolve(resolvedInitial || vCtx?.initial), 'initial');
      }
    }, {
      root: resolvedViewport?.root,
      rootMargin: resolvedViewport?.rootMargin,
      threshold: resolvedViewport?.amount === 'all' ? 1 : (typeof resolvedViewport?.amount === 'number' ? resolvedViewport.amount : 0.1),
    });

    observer.observe(internalRef.current);
    return () => observer.disconnect();
  }, [resolvedWhileInView, resolvedViewport, trigger, resolvedInitial, vCtx?.initial]);

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
        initial: resolvedInitial || vCtx?.initial,
        animate: targetAnimate || vCtx?.animate,
        exit: exit || vCtx?.exit,
        interactive: activeInteractionRef.current || vCtx?.interactive,
        index: staggerIdx,
        staggerChildren: resolvedTransition?.staggerChildren ?? vCtx?.staggerChildren,
        delayChildren: resolvedTransition?.delayChildren ?? vCtx?.delayChildren,
        staggerFrom: (resolvedTransition as any)?.staggerFrom ?? vCtx?.staggerFrom,
        staggerGrid: (resolvedTransition as any)?.staggerGrid ?? vCtx?.staggerGrid,
        totalChildren: React.Children.count(children),
        registerChild: () => {
          const next = localChildCounterRef.current;
          localChildCounterRef.current += 1;
          return next;
        }
      }}>
        {children}
      </VariantContext.Provider>
    </Component>
  );
}) as <T extends React.ElementType = 'div'>(props: AnimateProps<T> & { ref?: React.ForwardedRef<any> }) => React.ReactElement;

type MotionComponent<K extends keyof React.JSX.IntrinsicElements> = React.ForwardRefExoticComponent<
  AnimateProps<K> & React.RefAttributes<any>
>;
type MotionProxy = { [K in keyof React.JSX.IntrinsicElements]: MotionComponent<K> };

const motionCache = new Map<string, React.ForwardRefExoticComponent<any>>();

/**
 * Primary API (Framer-like): `motion.div`, `motion.span`, `motion.svg`, etc.
 * Uses WAAPI + transform channels under the hood (no transform conflicts).
 */
export const motion: MotionProxy = new Proxy(
  {} as MotionProxy,
  {
    get(_target, key) {
      if (typeof key !== 'string') return undefined;
      // Avoid Proxy self-recursion / weird JS internals / thenables.
      if (key === 'then' || key === '__proto__' || key === 'prototype' || key === 'constructor') return undefined;
      const as = key as keyof React.JSX.IntrinsicElements;
      const cached = motionCache.get(key);
      if (cached) return cached as any;

      const MotionEl = React.forwardRef<any, any>((props, ref) => (
        <PixonMotion as={as as any} {...props} ref={ref} />
      ));
      MotionEl.displayName = `motion.${key}`;
      motionCache.set(key, MotionEl);
      return MotionEl as any;
    },
  }
);

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
        s(resolved, { __instant: true });
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
