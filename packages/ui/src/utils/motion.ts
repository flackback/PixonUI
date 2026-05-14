/**
 * PixonUI Motion Core
 * Consolidated & Tree-shakable
 */

// 1. Types
export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  precision?: number;
}

export type ViewTransitionCallback = () => void | Promise<void>;

export interface PixonTransitionOptions {
  duration?: number;
  easing?: string;
  skipFallback?: boolean;
}

export interface StaggerConfig {
  delay: number;
  from?: 'first' | 'last' | 'center' | number;
  grid?: [number, number];
  axis?: 'x' | 'y';
}

export type AnimatableTarget = 
  | string 
  | Element 
  | Element[] 
  | NodeList 
  | { current: HTMLElement | null } 
  | Array<{ current: HTMLElement | null } | Element | null>;

export type SpringType = 'standard' | 'impulse';

export interface UltimateAnimationOptions {
  duration?: number;
  delay?: number;
  stagger?: number;
  easing?: string;
  spring?: SpringConfig;
  springType?: SpringType;
  offset?: string | number;
  composite?: 'replace' | 'add' | 'accumulate';
}

export interface TimelineTrack extends UltimateAnimationOptions {
  target: AnimatableTarget;
  keyframes: Keyframe[] | PropertyIndexedKeyframes | Record<string, any>;
}

export interface PixonTimelineController {
  play: () => PixonTimelineController;
  pause: () => PixonTimelineController;
  reverse: () => PixonTimelineController;
  restart: () => PixonTimelineController;
  seek: (timeMs: number) => PixonTimelineController;
  cancel: () => PixonTimelineController;
  finished: Promise<void>;
  /** Get all playing WAAPI active Animation objects */
  getAnimations: () => Animation[];
}

/** 
 * Utility to expand array-valued properties and parse shorthand shortcuts.
 * Transforms { scale: [1, 1.2], x: 0 } into [{ scale: 1, x: 0 }, { scale: 1.2, x: 0 }]
 */
export function prepareKeyframes(input: any): Keyframe[] {
  let processed = input;
  
  const isObject = (v: any) => typeof v === 'object' && v !== null && !Array.isArray(v);

  // 1. Expand array-valued properties (PropertyIndexedKeyframes style)
  if (isObject(input)) {
    const keys = Object.keys(input);
    const maxArrayLength = keys.reduce((max, key) => 
      Array.isArray(input[key]) ? Math.max(max, input[key].length) : max, 0);

    if (maxArrayLength > 0) {
      const list: any[] = [];
      for (let i = 0; i < maxArrayLength; i++) {
        const kf: any = {};
        keys.forEach(key => {
          const val = input[key];
          if (Array.isArray(val)) {
            const index = maxArrayLength > 1 
              ? Math.min(val.length - 1, Math.round((i / (maxArrayLength - 1)) * (val.length - 1)))
              : 0;
            kf[key] = val[index];
          } else {
            kf[key] = val;
          }
        });
        list.push(kf);
      }
      processed = list;
    } else {
      processed = [input];
    }
  } else if (Array.isArray(input)) {
    // Handle list of objects that might contain arrays (nested expansion)
    if (input.length === 1 && isObject(input[0])) {
      const firstKf = input[0];
      const keys = Object.keys(firstKf);
      const maxArrayLength = keys.reduce((max, key) => 
        Array.isArray(firstKf[key]) ? Math.max(max, firstKf[key].length) : max, 0);

      if (maxArrayLength > 0) {
        const list: any[] = [];
        for (let i = 0; i < maxArrayLength; i++) {
          const kf: any = {};
          keys.forEach(key => {
            const val = firstKf[key];
            if (Array.isArray(val)) {
              const index = maxArrayLength > 1 
                ? Math.min(val.length - 1, Math.round((i / (maxArrayLength - 1)) * (val.length - 1)))
                : 0;
              kf[key] = val[index];
            } else {
              kf[key] = val;
            }
          });
          list.push(kf);
        }
        processed = list;
      }
    }
  }

  // 2. Parse style shortcuts (x, y, scale, etc.)
  const result = Array.isArray(processed) 
    ? processed.map(kf => parseStyleShortcuts(kf))
    : [parseStyleShortcuts(processed)];

  return result as Keyframe[];
}

// 2. Spring Physics
const trajectoryCache = new Map<string, { progress: number[]; keyframes: number[]; duration: number }>();

/** Exported for testing only */
export function clearSpringCache() {
  trajectoryCache.clear();
}

export function generateSpringTrajectory(
  from: number,
  to: number,
  config: SpringConfig = {}
): { progress: number[]; keyframes: number[]; duration: number } {
  const { stiffness = 170, damping = 26, mass = 1, precision = 0.0005 } = config;
  const key = `${from}|${to}|${stiffness}|${damping}|${mass}|${precision}`;
  
  if (trajectoryCache.has(key)) {
    const res = trajectoryCache.get(key)!;
    trajectoryCache.delete(key);
    trajectoryCache.set(key, res);
    return res;
  }

  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  let settleTime = 10;
  if (zeta > 0) {
    const decayRate = zeta * w0;
    settleTime = -Math.log(precision) / decayRate;
  }
  const duration = Math.max(0.1, Math.min(3.0, settleTime));
  const steps = Math.max(40, Math.min(180, Math.round(duration * 120)));
  const progress: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * duration;
    let d = 0;
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      d = -Math.cos(wd * t) * Math.exp(-zeta * w0 * t);
    } else if (zeta === 1) {
      d = -(1 + w0 * t) * Math.exp(-w0 * t);
    } else {
      const r1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1));
      const r2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
      const c1 = r2 / (r2 - r1);
      const c2 = -r1 / (r2 - r1);
      d = c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
    }
    progress.push(1 + d);
  }
  
  // Force boundaries for trajectory stability and test compatibility
  if (progress.length > 0) {
    progress[0] = 0;
    progress[progress.length - 1] = 1;
  }

  const result = { progress, keyframes: progress, duration: duration * 1000 };
  if (trajectoryCache.size >= 100) {
    const firstKey = trajectoryCache.keys().next().value;
    if (firstKey !== undefined) trajectoryCache.delete(firstKey);
  }
  trajectoryCache.set(key, result);
  return result;
}

export function generateSpringImpulseTrajectory(
  config: SpringConfig = {}
): { progress: number[]; keyframes: number[]; duration: number } {
  const { stiffness = 170, damping = 26, mass = 1, precision = 0.0005 } = config;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  let settleTime = 10;
  if (zeta > 0) { settleTime = -Math.log(precision) / (zeta * w0); }
  const duration = Math.max(0.1, Math.min(3.0, settleTime));
  const steps = Math.max(40, Math.min(180, Math.round(duration * 120)));
  const progress: number[] = [];
  const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  const tPeak = (zeta < 1 && wd > 0) ? Math.atan(wd / (zeta * w0)) / wd : 1 / w0;

  const getD = (t: number): number => {
    if (zeta < 1 && wd > 0) return Math.sin(wd * t) * Math.exp(-zeta * w0 * t);
    if (zeta === 1) return t * w0 * Math.exp(-w0 * t);
    const r1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1));
    const r2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
    return (Math.exp(r1 * t) - Math.exp(r2 * t)) / (r2 - r1);
  };

  const peak = getD(tPeak) || 1;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * duration;
    progress.push(getD(t) / peak);
  }
  return { progress, keyframes: progress, duration: duration * 1000 };
}

// 3. Helpers & Caching
const springWrapperCache = new Map<string, { keyframes: number[]; duration: number }>();

export function cachedSpringKeyframes(opts: any = {}) {
  const { stiffness = 170, damping = 26, mass = 1, precision = 0.0005 } = opts;
  const p = opts.restDelta ?? opts.restSpeed ?? precision;
  const key = `0|1|${stiffness}|${damping}|${mass}|${p}`;
  
  if (springWrapperCache.has(key)) {
    const res = springWrapperCache.get(key)!;
    springWrapperCache.delete(key);
    springWrapperCache.set(key, res);
    return res;
  }

  const traj = generateSpringTrajectory(0, 1, { ...opts, precision: p });
  const result = { keyframes: traj.progress, duration: traj.duration };
  
  if (springWrapperCache.size >= 100) {
    const firstKey = springWrapperCache.keys().next().value;
    if (firstKey !== undefined) springWrapperCache.delete(firstKey);
  }
  springWrapperCache.set(key, result);
  return result;
}

export function parseStyleShortcuts(style: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  const transforms: string[] = [];

  const addTransform = (key: string, val: any, defaultUnit: string) => {
    if (val !== undefined && val !== null) {
      const formatted = typeof val === 'number' ? `${val}${defaultUnit}` : val;
      transforms.push(`${key}(${formatted})`);
    }
  };

  addTransform('translateX', style.x !== undefined ? style.x : style.translateX, 'px');
  addTransform('translateY', style.y !== undefined ? style.y : style.translateY, 'px');
  addTransform('translateZ', style.z !== undefined ? style.z : style.translateZ, 'px');
  addTransform('scale', style.scale, '');
  addTransform('scaleX', style.scaleX, '');
  addTransform('scaleY', style.scaleY, '');
  addTransform('scaleZ', style.scaleZ, '');
  addTransform('rotate', style.rotate, 'deg');
  addTransform('rotateX', style.rotateX, 'deg');
  addTransform('rotateY', style.rotateY, 'deg');
  addTransform('rotateZ', style.rotateZ, 'deg');
  addTransform('skewX', style.skewX, 'deg');
  addTransform('skewY', style.skewY, 'deg');

  if (style.blur !== undefined) {
    result.filter = `blur(${typeof style.blur === 'number' ? `${style.blur}px` : style.blur})`;
  }
  if (style.letterSpacing !== undefined) {
    result.letterSpacing = typeof style.letterSpacing === 'number' ? `${style.letterSpacing}px` : style.letterSpacing;
  }
  if (transforms.length > 0) result.transform = transforms.join(' ');

  const excludeKeys = [
    'x', 'y', 'z', 'translateX', 'translateY', 'translateZ',
    'scale', 'scaleX', 'scaleY', 'scaleZ',
    'rotate', 'rotateX', 'rotateY', 'rotateZ',
    'skewX', 'skewY', 'blur', 'letterSpacing'
  ];

  Object.keys(style).forEach((key) => {
    if (excludeKeys.includes(key)) return;
    result[key] = style[key];
  });
  return result;
}

/**
 * Core engine to compile a list of WAAPI keyframes based on spring physics.
 * Handles numeric interpolation, complex transform merging, and string morphing (SVG paths).
 */
export function compileSpringKeyframes(
  first: Keyframe, 
  last: Keyframe, 
  spring: SpringConfig, 
  springType: SpringType = 'standard'
): { keyframes: Keyframe[], duration: number } {
  const { progress, duration } = springType === 'impulse'
    ? generateSpringImpulseTrajectory(spring)
    : generateSpringTrajectory(0, 1, spring);

  const springKeys: Keyframe[] = [];
  const numericProps: string[] = [];
  const morphProps: string[] = [];
  const otherProps: string[] = [];

  const numberRegex = /-?\d*\.?\d+/g;

  Object.keys(last).forEach((key) => {
    if (['offset', 'easing', 'transform', 'composite'].includes(key)) return;
    const valStart = first[key];
    const valEnd = last[key];
    
    if (typeof valStart === 'number' && typeof valEnd === 'number') {
      numericProps.push(key);
    } else if (
      typeof valStart === 'string' && 
      typeof valEnd === 'string' && 
      valStart.match(numberRegex) && 
      valEnd.match(numberRegex)
    ) {
      morphProps.push(key);
    } else {
      otherProps.push(key);
    }
  });

  const startParsed = parseComplexTransform(first.transform as string || '');
  const endParsed = parseComplexTransform(last.transform as string || '');

  progress.forEach((p, index) => {
    const key: Keyframe = {};
    
    // 1. Numeric interpolation
    numericProps.forEach((prop) => {
      const s = first[prop] as number;
      const e = last[prop] as number;
      key[prop] = s + (e - s) * p;
    });

    // 2. String morphing (SVG paths, colors, filters)
    morphProps.forEach((prop) => {
      let val = interpolateString(first[prop] as string, last[prop] as string, p);
      // For SVG 'd' property in CSS, some browsers require path() wrapper
      if (prop === 'd' && !val.startsWith('path(')) {
        val = `path("${val}")`;
      }
      key[prop] = val;
    });

    // 3. Complex Transforms
    const ct = buildComplexTransform(startParsed, endParsed, p);
    if (ct) key.transform = ct;

    // 4. Fallback for non-interpolatable props
    if (index === 0) {
      otherProps.forEach((prop) => key[prop] = first[prop]);
    } else if (index === progress.length - 1) {
      otherProps.forEach((prop) => key[prop] = last[prop]);
    }
    springKeys.push(key);
  });

  return { keyframes: springKeys, duration };
}

/**
 * Interpolates numbers within a string. Used for SVG path morphing, complex filters, etc.
 */
export function interpolateString(f: string, t: string, p: number): string {
  const re = /-?\d*\.?\d+/g, m1 = f.match(re), m2 = t.match(re);
  if (!m1 || !m2 || m1.length !== m2.length) return p < .5 ? f : t;
  let i = 0;
  return t.replace(re, () => {
    const s = parseFloat(m1[i]!), target = parseFloat(m2[i++]!);
    const v = s + (target - s) * p;
    return v % 1 === 0 ? v.toString() : v.toFixed(3);
  });
}

/**
 * Creates a helper to follow an SVG path trajectory.
 * Returns a function that maps progress (0-1) to {x, y} coordinates.
 */
export function path(selector: string) {
  if (typeof window === 'undefined') return () => ({ x: 0, y: 0 });
  const el = document.querySelector(selector);
  if (!(el instanceof SVGPathElement)) {
    console.warn(`Pixon: Path selector "${selector}" not found or not an SVGPathElement.`);
    return () => ({ x: 0, y: 0 });
  }
  const length = el.getTotalLength();
  return (p: number) => {
    const pt = el.getPointAtLength(p * length);
    return { x: pt.x, y: pt.y };
  };
}

/**
 * Captures current visual state of an element, preferring active animation keyframes 
 * to avoid getComputedStyle race conditions during active motion.
 */
export function captureElementState(el: HTMLElement, props: string[]): Keyframe {
  const state: Keyframe = {};
  if (typeof window === 'undefined') return state;
  const anims = el.getAnimations?.() || [];
  anims.forEach(a => {
    if (a.effect instanceof KeyframeEffect) {
      const kf = a.effect.getKeyframes().at(-1);
      if (kf) props.forEach(p => kf[p] !== undefined && (state[p] = kf[p]));
    }
  });
  const miss = props.filter(p => state[p] === undefined);
  if (miss.length > 0) {
    const s = getComputedStyle(el);
    miss.forEach(p => state[p] = s.getPropertyValue(p) || (s as any)[p]);
  }
  return state;
}

export function interpolateValue(from: number, to: number, p: number): number {
  return from + (to - from) * p;
}

export type ParsedTransform = Record<string, number | string>;

export function parseComplexTransform(str: string): ParsedTransform {
  if (!str || str === 'none') return {};
  const result: ParsedTransform = {};
  const regex = /(\w+)\(([^)]+)\)/g;
  let m;
  while ((m = regex.exec(str)) !== null) {
    if (m[1] && m[2]) {
      if (m[1] === 'matrix' || m[1] === 'matrix3d') continue;
      const v = parseFloat(m[2]);
      if (!isNaN(v)) result[m[1]] = v;
    }
  }
  return result;
}

export function buildComplexTransform(start: ParsedTransform, end: ParsedTransform, p: number): string {
  const transforms: string[] = [];
  const keys = Array.from(new Set([...Object.keys(start), ...Object.keys(end)]));
  keys.forEach(k => {
    const s = (start[k] as number) ?? (k.startsWith('scale') ? 1 : (k.startsWith('translate') ? 0 : 0));
    const e = (end[k] as number) ?? (k.startsWith('scale') ? 1 : (k.startsWith('translate') ? 0 : 0));
    const val = s + (e - s) * p;
    const unit = k.includes('rotate') || k.includes('skew') ? 'deg' : (k.includes('translate') ? 'px' : '');
    transforms.push(`${k}(${val}${unit})`);
  });
  return transforms.join(' ');
}

export function calculateStagger(index: number, total: number, config: StaggerConfig): number {
  const { delay, from = 'first', grid, axis } = config;
  if (!grid) {
    if (from === 'first') return index * delay;
    if (from === 'last') return (total - 1 - index) * delay;
    if (from === 'center') return Math.abs((total - 1) / 2 - index) * delay;
    if (typeof from === 'number') return Math.abs(from - index) * delay;
    return index * delay;
  }
  const [cols] = grid;
  const col = index % cols;
  const row = Math.floor(index / cols);
  let fCol = 0, fRow = 0;
  if (from === 'last') { fCol = cols - 1; fRow = Math.ceil(total / cols) - 1; }
  else if (from === 'center') { fCol = (cols - 1) / 2; fRow = (Math.ceil(total / cols) - 1) / 2; }
  else if (typeof from === 'number') { fCol = from % cols; fRow = Math.floor(from / cols); }
  const dx = col - fCol;
  const dy = row - fRow;
  if (axis === 'x') return Math.abs(dx) * delay;
  if (axis === 'y') return Math.abs(dy) * delay;
  return Math.sqrt(dx * dx + dy * dy) * delay;
}

// 4. Timeline
export class PixonTimeline {
  private tracks: TimelineTrack[] = [];
  private activeAnimations: Animation[] = [];
  private resolveFinished?: () => void;
  public finished: Promise<void>;

  constructor() {
    this.finished = new Promise<void>((resolve) => {
      this.resolveFinished = resolve;
    });
  }

  public add(track: TimelineTrack): this;
  public add(target: AnimatableTarget, keyframes: Keyframe[] | PropertyIndexedKeyframes | Record<string, any>, options?: UltimateAnimationOptions): this;
  public add(targetOrTrack: AnimatableTarget | TimelineTrack, keyframes?: Keyframe[] | PropertyIndexedKeyframes | Record<string, any>, options?: UltimateAnimationOptions): this {
    if (keyframes === undefined) {
      const track = targetOrTrack as TimelineTrack;
      track.keyframes = prepareKeyframes(track.keyframes);
      this.tracks.push(track);
    } else {
      const target = targetOrTrack as AnimatableTarget;
      this.tracks.push({
        target,
        keyframes: prepareKeyframes(keyframes),
        duration: options?.duration,
        delay: options?.delay,
        stagger: options?.stagger,
        easing: options?.easing,
        spring: options?.spring,
        springType: options?.springType,
        offset: options?.offset,
      });
    }
    return this;
  }

  private resolveTargets(target: AnimatableTarget): Element[] {
    if (!target) return [];
    if (typeof target === 'string') return Array.from(document.querySelectorAll(target));
    if (target instanceof Element) return [target];
    if (target instanceof NodeList) return Array.from(target) as Element[];
    if (Array.isArray(target)) {
      return (target as any[]).flatMap((t) => {
        if (!t) return [];
        if (t instanceof Element) return [t];
        if (typeof t === 'object' && 'current' in t) return t.current ? [t.current] : [];
        return [];
      });
    }
    if (typeof target === 'object' && 'current' in target) return (target as any).current ? [(target as any).current] : [];
    return [];
  }

  public play(): PixonTimelineController {
    this.cancel();
    this.activeAnimations = [];
    let prevStart = 0;
    let end = 0;
    const completedPromises: Promise<void>[] = [];
    this.tracks.forEach(t => {
      const targets = this.resolveTargets(t.target);
      if (!targets.length) return;
      let start = end, kfs = t.keyframes as Keyframe[], dur = t.duration ?? 400, easing = t.easing ?? 'cubic-bezier(.16,1,.3,1)';
      if (t.offset !== undefined) {
        const off = String(t.offset);
        if (off.startsWith('+=')) start = end + parseFloat(off.slice(2));
        else if (off.startsWith('-=')) start = end - parseFloat(off.slice(2));
        else if (off.startsWith('<')) start = prevStart + (parseFloat(off.slice(1)) || 0);
        else if (off.startsWith('>')) start = end + (parseFloat(off.slice(1)) || 0);
        else start = parseFloat(off);
      }
      start = Math.max(0, start);
      if (t.spring || (Array.isArray(t.keyframes) && t.keyframes.some(k => 'd' in k))) {
        const last = (kfs.at(-1) || {}) as Keyframe, first = kfs.length > 1 ? (kfs[0] as Keyframe) : (targets[0] instanceof HTMLElement ? captureElementState(targets[0], Object.keys(last)) : {});
        const s = compileSpringKeyframes(first, last, t.spring || { stiffness: 170, damping: 26 }, t.springType);
        if (t.spring) { dur = s.duration; easing = 'linear'; }
        kfs = s.keyframes;
      }
      const stagger = t.stagger ?? t.delay ?? 0;
      let maxD = 0;
      targets.forEach((el: any, i) => {
        const d = start + (i * stagger);
        if (el.style) el.style.willChange = 'transform, opacity';
        const a = el.animate(kfs, { delay: d, duration: dur, easing, fill: 'both', composite: t.composite || 'add' });
        this.activeAnimations.push(a);
        maxD = Math.max(maxD, d + dur);
        completedPromises.push(a.finished.then(() => {
          if (a.playState === 'finished' && el.isConnected) {
            a.commitStyles(); a.cancel(); if (el.style) el.style.willChange = 'auto';
          }
        }).catch(() => {}));
      });
      prevStart = start; end = maxD;
    });
    Promise.all(completedPromises).then(() => this.resolveFinished?.());
    return this.getController();
  }

  private getController(): PixonTimelineController {
    return {
      play: () => { this.activeAnimations.forEach(a => a.play()); return this.getController(); },
      pause: () => { this.activeAnimations.forEach(a => a.pause()); return this.getController(); },
      reverse: () => { this.activeAnimations.forEach(a => a.reverse()); return this.getController(); },
      restart: () => { this.play(); return this.getController(); },
      seek: (t) => { this.activeAnimations.forEach(a => a.currentTime = t); return this.getController(); },
      cancel: () => { this.cancel(); return this.getController(); },
      finished: this.finished,
      getAnimations: () => this.activeAnimations,
    };
  }

  public cancel(): void { this.activeAnimations.forEach(a => a.cancel()); this.activeAnimations = []; }
}

// 5. Dynamic CSS Sheet
let pixonSheet: CSSStyleSheet | null = null;
const ruleRegistry = new Map<string, Set<string>>();

export function clearStyles() {
  if (pixonSheet) {
    const el = document.getElementById('pixon-motion-sheet');
    if (el) el.remove();
    pixonSheet = null;
  }
  ruleRegistry.clear();
}

export function insertScopedRules(scopeId: string, css: string): () => void {
  if (typeof document === 'undefined') return () => {};
  if (!pixonSheet) {
    const el = document.createElement('style');
    el.id = 'pixon-motion-sheet';
    el.setAttribute('data-pixon-sheet', '');
    document.head.appendChild(el);
    pixonSheet = el.sheet as CSSStyleSheet;
  }
  const rules = css.split('}').map(r => r.trim()).filter(Boolean).map(r => r + '}');
  if (!ruleRegistry.has(scopeId)) ruleRegistry.set(scopeId, new Set());
  const scopeSet = ruleRegistry.get(scopeId)!;
  rules.forEach(rule => {
    try {
      pixonSheet!.insertRule(rule, pixonSheet!.cssRules.length);
      scopeSet.add(rule);
    } catch (e) {}
  });
  return () => {
    const rulesToDelete = Array.from(scopeSet);
    for (let i = pixonSheet!.cssRules.length - 1; i >= 0; i--) {
      const ruleNode = pixonSheet!.cssRules[i];
      if (ruleNode && rulesToDelete.includes(ruleNode.cssText)) {
        pixonSheet!.deleteRule(i);
        scopeSet.delete(ruleNode.cssText);
      }
    }
  };
}

// 6. View Transitions
export function startPixonTransition(
  update: ViewTransitionCallback,
  opts: PixonTransitionOptions = {}
): Promise<void> {
  const { duration = 250, easing = 'ease-in-out', skipFallback = false } = opts;
  if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    const res = update();
    return res instanceof Promise ? res.then(() => {}) : Promise.resolve();
  }
  const doc = document as any;
  if (typeof doc.startViewTransition === 'function') return doc.startViewTransition(update).finished.catch(() => {});
  if (skipFallback) {
    const res = update();
    return res instanceof Promise ? res.then(() => {}) : Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-pixon-transition-overlay', '');
    overlay.style.cssText = `position:fixed;inset:0;background:var(--pixon-bg, #000);opacity:0;pointer-events:none;z-index:2147483646;transition:opacity ${duration / 2}ms ${easing};`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.addEventListener('transitionend', () => {
        const res = update();
        Promise.resolve(res).then(() => {
          requestAnimationFrame(() => {
            overlay.style.opacity = '0';
            overlay.addEventListener('transitionend', () => { overlay.remove(); resolve(); }, { once: true });
          });
        });
      }, { once: true });
    });
  });
}

/**
 * PixonTimeline Factory
 * Orchestrates multi-element WAAPI animations with stagger and spring physics.
 */
export function timeline(tracksOrOptions: TimelineTrack[] | UltimateAnimationOptions = [], options: UltimateAnimationOptions = {}): PixonTimeline {
  const tl = new PixonTimeline();
  if (Array.isArray(tracksOrOptions)) {
    tracksOrOptions.forEach(track => tl.add(track));
  }
  // Note: PixonTimeline doesn't currently use global options, but we could add them if needed.
  return tl;
}
