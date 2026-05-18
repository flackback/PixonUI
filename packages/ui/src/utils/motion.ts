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
  /** Base delay before the stagger starts (ms). */
  delay?: number;
  /** Delay between steps (ms). */
  amount?: number;
  /** Anchor point for the stagger calculation. */
  from?: 'first' | 'last' | 'center' | number;
  /** Optional grid definition for position-based staggering. */
  grid?: [columns: number, rows: number];
};

const warnedTimeKeys = new Set<string>();
const warnedRateKeys = new Set<string>();

function isDevRuntime() {
  try {
    const nodeEnv = (globalThis as any).process?.env?.NODE_ENV;
    if (typeof nodeEnv === 'string') return nodeEnv !== 'production';
    return true;
  } catch {
    return true;
  }
}

/**
 * VNext time normalizer.
 * Canonical unit is milliseconds (ms) for all numeric motion/timeline APIs.
 * Legacy seconds-like values are no longer auto-converted in vNext (breaking).
 */
export function normalizeTimeMs(
  value: unknown,
  fallback = 0,
  ctx: { prop?: string; source?: string } = {}
): number {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return fallback;
  if (raw < 0) return 0;
  if (raw === 0) return 0;

  // Legacy seconds heuristics (e.g. 0.4, 1.2, 2).
  const looksLikeSeconds = raw > 0 && raw < 20;
  if (!looksLikeSeconds) return raw;

  const key = `${ctx.source || 'motion'}:${ctx.prop || 'time'}`;
  if (isDevRuntime() && !warnedTimeKeys.has(key)) {
    warnedTimeKeys.add(key);
    console.warn(
      `[Pixon Motion vNext] "${ctx.prop || 'time'}" now expects milliseconds. ` +
      `Received legacy seconds-like value ${raw}. ` +
      `Auto-conversion is removed; pass milliseconds explicitly (example: ${raw} -> ${raw * 1000}).`
    );
  }
  return raw;
}

function normalizeTimeScale(
  value: unknown,
  fallback = 1,
  ctx: { prop?: string; source?: string } = {}
): number {
  const raw = Number(value);
  if (Number.isFinite(raw) && raw > 0) return raw;
  const key = `${ctx.source || 'motion'}:${ctx.prop || 'timeScale'}`;
  if (isDevRuntime() && !warnedRateKeys.has(key)) {
    warnedRateKeys.add(key);
    console.warn(
      `[Pixon Motion vNext] "${ctx.prop || 'timeScale'}" must be a positive number. ` +
      `Received ${String(value)}. Using fallback ${fallback}.`
    );
  }
  return fallback;
}

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

const TRANSFORM_SHORTCUTS = new Set([
  'x', 'y', 'z',
  'translateX', 'translateY', 'translateZ',
  'rotate', 'rotateX', 'rotateY', 'rotateZ',
  'scale', 'scaleX', 'scaleY', 'scaleZ',
  'skewX', 'skewY',
  'perspective',
]);

function withTransformUnit(prop: string, val: any) {
  if (typeof val !== 'number') return val;
  if (prop === 'scale' || prop.startsWith('scale')) return val;
  return `${val}${UNIT_MAP[prop] || ''}`;
}

function toTransformFunction(prop: string, val: any): string {
  if (prop === 'x') return `translateX(${withTransformUnit('x', val)})`;
  if (prop === 'y') return `translateY(${withTransformUnit('y', val)})`;
  if (prop === 'z') return `translateZ(${withTransformUnit('translateZ', val)})`;
  return `${prop}(${withTransformUnit(prop, val)})`;
}

export function sanitizeKeyframeProps(kf: any): Keyframe {
  const sanitized: any = {};
  const transforms: string[] = [];
  Object.keys(kf).forEach(p => {
    const prop = p;
    let val = kf[p];

    // V4.7 Supreme Clamping: Prevent invalid values that cause browser warnings & main-thread freezing
    if (typeof val === 'number') {
      if (['opacity', 'scale', 'scaleX', 'scaleY', 'borderRadius', 'borderWidth'].includes(prop)) {
        val = Math.max(0.0001, val); // Stay slightly above 0 to avoid some browser glitches
      }
    } else if (typeof val === 'string' && prop === 'borderRadius' && val.includes('%')) {
      const numeric = parseFloat(val);
      if (numeric < 0) val = '0%';
    }

    if (TRANSFORM_SHORTCUTS.has(prop)) {
      transforms.push(toTransformFunction(prop, val));
      return;
    }

    if (typeof val === 'number' && UNIT_MAP[prop]) {
      val = `${val}${UNIT_MAP[prop]}`;
    }
    sanitized[prop] = val;
  });

  if (transforms.length > 0) {
    const existing = typeof sanitized.transform === 'string' ? sanitized.transform : '';
    sanitized.transform = [existing, transforms.join(' ')].filter(Boolean).join(' ').trim();
  }

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

function toInterpolableText(v: any): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  // Handles CSS Typed OM values (e.g. CSSUnitValue) and other stringable objects.
  try { return String(v); } catch { return ''; }
}

export function interpolateString(f: any, t: any, p: number, propName?: string): string {
  const from = toInterpolableText(f);
  const to = toInterpolableText(t);

  // Color Detection (Hex, RGB, RGBA, HSL)
  const isColor = (s: string) => {
    const x = s.trim().toLowerCase();
    return x.startsWith('#') || x.startsWith('rgb') || x.startsWith('hsl');
  };
  if (isColor(from) && isColor(to)) {
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
    const [c1a, c1b, c1c, a1] = parse(from);
    const [c2a, c2b, c2c, a2] = parse(to);
    const isHsl = from.includes('hsl');
    const a = (c1a! + (c2a! - c1a!) * p);
    const b = (c1b! + (c2b! - c1b!) * p);
    const c = (c1c! + (c2c! - c1c!) * p);
    const alpha = (a1! + (a2! - a1!) * p).toFixed(3);
    return isHsl 
      ? `hsla(${Math.round(a)}, ${Math.round(b)}%, ${Math.round(c)}%, ${alpha})`
      : `rgba(${Math.round(a)}, ${Math.round(b)}, ${Math.round(c)}, ${alpha})`;
  }

  const re = /-?\d*\.?\d+/g, m1 = from.match(re), m2 = to.match(re);
  if (!m1 || !m2) return p < .5 ? from : to;
  
  const numbers: string[] = [];
  const shouldClamp = propName && ['opacity', 'scale', 'borderRadius', 'borderWidth'].some(x => propName.includes(x));

  for (let k = 0; k < Math.max(m1.length, m2.length); k++) {
    const s = parseFloat(m1[k] ?? '0'), target = parseFloat(m2[k] ?? '0');
    let v = s + (target - s) * p;
    if (shouldClamp) v = Math.max(0, v);
    numbers.push(v % 1 === 0 ? v.toString() : v.toFixed(5));
  }

  let cursor = 0;
  return to.replace(re, () => numbers[cursor++] || '0');
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
      const all = a.effect.getKeyframes();
      const kf = all && all.length ? all[all.length - 1] : undefined;
      if (kf) props.forEach(p => kf[p] !== undefined && (state[p] = kf[p]));
    }
  });

  // If we still have missing props, we MUST query computedStyle (unavoidable)
  const missing = props.filter(p => state[p] === undefined);
  if (missing.length > 0) {
    const s = getComputedStyle(el);
    missing.forEach(p => {
      if (p === 'transform' || p === 'filter' || p === 'backdropFilter' || p === 'backdrop-filter') {
        const rawTransform = (s as any)[p] ?? s.getPropertyValue(p);
        const transformValue = String(rawTransform ?? '').trim();
        state[p] = transformValue === '' ? 'none' : transformValue;
        return;
      }
      const val = s.getPropertyValue(p) || (s as any)[p] || (el as any).getAttribute?.(p);
      // CSS custom properties must preserve units as strings (WAAPI expects strings).
      if (typeof val === 'string' && p.startsWith('--')) {
        state[p] = val.trim();
        return;
      }
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
  const hasTransformKey = first.transform !== undefined || last.transform !== undefined;
  
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
        if (prop.includes('opacity')) {
          val = Math.max(0, Math.min(1, val));
        } else if (['scale', 'borderRadius', 'borderWidth'].some(x => prop.includes(x))) {
          val = Math.max(0.0001, val);
        }
        k[prop] = val;
      });
      morph.forEach(prop => k[prop] = interpolateString(first[prop], last[prop], p, prop));
      if (hasTransformKey) {
        const transformValue = buildComplexTransform(sT, eT, p);
        k.transform = transformValue === '' ? 'none' : transformValue;
      }
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
  Object.keys(style).forEach((prop) => {
    if (TRANSFORM_SHORTCUTS.has(prop)) transforms.push(toTransformFunction(prop, style[prop]));
  });

  if (transforms.length > 0) {
    // Avoid passing non-standard shorthand props (or numeric rotate) to WAAPI.
    TRANSFORM_SHORTCUTS.forEach((prop) => {
      delete result[prop];
    });

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
  const delay = normalizeTimeMs(config.delay ?? 0, 0, { prop: 'stagger.delay', source: 'calculateStagger' });
  const amount = normalizeTimeMs(config.amount ?? 50, 50, { prop: 'stagger.amount', source: 'calculateStagger' });
  const from = config.from ?? 'first';
  const grid = config.grid;
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

  return delay + offset * amount;
}

export type Target = Record<string, any> | string;
export type Transition = {
  type?: 'spring' | 'tween';
  /** Duration in milliseconds. */
  duration?: number;
  /** Delay in milliseconds. */
  delay?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  velocity?: number;
  easing?: string | number[];
  repeat?: number;
  repeatType?: 'loop' | 'mirror' | 'reverse';
  /** Delay between repeats in milliseconds. */
  repeatDelay?: number;
  /** Per-child stagger in milliseconds. */
  staggerChildren?: number;
  /** Base children delay in milliseconds. */
  delayChildren?: number;
  /** Stagger anchor for children. */
  staggerFrom?: 'first' | 'last' | 'center' | number;
  /** Optional stagger grid [columns, rows]. */
  staggerGrid?: [columns: number, rows: number];
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
    try { pixonSheetTag.parentNode.removeChild(pixonSheetTag); } catch { /* noop */ }
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
      try { overlay.remove(); } catch { /* noop */ }
      resolve();
    };

    const onEnd = async () => {
      if (phase === 'in') {
        phase = 'out';
        try { await update(); } catch { /* noop */ }
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
  options?: TimelineAnimateOptions;
  /** Duration in ms (convenience). */
  duration?: number;
  /** Time position (number or expression like `+=200`, `label`, `label-=120`). */
  at?: number | string;
  /** Optional label anchor used as base for `at`. */
  atLabel?: string;
  /** Register a label at this track start. */
  label?: string;
}

export interface TimelineFactoryOptions {
  easing?: any;
  /** Playback rate multiplier (1 = normal speed). */
  timeScale?: number;
  /** Scrub-friendly mode (starts paused at 0 unless autoplay=true). */
  scrub?: boolean;
  /** Auto-start playback when play() is created (default true, false when scrub=true). */
  autoplay?: boolean;
}

export type TimelineController = {
  getAnimations: () => Animation[];
  getDuration: () => number;
  getTimeScale: () => number;
  setTimeScale: (rate: number) => void;
  scrub: (progress: number) => void;
  bindScrub: (
    source: { get: () => number; on: (event: 'change', cb: (latest: number) => void) => () => void },
    options?: { from?: number; to?: number; clamp?: boolean; immediate?: boolean }
  ) => () => void;
  seek: (t: number) => void;
  getDebugSnapshot: () => {
    cursor: number;
    duration: number;
    timeScale: number;
    labels: string[];
    segmentCount: number;
    callbackCount: number;
    animationCount: number;
    paused: boolean;
    scrub: boolean;
  };
  play: () => void;
  pause: () => void;
  resume: () => void;
  reverse: () => void;
  finish: () => void;
  finished: Promise<void>;
  then: <TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
  cancel: () => void;
};

export type TimelineAddOptions = TimelineAnimateOptions & {
  /** Duration in ms. */
  duration?: number;
  /** Absolute start offset in ms (timeline position). */
  offset?: number;
  /** Time position (number or expression like `+=200`, `label`, `label-=120`). */
  at?: number | string;
  /** Optional label anchor used as base for `at`/`offset`. */
  atLabel?: string;
  /** Register a label at this segment start. */
  label?: string;
  /** Stagger per-target delay in ms. */
  stagger?: number;
  /** Optional scope root for string selectors in this segment. */
  scope?: Element | Document | string | null;
};

export type TimelineBuilder = {
  add: (target: any, keyframes: any, segOpts?: TimelineAddOptions) => any;
  to: (target: any, keyframes: any, segOpts?: TimelineAddOptions) => any;
  from: (target: any, keyframes: any, segOpts?: TimelineAddOptions) => any;
  fromTo: (target: any, fromKeyframes: any, toKeyframes: any, segOpts?: TimelineAddOptions) => any;
  addTimeline: (
    child: TimelineBuilder | ((tl: TimelineBuilder) => void),
    options?: TimelineNestOptions
  ) => any;
  nest: (
    child: TimelineBuilder | ((tl: TimelineBuilder) => void),
    options?: TimelineNestOptions
  ) => any;
  set: (target: any, keyframes: any, at?: number | string) => any;
  timeScale: (rate: number) => any;
  scrub: (enabled?: boolean) => any;
  autoplay: (enabled?: boolean) => any;
  scope: (root: Element | Document | string | null) => any;
  label: (name: string, at?: number | string) => any;
  sync: (at?: number | string) => any;
  call: (callback: () => void, at?: number | string) => any;
  then: (callback: () => void, at?: number | string) => any;
  chain: (compose: (tl: TimelineBuilder) => void) => any;
  play: () => TimelineController;
  cancel: () => void;
};

export type TimelineNestOptions = {
  at?: number | string;
  atLabel?: string;
  label?: string;
  offset?: number;
  /** 2 = nested timeline runs 2x faster (effective duration is divided by 2). */
  timeScale?: number;
  /** Expose child labels into parent timeline namespace. */
  propagateLabels?: boolean;
  /** Optional prefix for propagated labels (ex: "hero."). */
  labelPrefix?: string;
};
export function timeline(tracks: TimelineTrack[], options?: TimelineFactoryOptions): { play(): TimelineController };
export function timeline(options?: TimelineFactoryOptions): TimelineBuilder;
export function timeline(tracks?: TimelineTrack[] | TimelineFactoryOptions, options?: TimelineFactoryOptions) {
  const internalKey = '__pxTimelineInternals';
  const parsePosition = (
    raw: number | string | undefined,
    fallback: number,
    labels: Map<string, number>,
    ctx: { prop: string; source: string }
  ): number => {
    if (raw === null || raw === undefined) return fallback;
    if (typeof raw === 'number') return normalizeTimeMs(raw, fallback, ctx);

    const text = String(raw).trim();
    if (!text) return fallback;

    const relative = text.match(/^([+-])=\s*(-?\d*\.?\d+)$/);
    if (relative) {
      const sign = relative[1] === '-' ? -1 : 1;
      const delta = normalizeTimeMs(Number(relative[2] || 0), 0, ctx);
      return Math.max(0, fallback + sign * delta);
    }

    if (labels.has(text)) return labels.get(text)!;

    const labelExpr = text.match(/^([A-Za-z_][\w.-]*)(?:\s*([+-])=\s*(-?\d*\.?\d+))?$/);
    if (labelExpr) {
      const base = labels.get(labelExpr[1]!) ?? fallback;
      if (!labelExpr[2]) return base;
      const sign = labelExpr[2] === '-' ? -1 : 1;
      const delta = normalizeTimeMs(Number(labelExpr[3] || 0), 0, ctx);
      return Math.max(0, base + sign * delta);
    }

    const asNumber = Number(text);
    if (Number.isFinite(asNumber)) return normalizeTimeMs(asNumber, fallback, ctx);
    return fallback;
  };

  // 1) Back-compat mode: timeline(tracks[]).play()
  if (Array.isArray(tracks)) {
    const resolvedTracks = [...tracks];

    return {
      play(): TimelineController {
        const animations: Animation[] = [];
        const labels = new Map<string, number>([['start', 0]]);
        let totalDuration = 0;
        let cursor = 0;
        let playbackRate = normalizeTimeScale(options?.timeScale ?? 1, 1, { prop: 'timeScale', source: 'timeline(tracks)' });
        const scrubMode = !!options?.scrub;
        const autoplay = options?.autoplay ?? !scrubMode;

        resolvedTracks.forEach((track) => {
          const el = typeof track.target === 'string' ? document.querySelector(track.target) : track.target;
          if (!el || typeof (el as any).animate !== 'function') return;

          const opts: KeyframeAnimationOptions = {
            fill: 'both',
            ...(track.options || {}),
          };
          if (typeof track.duration === 'number') {
            opts.duration = normalizeTimeMs(track.duration, 400, { prop: 'duration', source: 'timeline(tracks)' });
          }
          const base = typeof track.atLabel === 'string' && labels.has(track.atLabel)
            ? labels.get(track.atLabel)!
            : cursor;
          const offset = parsePosition(track.at, base, labels, { prop: 'at', source: 'timeline(tracks)' });
          const curDelay = normalizeTimeMs(opts.delay ?? 0, 0, { prop: 'delay', source: 'timeline(tracks)' });
          opts.delay = curDelay + offset;
          if (typeof track.label === 'string' && track.label.trim()) {
            labels.set(track.label.trim(), offset);
          }
          const resolvedDuration = normalizeTimeMs(opts.duration ?? 400, 400, { prop: 'duration', source: 'timeline(tracks)' });
          totalDuration = Math.max(totalDuration, (Number(opts.delay) || 0) + resolvedDuration);
          cursor = Math.max(cursor, offset + resolvedDuration);

          const anim = (el as any).animate(track.keyframes, opts);
          if (anim) {
            try { (anim as any).playbackRate = playbackRate; } catch { /* noop */ }
            animations.push(anim);
          }
        });

        if (!autoplay) {
          animations.forEach((a) => {
            try { a.pause(); } catch { /* noop */ }
            try { (a as any).currentTime = 0; } catch { /* noop */ }
          });
        }

        const finished = Promise.allSettled(
          animations.map((a) => {
            const p = (a as any)?.finished;
            return p && typeof p.then === 'function' ? p : Promise.resolve();
          })
        ).then(() => undefined);

        return {
          getAnimations: () => animations,
          getDuration: () => totalDuration,
          getTimeScale: () => playbackRate,
          setTimeScale: (rate: number) => {
            playbackRate = normalizeTimeScale(rate, playbackRate, { prop: 'timeScale', source: 'timeline(tracks).controller' });
            animations.forEach((a) => {
              try { (a as any).playbackRate = playbackRate; } catch { /* noop */ }
            });
          },
          scrub: (progress: number) => {
            const normalized = Math.max(0, Math.min(1, Number(progress) || 0));
            const time = totalDuration * normalized;
            animations.forEach((a) => {
              try { (a as any).currentTime = time; } catch { /* noop */ }
            });
          },
          bindScrub: (source, bindOptions) => {
            const from = Number(bindOptions?.from ?? 0);
            const to = Number(bindOptions?.to ?? 1);
            const clamp = bindOptions?.clamp ?? true;
            const mapToProgress = (latest: number) => {
              const span = to - from;
              if (!Number.isFinite(span) || Math.abs(span) < 1e-9) return 0;
              let progress = (latest - from) / span;
              if (clamp) progress = Math.max(0, Math.min(1, progress));
              return progress;
            };
            const apply = (latest: number) => {
              const progress = mapToProgress(Number(latest) || 0);
              const time = totalDuration * progress;
              animations.forEach((a) => {
                try { (a as any).currentTime = time; } catch { /* noop */ }
              });
            };
            if (bindOptions?.immediate !== false) {
              try { apply(Number(source.get()) || 0); } catch { /* noop */ }
            }
            return source.on('change', (latest) => apply(Number(latest) || 0));
          },
          seek: (t: number) => {
            animations.forEach((a) => {
              try { (a as any).currentTime = t; } catch { /* noop */ }
            });
          },
          getDebugSnapshot: () => {
            const first = animations[0] as any;
            const cursor = typeof first?.currentTime === 'number' && Number.isFinite(first.currentTime)
              ? Math.max(0, first.currentTime)
              : 0;
            const playState = String(first?.playState ?? '').toLowerCase();
            return {
              cursor,
              duration: totalDuration,
              timeScale: playbackRate,
              labels: Array.from(labels.keys()),
              segmentCount: resolvedTracks.length,
              callbackCount: 0,
              animationCount: animations.length,
              paused: playState === 'paused',
              scrub: scrubMode,
            };
          },
          play: () => {
            animations.forEach((a) => {
              try { a.play(); } catch { /* noop */ }
            });
          },
          pause: () => {
            animations.forEach((a) => {
              try { a.pause(); } catch { /* noop */ }
            });
          },
          resume: () => {
            animations.forEach((a) => {
              try { a.play(); } catch { /* noop */ }
            });
          },
          reverse: () => {
            animations.forEach((a) => {
              try { a.reverse(); } catch { /* noop */ }
            });
          },
          finish: () => {
            animations.forEach((a) => {
              try { a.finish(); } catch { /* noop */ }
            });
          },
          finished,
          then: (onfulfilled?: any, onrejected?: any) => finished.then(onfulfilled, onrejected),
          cancel: () => {
            animations.forEach((a) => {
              try { a.cancel(); } catch { /* noop */ }
            });
            animations.length = 0;
          },
        };
      },
    };
  }

  // 2) Builder mode: timeline({ easing }).add(...).play()
  const defaults = (tracks || options || {}) as TimelineFactoryOptions;
  let defaultTimeScale = normalizeTimeScale(defaults.timeScale ?? 1, 1, { prop: 'timeScale', source: 'timeline()' });
  let defaultScrub = !!defaults.scrub;
  let defaultAutoplay = defaults.autoplay ?? !defaultScrub;
  const segments: Array<{ target: any; keyframes: any; options: TimelineAddOptions }> = [];
  const callbacks: Array<{ fn: () => void; at: number }> = [];
  const labels = new Map<string, number>([['start', 0]]);
  let cursor = 0;
  let active: TimelineController | null = null;
  let timerIds: number[] = [];
  let activeScope: Element | Document | null = null;

  const readBuilderSnapshot = (candidate: any): {
    segments: Array<{ target: any; keyframes: any; options: TimelineAddOptions }>;
    callbacks: Array<{ fn: () => void; at: number }>;
    labels: Map<string, number>;
    cursor: number;
  } | null => {
    const bag = candidate?.[internalKey];
    if (!bag || typeof bag.getSnapshot !== 'function') return null;
    try {
      const snapshot = bag.getSnapshot();
      if (!snapshot) return null;
      return {
        segments: Array.isArray(snapshot.segments) ? [...snapshot.segments] : [],
        callbacks: Array.isArray(snapshot.callbacks) ? [...snapshot.callbacks] : [],
        labels: snapshot.labels instanceof Map ? new Map(snapshot.labels) : new Map<string, number>(),
        cursor: Number(snapshot.cursor) || 0,
      };
    } catch {
      return null;
    }
  };

  const resolveScopeRoot = (root: Element | Document | string | null | undefined): Element | Document | null => {
    if (!root) return null;
    if (typeof root !== 'string') return root;
    if (typeof document === 'undefined') return null;
    const scoped = document.querySelector(root);
    return scoped ?? null;
  };

  const resolveNodes = (target: any, scopeRoot: Element | Document | null): any[] => {
    if (typeof target === 'string') {
      const base = scopeRoot ?? (typeof document !== 'undefined' ? document : null);
      if (!base || typeof (base as any).querySelectorAll !== 'function') return [];
      return Array.from((base as any).querySelectorAll(target));
    }
    if (Array.isArray(target)) return target;
    if (target && typeof (target as any).length === 'number' && !(target as any).animate) return Array.from(target as any);
    return [target];
  };

  const api = {
    add(target: any, keyframes: any, segOpts: TimelineAddOptions = {}) {
      const base = typeof segOpts.atLabel === 'string' && labels.has(segOpts.atLabel)
        ? labels.get(segOpts.atLabel)!
        : cursor;
      const atOrOffset = segOpts.at ?? segOpts.offset;
      const offset = parsePosition(atOrOffset as any, base, labels, { prop: 'at', source: 'timeline().add' });
      const duration = typeof segOpts.duration === 'number'
        ? normalizeTimeMs(segOpts.duration, 400, { prop: 'duration', source: 'timeline().add' })
        : (typeof (segOpts as any).duration === 'number'
          ? normalizeTimeMs((segOpts as any).duration, 400, { prop: 'duration', source: 'timeline().add' })
          : 400);
      if (typeof segOpts.label === 'string' && segOpts.label.trim()) {
        labels.set(segOpts.label.trim(), offset);
      }
      const segScope = resolveScopeRoot(segOpts.scope) ?? activeScope;
      segments.push({ target, keyframes, options: { ...segOpts, offset, duration, scope: segScope } });
      cursor = Math.max(cursor, offset + duration);
      return api;
    },
    to(target: any, keyframes: any, segOpts: TimelineAddOptions = {}) {
      return api.add(target, keyframes, segOpts);
    },
    from(target: any, keyframes: any, segOpts: TimelineAddOptions = {}) {
      return api.add(target, keyframes, segOpts);
    },
    fromTo(target: any, fromKeyframes: any, toKeyframes: any, segOpts: TimelineAddOptions = {}) {
      const fromPrepared = prepareKeyframes(fromKeyframes);
      const toPrepared = prepareKeyframes(toKeyframes);
      const fromFrame = fromPrepared[fromPrepared.length - 1] ?? fromPrepared[0] ?? {};
      const toFrame = toPrepared[toPrepared.length - 1] ?? toPrepared[0] ?? {};
      return api.add(target, [fromFrame, toFrame], segOpts);
    },
    addTimeline(child: TimelineBuilder | ((tl: TimelineBuilder) => void), nestOpts: TimelineNestOptions = {}) {
      const nestedBuilder = typeof child === 'function'
        ? (() => {
            const nested = timeline({
              easing: defaults.easing,
              timeScale: 1,
              scrub: false,
              autoplay: true,
            });
            try {
              if (activeScope) (nested as any).scope(activeScope);
              (child as (tl: TimelineBuilder) => void)(nested as TimelineBuilder);
            } catch { /* noop */ }
            return nested as TimelineBuilder;
          })()
        : child;

      const snapshot = readBuilderSnapshot(nestedBuilder);
      if (!snapshot) return api;

      const base = typeof nestOpts.atLabel === 'string' && labels.has(nestOpts.atLabel)
        ? labels.get(nestOpts.atLabel)!
        : cursor;
      const atOrOffset = nestOpts.at ?? nestOpts.offset;
      const nestOffset = parsePosition(atOrOffset as any, base, labels, { prop: 'at', source: 'timeline().addTimeline' });
      const nestRate = normalizeTimeScale(nestOpts.timeScale ?? 1, 1, { prop: 'timeScale', source: 'timeline().addTimeline' });
      const invRate = 1 / nestRate;
      const shouldPropagateLabels = nestOpts.propagateLabels ?? true;
      const prefix = nestOpts.labelPrefix ?? (typeof nestOpts.label === 'string' && nestOpts.label.trim() ? `${nestOpts.label.trim()}.` : '');

      if (typeof nestOpts.label === 'string' && nestOpts.label.trim()) {
        labels.set(nestOpts.label.trim(), nestOffset);
      }

      snapshot.segments.forEach((seg) => {
        const segOffset = normalizeTimeMs((seg.options as any)?.offset ?? 0, 0, { prop: 'offset', source: 'timeline().addTimeline' }) * invRate;
        const segDuration = normalizeTimeMs(seg.options.duration ?? 400, 400, { prop: 'duration', source: 'timeline().addTimeline' }) * invRate;
        const segDelay = normalizeTimeMs(seg.options.delay ?? 0, 0, { prop: 'delay', source: 'timeline().addTimeline' }) * invRate;
        const segStagger = normalizeTimeMs(seg.options.stagger ?? 0, 0, { prop: 'stagger', source: 'timeline().addTimeline' }) * invRate;

        segments.push({
          target: seg.target,
          keyframes: seg.keyframes,
          options: {
            ...seg.options,
            offset: nestOffset + segOffset,
            duration: segDuration,
            delay: segDelay,
            stagger: segStagger,
          },
        });
      });

      snapshot.callbacks.forEach((cb) => {
        callbacks.push({
          fn: cb.fn,
          at: nestOffset + Math.max(0, Number(cb.at) || 0) * invRate,
        });
      });

      if (shouldPropagateLabels) {
        snapshot.labels.forEach((at, name) => {
          const clean = String(name || '').trim();
          if (!clean) return;
          const merged = `${prefix}${clean}`;
          labels.set(merged, nestOffset + Math.max(0, Number(at) || 0) * invRate);
        });
      }

      cursor = Math.max(cursor, nestOffset + Math.max(0, snapshot.cursor) * invRate);
      return api;
    },
    nest(child: TimelineBuilder | ((tl: TimelineBuilder) => void), options?: TimelineNestOptions) {
      return api.addTimeline(child, options);
    },
    set(target: any, keyframes: any, at?: number | string) {
      return api.add(target, keyframes, { duration: 0, at, fill: 'both' });
    },
    timeScale(rate: number) {
      defaultTimeScale = normalizeTimeScale(rate, defaultTimeScale, { prop: 'timeScale', source: 'timeline().timeScale' });
      return api;
    },
    scrub(enabled = true) {
      defaultScrub = !!enabled;
      if (enabled && (defaults.autoplay === null || defaults.autoplay === undefined)) defaultAutoplay = false;
      return api;
    },
    autoplay(enabled = true) {
      defaultAutoplay = !!enabled;
      return api;
    },
    scope(root: Element | Document | string | null) {
      activeScope = resolveScopeRoot(root);
      return api;
    },
    label(name: string, at?: number | string) {
      const trimmed = String(name || '').trim();
      if (!trimmed) return api;
      const resolved = parsePosition(at, cursor, labels, { prop: 'label', source: 'timeline().label' });
      labels.set(trimmed, resolved);
      cursor = Math.max(cursor, resolved);
      return api;
    },
    sync(at?: number | string) {
      cursor = parsePosition(at, cursor, labels, { prop: 'sync', source: 'timeline().sync' });
      return api;
    },
    call(callback: () => void, at?: number | string) {
      const resolved = parsePosition(at, cursor, labels, { prop: 'call', source: 'timeline().call' });
      callbacks.push({ fn: callback, at: resolved });
      cursor = Math.max(cursor, resolved);
      return api;
    },
    then(callback: () => void, at?: number | string) {
      return api.call(callback, at);
    },
    chain(compose: (tl: TimelineBuilder) => void) {
      try {
        compose(api as TimelineBuilder);
      } catch { /* noop */ }
      return api;
    },
    play(): TimelineController {
      // Cancel previous run
      active?.cancel?.();
      const animations: Animation[] = [];
      timerIds.forEach((id) => clearTimeout(id));
      timerIds = [];

      const globalEasing = defaults.easing;
      const scrubMode = defaultScrub;
      const autoplay = defaultAutoplay;
      const nowSegments = [...segments];
      const nowCallbacks = [...callbacks];
      const callbackQueue = nowCallbacks.map((cb) => ({
        at: Math.max(0, cb.at),
        fn: cb.fn,
        fired: false,
      }));
      let resolveCallbacksDone: () => void = () => {};
      const callbacksDone = new Promise<void>((resolve) => {
        resolveCallbacksDone = resolve;
      });
      if (callbackQueue.length === 0) resolveCallbacksDone();
      let callbackCursor = 0;
      let callbackPaused = false;
      let callbackRate = defaultTimeScale;
      let callbackAnchorTimeline = 0;
      let callbackAnchorNow = 0;
      let totalDuration = 0;

      const nowMs = () => {
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') return performance.now();
        return Date.now();
      };

      const syncCallbackAnchor = (timelineMs: number) => {
        callbackCursor = Math.max(0, timelineMs);
        callbackAnchorTimeline = callbackCursor;
        callbackAnchorNow = nowMs();
      };

      const getCurrentCallbackTime = () => {
        if (callbackPaused) return callbackCursor;
        return Math.max(0, callbackAnchorTimeline + (nowMs() - callbackAnchorNow) * callbackRate);
      };

      nowSegments.forEach((seg) => {
        const { target, keyframes, options: segOpts } = seg;
        const baseOffset = normalizeTimeMs(segOpts.offset ?? 0, 0, { prop: 'offset', source: 'timeline().play' });
        const duration = normalizeTimeMs(segOpts.duration ?? 400, 400, { prop: 'duration', source: 'timeline().play' });
        const delay = normalizeTimeMs(segOpts.delay ?? 0, 0, { prop: 'delay', source: 'timeline().play' }) + baseOffset;
        const easing = (segOpts.easing ?? globalEasing) as any;
        const stagger = normalizeTimeMs(segOpts.stagger ?? 0, 0, { prop: 'stagger', source: 'timeline().play' });

        const nodes = resolveNodes(target, resolveScopeRoot((segOpts as any).scope));

        nodes.forEach((node, idx) => {
          if (!node || typeof (node as any).animate !== 'function') return;
          const opts: KeyframeAnimationOptions = {
            fill: 'both',
            ...(segOpts as any),
            duration,
            delay: delay + idx * stagger,
            easing: easing !== null && easing !== undefined ? sanitizeEasing(easing) : undefined,
          };
          totalDuration = Math.max(totalDuration, (Number(opts.delay) || 0) + duration);
          delete (opts as any).offset;
          delete (opts as any).at;
          delete (opts as any).atLabel;
          delete (opts as any).label;
          delete (opts as any).stagger;

          const anim = (node as any).animate(keyframes, opts);
          if (anim) {
            try { (anim as any).playbackRate = callbackRate; } catch { /* noop */ }
            animations.push(anim);
          }
        });
      });
      callbackQueue.forEach((cb) => {
        totalDuration = Math.max(totalDuration, cb.at);
      });

      const clearCallbackTimers = () => {
        timerIds.forEach((id) => clearTimeout(id));
        timerIds = [];
      };

      const fireCallback = (cb: { fn: () => void; fired: boolean }) => {
        if (cb.fired) return;
        cb.fired = true;
        try { cb.fn(); } catch { /* noop */ }
        if (callbackQueue.every((entry) => entry.fired)) {
          resolveCallbacksDone();
        }
      };

      const runCallbacksUntil = (timeMs: number) => {
        callbackCursor = Math.max(0, timeMs);
        callbackQueue.forEach((cb) => {
          if (!cb.fired && cb.at <= callbackCursor) fireCallback(cb);
        });
      };

      const scheduleCallbacksFrom = (timeMs: number) => {
        clearCallbackTimers();
        syncCallbackAnchor(timeMs);
        runCallbacksUntil(timeMs);
        if (callbackPaused || scrubMode || typeof window === 'undefined' || callbackRate <= 0) return;
        callbackQueue.forEach((cb) => {
          if (cb.fired) return;
          const wait = Math.max(0, (cb.at - callbackCursor) / callbackRate);
          const id = window.setTimeout(() => {
            fireCallback(cb);
          }, wait);
          timerIds.push(id);
        });
      };

      callbackPaused = !autoplay;
      scheduleCallbacksFrom(0);
      if (!autoplay) {
        animations.forEach((a) => {
          try { a.pause(); } catch { /* noop */ }
          try { (a as any).currentTime = 0; } catch { /* noop */ }
        });
      }

      const animationsDone = Promise.allSettled(
        animations.map((a) => {
          const p = (a as any)?.finished;
          return p && typeof p.then === 'function' ? p : Promise.resolve();
        })
      ).then(() => undefined);
      const finished = Promise.all([animationsDone, callbacksDone]).then(() => undefined);

      active = {
        getAnimations: () => animations,
        getDuration: () => totalDuration,
        getTimeScale: () => callbackRate,
        setTimeScale: (rate: number) => {
          const nextRate = normalizeTimeScale(rate, callbackRate, { prop: 'timeScale', source: 'timeline().controller' });
          const current = (() => {
            const waapiTime = (animations[0] as any)?.currentTime;
            if (typeof waapiTime === 'number' && Number.isFinite(waapiTime)) return Math.max(0, waapiTime);
            return getCurrentCallbackTime();
          })();
          callbackRate = nextRate;
          animations.forEach((a) => {
            try { (a as any).playbackRate = nextRate; } catch { /* noop */ }
          });
          if (callbackPaused) {
            syncCallbackAnchor(current);
          } else {
            scheduleCallbacksFrom(current);
          }
        },
        scrub: (progress: number) => {
          const normalized = Math.max(0, Math.min(1, Number(progress) || 0));
          const time = totalDuration * normalized;
          animations.forEach((a) => {
            try { (a as any).currentTime = time; } catch { /* noop */ }
          });
          scheduleCallbacksFrom(time);
        },
        bindScrub: (source, bindOptions) => {
          const from = Number(bindOptions?.from ?? 0);
          const to = Number(bindOptions?.to ?? 1);
          const clamp = bindOptions?.clamp ?? true;
          const mapToProgress = (latest: number) => {
            const span = to - from;
            if (!Number.isFinite(span) || Math.abs(span) < 1e-9) return 0;
            let progress = (latest - from) / span;
            if (clamp) progress = Math.max(0, Math.min(1, progress));
            return progress;
          };
          const apply = (latest: number) => {
            const progress = mapToProgress(Number(latest) || 0);
            const time = totalDuration * progress;
            animations.forEach((a) => {
              try { (a as any).currentTime = time; } catch { /* noop */ }
            });
            scheduleCallbacksFrom(time);
          };
          if (bindOptions?.immediate !== false) {
            try { apply(Number(source.get()) || 0); } catch { /* noop */ }
          }
          return source.on('change', (latest) => apply(Number(latest) || 0));
        },
        seek: (t: number) => {
          const seekMs = Math.max(0, Number(t) || 0);
          animations.forEach((a) => {
            try { (a as any).currentTime = seekMs; } catch { /* noop */ }
          });
          scheduleCallbacksFrom(seekMs);
        },
        getDebugSnapshot: () => ({
          cursor: Math.max(0, callbackCursor),
          duration: totalDuration,
          timeScale: callbackRate,
          labels: Array.from(labels.keys()),
          segmentCount: nowSegments.length,
          callbackCount: nowCallbacks.length,
          animationCount: animations.length,
          paused: callbackPaused,
          scrub: scrubMode,
        }),
        play: () => {
          callbackPaused = false;
          const current = (animations[0] as any)?.currentTime;
          if (typeof current === 'number' && Number.isFinite(current)) {
            callbackCursor = Math.max(0, current);
          }
          scheduleCallbacksFrom(callbackCursor);
          animations.forEach((a) => {
            try { a.play(); } catch { /* noop */ }
          });
        },
        pause: () => {
          callbackPaused = true;
          const current = (animations[0] as any)?.currentTime;
          if (typeof current === 'number' && Number.isFinite(current)) {
            callbackCursor = Math.max(0, current);
          }
          clearCallbackTimers();
          syncCallbackAnchor(callbackCursor);
          animations.forEach((a) => {
            try { a.pause(); } catch { /* noop */ }
          });
        },
        resume: () => {
          callbackPaused = false;
          const current = (animations[0] as any)?.currentTime;
          if (typeof current === 'number' && Number.isFinite(current)) {
            callbackCursor = Math.max(0, current);
          }
          scheduleCallbacksFrom(callbackCursor);
          animations.forEach((a) => {
            try { a.play(); } catch { /* noop */ }
          });
        },
        reverse: () => {
          callbackPaused = true;
          clearCallbackTimers();
          syncCallbackAnchor(callbackCursor);
          animations.forEach((a) => {
            try { a.reverse(); } catch { /* noop */ }
          });
        },
        finish: () => {
          clearCallbackTimers();
          callbackQueue.forEach((cb) => fireCallback(cb));
          resolveCallbacksDone();
          animations.forEach((a) => {
            try { a.finish(); } catch { /* noop */ }
          });
        },
        finished,
        then: (onfulfilled?: any, onrejected?: any) => finished.then(onfulfilled, onrejected),
        cancel: () => {
          animations.forEach((a) => {
            try { a.cancel(); } catch { /* noop */ }
          });
          resolveCallbacksDone();
          clearCallbackTimers();
          animations.length = 0;
        },
      };

      return active;
    },
    cancel() {
      active?.cancel();
      active = null;
    },
  };

  Object.defineProperty(api, internalKey, {
    enumerable: false,
    configurable: false,
    writable: false,
    value: {
      getSnapshot: () => ({
        segments: [...segments],
        callbacks: [...callbacks],
        labels: new Map(labels),
        cursor,
      }),
    },
  });

  return api;
}

export function timelineScoped(
  scope: Element | Document | string | null,
  options?: TimelineFactoryOptions
): TimelineBuilder {
  return timeline(options).scope(scope);
}

export interface TimelineDevtoolsOptions {
  title?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  zIndex?: number;
}

/**
 * Optional runtime overlay for timeline debugging.
 * Shows cursor, labels, segment/callback counts and playback state.
 */
export function attachTimelineDevtools(
  controller: TimelineController,
  options: TimelineDevtoolsOptions = {}
): () => void {
  if (typeof document === 'undefined' || !controller) return () => {};

  const panel = document.createElement('div');
  const pre = document.createElement('pre');
  const pos = options.position ?? 'bottom-right';
  const posStyle: Record<string, string> = {
    top: pos.startsWith('top') ? '12px' : 'auto',
    bottom: pos.startsWith('bottom') ? '12px' : 'auto',
    left: pos.endsWith('left') ? '12px' : 'auto',
    right: pos.endsWith('right') ? '12px' : 'auto',
  };

  Object.assign(panel.style, {
    position: 'fixed',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'rgba(4,8,22,0.86)',
    border: '1px solid rgba(133,214,255,0.35)',
    color: '#d9f4ff',
    font: '12px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    whiteSpace: 'pre',
    pointerEvents: 'none',
    zIndex: String(options.zIndex ?? 2147483600),
    boxShadow: '0 10px 32px rgba(0,0,0,0.35)',
    ...posStyle,
  } as CSSStyleDeclaration);

  pre.style.margin = '0';
  panel.appendChild(pre);
  document.body.appendChild(panel);

  let rafId = 0;
  const renderText = () => {
    try {
      const d = controller.getDebugSnapshot();
      pre.textContent = [
        `${options.title ?? 'Pixon Timeline Devtools'}`,
        `time: ${Math.round(d.cursor)}ms / ${Math.round(d.duration)}ms`,
        `rate: ${d.timeScale.toFixed(2)}x  paused: ${d.paused ? 'yes' : 'no'}  scrub: ${d.scrub ? 'yes' : 'no'}`,
        `segments: ${d.segmentCount}  callbacks: ${d.callbackCount}  animations: ${d.animationCount}`,
        `labels: ${d.labels.join(', ') || '(none)'}`,
      ].join('\n');
    } catch {
      pre.textContent = `${options.title ?? 'Pixon Timeline Devtools'}\n(unavailable)`;
    }
  };
  const update = () => {
    renderText();
    rafId = requestAnimationFrame(update);
  };

  renderText();
  rafId = requestAnimationFrame(update);
  return () => {
    try { cancelAnimationFrame(rafId); } catch { /* noop */ }
    try { panel.remove(); } catch { /* noop */ }
  };
}

export interface TimelineAnimateOptions extends KeyframeAnimationOptions {
  spring?: SpringConfig & { velocity?: number };
  springType?: SpringType;
  additive?: boolean;
}
