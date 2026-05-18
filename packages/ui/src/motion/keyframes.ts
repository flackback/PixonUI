import type { TransformChannel } from './transformChannels';
import { toChannelVars } from './transformChannels';

const TRANSFORM_KEYS = new Set([
  'transform',
  'x', 'y', 'z',
  'translateX', 'translateY', 'translateZ',
  'rotate', 'rotateX', 'rotateY', 'rotateZ',
  'scale', 'scaleX', 'scaleY', 'scaleZ',
  'skewX', 'skewY',
  'perspective',
]);

type AnyKeyframe = Record<string, any>;

const LENGTH_PROPS = new Set([
  'width', 'height',
  'top', 'right', 'bottom', 'left',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'gap', 'rowGap', 'columnGap',
  'fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing',
  'borderRadius', 'borderWidth',
  'outlineWidth',
  'maxWidth', 'maxHeight', 'minWidth', 'minHeight',
]);

function sanitizeNonTransformProp(prop: string, val: any) {
  // Prevent invalid values that can cause warnings/jank.
  if (typeof val === 'number') {
    if (prop === 'opacity') return Math.max(0.0001, val);
    if (LENGTH_PROPS.has(prop)) return `${val}px`;
  }
  return val;
}

function parseTransformList(transform: string): Record<string, any> {
  const out: Record<string, any> = {};
  const str = String(transform);
  if (str.trim() === 'none') {
    return {
      x: '0px',
      y: '0px',
      z: '0px',
      scale: '1',
      scaleX: '1',
      scaleY: '1',
      rotate: '0deg',
      rotateX: '0deg',
      rotateY: '0deg',
      rotateZ: '0deg',
      skewX: '0deg',
      skewY: '0deg',
    };
  }
  const re = /([a-zA-Z0-9]+)\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(str))) {
    const fn = m[1]!;
    const args = m[2]!.split(',').map((s) => s.trim());

    if (fn === 'translate' || fn === 'translate3d') {
      if (args[0] !== undefined) out.x = args[0];
      if (args[1] !== undefined) out.y = args[1];
      if (fn === 'translate3d' && args[2] !== undefined) out.z = args[2];
      continue;
    }

    if (fn === 'translateX' && args[0] !== undefined) { out.x = args[0]; continue; }
    if (fn === 'translateY' && args[0] !== undefined) { out.y = args[0]; continue; }
    if (fn === 'translateZ' && args[0] !== undefined) { out.z = args[0]; continue; }

    if (fn === 'scale') {
      if (args[0] !== undefined) out.scaleX = args[0];
      if (args[1] !== undefined) out.scaleY = args[1];
      else if (args[0] !== undefined) out.scale = args[0];
      continue;
    }
    if (fn === 'scaleX' && args[0] !== undefined) { out.scaleX = args[0]; continue; }
    if (fn === 'scaleY' && args[0] !== undefined) { out.scaleY = args[0]; continue; }
    if (fn === 'rotate' && args[0] !== undefined) { out.rotate = args[0]; continue; }
    if (fn === 'rotateX' && args[0] !== undefined) { out.rotateX = args[0]; continue; }
    if (fn === 'rotateY' && args[0] !== undefined) { out.rotateY = args[0]; continue; }
    if (fn === 'rotateZ' && args[0] !== undefined) { out.rotateZ = args[0]; continue; }
    if (fn === 'skewX' && args[0] !== undefined) { out.skewX = args[0]; continue; }
    if (fn === 'skewY' && args[0] !== undefined) { out.skewY = args[0]; continue; }
  }
  return out;
}

function channelizeKeyframe(kf: AnyKeyframe, channel: TransformChannel): Keyframe {
  const out: AnyKeyframe = {};
  const transformish: AnyKeyframe = {};

  for (const key of Object.keys(kf)) {
    const val = kf[key];
    if (TRANSFORM_KEYS.has(key)) {
      // We ignore raw transform strings in channel mode (root cause fix).
      if (key === 'transform' && typeof val === 'string') {
        Object.assign(transformish, parseTransformList(val));
      } else if (key !== 'transform') {
        transformish[key] = val;
      }
      continue;
    }
    out[key] = sanitizeNonTransformProp(key, val);
  }

  const vars = toChannelVars(transformish, channel);
  for (const k of Object.keys(vars)) out[k] = vars[k];

  return out as Keyframe;
}

export function prepareChannelKeyframes(input: any, channel: TransformChannel): Keyframe[] {
  if (Array.isArray(input)) {
    return input.map((k) => channelizeKeyframe(typeof k === 'object' ? k : { opacity: k }, channel));
  }

  if (typeof input === 'object' && input) {
    const keys = Object.keys(input);

    // Property-level arrays: { x: [0, 10], opacity: [0, 1] }
    const hasArray = keys.some((k) => Array.isArray((input as any)[k]));
    if (hasArray) {
      const maxLength = Math.max(...keys.map((k) => (Array.isArray((input as any)[k]) ? (input as any)[k].length : 1)));
      return Array.from({ length: maxLength }).map((_, i) => {
        const kf: AnyKeyframe = {};
        for (const k of keys) {
          const v = (input as any)[k];
          kf[k] = Array.isArray(v) ? v[Math.min(i, v.length - 1)] : v;
        }
        return channelizeKeyframe(kf, channel);
      });
    }

    // Numeric-key object: { 0: {...}, 1: {...} }
    if (keys.every((k) => !isNaN(Number(k)))) {
      return Object.values(input).map((k) => channelizeKeyframe(k as AnyKeyframe, channel));
    }

    return [channelizeKeyframe(input as AnyKeyframe, channel)];
  }

  // Fallback: treat primitive as opacity for safety.
  return [channelizeKeyframe({ opacity: input }, channel)];
}
