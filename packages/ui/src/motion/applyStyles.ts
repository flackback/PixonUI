import type { MotionValue } from './value';
import { ensureTransformChannels, toChannelVars, type TransformChannel } from './transformChannels';

function isMotionValue(v: any): v is MotionValue<any> {
  return v && typeof v.get === 'function' && typeof v.on === 'function';
}

const TRANSFORMISH = new Set([
  'x', 'y', 'z',
  'translateX', 'translateY', 'translateZ',
  'rotate', 'rotateX', 'rotateY', 'rotateZ',
  'scale', 'scaleX', 'scaleY', 'scaleZ',
  'skewX', 'skewY',
  'perspective',
]);

type StyleLike = Record<string, any>;

export function applyStyleObject(
  el: HTMLElement | SVGElement,
  style: StyleLike,
  channel: TransformChannel
): { cleanup: () => void; restStyle: Record<string, any> } {
  ensureTransformChannels();
  try { el.classList.add('px-transform'); } catch { /* noop */ }

  const restStyle: Record<string, any> = {};
  const transformish: Record<string, any> = {};
  const unsubs: Array<() => void> = [];

  for (const key of Object.keys(style)) {
    const val = style[key];

    if (key === 'transform') {
      if (typeof val === 'string') {
        el.style.setProperty('--px-raw-transform', val);
        continue;
      }
      if (isMotionValue(val)) {
        el.style.setProperty('--px-raw-transform', String(val.get()));
        unsubs.push(val.on('change', (latest: any) => el.style.setProperty('--px-raw-transform', String(latest))));
        continue;
      }
    }

    if (TRANSFORMISH.has(key)) {
      transformish[key] = isMotionValue(val) ? val.get() : val;
      if (isMotionValue(val)) {
        unsubs.push(
          val.on('change', (latest: any) => {
            const vars = toChannelVars({ [key]: latest }, channel);
            for (const k of Object.keys(vars)) el.style.setProperty(k, vars[k]!);
          })
        );
      }
      continue;
    }

    if (isMotionValue(val)) {
      restStyle[key] = val.get();
      unsubs.push(
        val.on('change', (latest: any) => {
          try { (el.style as any)[key] = latest; } catch { /* noop */ }
        })
      );
      continue;
    }

    restStyle[key] = val;
    try { (el.style as any)[key] = val; } catch { /* noop */ }
  }

  const vars = toChannelVars(transformish, channel);
  for (const k of Object.keys(vars)) el.style.setProperty(k, vars[k]!);

  return {
    restStyle,
    cleanup: () => {
      unsubs.forEach((u) => u());
    },
  };
}

/**
 * Immediate style write path used by animation controls `.set()`.
 * Avoids creating WAAPI animations for per-frame pointer updates.
 */
export function applyStyleObjectImmediate(
  el: HTMLElement | SVGElement,
  style: StyleLike,
  channel: TransformChannel
) {
  ensureTransformChannels();
  try { el.classList.add('px-transform'); } catch { /* noop */ }

  const transformish: Record<string, any> = {};
  for (const key of Object.keys(style || {})) {
    const raw = style[key];
    const val = isMotionValue(raw) ? raw.get() : raw;

    if (key === 'transform') {
      if (val !== null && val !== undefined) el.style.setProperty('--px-raw-transform', String(val));
      continue;
    }

    if (TRANSFORMISH.has(key)) {
      transformish[key] = val;
      continue;
    }

    try { (el.style as any)[key] = val; } catch { /* noop */ }
  }

  const vars = toChannelVars(transformish, channel);
  for (const k of Object.keys(vars)) {
    el.style.setProperty(k, vars[k]!);
  }
}
