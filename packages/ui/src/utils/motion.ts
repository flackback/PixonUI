import { CSSProperties } from 'react';

export type SpringConfig = {
  stiffness?: number;
  damping?: number;
  mass?: number;
  /** Precision threshold used to decide when the spring "settled" (smaller = longer). */
  precision?: number;
  /** Framer-style stop conditions (used for cache key + precision fallback). */
  restSpeed?: number;
  restDelta?: number;
};
export type SpringType = 'standard' | 'impulse';
export type StaggerConfig = {
  /** Base delay before the stagger starts (seconds). */
  delay?: number;
  /** Delay between steps (seconds). */
  amount?: number;
  /** Anchor point for the stagger calculation. */
  from?: 'first' | 'last' | 'center' | number;
  /** Optional grid definition for position-based staggering. */
  grid?: [columns: number, rows: number];
};

const trajectoryCache = new Map<string, { progress: number[]; keyframes: number[]; duration: number }>();
const TRAJECTORY_CACHE_MAX = 100;
// V4.7 Supreme: Unified registry for element state, interaction keys, and style caching
export const elementStateRegistry = new WeakMap<Element, Record<string, any>>();

export function shouldTrigger(el: Element, targetKey: string): boolean {
  const state = elementStateRegistry.get(el) || {};
  if (state.targetKey === targetKey) return false;
  elementStateRegistry.set(el, { ...state, targetKey, lastUpdate: Date.now() });
  return true;
}

/**
 * Pixon V4.7 Supreme Motion Utilities
 * Hardened physics, matrix decomposition, and color-aware interpolation.
 */

const UNIT_MAP: Record<string, string> = {
  rotate: 'deg', rotateX: 'deg', rotateY: 'deg', rotateZ: 'deg',
  translateX: 'px', translateY: 'px', translateZ: 'px',
  x: 'px', y: 'px',
  skewX: 'deg', skewY: 'deg', perspective: 'px'
};

export function sanitizeKeyframeProps(kf: any): Keyframe {
  const sanitized: any = {};
  Object.keys(kf).forEach(p => {
    let prop = p;
    let val = kf[p];
    
    // Map shorthands
    if (prop === 'x') prop = 'translateX';
    if (prop === 'y') prop = 'translateY';

    // V4.7 Supreme Clamping: Prevent invalid values that cause browser warnings & main-thread freezing
    if (typeof val === 'number') {
      if (['opacity', 'scale', 'scaleX', 'scaleY', 'borderRadius', 'borderWidth'].includes(prop)) {
        val = Math.max(0.0001, val); // Stay slightly above 0 to avoid some browser glitches
      }
    } else if (typeof val === 'string' && prop === 'borderRadius' && val.includes('%')) {
      const numeric = parseFloat(val);
      if (numeric < 0) val = '0%';
    }

    if (typeof val === 'number' && UNIT_MAP[prop]) {
      val = `${val}${UNIT_MAP[prop]}`;
    }
    sanitized[prop] = val;
  });
  return sanitized;
}

export function prepareKeyframes(input: any): Keyframe[] {
  if (Array.isArray(input)) return input.map(k => sanitizeKeyframeProps(typeof k === 'object' ? k : { transform: k }));
  if (typeof input === 'object') {
    const keys = Object.keys(input);
    
    // Support for property-level arrays: { scale: [1, 2], opacity: [0, 1] }
    const hasArray = keys.some(k => Array.isArray(input[k]));
    if (hasArray) {
      const maxLength = Math.max(...keys.map(k => Array.isArray(input[k]) ? input[k].length : 1));
      return Array.from({ length: maxLength }).map((_, i) => {
        const kf: any = {};
        keys.forEach(k => {
          const val = input[k];
          if (Array.isArray(val)) {
            kf[k] = val[Math.min(i, val.length - 1)];
          } else {
            kf[k] = val;
          }
        });
        return sanitizeKeyframeProps(kf);
      });
    }

    if (keys.every(k => !isNaN(Number(k)))) return Object.values(input).map(sanitizeKeyframeProps);
    return [sanitizeKeyframeProps(input)];
  }
  return [sanitizeKeyframeProps({ transform: input })];
}

export function sanitizeEasing(easing: any): string {
  if (Array.isArray(easing) && easing.length === 4) {
    return `cubic-bezier(${easing.join(', ')})`;
  }
  const presets: Record<string, string> = {
    'elite-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
    'elite-in-out': 'cubic-bezier(0.87, 0, 0.13, 1)',
    'spring-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    'soft-bounce': 'cubic-bezier(0.47, 1.64, 0.41, 0.8)',
    'easeInExpo': 'cubic-bezier(0.7, 0, 0.84, 0)',
    'easeOutExpo': 'cubic-bezier(0.16, 1, 0.3, 1)',
    'easeInOutExpo': 'cubic-bezier(0.87, 0, 0.13, 1)'
  };
  return presets[easing] || easing || 'ease';
}

/**
 * Analytical Spring Physics Engine (V4.7 Supreme)
 * Now with Velocity Derivative support for 'Infinite Momentum' transitions.
 */
export function generateSpringTrajectory(
  from: number,
  to: number,
  config: SpringConfig & { velocity?: number } = {}
): { progress: number[]; keyframes: number[]; duration: number } {
  const {
    stiffness = 170,
    damping = 26,
    mass = 1,
    precision: precisionProp = 0.0001,
    restDelta,
    restSpeed,
    velocity = 0,
  } = config;
  const precision = restDelta ?? precisionProp;
  const key = `${from}|${to}|${stiffness}|${damping}|${mass}|${precision}|${restSpeed ?? ''}|${restDelta ?? ''}|${velocity}`;
  
  if (trajectoryCache.has(key)) {
    const cached = trajectoryCache.get(key)!;
    // LRU touch: keep insertion order by moving to the end
    trajectoryCache.delete(key);
    trajectoryCache.set(key, cached);
    return cached;
  }

  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const v0 = -velocity; 
  const x0 = to - from; 

  let settleTime = 10;
  if (zeta < 1) settleTime = -Math.log(precision) / (zeta * w0);
  else settleTime = -Math.log(precision) / (w0 * (zeta - Math.sqrt(zeta * zeta - 1)));
  
  const duration = Math.max(0.1, Math.min(4.0, settleTime));
  const steps = Math.max(60, Math.min(300, Math.round(duration * 120)));
  const progress: number[] = new Array(steps + 1);

  // Closed-form solution for Damped Harmonic Oscillator
  const solve = (t: number) => {
    if (x0 === 0) return 1;
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0 * x0 + v0) / (wd * x0)) * Math.sin(wd * t));
    } else if (zeta === 1) {
      return 1 - Math.exp(-w0 * t) * (1 + (v0 + w0 * x0) * t / x0);
    } else {
      const r1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1));
      const r2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
      const c1 = (v0 - r2 * x0) / (x0 * (r1 - r2));
      const c2 = 1 - c1;
      return 1 - (c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t));
    }
  };

  for (let i = 0; i <= steps; i++) progress[i] = solve((i / steps) * duration);
  // Make the endpoints exact to avoid tiny numeric overshoots breaking consumers/tests.
  if (progress.length > 0) {
    progress[0] = 0;
    progress[progress.length - 1] = 1;
  }
  
  const result = { progress, keyframes: progress, duration: duration * 1000 };
  if (trajectoryCache.size >= TRAJECTORY_CACHE_MAX) {
    trajectoryCache.delete(trajectoryCache.keys().next().value!);
  }
  trajectoryCache.set(key, result);
  return result;
}

/**
 * Returns the instantaneous velocity at time T for a spring trajectory.
 * Used for seamless handoffs during interruption.
 */
export function getSpringVelocityAt(t: number, x0: number, v0: number, w0: number, zeta: number): number {
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const a = -zeta * w0;
    const b = (zeta * w0 * x0 + v0) / (wd * x0);
    const exp = Math.exp(a * t);
    // Derivative: v(t) = exp(at) * ( (a*cos(wdt) - wd*sin(wdt)) + b*(a*sin(wdt) + wd*cos(wdt)) )
    return exp * ((a * Math.cos(wd * t) - wd * Math.sin(wd * t)) + b * (a * Math.sin(wd * t) + wd * Math.cos(wd * t))) * x0;
  }
  return 0; // Simplified for overdamped
}

export function interpolateString(f: string, t: string, p: number, propName?: string): string {
  // Color Detection (Hex, RGB, RGBA, HSL)
  const isColor = (s: string) => s.startsWith('#') || s.startsWith('rgb') || s.startsWith('hsl');
  if (isColor(f) && isColor(t)) {
    const parse = (s: string) => {
      if (s.startsWith('#')) {
        const h = s.slice(1);
        const r = parseInt(h.length === 3 ? h[0]!+h[0]! : h.slice(0, 2), 16);
        const g = parseInt(h.length === 3 ? h[1]!+h[1]! : h.slice(2, 4), 16);
        const b = parseInt(h.length === 3 ? h[2]!+h[2]! : h.slice(4, 6), 16);
        return [r, g, b, 1];
      }
      const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/) || 
                s.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
      return m ? [parseFloat(m[1]!), parseFloat(m[2]!), parseFloat(m[3]!), parseFloat(m[4] ?? '1')] : [0, 0, 0, 1];
    };
    const [c1a, c1b, c1c, a1] = parse(f);
    const [c2a, c2b, c2c, a2] = parse(t);
    const isHsl = f.includes('hsl');
    const a = (c1a! + (c2a! - c1a!) * p);
    const b = (c1b! + (c2b! - c1b!) * p);
    const c = (c1c! + (c2c! - c1c!) * p);
    const alpha = (a1! + (a2! - a1!) * p).toFixed(3);
    return isHsl 
      ? `hsla(${Math.round(a)}, ${Math.round(b)}%, ${Math.round(c)}%, ${alpha})`
      : `rgba(${Math.round(a)}, ${Math.round(b)}, ${Math.round(c)}, ${alpha})`;
  }

  const re = /-?\d*\.?\d+/g, m1 = f.match(re), m2 = t.match(re);
  if (!m1 || !m2) return p < .5 ? f : t;
  
  const numbers: string[] = [];
  const shouldClamp = propName && ['opacity', 'scale', 'borderRadius', 'borderWidth'].some(x => propName.includes(x));

  for (let k = 0; k < Math.max(m1.length, m2.length); k++) {
    const s = parseFloat(m1[k] ?? '0'), target = parseFloat(m2[k] ?? '0');
    let v = s + (target - s) * p;
    if (shouldClamp) v = Math.max(0, v);
    numbers.push(v % 1 === 0 ? v.toString() : v.toFixed(5));
  }

  let cursor = 0;
  return t.replace(re, () => numbers[cursor++] || '0');
}

export function parseComplexTransform(str: string): Record<string, { val: number; unit: string }[]> {
  if (!str || str === 'none') return {};
  const result: Record<string, { val: number; unit: string }[]> = {};
  
  if (str.startsWith('matrix')) {
    const m = str.match(/matrix\((.+)\)/)?.[1]?.split(',').map(n => parseFloat(n.trim()));
    if (m && m.length === 6) {
      result.translateX = [{ val: m[4]!, unit: 'px' }];
      result.translateY = [{ val: m[5]!, unit: 'px' }];
      const sX = Math.sqrt(m[0]!**2 + m[1]!**2), sY = Math.sqrt(m[2]!**2 + m[3]!**2);
      result.scale = [{ val: sX, unit: '' }, { val: sY, unit: '' }];
      result.rotate = [{ val: Math.atan2(m[1]!, m[0]!) * (180/Math.PI), unit: 'deg' }];
      return result;
    }
  }

  const regex = /(\w+)\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const [_, name, rawArgs] = match;
    const args = rawArgs!.split(',').map(a => ({ val: parseFloat(a.trim()), unit: a.trim().replace(/[0-9.-]/g, '') }));
    result[name!] = args;
  }
  return result;
}

const TRANSFORM_ORDER = ['translate', 'translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY'];

export function buildComplexTransform(start: any, end: any, p: number): string {
  return TRANSFORM_ORDER.map(k => {
    const s = start[k], e = end[k];
    if (!s && !e) return '';
    const isScale = k.startsWith('scale');
    const count = Math.max((s?.length || 0), (e?.length || 0), (k.includes('3d') ? 3 : 1));
    const args = [];
    for (let j = 0; j < count; j++) {
      const sV = s?.[j] || { val: isScale ? 1 : 0, unit: '' }, eV = e?.[j] || { val: isScale ? 1 : 0, unit: '' };
      const val = sV.val + (eV.val - sV.val) * p;
      args.push(`${val % 1 === 0 ? val : val.toFixed(5)}${eV.unit || sV.unit}`);
    }
    return `${k}(${args.join(', ')})`;
  }).filter(Boolean).join(' ');
}

export function calcFlip(first: any, last: any) {
  const dx = first.left - last.left, dy = first.top - last.top;
  const dw = first.width / last.width, dh = first.height / last.height;
  return { transform: `translate(${dx}px, ${dy}px) scale(${dw}, ${dh})` };
}

export function captureElementState(el: Element, props: string[]): Keyframe {
  const state: Keyframe = {};
  const cached = elementStateRegistry.get(el);
  
  // V4.7 Supreme: Use cache first to prevent layout-inducing getComputedStyle calls
  if (cached) {
    props.forEach(p => {
      if (cached[p] !== undefined) state[p] = cached[p];
    });
  }

  const anims = (el as any).getAnimations?.() || [];
  anims.forEach((a: any) => {
    if (a.effect instanceof KeyframeEffect) {
      const kf = a.effect.getKeyframes().at(-1);
      if (kf) props.forEach(p => kf[p] !== undefined && (state[p] = kf[p]));
    }
  });

  // If we still have missing props, we MUST query computedStyle (unavoidable)
  const missing = props.filter(p => state[p] === undefined);
  if (missing.length > 0) {
    const s = getComputedStyle(el);
    missing.forEach(p => {
      const val = s.getPropertyValue(p) || (s as any)[p] || (el as any).getAttribute?.(p);
      if (typeof val === 'string' && /^-?\d*\.?\d+(px|%|em|rem|vh|vw|deg|rad|turn)?$/.test(val)) {
        state[p] = parseFloat(val);
      } else {
        state[p] = val;
      }
    });
  }

  // Update cache with combined state
  elementStateRegistry.set(el, { ...(cached || {}), ...state });
  return state;
}

export function compileSpringKeyframes(first: Keyframe, last: Keyframe, spring: SpringConfig & { velocity?: number }, type: SpringType = 'standard') {
  const { progress, duration } = type === 'impulse' ? generateSpringImpulseTrajectory(spring) : generateSpringTrajectory(0, 1, spring);
  const sT = parseComplexTransform(first.transform as string || ''), eT = parseComplexTransform(last.transform as string || '');
  
  // Ensure numeric props are actually numbers to avoid string concatenation NaN
  const numeric = Object.keys(last).filter(k => {
    if (['offset', 'easing', 'transform', 'composite'].includes(k)) return false;
    return typeof last[k] === 'number';
  });

  const morph = Object.keys(last).filter(k => typeof last[k] === 'string' && k !== 'transform' && (last[k] as string).match(/\d/));

  return {
    duration,
    keyframes: progress.map(p => {
      const k: Keyframe = {};
      numeric.forEach(prop => {
        const s = typeof first[prop] === 'string' ? parseFloat(first[prop] as string) || 0 : (first[prop] as number) || 0;
        const e = last[prop] as number;
        let val = s + (e - s) * p;
        if (['opacity', 'scale', 'borderRadius', 'borderWidth'].some(x => prop.includes(x))) val = Math.max(0.0001, val);
        k[prop] = val;
      });
      morph.forEach(prop => k[prop] = interpolateString(first[prop] as string || '', last[prop] as string, p, prop));
      k.transform = buildComplexTransform(sT, eT, p);
      return k;
    })
  };
}

export function generateSpringImpulseTrajectory(config: SpringConfig) {
  return generateSpringTrajectory(0, 1, { ...config, velocity: 10 });
}

export function cachedSpringKeyframes(opts: any = {}) {
  const { from = 0, to = 1, stiffness = 170, damping = 26, mass = 1, restSpeed, restDelta, precision, velocity } = opts;
  return generateSpringTrajectory(from, to, { stiffness, damping, mass, restSpeed, restDelta, precision, velocity });
}

export function parseStyleShortcuts(style: Record<string, any>): Record<string, any> {
  const result: any = { ...style };
  const transforms: string[] = [];
  if (style.x !== undefined) transforms.push(`translateX(${typeof style.x === 'number' ? `${style.x}px` : style.x})`);
  if (style.y !== undefined) transforms.push(`translateY(${typeof style.y === 'number' ? `${style.y}px` : style.y})`);
  if (style.scale !== undefined) transforms.push(`scale(${style.scale})`);
  if (style.rotate !== undefined) transforms.push(`rotate(${typeof style.rotate === 'number' ? `${style.rotate}deg` : style.rotate})`);

  if (transforms.length > 0) {
    // Avoid passing non-standard shorthand props (or numeric rotate) to WAAPI.
    delete result.x;
    delete result.y;
    delete result.scale;
    delete result.rotate;

    // Merge with any explicit transform the user provided.
    const existing = typeof result.transform === 'string' ? result.transform : '';
    result.transform = [existing, transforms.join(' ')].filter(Boolean).join(' ').trim();
  }
  return result;
}

export function insertScopedRules(scopeId: string, css: string): () => void {
  if (typeof document === 'undefined') return () => {};

  pixonScopedCss.set(scopeId, css);
  rebuildPixonSheet();

  return () => {
    pixonScopedCss.delete(scopeId);
    if (pixonScopedCss.size === 0) {
      clearStyles();
    } else {
      rebuildPixonSheet();
    }
  };
}

/**
 * Calculates the stagger delay based on index and total count.
 * V4.7 Supreme: Supports center-based and numeric offset staggers.
 */
export function calculateStagger(index: number, total: number, config: StaggerConfig = {}): number {
  const { delay = 0, amount = 0.05, from = 'first', grid } = config;
  let offset = 0;

  if (grid && grid[0] > 0) {
    const [cols, rows] = grid;
    const col = index % cols;
    const row = Math.floor(index / cols);

    let anchorCol = 0;
    let anchorRow = 0;

    if (from === 'first') {
      anchorCol = 0;
      anchorRow = 0;
    } else if (from === 'last') {
      const anchorIndex = Math.max(0, total - 1);
      anchorCol = anchorIndex % cols;
      anchorRow = Math.floor(anchorIndex / cols);
    } else if (from === 'center') {
      // True geometric center (works even when the last row is incomplete).
      anchorCol = (cols - 1) / 2;
      anchorRow = (rows - 1) / 2;
    } else if (typeof from === 'number') {
      const anchorIndex = Math.max(0, Math.min(total - 1, from));
      anchorCol = anchorIndex % cols;
      anchorRow = Math.floor(anchorIndex / cols);
    }

    // Position-based staggering (Euclidean distance) to create radial/diagonal waves.
    const dx = col - anchorCol;
    const dy = row - anchorRow;
    offset = Math.sqrt(dx * dx + dy * dy);
  } else {
    if (from === 'first') offset = index;
    else if (from === 'last') offset = total - 1 - index;
    else if (from === 'center') offset = Math.abs((total - 1) / 2 - index);
    else if (typeof from === 'number') offset = Math.abs(from - index);
  }

  return (delay + offset * amount) * 1000;
}

export type Target = Record<string, any> | string;
export type Transition = {
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

export function clearSpringCache() { trajectoryCache.clear(); }

let pixonSheetTag: HTMLStyleElement | null = null;
const pixonScopedCss = new Map<string, string>();

function getPixonSheetTag(): HTMLStyleElement | null {
  if (typeof document === 'undefined') return null;
  if (pixonSheetTag && pixonSheetTag.isConnected) return pixonSheetTag;

  const existing = document.querySelector('style[data-pixon-sheet]') as HTMLStyleElement | null;
  if (existing) {
    pixonSheetTag = existing;
    return existing;
  }

  const style = document.createElement('style');
  style.setAttribute('data-pixon-sheet', '');
  document.head.appendChild(style);
  pixonSheetTag = style;
  return style;
}

function rebuildPixonSheet() {
  const tag = getPixonSheetTag();
  if (!tag) return;

  const blocks: string[] = [];
  for (const [id, css] of pixonScopedCss.entries()) {
    blocks.push(`/* ${id} */\n${css}`);
  }
  tag.textContent = blocks.join('\n');
}

export function clearStyles() {
  pixonScopedCss.clear();
  if (pixonSheetTag && pixonSheetTag.parentNode) {
    try { pixonSheetTag.parentNode.removeChild(pixonSheetTag); } catch {}
  }
  pixonSheetTag = null;
}

export function startPixonTransition(
  update: () => void | Promise<void>,
  options: { duration?: number, easing?: string } = {}
) {
  if (typeof document === 'undefined') {
    update();
    return Promise.resolve();
  }

  const prefersReduced =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)')?.matches;

  if (prefersReduced) {
    update();
    return Promise.resolve();
  }

  if ((document as any).startViewTransition) {
    return (document as any).startViewTransition(update).finished;
  }

  // Fallback: simple overlay crossfade without cloning DOM nodes.
  const duration = options.duration ?? 180;
  const easing = options.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';

  const overlay = document.createElement('div');
  overlay.setAttribute('data-pixon-transition-overlay', '');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,0)',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '2147483647',
    transition: `opacity ${duration}ms ${easing}`,
  } as CSSStyleDeclaration);

  document.body.appendChild(overlay);

  return new Promise<void>((resolve) => {
    let phase: 'in' | 'out' = 'in';

    const cleanup = () => {
      overlay.removeEventListener('transitionend', onEnd);
      try { overlay.remove(); } catch {}
      resolve();
    };

    const onEnd = async () => {
      if (phase === 'in') {
        phase = 'out';
        try { await update(); } catch {}
        requestAnimationFrame(() => {
          overlay.style.opacity = '0';
        });
        return;
      }
      cleanup();
    };

    overlay.addEventListener('transitionend', onEnd);
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
  });
}

export interface TimelineTrack {
  target: any;
  keyframes: any;
  options?: PixonAnimateOptions;
  /** Duration in ms (convenience). */
  duration?: number;
  at?: number | string;
}

export function timeline(tracks: TimelineTrack[] = [], options: any = {}) {
  // Minimal timeline controller for WAAPI (matches tests + provides imperative control).
  const resolvedTracks = [...tracks];

  return {
    play() {
      const animations: Animation[] = [];

      resolvedTracks.forEach((track) => {
        const el = typeof track.target === 'string' ? document.querySelector(track.target) : track.target;
        if (!el || typeof (el as any).animate !== 'function') return;

        const opts: KeyframeAnimationOptions = {
          fill: 'both',
          ...(track.options || {}),
        };
        if (typeof track.duration === 'number') opts.duration = track.duration;

        const anim = (el as any).animate(track.keyframes, opts);
        if (anim) animations.push(anim);
      });

      return {
        getAnimations: () => animations,
        seek: (t: number) => {
          animations.forEach((a) => {
            try { (a as any).currentTime = t; } catch {}
          });
        },
        cancel: () => {
          animations.forEach((a) => {
            try { a.cancel(); } catch {}
          });
          animations.length = 0;
        },
      };
    },
  };
}

export interface PixonAnimateOptions extends KeyframeAnimationOptions {
  spring?: SpringConfig & { velocity?: number };
  springType?: SpringType;
  additive?: boolean;
}
