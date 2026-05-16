type VarKeyframe = Record<string, any>;

type Parsed = { n: number; unit: string } | { raw: string };

function parseValue(v: any): Parsed {
  if (v == null) return { raw: '' };
  if (typeof v === 'number') return { n: v, unit: '' };
  const s = String(v).trim();
  const m = /^(-?\d+(?:\.\d+)?)([a-zA-Z%]*)$/.exec(s);
  if (!m) return { raw: s };
  return { n: Number(m[1]), unit: m[2] ?? '' };
}

function formatValue(p: Parsed): string {
  if ('raw' in p) return p.raw;
  // Keep unitless numbers as plain strings (CSS vars accept both).
  return `${p.n}${p.unit}`;
}

// Tiny cubic-bezier evaluator (solve for y given x=t).
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDerivX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveT = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const x2 = sampleX(t) - x;
      const d2 = sampleDerivX(t);
      if (Math.abs(x2) < 1e-6) return t;
      if (Math.abs(d2) < 1e-6) break;
      t = t - x2 / d2;
    }
    // Fallback to binary subdivision.
    let a = 0;
    let b = 1;
    t = x;
    for (let i = 0; i < 12; i++) {
      const x2 = sampleX(t);
      if (Math.abs(x2 - x) < 1e-6) return t;
      if (x > x2) a = t;
      else b = t;
      t = (a + b) / 2;
    }
    return t;
  };

  return (x: number) => {
    const t = solveT(Math.max(0, Math.min(1, x)));
    return sampleY(t);
  };
}

function easingFn(easing: string | undefined): (t: number) => number {
  const e = (easing || 'linear').trim();
  if (e === 'linear') return (t) => t;
  if (e === 'ease') return cubicBezier(0.25, 0.1, 0.25, 1);
  if (e === 'ease-in') return cubicBezier(0.42, 0, 1, 1);
  if (e === 'ease-out') return cubicBezier(0, 0, 0.58, 1);
  if (e === 'ease-in-out') return cubicBezier(0.42, 0, 0.58, 1);
  const m = /^cubic-bezier\(\s*([0-9.\-]+)\s*,\s*([0-9.\-]+)\s*,\s*([0-9.\-]+)\s*,\s*([0-9.\-]+)\s*\)$/.exec(e);
  if (m) return cubicBezier(Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]));
  return (t) => t;
}

function lerp(a: Parsed, b: Parsed, t: number): Parsed {
  if ('raw' in a || 'raw' in b) return t < 1 ? a : b;
  if (a.unit !== b.unit) return t < 1 ? a : b;
  return { n: a.n + (b.n - a.n) * t, unit: a.unit };
}

export type VarTweenHandle = {
  cancel: () => void;
  finished: Promise<void>;
};

/**
 * Fallback tween for CSS custom properties in browsers without `CSS.registerProperty`.
 * Only intended for transform-channel vars (px/deg/unitless numbers).
 */
export function tweenCustomProperties(
  el: HTMLElement,
  keyframes: VarKeyframe[],
  options: { duration: number; delay?: number; easing?: string; iterations?: number; direction?: PlaybackDirection; fill?: FillMode } = { duration: 400 }
): VarTweenHandle {
  const duration = Math.max(0, options.duration ?? 0);
  const delay = Math.max(0, options.delay ?? 0);
  const iterations = options.iterations ?? 1;
  const direction = options.direction ?? 'normal';
  const ease = easingFn(options.easing);

  // Only supports 2+ frames; for 1 frame we just apply immediately after delay.
  const frames = keyframes.length >= 2 ? keyframes : [keyframes[0] ?? {}, keyframes[0] ?? {}];
  const from = frames[0]!;
  const to = frames[frames.length - 1]!;

  const keys = Array.from(
    new Set([...Object.keys(from), ...Object.keys(to)].filter((k) => k.startsWith('--')))
  );
  const fromParsed: Record<string, Parsed> = {};
  const toParsed: Record<string, Parsed> = {};
  keys.forEach((k) => {
    fromParsed[k] = parseValue(from[k]);
    toParsed[k] = parseValue(to[k]);
  });

  let raf: number | null = null;
  let stopped = false;
  let resolveFinished!: () => void;
  const finished = new Promise<void>((r) => { resolveFinished = r; });

  const applyAt = (p: number) => {
    const eased = ease(p);
    for (const k of keys) {
      const v = lerp(fromParsed[k]!, toParsed[k]!, eased);
      try { el.style.setProperty(k, formatValue(v)); } catch {}
    }
  };

  const startAt = performance.now() + delay;
  const totalDuration = duration * Math.max(1, iterations);

  const tick = (now: number) => {
    if (stopped) return;
    const t = now - startAt;
    if (t < 0) {
      raf = requestAnimationFrame(tick);
      return;
    }

    const clamped = Math.min(t, totalDuration);
    const iter = duration > 0 ? Math.floor(clamped / duration) : 0;
    const local = duration > 0 ? (clamped - iter * duration) / duration : 1;

    const isReverse = direction === 'reverse' || (direction === 'alternate' && iter % 2 === 1) || (direction === 'alternate-reverse' && iter % 2 === 0);
    applyAt(isReverse ? 1 - local : local);

    if (t >= totalDuration) {
      raf = null;
      resolveFinished();
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  return {
    cancel() {
      stopped = true;
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
      resolveFinished();
    },
    finished,
  };
}

