import React, { useEffect, useLayoutEffect, forwardRef, useState, useRef } from 'react';
import { usePixonAnimate } from '../../hooks/usePixonAnimate';
import { SpringConfig } from '../../utils/motion';
import { usePresenceContext } from './AnimatePresence';
import { useLayoutGroup } from './LayoutGroup';
import { VariantProvider, useVariantContext } from './VariantContext';

export interface AnimateProps extends React.HTMLAttributes<HTMLDivElement> {
  layoutId?: string; layout?: boolean | 'position' | 'size'; custom?: any;
  variants?: Record<string, any>; initial?: string | Record<string, any>;
  animate?: any; exit?: string | Record<string, any>;
  whileHover?: string | Record<string, any>; whileTap?: string | Record<string, any>;
  whileInView?: string | Record<string, any>;
  viewport?: { once?: boolean; root?: any; rootMargin?: string; amount?: 'some' | 'all' | number; threshold?: number | number[]; };
  transition?: { type?: 'spring' | 'tween'; duration?: number; delay?: number; stiffness?: number; damping?: number; mass?: number; easing?: string; staggerChildren?: number; delayChildren?: number; };
  as?: any;
}

export const PixonMotion = forwardRef<HTMLElement, AnimateProps>(({ layoutId, layout, custom, variants, initial, animate: targetAnimate, exit: targetExit, whileHover, whileTap, whileInView, viewport, transition, as: Component = 'div', style, children, onPointerEnter, onPointerLeave, onPointerDown, onPointerUp, ...props }, forwardedRef) => {
  const { ref: internalRef, animate, cancel } = usePixonAnimate(), presence = usePresenceContext(), layoutGroup = useLayoutGroup(), vCtx = useVariantContext();
  const [staggerIdx] = useState(() => vCtx?.registerChild?.() ?? 0), [isInView, setIsInView] = useState(false);
  const lastAnimate = useRef<string>(''), lastInView = useRef<string>('');

  const resolve = (v: any, cv?: any) => {
    const f = v !== undefined ? v : cv;
    if (typeof f === 'string' && variants) { const o = variants[f]; return typeof o === 'function' ? o(custom) : o; }
    return typeof f === 'object' ? f : undefined;
  };

  const rInit = resolve(initial, vCtx?.initial), rAnim = resolve(targetAnimate, vCtx?.animate), rExit = resolve(targetExit, vCtx?.exit), rHover = resolve(whileHover), rTap = resolve(whileTap), rInView = resolve(whileInView);

  const setRefs = (el: HTMLElement | null) => {
    (internalRef as any).current = el;
    if (typeof forwardedRef === 'function') forwardedRef(el); else if (forwardedRef) (forwardedRef as any).current = el;
  };

  useEffect(() => {
    if (!whileInView || !internalRef.current) return;
    const obs = new IntersectionObserver(([e]) => {
      setIsInView(e?.isIntersecting ?? false);
      if (e?.isIntersecting && viewport?.once) obs.unobserve(internalRef.current!);
    }, { root: viewport?.root?.current || null, rootMargin: viewport?.rootMargin, threshold: typeof viewport?.amount === 'number' ? viewport.amount : (viewport?.amount === 'all' ? .95 : .1) });
    obs.observe(internalRef.current); return () => obs.disconnect();
  }, [whileInView, viewport]);

  const trigger = (t: any) => {
    if (!t || !internalRef.current) return null;
    const stag = (vCtx?.delayChildren ?? 0) * 1000 + staggerIdx * (vCtx?.staggerChildren ?? 0) * 1000;
    const m = { ...t };
    if (m.pathLength !== undefined) { m.strokeDasharray = '1 1'; m.strokeDashoffset = 1 - m.pathLength; delete m.pathLength; }
    return animate([m], { duration: transition?.duration, delay: (transition?.delay ?? 0) * 1000 + stag, easing: transition?.easing, spring: transition?.type === 'spring' ? { stiffness: transition.stiffness, damping: transition.damping, mass: transition.mass } : undefined });
  };

  useEffect(() => {
    if (targetAnimate?.subscribe) return targetAnimate.subscribe((d: any) => { const r = resolve(d); if (r) trigger(r); }, cancel);
  }, [targetAnimate, variants, custom]);

  useEffect(() => {
    if (presence && !presence.isPresent) { if (rExit) { const a = trigger(rExit); if (a) a.onfinish = () => presence.onExitComplete?.(); else presence.onExitComplete?.(); } else presence.onExitComplete?.(); return; }
    if (rAnim && !rInView && !targetAnimate?.subscribe) {
      const k = JSON.stringify(rAnim); if (k !== lastAnimate.current) { trigger(rAnim); lastAnimate.current = k; }
    }
  }, [rAnim, rExit, presence?.isPresent]);

  useEffect(() => {
    if (presence && !presence.isPresent) return;
    if (rInView) {
      if (isInView) { const k = JSON.stringify(rInView); if (k !== lastInView.current) { trigger(rInView); lastInView.current = k; } }
      else if (rInit) trigger(rInit);
    }
  }, [isInView, rInView, rInit]);

  const element = React.createElement(Component, {
    ...props, ref: setRefs, style: { ...rInit, ...style },
    onPointerEnter: (e: any) => { if (rHover) trigger(rHover); onPointerEnter?.(e); },
    onPointerLeave: (e: any) => { if (rHover) trigger(rAnim || rInit || {}); onPointerLeave?.(e); },
    onPointerDown: (e: any) => { if (rTap) trigger(rTap); onPointerDown?.(e); },
    onPointerUp: (e: any) => { if (rTap) trigger(rHover || rAnim || rInit || {}); onPointerUp?.(e); },
  }, children);

  return <VariantProvider initial={initial} animate={targetAnimate} exit={targetExit} staggerChildren={transition?.staggerChildren} delayChildren={transition?.delayChildren}>{element}</VariantProvider>;
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

export const motion = new Proxy({}, {
  get: (_, p) => {
    if (typeof p === 'symbol' || p === '$$typeof') return undefined;
    const C = forwardRef<HTMLElement, any>((pr, r) => <PixonMotion as={p as any} ref={r} {...pr} />);
    C.displayName = `motion.${String(p)}`; return C;
  }
}) as any;
