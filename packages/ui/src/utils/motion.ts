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

// 2. Spring Physics
const trajectoryCache = new Map<string, { progress: number[]; duration: number }>();

export function generateSpringTrajectory(
  from: number,
  to: number,
  config: SpringConfig = {}
): { progress: number[]; duration: number } {
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

  const result = { progress, duration: duration * 1000 };
  if (trajectoryCache.size >= 100) {
    const firstKey = trajectoryCache.keys().next().value;
    if (firstKey !== undefined) trajectoryCache.delete(firstKey);
  }
  trajectoryCache.set(key, result);
  return result;
}

export function generateSpringImpulseTrajectory(
  config: SpringConfig = {}
): { progress: number[]; duration: number } {
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
  return { progress, duration: duration * 1000 };
}

// 3. Helpers & Caching
export function cachedSpringKeyframes(opts: any = {}) {
  const traj = generateSpringTrajectory(0, 1, opts);
  return { keyframes: traj.progress, duration: traj.duration };
}

export function parseStyleShortcuts(style: any): any {
  const result: any = {};
  const transforms: string[] = [];
  const addT = (k: string, v: any, u: string) => {
    if (v !== undefined && v !== null) {
      transforms.push(`${k}(${typeof v === 'number' ? `${v}${u}` : v})`);
    }
  };

  addT('translateX', style.x ?? style.translateX, 'px');
  addT('translateY', style.y ?? style.translateY, 'px');
  addT('scale', style.scale, '');
  addT('scaleX', style.scaleX, '');
  addT('scaleY', style.scaleY, '');
  addT('rotate', style.rotate, 'deg');
  addT('rotateX', style.rotateX, 'deg');
  addT('rotateY', style.rotateY, 'deg');
  addT('skewX', style.skewX, 'deg');
  addT('skewY', style.skewY, 'deg');
  
  if (style.blur !== undefined) {
    result.filter = `blur(${typeof style.blur === 'number' ? `${style.blur}px` : style.blur})`;
  }
  if (transforms.length > 0) result.transform = transforms.join(' ');

  const exclude = ['x', 'y', 'translateX', 'translateY', 'scale', 'scaleX', 'scaleY', 'rotate', 'rotateX', 'rotateY', 'skewX', 'skewY', 'blur'];
  Object.keys(style).forEach(k => { if (!exclude.includes(k)) result[k] = style[k]; });
  return result;
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
    const s = (start[k] as number) ?? (k.startsWith('scale') ? 1 : 0);
    const e = (end[k] as number) ?? (k.startsWith('scale') ? 1 : 0);
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

// 4. Dynamic CSS Sheet
let pixonSheet: CSSStyleSheet | null = null;
const ruleRegistry = new Map<string, Set<string>>();

export function insertScopedRules(scopeId: string, css: string): () => void {
  if (typeof document === 'undefined') return () => {};
  if (!pixonSheet) {
    const el = document.createElement('style');
    el.id = 'pixon-motion-sheet';
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

// 5. View Transitions
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
