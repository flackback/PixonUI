import {
  AnimationStudioChannel,
  AnimationStudioKeyframe,
  AnimationStudioTrack,
  AnimationStudioClip,
  AnimationStudioElement,
} from './AnimationStudio.types';

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let x = t;
    for (let i = 0; i < 8; i++) {
      const currentX = 3 * (1 - x) * (1 - x) * x * x1 + 3 * (1 - x) * x * x * x2 + x * x * x;
      const derivativeX = 3 * (1 - x) * (1 - x) * x1 + 6 * (1 - x) * x * (x2 - x1) + 3 * x * x * (1 - x2);
      if (Math.abs(currentX - t) < 1e-5) break;
      if (Math.abs(derivativeX) < 1e-5) break;
      x -= (currentX - t) / derivativeX;
    }
    return 3 * (1 - x) * (1 - x) * x * y1 + 3 * (1 - x) * x * x * y2 + x * x * x;
  };
}

export function easeOutBounce(t: number) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    let tTemp = t - 1.5 / d1;
    return n1 * tTemp * tTemp + 0.75;
  } else if (t < 2.5 / d1) {
    let tTemp = t - 2.25 / d1;
    return n1 * tTemp * tTemp + 0.9375;
  } else {
    let tTemp = t - 2.625 / d1;
    return n1 * tTemp * tTemp + 0.984375;
  }
}

export function easeInBounce(t: number) {
  return 1 - easeOutBounce(1 - t);
}

export function easeInOutBounce(t: number) {
  return t < 0.5
    ? (1 - easeOutBounce(1 - 2 * t)) / 2
    : (1 + easeOutBounce(2 * t - 1)) / 2;
}

export const EASING_CURVES: Record<string, (t: number) => number> = {
  linear: (t) => t,
  'ease-in': cubicBezier(0.42, 0, 1, 1),
  'ease-out': cubicBezier(0, 0, 0.58, 1),
  'ease-in-out': cubicBezier(0.42, 0, 0.58, 1),
  'ease-in-sine': (t) => 1 - Math.cos((t * Math.PI) / 2),
  'ease-out-sine': (t) => Math.sin((t * Math.PI) / 2),
  'ease-in-out-sine': (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  'ease-in-quad': (t) => t * t,
  'ease-out-quad': (t) => 1 - (1 - t) * (1 - t),
  'ease-in-out-quad': (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  'ease-in-cubic': (t) => t * t * t,
  'ease-out-cubic': (t) => 1 - Math.pow(1 - t, 3),
  'ease-in-out-cubic': (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  'ease-in-quart': (t) => t * t * t * t,
  'ease-out-quart': (t) => 1 - Math.pow(1 - t, 4),
  'ease-in-out-quart': (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  'ease-in-quint': (t) => t * t * t * t * t,
  'ease-out-quint': (t) => 1 - Math.pow(1 - t, 5),
  'ease-in-out-quint': (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
  'ease-in-expo': (t) => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
  'ease-out-expo': (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  'ease-in-out-expo': (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  'ease-in-circ': (t) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
  'ease-out-circ': (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  'ease-in-out-circ': (t) => t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  'ease-in-back': (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  'ease-out-back': (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  'ease-in-out-back': (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  'ease-in-bounce': easeInBounce,
  'ease-out-bounce': easeOutBounce,
  'ease-in-out-bounce': easeInOutBounce,
  'bounce-in': easeInBounce,
  'bounce-out': easeOutBounce,
  'bounce-in-out': easeInOutBounce,
  'spring-wobbly': (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 3 * Math.PI) + 1;
  },
  'spring-stiff': (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -12 * t) * Math.sin((t - 0.05) * 4 * Math.PI) + 1;
  },
  'spring-slow': (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -6 * t) * Math.sin((t - 0.15) * 2 * Math.PI) + 1;
  },
  'spring-custom': (t) => t,
  'elastic': (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  'elite-out': cubicBezier(0.16, 1, 0.3, 1),
  'elite-in-out': cubicBezier(0.87, 0, 0.13, 1),
  'spring-out': cubicBezier(0.34, 1.56, 0.64, 1),
  'soft-bounce': cubicBezier(0.47, 1.64, 0.41, 0.8),
};

export function parseCubicBezierString(easing?: string): [number, number, number, number] | null {
  if (!easing) return null;
  const match = easing.trim().match(/^cubic-bezier\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)$/);
  if (!match) return null;
  const values = match.slice(1).map(Number);
  if (values.some((value) => Number.isNaN(value))) return null;
  return values as [number, number, number, number];
}

export type CustomCurvePoint = { x: number; y: number };

export function parseCustomCurveString(easing?: string): CustomCurvePoint[] | null {
  if (!easing) return null;
  const match = easing.trim().match(/^curve\(\s*(.+)\s*\)$/);
  if (!match) return null;
  const raw = match[1] ?? '';
  const points = raw
    .split('|')
    .map((part) => part.trim())
    .map((part) => {
      const m = part.match(/^(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)$/);
      if (!m) return null;
      const x = Number(m[1]);
      const y = Number(m[2]);
      if (Number.isNaN(x) || Number.isNaN(y)) return null;
      return { x, y };
    })
    .filter((point): point is CustomCurvePoint => !!point)
    .sort((a, b) => a.x - b.x);
  if (points.length < 2) return null;
  return points;
}

export function serializeCustomCurve(points: CustomCurvePoint[]) {
  const clamped = [...points]
    .map((p) => ({ x: Math.max(0, Math.min(1, p.x)), y: Math.max(-2, Math.min(3, p.y)) }))
    .sort((a, b) => a.x - b.x);
  return `curve(${clamped.map((p) => `${Number(p.x.toFixed(3))},${Number(p.y.toFixed(3))}`).join('|')})`;
}

export function evaluateCustomCurve(points: CustomCurvePoint[], t: number) {
  if (points.length === 0) return t;
  const sorted = [...points].sort((a, b) => a.x - b.x);
  if (t <= sorted[0]!.x) return sorted[0]!.y;
  if (t >= sorted[sorted.length - 1]!.x) return sorted[sorted.length - 1]!.y;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]!;
    const b = sorted[i + 1]!;
    if (t >= a.x && t <= b.x) {
      const span = Math.max(1e-6, b.x - a.x);
      const p = (t - a.x) / span;
      return a.y + (b.y - a.y) * p;
    }
  }
  return t;
}

export function getEasingFunction(kf: Pick<AnimationStudioKeyframe, 'easing' | 'mass' | 'stiffness' | 'damping'>) {
  if (kf.easing === 'spring-custom') {
    return calculateSpringCurve(kf.mass ?? 1, kf.stiffness ?? 100, kf.damping ?? 10);
  }
  const customCurve = parseCustomCurveString(kf.easing);
  if (customCurve) {
    return (val: number) => evaluateCustomCurve(customCurve, val);
  }
  const bezier = parseCubicBezierString(kf.easing);
  if (bezier) return cubicBezier(...bezier);
  return EASING_CURVES[kf.easing || 'linear'] || ((val: number) => val);
}

export function calculateSpringCurve(mass: number, stiffness: number, damping: number) {
  const omega0 = Math.sqrt(stiffness / mass);
  const beta = damping / (2 * mass);
  
  if (omega0 > beta) {
    const omegaD = Math.sqrt(omega0 * omega0 - beta * beta);
    return (t: number) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      const sec = t * 1.5; 
      const envelope = Math.exp(-beta * sec);
      return 1 - envelope * (Math.cos(omegaD * sec) + (beta / omegaD) * Math.sin(omegaD * sec));
    };
  } else {
    const r = Math.sqrt(Math.max(0.001, beta * beta - omega0 * omega0));
    return (t: number) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      const sec = t * 1.5;
      const envelope = Math.exp(-beta * sec);
      return 1 - envelope * (Math.cosh(r * sec) + (beta / r) * Math.sinh(r * sec));
    };
  }
}

export function sortKeyframes(keyframes: AnimationStudioKeyframe[]) {
  return [...keyframes].sort((a, b) => a.t - b.t);
}

export function parsePathStandalone(d: string) {
  const commands: { type: string; args: number[] }[] = [];
  const regex = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
  let match;
  while ((match = regex.exec(d)) !== null) {
    const type = match[1] ?? '';
    const argStr = (match[2] ?? '').trim();
    const args = argStr ? argStr.split(/[\s,]+/).map(Number).filter(n => !isNaN(n)) : [];
    commands.push({ type, args });
  }
  return commands;
}

export function serializePathStandalone(commands: { type: string; args: number[] }[]): string {
  return commands.map(c => `${c.type} ${c.args.join(' ')}`).join(' ');
}

export function interpolateSvgPaths(pathA: string, pathB: string, p: number): string {
  const cmdsA = parsePathStandalone(pathA);
  const cmdsB = parsePathStandalone(pathB);
  
  if (cmdsA.length === 0 && cmdsB.length === 0) return '';
  if (cmdsA.length === 0) return pathB;
  if (cmdsB.length === 0) return pathA;
  
  const maxLen = Math.max(cmdsA.length, cmdsB.length);
  const alignedA = [...cmdsA];
  const alignedB = [...cmdsB];
  
  while (alignedA.length < maxLen) {
    const last = alignedA[alignedA.length - 1] || { type: 'M', args: [0, 0] };
    alignedA.push({ ...last, args: [...last.args] });
  }
  while (alignedB.length < maxLen) {
    const last = alignedB[alignedB.length - 1] || { type: 'M', args: [0, 0] };
    alignedB.push({ ...last, args: [...last.args] });
  }
  
  const interpolatedCmds = alignedA.map((cmdA, idx) => {
    const cmdB = alignedB[idx]!;
    const type = cmdA.type;
    
    const maxArgs = Math.max(cmdA.args.length, cmdB.args.length);
    const argsA = [...cmdA.args];
    const argsB = [...cmdB.args];
    while (argsA.length < maxArgs) argsA.push(argsA[argsA.length - 2] ?? argsA[argsA.length - 1] ?? 0);
    while (argsB.length < maxArgs) argsB.push(argsB[argsB.length - 2] ?? argsB[argsB.length - 1] ?? 0);
    
    const args = argsA.map((valA, argIdx) => {
      const valB = argsB[argIdx]!;
      return valA + (valB - valA) * p;
    });
    
    return { type, args };
  });
  
  return serializePathStandalone(interpolatedCmds);
}

export function valueAt(track: AnimationStudioTrack, t: number): number | string {
  const kfs = sortKeyframes(track.keyframes);
  if (kfs.length === 0) {
    if (track.channel === 'opacity') return 1;
    if (track.channel === 'scale') return 1;
    if (track.channel === 'scaleX' || track.channel === 'scaleY') return 1;
    if (track.channel === 'brightness' || track.channel === 'contrast' || track.channel === 'saturate') return 100;
    if (track.channel === 'zIndex') return 1;
    if (track.channel === 'originX' || track.channel === 'originY') return 50;
    if (track.channel === 'borderColorH' || track.channel === 'bgH') return 270;
    if (track.channel === 'borderColorS' || track.channel === 'bgS') return 80;
    if (track.channel === 'borderColorL' || track.channel === 'bgL') return 50;
    if (track.channel === 'borderColorA' || track.channel === 'bgA') return 1;
    if (track.channel === 'd') return "M 0 0 L 100 0 L 100 100 L 0 100 Z";
    if (track.channel === 'cameraZoom') return 1;
    return 0;
  }
  if (t <= kfs[0]!.t) return kfs[0]!.v;
  if (t >= kfs[kfs.length - 1]!.t) return kfs[kfs.length - 1]!.v;
  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i]!;
    const b = kfs[i + 1]!;
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t || 1;
      let p = (t - a.t) / span;
      const easeFn = getEasingFunction(a);
      p = easeFn(p);
      if (track.channel === 'd') {
        return interpolateSvgPaths(String(a.v), String(b.v), p);
      }
      return Number(a.v) + (Number(b.v) - Number(a.v)) * p;
    }
  }
  return kfs[kfs.length - 1]!.v;
}

export interface ResolvedElementFrame {
  id: string;
  parentId?: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
  width: number;
  height: number;
  globalX: number;
  globalY: number;
}

function numericChannel(el: AnimationStudioElement, channel: AnimationStudioChannel, timeMs: number, fallback: number) {
  const track = el.tracks.find((tr) => tr.channel === channel);
  return Number(track ? valueAt(track, timeMs) : fallback);
}

function defaultSize(el: AnimationStudioElement) {
  if (el.type === 'image') return { width: 120, height: 80 };
  if (el.type === 'star') return { width: 80, height: 80 };
  if (el.type === 'text') return { width: 80, height: 30 };
  if (el.type === 'group') return { width: 0, height: 0 };
  return { width: 100, height: 100 };
}

export function getChildren(elements: AnimationStudioElement[], parentId: string) {
  return elements.filter((el) => el.parentId === parentId);
}

export function getRootElements(elements: AnimationStudioElement[]) {
  return elements.filter((el) => !el.parentId);
}

export function wouldCreateParentCycle(elements: AnimationStudioElement[], childId: string, parentId: string) {
  let currentId: string | undefined = parentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === childId || visited.has(currentId)) return true;
    visited.add(currentId);
    currentId = elements.find((el) => el.id === currentId)?.parentId;
  }

  return false;
}

export function resolveElementFrame(el: AnimationStudioElement, timeMs: number): ResolvedElementFrame {
  const size = defaultSize(el);
  return {
    id: el.id,
    parentId: el.parentId,
    x: numericChannel(el, 'x', timeMs, 0),
    y: numericChannel(el, 'y', timeMs, 0),
    scale: numericChannel(el, 'scale', timeMs, 1),
    rotate: numericChannel(el, 'rotate', timeMs, 0),
    opacity: numericChannel(el, 'opacity', timeMs, 1),
    width: numericChannel(el, 'width', timeMs, size.width),
    height: numericChannel(el, 'height', timeMs, size.height),
    globalX: 0,
    globalY: 0,
  };
}

export function resolveElementTree(elements: AnimationStudioElement[], timeMs: number) {
  const frameMap = new Map<string, ResolvedElementFrame>();
  elements.forEach((el) => frameMap.set(el.id, resolveElementFrame(el, timeMs)));

  const resolveGlobal = (id: string, stack = new Set<string>()): ResolvedElementFrame | undefined => {
    const frame = frameMap.get(id);
    if (!frame || stack.has(id)) return frame;
    stack.add(id);
    if (!frame.parentId) {
      frame.globalX = frame.x;
      frame.globalY = frame.y;
      return frame;
    }
    const parent = resolveGlobal(frame.parentId, stack);
    frame.globalX = (parent?.globalX ?? 0) + frame.x;
    frame.globalY = (parent?.globalY ?? 0) + frame.y;
    return frame;
  };

  elements.forEach((el) => resolveGlobal(el.id));
  return frameMap;
}

export function toLocalPoint(elements: AnimationStudioElement[], childId: string, parentId: string, timeMs: number) {
  const frames = resolveElementTree(elements, timeMs);
  const child = frames.get(childId);
  const parent = frames.get(parentId);
  return {
    x: (child?.globalX ?? 0) - (parent?.globalX ?? 0),
    y: (child?.globalY ?? 0) - (parent?.globalY ?? 0),
  };
}

export function compileKeyframes(clip: AnimationStudioClip, el?: AnimationStudioElement) {
  const durationMs = Math.max(1, clip.durationMs);
  const times = new Set<number>([0, durationMs]);
  for (const track of clip.tracks) {
    for (const kf of track.keyframes) times.add(clamp(kf.t, 0, durationMs));
  }
  const sortedTimes = [...times].sort((a, b) => a - b);

  const channels: Record<AnimationStudioChannel, any> = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
    blur: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    hueRotate: 0,
    saturate: 100,
    sepia: 0,
    zIndex: 1,
    rotateX: 0,
    rotateY: 0,
    originX: 50,
    originY: 50,
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    shadowSpread: 0,
    shadowOpacity: 0,
    borderRadius: 0,
    borderRadiusTopLeft: 0,
    borderRadiusTopRight: 0,
    borderRadiusBottomRight: 0,
    borderRadiusBottomLeft: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderColorH: 270,
    borderColorS: 80,
    borderColorL: 50,
    borderColorA: 1,
    bgH: 270,
    bgS: 80,
    bgL: 50,
    bgA: 1,
    bg2H: 220,
    bg2S: 80,
    bg2L: 50,
    bg2A: 0,
    bgAngle: 135,
    bgPosX: 0,
    bgPosY: 0,
    clipTop: 0,
    clipRight: 0,
    clipBottom: 0,
    clipLeft: 0,
    width: 0,
    height: 0,
    offsetDistance: 0,
    offsetRotate: 0,
    d: "M 0 0 L 100 0 L 100 100 L 0 100 Z",
    cameraZoom: 1,
    cameraPanX: 0,
    cameraPanY: 0,
    cameraTilt: 0,
  };

  const trackMap = new Map<AnimationStudioChannel, AnimationStudioTrack>();
  for (const t of clip.tracks) trackMap.set(t.channel, t);

  return sortedTimes.map((time) => {
    for (const ch of Object.keys(channels) as AnimationStudioChannel[]) {
      const track = trackMap.get(ch);
      if (track) {
        channels[ch] = valueAt(track, time);
      } else {
        if (ch === 'opacity' || ch === 'scale') {
          channels[ch] = 1;
        } else if (ch === 'scaleX' || ch === 'scaleY') {
          channels[ch] = 1;
        } else if (ch === 'brightness' || ch === 'contrast' || ch === 'saturate') {
          channels[ch] = 100;
        } else if (ch === 'zIndex') {
          channels[ch] = 1;
        } else if (ch === 'originX' || ch === 'originY') {
          channels[ch] = 50;
        } else if (ch === 'borderColorH' || ch === 'bgH' || ch === 'bg2H') {
          channels[ch] = 270;
        } else if (ch === 'borderColorS' || ch === 'bgS' || ch === 'bg2S') {
          channels[ch] = 80;
        } else if (ch === 'borderColorL' || ch === 'bgL' || ch === 'bg2L') {
          channels[ch] = 50;
        } else if (ch === 'borderColorA' || ch === 'bgA') {
          channels[ch] = 1;
        } else if (ch === 'bgAngle') {
          channels[ch] = 135;
        } else if (ch === 'cameraZoom') {
          channels[ch] = 1;
        } else if (ch === 'cameraPanX' || ch === 'cameraPanY' || ch === 'cameraTilt') {
          channels[ch] = 0;
        } else {
          channels[ch] = 0;
        }
      }
    }
    const transform = el?.id === 'el-camera'
      ? `translate3d(${-channels.cameraPanX}px, ${-channels.cameraPanY}px, 0px) scale(${channels.cameraZoom}) rotateX(${channels.cameraTilt}deg)`
      : `translate3d(${channels.x}px, ${channels.y}px, 0px) scale(${channels.scale * channels.scaleX}, ${channels.scale * channels.scaleY}) rotate(${channels.rotate}deg) rotateX(${channels.rotateX}deg) rotateY(${channels.rotateY}deg)`;
    const transformOrigin = `${channels.originX}% ${channels.originY}%`;
    const boxShadow = `${channels.shadowX}px ${channels.shadowY}px ${channels.shadowBlur}px ${channels.shadowSpread}px rgba(0, 0, 0, ${channels.shadowOpacity})`;
    const borderRadius = `${channels.borderRadius}px`;
    const borderColor = `hsla(${channels.borderColorH}, ${channels.borderColorS}%, ${channels.borderColorL}%, ${channels.borderColorA})`;
    
    const filterParts: string[] = [];
    if (channels.blur > 0) filterParts.push(`blur(${channels.blur}px)`);
    if (channels.brightness !== 100) filterParts.push(`brightness(${channels.brightness}%)`);
    if (channels.contrast !== 100) filterParts.push(`contrast(${channels.contrast}%)`);
    if (channels.grayscale > 0) filterParts.push(`grayscale(${channels.grayscale}%)`);
    if (channels.hueRotate !== 0) filterParts.push(`hue-rotate(${channels.hueRotate}deg)`);
    if (channels.saturate !== 100) filterParts.push(`saturate(${channels.saturate}%)`);
    if (channels.sepia > 0) filterParts.push(`sepia(${channels.sepia}%)`);
    const filter = filterParts.length > 0 ? filterParts.join(' ') : 'none';

    return {
      offset: clamp(time / durationMs, 0, 1),
      opacity: channels.opacity,
      transform,
      transformOrigin,
      boxShadow,
      borderRadius,
      borderStyle: 'solid',
      borderTopWidth: `${channels.borderTopWidth}px`,
      borderRightWidth: `${channels.borderRightWidth}px`,
      borderBottomWidth: `${channels.borderBottomWidth}px`,
      borderLeftWidth: `${channels.borderLeftWidth}px`,
      borderColor,
      backgroundColor: `hsla(${channels.bgH}, ${channels.bgS}%, ${channels.bgL}%, ${channels.bgA})`,
      ...(channels.bg2A > 0 ? {
        backgroundImage: `linear-gradient(${channels.bgAngle}deg, hsla(${channels.bgH}, ${channels.bgS}%, ${channels.bgL}%, ${channels.bgA}), hsla(${channels.bg2H}, ${channels.bg2S}%, ${channels.bg2L}%, ${channels.bg2A}))`,
      } : {}),
      backgroundPosition: `${channels.bgPosX}px ${channels.bgPosY}px`,
      clipPath: `inset(${channels.clipTop}% ${channels.clipRight}% ${channels.clipBottom}% ${channels.clipLeft}%)`,
      zIndex: channels.zIndex,
      filter,
      ...(channels.width > 0 ? { width: `${channels.width}px` } : {}),
      ...(channels.height > 0 ? { height: `${channels.height}px` } : {}),
      ...(el?.motionPath ? {
        offsetPath: el.motionPath,
        offsetDistance: `${channels.offsetDistance}%`,
        offsetRotate: formatMotionOffsetRotate(el.motionRotate, Number(channels.offsetRotate)),
      } : {}),
    } as Keyframe;
  });
}

export function formatMotionOffsetRotate(mode: string | undefined, offsetDeg: number) {
  const normalizedMode = mode || 'auto';
  const normalizedOffset = Number.isFinite(offsetDeg) ? offsetDeg : 0;
  if (normalizedMode === 'auto' || normalizedMode === 'reverse') {
    return normalizedOffset === 0 ? normalizedMode : `${normalizedMode} ${normalizedOffset}deg`;
  }
  if (normalizedMode.startsWith('auto ')) {
    const base = normalizedMode.match(/-?\d+(\.\d+)?/)?.[0];
    const baseDeg = base ? Number(base) : 0;
    const total = baseDeg + normalizedOffset;
    return total === 0 ? 'auto' : `auto ${total}deg`;
  }
  const fixed = normalizedMode.match(/-?\d+(\.\d+)?/)?.[0];
  const fixedDeg = fixed ? Number(fixed) : 0;
  return `${fixedDeg + normalizedOffset}deg`;
}

export function formatTime(ms: number) {
  const s = Math.max(0, ms) / 1000;
  return `${s.toFixed(2)}s`;
}

export function uid() {
  const anyCrypto = (globalThis as any).crypto as Crypto | undefined;
  const uuid = anyCrypto?.randomUUID?.();
  return uuid ?? `kf_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
