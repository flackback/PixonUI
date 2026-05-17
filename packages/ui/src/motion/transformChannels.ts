type CssRegisterProperty = (definition: {
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue: string;
}) => void;

const CHANNELS = ['', 'g', 'd', 's', 'l'] as const; // base, gesture, drag, scroll, layout
let channelsRegistered = false;
let templateInjected = false;

function register(name: string, syntax: string, initialValue: string) {
  const cssAny: any = typeof CSS !== 'undefined' ? (CSS as any) : null;
  const fn: CssRegisterProperty | undefined = cssAny?.registerProperty?.bind(cssAny);
  if (!fn) return;
  try {
    fn({ name, syntax, inherits: false, initialValue });
  } catch {
    // Ignore "already registered" and unsupported syntaxes.
  }
}

export function ensureTransformChannels() {
  if (typeof document === 'undefined') return;

  // 1) Register typed custom properties (best-effort).
  if (!channelsRegistered) {
    for (const ch of CHANNELS) {
      register(`--px-x${ch}`, '<length>', '0px');
      register(`--px-y${ch}`, '<length>', '0px');
      register(`--px-z${ch}`, '<length>', '0px');

      register(`--px-rotate${ch}`, '<angle>', '0deg');
      register(`--px-rotateX${ch}`, '<angle>', '0deg');
      register(`--px-rotateY${ch}`, '<angle>', '0deg');
      register(`--px-rotateZ${ch}`, '<angle>', '0deg');

      register(`--px-skewX${ch}`, '<angle>', '0deg');
      register(`--px-skewY${ch}`, '<angle>', '0deg');

      // "<number>" works in most engines for @property; CSS.registerProperty uses "syntax".
      register(`--px-scale${ch}`, '<number>', '1');
      register(`--px-scaleX${ch}`, '<number>', '1');
      register(`--px-scaleY${ch}`, '<number>', '1');
    }

    register(`--px-raw-transform`, '<transform-list>', 'translate3d(0px, 0px, 0px)');
    channelsRegistered = true;
  }

  // 2) Inject transform template once.
  const id = '__pixon_transform_channels__';
  if (templateInjected) return;
  if (document.getElementById(id)) {
    templateInjected = true;
    return;
  }

  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    .px-transform {
      transform:
        translate3d(var(--px-x, 0px), var(--px-y, 0px), var(--px-z, 0px))
        translate3d(var(--px-xg, 0px), var(--px-yg, 0px), var(--px-zg, 0px))
        translate3d(var(--px-xd, 0px), var(--px-yd, 0px), var(--px-zd, 0px))
        translate3d(var(--px-xs, 0px), var(--px-ys, 0px), var(--px-zs, 0px))
        translate3d(var(--px-xl, 0px), var(--px-yl, 0px), var(--px-zl, 0px))

        rotate(var(--px-rotate, 0deg))
        rotateX(var(--px-rotateX, 0deg))
        rotateY(var(--px-rotateY, 0deg))
        rotateZ(var(--px-rotateZ, 0deg))

        rotate(var(--px-rotateg, 0deg))
        rotateX(var(--px-rotateXg, 0deg))
        rotateY(var(--px-rotateYg, 0deg))
        rotateZ(var(--px-rotateZg, 0deg))

        rotate(var(--px-rotated, 0deg))
        rotateX(var(--px-rotateXd, 0deg))
        rotateY(var(--px-rotateYd, 0deg))
        rotateZ(var(--px-rotateZd, 0deg))

        rotate(var(--px-rotates, 0deg))
        rotateX(var(--px-rotateXs, 0deg))
        rotateY(var(--px-rotateYs, 0deg))
        rotateZ(var(--px-rotateZs, 0deg))

        rotate(var(--px-rotatel, 0deg))
        rotateX(var(--px-rotateXl, 0deg))
        rotateY(var(--px-rotateYl, 0deg))
        rotateZ(var(--px-rotateZl, 0deg))

        skewX(var(--px-skewX, 0deg))
        skewY(var(--px-skewY, 0deg))
        skewX(var(--px-skewXg, 0deg))
        skewY(var(--px-skewYg, 0deg))
        skewX(var(--px-skewXd, 0deg))
        skewY(var(--px-skewYd, 0deg))
        skewX(var(--px-skewXs, 0deg))
        skewY(var(--px-skewYs, 0deg))
        skewX(var(--px-skewXl, 0deg))
        skewY(var(--px-skewYl, 0deg))

        scaleX(var(--px-scaleX, 1)) scaleY(var(--px-scaleY, 1)) scale(var(--px-scale, 1))
        scaleX(var(--px-scaleXg, 1)) scaleY(var(--px-scaleYg, 1)) scale(var(--px-scaleg, 1))
        scaleX(var(--px-scaleXd, 1)) scaleY(var(--px-scaleYd, 1)) scale(var(--px-scaled, 1))
        scaleX(var(--px-scaleXs, 1)) scaleY(var(--px-scaleYs, 1)) scale(var(--px-scales, 1))
        scaleX(var(--px-scaleXl, 1)) scaleY(var(--px-scaleYl, 1)) scale(var(--px-scalel, 1))

        /* Optional extra transform list provided by user (compat bridge). */
        var(--px-raw-transform, translate3d(0px, 0px, 0px));

      transform-style: preserve-3d;
      will-change: transform;
    }
  `;
  document.head.appendChild(style);
  templateInjected = true;
}

export function supportsTypedCustomProperties(): boolean {
  const cssAny: any = typeof CSS !== 'undefined' ? (CSS as any) : null;
  return typeof cssAny?.registerProperty === 'function';
}

export type TransformChannel = 'base' | 'gesture' | 'drag' | 'scroll' | 'layout';

const CHANNEL_SUFFIX: Record<TransformChannel, '' | 'g' | 'd' | 's' | 'l'> = {
  base: '',
  gesture: 'g',
  drag: 'd',
  scroll: 's',
  layout: 'l',
};

const UNIT: Record<string, string> = {
  x: 'px',
  y: 'px',
  z: 'px',
  rotate: 'deg',
  rotateX: 'deg',
  rotateY: 'deg',
  rotateZ: 'deg',
  skewX: 'deg',
  skewY: 'deg',
  scale: '',
  scaleX: '',
  scaleY: '',
};

function withUnit(key: string, val: any) {
  if (val == null) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val !== 'number') return undefined;
  const u = UNIT[key] ?? '';
  return u ? `${val}${u}` : String(val);
}

export function toChannelVars(style: Record<string, any>, channel: TransformChannel): Record<string, string> {
  const sfx = CHANNEL_SUFFIX[channel];
  const out: Record<string, string> = {};

  const set = (key: string, value: any) => {
    const v = withUnit(key, value);
    if (v === undefined) return;
    out[`--px-${key}${sfx}`] = v;
  };

  // Shorthands.
  if (style.translateX != null) set('x', style.translateX);
  if (style.translateY != null) set('y', style.translateY);
  if (style.translateZ != null) set('z', style.translateZ);
  if (style.x != null) set('x', style.x);
  if (style.y != null) set('y', style.y);
  if (style.z != null) set('z', style.z);

  if (style.rotate != null) set('rotate', style.rotate);
  if (style.rotateX != null) set('rotateX', style.rotateX);
  if (style.rotateY != null) set('rotateY', style.rotateY);
  if (style.rotateZ != null) set('rotateZ', style.rotateZ);

  if (style.skewX != null) set('skewX', style.skewX);
  if (style.skewY != null) set('skewY', style.skewY);

  if (style.scale != null) set('scale', style.scale);
  if (style.scaleX != null) set('scaleX', style.scaleX);
  if (style.scaleY != null) set('scaleY', style.scaleY);

  return out;
}
