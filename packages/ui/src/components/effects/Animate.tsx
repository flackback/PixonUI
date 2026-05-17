import React, { useRef, useMemo, useCallback, useEffect, useLayoutEffect, useContext, useState } from 'react';
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
  drag?: boolean | 'x' | 'y';
  dragConstraints?: { top?: number; right?: number; bottom?: number; left?: number } | React.RefObject<HTMLElement | null>;
  dragElastic?: number;
  dragMomentum?: boolean;
  onDragStart?: (offset: { x: number; y: number }) => void;
  onDrag?: (state: { x: number; y: number; velocityX: number; velocityY: number; isDragging: boolean }) => void;
  onDragEnd?: (state: { x: number; y: number; velocityX: number; velocityY: number; isDragging: boolean }) => void;
  revealOnScroll?: boolean | RevealOnScrollOptions;
  parallax?: boolean | ParallaxOptions;
  staggerChildren?: boolean | StaggerChildrenOptions;
  viewport?: { once?: boolean; root?: any; rootMargin?: string; amount?: 'some' | 'all' | number; };
  transition?: Transition; as?: T; onAnimationComplete?: (definition: string) => void;
  children?: React.ReactNode; style?: Record<string, any>; className?: string;
  id?: string;
  staggerIdx?: number;
};

type DragMotionState = {
  active: boolean;
  pointerId: number | null;
  originPointerX: number;
  originPointerY: number;
  originOffsetX: number;
  originOffsetY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  lastX: number;
  lastY: number;
  lastTs: number;
  raf: number | null;
};

type DragBounds = { top?: number; right?: number; bottom?: number; left?: number };

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

function stableMotionKey(value: unknown): string {
  const seen = new WeakSet<object>();

  try {
    return JSON.stringify(value ?? null, (_key, entry) => {
      if (typeof entry === 'function') return `[function:${entry.name || 'anonymous'}]`;
      if (typeof entry === 'symbol') return entry.toString();

      if (entry && typeof entry === 'object') {
        const ElementCtor = typeof Element === 'undefined' ? null : Element;
        if (ElementCtor && entry instanceof ElementCtor) {
          return `[element:${entry.tagName.toLowerCase()}]`;
        }

        if (seen.has(entry)) return '[circular]';
        seen.add(entry);
      }

      return entry;
    }) ?? 'null';
  } catch {
    return String(value);
  }
}

function isDragConstraintRef(
  value: AnimateOwnProps['dragConstraints']
): value is React.RefObject<HTMLElement | null> {
  return !!value && typeof value === 'object' && 'current' in value;
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
 * Planned removal date: after 2026-09-30.
 */
export const PixonMotion = React.forwardRef(<T extends React.ElementType = 'div'>(
  { as, children, initial, animate: targetAnimate, exit, variants, transition, whileHover, whileTap, whileInView, drag, dragConstraints, dragElastic = 0.5, dragMomentum = true, onDragStart, onDrag, onDragEnd, revealOnScroll, parallax, staggerChildren, viewport, layout, layoutId, onAnimationComplete, staggerIdx: propStaggerIdx, ...props }: AnimateProps<T> & { staggerIdx?: number },
  externalRef: React.ForwardedRef<any>
) => {
  const Component = (as || 'div') as any;
  const { ref: internalRef, animate: pixonAnimate } = usePixonAnimate<any>();
  const [mountedNode, setMountedNode] = useState<HTMLElement | SVGElement | null>(null);
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
  const inViewStateRef = useRef<boolean | null>(null);
  const styleCleanupRef = useRef<null | (() => void)>(null);
  const inheritedIndexRef = useRef<number | null>(null);
  const localChildCounterRef = useRef(0);
  const prevAnimateRef = useRef<any>(targetAnimate || vCtx?.animate);
  const dragStateRef = useRef<DragMotionState>({
    active: false,
    pointerId: null,
    originPointerX: 0,
    originPointerY: 0,
    originOffsetX: 0,
    originOffsetY: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    lastX: 0,
    lastY: 0,
    lastTs: 0,
    raf: null,
  });
  const dragBoundsRef = useRef<DragBounds | null>(null);

  if (inheritedIndexRef.current === null) {
    inheritedIndexRef.current = vCtx?.registerChild ? vCtx.registerChild() : 0;
  }

  const contextAnimate = targetAnimate || vCtx?.animate;
  if (prevAnimateRef.current !== contextAnimate) {
    localChildCounterRef.current = 0;
    prevAnimateRef.current = contextAnimate;
  }

  const revealCfgKey = useMemo(() => stableMotionKey(revealOnScroll), [revealOnScroll]);
  const revealCfg = useMemo(() => {
    if (!revealOnScroll) return null;
    return createRevealOnScrollPreset(typeof revealOnScroll === 'object' ? revealOnScroll : {});
  }, [revealCfgKey]);

  const staggerPresetKey = useMemo(() => stableMotionKey(staggerChildren), [staggerChildren]);
  const staggerPreset = useMemo(() => {
    if (!staggerChildren) return null;
    return createStaggerChildrenPreset(typeof staggerChildren === 'object' ? staggerChildren : {});
  }, [staggerPresetKey]);

  const parallaxCfgKey = useMemo(() => stableMotionKey(parallax), [parallax]);
  const parallaxCfg = useMemo(() => {
    if (!parallax) return null;
    return createParallaxPreset(typeof parallax === 'object' ? parallax : {});
  }, [parallaxCfgKey]);

  const parallaxContainerRef = parallaxCfg?.source === 'container' ? parallaxCfg.container : undefined;
  const { scrollXProgress, scrollYProgress } = useScroll({ enabled: !!parallaxCfg, container: parallaxContainerRef });
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
  const stableTransition = useMemo(() => stableMotionKey(resolvedTransition), [resolvedTransition]);
  const stableTarget = useMemo(() => stableMotionKey(targetAnimate), [targetAnimate]);
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

  const setRefs = useCallback((node: HTMLElement | SVGElement | null) => {
    (internalRef as React.MutableRefObject<HTMLElement | SVGElement | null>).current = node;
    setMountedNode(node);
    if (typeof externalRef === 'function') externalRef(node);
    else if (externalRef) externalRef.current = node;
  }, [externalRef, internalRef]);

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

    const targetKey = (typeof target === 'string' ? target : (target._variantName || stableMotionKey(target))) + label;
    
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
      const useSpring = propTrans?.type === 'spring' && prop !== 'opacity';
      
      const opts: PixonAnimateOptions = {
        duration: normalizeTimeMs(propTrans?.duration ?? 400, 400, { prop: `${prop}.duration`, source: 'motion.transition' }),
        delay: resolveDelayMs(propTrans?.delay, `${prop}.delay`) + stag,
        easing: propTrans?.easing || effectiveTransition?.easing || 'elite-out',
        spring: useSpring
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

  const resolveDragOffset = useCallback((offsetX: number, offsetY: number, withElastic: boolean) => {
    let x = offsetX;
    let y = offsetY;

    if (drag === 'x') y = 0;
    if (drag === 'y') x = 0;

    const elastic = Math.max(0, Math.min(1, dragElastic));
    const bounds = dragBoundsRef.current;
    if (bounds) {
      if (bounds.left !== undefined && x < bounds.left) {
        x = withElastic
          ? bounds.left + (x - bounds.left) * elastic
          : bounds.left;
      }
      if (bounds.right !== undefined && x > bounds.right) {
        x = withElastic
          ? bounds.right + (x - bounds.right) * elastic
          : bounds.right;
      }
      if (bounds.top !== undefined && y < bounds.top) {
        y = withElastic
          ? bounds.top + (y - bounds.top) * elastic
          : bounds.top;
      }
      if (bounds.bottom !== undefined && y > bounds.bottom) {
        y = withElastic
          ? bounds.bottom + (y - bounds.bottom) * elastic
          : bounds.bottom;
      }
    }

    return { x, y };
  }, [drag, dragConstraints, dragElastic]);

  const writeDragOffset = useCallback((nextX: number, nextY: number) => {
    const el = internalRef.current as HTMLElement | null;
    if (!el) return;
    el.classList.add('px-transform');
    el.style.setProperty('--px-xd', `${nextX}px`);
    el.style.setProperty('--px-yd', `${nextY}px`);
  }, []);

  const computeDragBounds = useCallback((el: HTMLElement, currentX: number, currentY: number): DragBounds | null => {
    if (!dragConstraints) return null;
    if (!isDragConstraintRef(dragConstraints)) {
      return dragConstraints;
    }
    const containerEl = dragConstraints.current;
    if (!containerEl) return null;

    const containerRect = containerEl.getBoundingClientRect();
    const nodeRect = el.getBoundingClientRect();
    return {
      left: currentX + (containerRect.left - nodeRect.left),
      right: currentX + (containerRect.right - nodeRect.right),
      top: currentY + (containerRect.top - nodeRect.top),
      bottom: currentY + (containerRect.bottom - nodeRect.bottom),
    };
  }, [dragConstraints]);

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
    // Mount animation must bypass passive gate once; otherwise elements that
    // start from `initial` can remain hidden when target key caching collides.
    if (rAnim && !resolvedWhileInView) trigger(rAnim, 'animate', true);
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

  // Drag / inertia primitive (channel: drag).
  useEffect(() => {
    const el = internalRef.current as HTMLElement | null;
    if (!el || !drag) return;

    const state = dragStateRef.current;
    const momentum = dragMomentum;
    const bounce = 0.35;
    const friction = 0.92;

    const stopInertia = () => {
      if (state.raf !== null) {
        cancelAnimationFrame(state.raf);
        state.raf = null;
      }
    };

    const emit = (isDragging: boolean) => {
      onDrag?.({
        x: state.x,
        y: state.y,
        velocityX: state.vx,
        velocityY: state.vy,
        isDragging,
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      stopInertia();
      state.active = true;
      state.pointerId = event.pointerId;
      state.originPointerX = event.clientX;
      state.originPointerY = event.clientY;
      state.originOffsetX = state.x;
      state.originOffsetY = state.y;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      state.lastTs = performance.now();
      state.vx = 0;
      state.vy = 0;
      dragBoundsRef.current = computeDragBounds(el, state.x, state.y);
      activeInteractionRef.current = 'drag';
      el.style.cursor = 'grabbing';
      el.style.willChange = 'transform';
      try { el.setPointerCapture(event.pointerId); } catch {}
      onDragStart?.({ x: state.x, y: state.y });
      emit(true);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!state.active || state.pointerId !== event.pointerId) return;
      const now = performance.now();
      const dt = Math.max(1, now - state.lastTs);

      const desiredX = state.originOffsetX + (event.clientX - state.originPointerX);
      const desiredY = state.originOffsetY + (event.clientY - state.originPointerY);
      const constrained = resolveDragOffset(desiredX, desiredY, true);

      state.vx = (event.clientX - state.lastX) / dt;
      state.vy = (event.clientY - state.lastY) / dt;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      state.lastTs = now;
      state.x = constrained.x;
      state.y = constrained.y;
      writeDragOffset(state.x, state.y);
      emit(true);
    };

    const release = () => {
      state.active = false;
      state.pointerId = null;
      activeInteractionRef.current = null;
      el.style.cursor = 'grab';

      const runInertia = momentum && (Math.abs(state.vx) > 0.05 || Math.abs(state.vy) > 0.05);
      if (!runInertia) {
        onDragEnd?.({
          x: state.x,
          y: state.y,
          velocityX: state.vx,
          velocityY: state.vy,
          isDragging: false,
        });
        return;
      }

      let lastFrame = performance.now();
      const loop = () => {
        const now = performance.now();
        const dt = Math.min(32, Math.max(1, now - lastFrame));
        lastFrame = now;

        state.vx *= Math.pow(friction, dt / 16);
        state.vy *= Math.pow(friction, dt / 16);

        let nextX = state.x + state.vx * dt;
        let nextY = state.y + state.vy * dt;
        const constrained = resolveDragOffset(nextX, nextY, false);
        if (constrained.x !== nextX) state.vx *= -bounce;
        if (constrained.y !== nextY) state.vy *= -bounce;

        state.x = constrained.x;
        state.y = constrained.y;
        writeDragOffset(state.x, state.y);
        emit(false);

        if (Math.abs(state.vx) <= 0.01 && Math.abs(state.vy) <= 0.01) {
          state.raf = null;
          el.style.willChange = '';
          onDragEnd?.({
            x: state.x,
            y: state.y,
            velocityX: state.vx,
            velocityY: state.vy,
            isDragging: false,
          });
          return;
        }
        state.raf = requestAnimationFrame(loop);
      };

      state.raf = requestAnimationFrame(loop);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!state.active || state.pointerId !== event.pointerId) return;
      release();
    };

    const onPointerCancel = (event: PointerEvent) => {
      if (!state.active || state.pointerId !== event.pointerId) return;
      release();
    };

    el.style.cursor = 'grab';
    el.style.touchAction = 'none';
    writeDragOffset(state.x, state.y);
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });

    return () => {
      stopInertia();
      dragBoundsRef.current = null;
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove as any);
      window.removeEventListener('pointerup', onPointerUp as any);
      window.removeEventListener('pointercancel', onPointerCancel as any);
      el.style.willChange = '';
      if (!props.style || !(props.style as any).cursor) {
        el.style.cursor = '';
      }
      if (!props.style || !(props.style as any).touchAction) {
        el.style.touchAction = '';
      }
      if (!drag) {
        el.style.setProperty('--px-xd', '0px');
        el.style.setProperty('--px-yd', '0px');
      }
    };
  }, [drag, dragMomentum, onDragStart, onDrag, onDragEnd, resolveDragOffset, writeDragOffset, props.style]);

  // Interaction: InView (Lazy)
  useEffect(() => {
    const node = mountedNode;
    if (!resolvedWhileInView || !node || hasInViewTriggered.current) return;
    const threshold = resolvedViewport?.amount === 'all'
      ? 1
      : (typeof resolvedViewport?.amount === 'number' ? resolvedViewport.amount : 0.1);
    const activate = () => {
      if (inViewStateRef.current === true) return;
      inViewStateRef.current = true;
      trigger(resolve(resolvedWhileInView), 'whileInView', true);
    };
    const reset = () => {
      if (resolvedViewport?.once || inViewStateRef.current === false) return;
      inViewStateRef.current = false;
      trigger(resolve(resolvedInitial || vCtx?.initial), 'initial', true);
    };

    const rect = node.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const visibleY = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
    const ratio = rect.height > 0 ? visibleY / rect.height : 0;
    if (visibleY > 0 && ratio >= threshold) {
      activate();
      if (resolvedViewport?.once) {
        hasInViewTriggered.current = true;
        return () => {
          inViewStateRef.current = null;
        };
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      const isInView = !!entry?.isIntersecting;
      if (inViewStateRef.current === isInView) return;

      if (isInView) {
        activate();
        if (resolvedViewport?.once) {
          hasInViewTriggered.current = true;
          observer.disconnect();
        }
      } else {
        reset();
      }
    }, {
      root: resolvedViewport?.root,
      rootMargin: resolvedViewport?.rootMargin,
      threshold,
    });

    observer.observe(node);
    return () => {
      inViewStateRef.current = null;
      observer.disconnect();
    };
  }, [mountedNode, resolvedWhileInView, resolvedViewport, trigger, resolvedInitial, vCtx?.initial]);

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
      ref={setRefs}
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
