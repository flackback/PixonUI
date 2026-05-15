import React, { useEffect, useLayoutEffect, forwardRef, useState, useRef } from 'react';
import { usePixonAnimate } from '../../hooks/usePixonAnimate';
import { usePresenceContext } from './AnimatePresence';
import { useLayoutGroup } from './LayoutGroup';
import { VariantProvider, useVariantContext } from './VariantContext';
import { calcFlip } from '../../utils/motion';

type Target = string | Record<string, any>;
type Transition = { 
  type?: 'spring' | 'tween'; 
  duration?: number; 
  delay?: number; 
  stiffness?: number; 
  damping?: number; 
  mass?: number; 
  easing?: string; 
  staggerChildren?: number; 
  delayChildren?: number; 
};

export interface AnimateProps<T extends React.ElementType = 'div'> {
  /** Unique ID for shared element transitions */
  layoutId?: string; 
  /** Enable layout animations */
  layout?: boolean | 'position' | 'size'; 
  /** Custom data for variant functions */
  custom?: any;
  /** Animation variants */
  variants?: Record<string, any>; 
  /** Initial state */
  initial?: Target; 
  /** Animation target */
  animate?: Target; 
  /** Exit animation target */
  exit?: Target;
  /** Hover state target */
  whileHover?: Target; 
  /** Tap state target */
  whileTap?: Target; 
  /** Intersection target */
  whileInView?: Target;
  /** Viewport observer options */
  viewport?: { once?: boolean; root?: any; rootMargin?: string; amount?: 'some' | 'all' | number; };
  /** Transition configuration */
  transition?: Transition; 
  /** Render as a different component */
  as?: T; 
  children?: React.ReactNode; 
  style?: React.CSSProperties;
}

/**
 * PixonMotion: The core high-performance motion component.
 * Uses WAAPI for off-thread, hardware-accelerated animations.
 */
export const PixonMotion = forwardRef(<T extends React.ElementType = 'div'>(
  { layoutId, layout, custom, variants, initial, animate: targetAnimate, exit: targetExit, whileHover, whileTap, whileInView, viewport, transition, as: Component = 'div' as any, style, children, onPointerEnter, onPointerLeave, onPointerDown, onPointerUp, ...props }: AnimateProps<T> & React.ComponentPropsWithoutRef<T>, 
  forwardedRef: React.ForwardedRef<any>
) => {
  const { ref: internalRef, animate } = usePixonAnimate(), presence = usePresenceContext(), lGrp = useLayoutGroup(), vCtx = useVariantContext();
  const [staggerIdx] = useState(() => vCtx?.registerChild?.() ?? 0), [isInView, setIsInView] = useState(false);
  const last = useRef<Record<string, string>>({});

  const resolve = (v: any, cv?: any) => {
    const f = v ?? cv;
    if (typeof f === 'string' && variants) { const o = variants[f]; return typeof o === 'function' ? o(custom) : o; }
    return typeof f === 'object' ? f : undefined;
  };

  const rInit = resolve(initial, vCtx?.initial), rAnim = resolve(targetAnimate, vCtx?.animate), rExit = resolve(targetExit, vCtx?.exit), rHover = resolve(whileHover), rTap = resolve(whileTap), rInView = resolve(whileInView);

  useLayoutEffect(() => {
    const el = internalRef.current;
    if (!layoutId || !lGrp || !el) return;
    const old = lGrp.getRect(layoutId), cur = el.getBoundingClientRect();
    if (old && (old.left !== cur.left || old.top !== cur.top || old.width !== cur.width || old.height !== cur.height)) {
      const flip = calcFlip(old, cur);
      el.style.transformOrigin = 'top left';
      animate([{ transform: flip.transform }, { transform: 'none' }], { 
        duration: transition?.duration || 600, 
        easing: transition?.easing || 'elite-out',
        spring: transition?.type === 'spring' ? { stiffness: transition.stiffness, damping: transition.damping, mass: transition.mass } : undefined
      });
    }
    lGrp.setRect(layoutId, cur);
    return () => { if (internalRef.current) lGrp.setRect(layoutId, internalRef.current.getBoundingClientRect()); };
  }, [layoutId, lGrp]);

  const trigger = (t: any) => {
    if (!t || !internalRef.current) return null;
    const stag = (vCtx?.delayChildren ?? 0) * 1000 + staggerIdx * (vCtx?.staggerChildren ?? 0) * 1000;
    return animate([t], { duration: transition?.duration, delay: (transition?.delay ?? 0) * 1000 + stag, easing: transition?.easing || 'elite-out', spring: transition?.type === 'spring' ? { stiffness: transition.stiffness, damping: transition.damping, mass: transition.mass } : undefined });
  };

  useEffect(() => {
    if (!whileInView || !internalRef.current) return;
    const obs = new IntersectionObserver(([e]) => {
      setIsInView(e?.isIntersecting ?? false);
      if (e?.isIntersecting && viewport?.once) obs.unobserve(internalRef.current!);
    }, { root: viewport?.root?.current || null, rootMargin: viewport?.rootMargin, threshold: typeof viewport?.amount === 'number' ? viewport.amount : (viewport?.amount === 'all' ? .95 : .1) });
    obs.observe(internalRef.current); return () => obs.disconnect();
  }, [whileInView, viewport]);

  useEffect(() => {
    if (presence && !presence.isPresent) { if (rExit) { const a = trigger(rExit); if (a) a.onfinish = () => presence.onExitComplete?.(); else presence.onExitComplete?.(); } else presence.onExitComplete?.(); return; }
    if (rAnim && !rInView && !targetAnimate?.subscribe) {
      const k = JSON.stringify(rAnim); if (k !== last.current.anim) { trigger(rAnim); last.current.anim = k; }
    }
  }, [rAnim, rExit, presence?.isPresent]);

  const [currentStyle, setCurrentStyle] = useState<React.CSSProperties>(rInit || {});

  useLayoutEffect(() => {
    if (rInit) setCurrentStyle(rInit);
  }, [JSON.stringify(rInit)]);

  useEffect(() => {
    if (presence && !presence.isPresent) return;
    if (rInView) {
      if (isInView) { 
        const k = JSON.stringify(rInView); 
        if (k !== last.current.view) { 
          trigger(rInView); 
          last.current.view = k; 
        } 
      }
      else if (rInit && !last.current.view) {
        // Safe fallback to initial if not in view
        trigger(rInit);
      }
    }
  }, [isInView, rInView, rInit, presence?.isPresent]);

  return (
    <VariantProvider initial={initial} animate={targetAnimate} exit={targetExit} staggerChildren={transition?.staggerChildren} delayChildren={transition?.delayChildren}>
      {React.createElement(Component, {
        ...props, ref: (el: any) => { (internalRef as any).current = el; if (typeof forwardedRef === 'function') forwardedRef(el); else if (forwardedRef) (forwardedRef as any).current = el; },
        style: { ...currentStyle, ...style },
        onPointerEnter: (e: any) => { if (rHover) trigger(rHover); onPointerEnter?.(e); },
        onPointerLeave: (e: any) => { if (rHover) trigger(rAnim || rInit || {}); onPointerLeave?.(e); },
        onPointerDown: (e: any) => { if (rTap) trigger(rTap); onPointerDown?.(e); },
        onPointerUp: (e: any) => { if (rTap) trigger(rHover || rAnim || rInit || {}); onPointerUp?.(e); },
      }, children)}
    </VariantProvider>
  );
});

export class PixonAnimationControls {
  private subs = new Set<(d: any) => void>();
  private stops = new Set<() => void>();
  subscribe(cb: any, scb: any) { this.subs.add(cb); this.stops.add(scb); return () => { this.subs.delete(cb); this.stops.delete(scb); }; }
  async start(d: any) { await Promise.all(Array.from(this.subs).map(cb => cb(d))); }
  stop() { this.stops.forEach(s => s()); }
  set(d: any) { this.start(d); }
}

export const useAnimationControls = () => useState(() => new PixonAnimationControls())[0];

type HTMLMotionComponents = { [K in keyof React.JSX.IntrinsicElements]: React.ForwardRefExoticComponent<AnimateProps<K> & React.ComponentPropsWithoutRef<K>> };
export const motion = new Proxy({}, {
  get: (_, p: string) => forwardRef((pr: any, r: any) => <PixonMotion as={p} ref={r} {...pr} />)
}) as any as HTMLMotionComponents;
