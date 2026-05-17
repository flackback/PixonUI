import React, { useEffect, useState, useId, useMemo, useCallback, useRef, useLayoutEffect } from 'react';

const canUseLayoutEffect = (() => {
  const isNodeRuntime =
    typeof process !== 'undefined' &&
    typeof process.versions !== 'undefined' &&
    !!process.versions.node;
  if (isNodeRuntime) return false;
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  if (/jsdom/i.test(ua)) return false;
  return true;
})();

const useIsomorphicLayoutEffect = canUseLayoutEffect ? useLayoutEffect : useEffect;
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { 
  generateSpringTrajectory, 
  SpringConfig, 
  parseStyleShortcuts,
  insertScopedRules,
  cachedSpringKeyframes 
} from '../../utils/motion';


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Any CSS-animatable property expressed as a simple JS object */
export interface MotionStyle {
  opacity?: number;
  x?: number | string;
  y?: number | string;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  skewX?: number | string;
  skewY?: number | string;
  blur?: number | string;
  filter?: string;
  brightness?: number;
  saturate?: number;
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  boxShadow?: string;
  borderRadius?: number | string;
  width?: number | string;
  height?: number | string;
  padding?: number | string;
  gap?: number | string;
  /** Raw CSS custom property overrides, e.g. { '--glow-color': '#a855f7' } */
  [key: `--${string}`]: string | number | undefined;
}

/** Built-in presets (backward compatible with previous API) */
export type MotionPreset =
  | 'fade'
  | 'spring'
  | 'slide-right'
  | 'slide-left'
  | 'blur'
  | '3d-flip'
  | 'bounce'
  | 'elastic'
  | 'zoom-in'
  | 'zoom-out'
  | 'rotate-in'
  | 'flip-x'
  | 'flip-y';

/** Easing curve name shortcuts */
export type MotionEasing =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'        // cubic-bezier(0.34, 1.56, 0.64, 1)
  | 'apple'         // cubic-bezier(0.16, 1, 0.3, 1)
  | 'bounce'        // cubic-bezier(0.34, 1.56, 0.64, 1)
  | 'smooth'        // cubic-bezier(0.4, 0, 0.2, 1)
  | 'snappy'        // cubic-bezier(0.2, 0, 0, 1)
  | 'elastic-out'   // cubic-bezier(0.68, -0.55, 0.265, 1.55)
  | (string & {});  // Allow arbitrary cubic-bezier values

export interface MotionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;

  // ── Preset API (backward compat) ──────────────────────────────────────
  /** Quick preset animation. Ignored when `from`/`to` are provided. */
  preset?: MotionPreset;

  // ── Custom animation API ──────────────────────────────────────────────
  /** Starting state (element invisible/off-screen) */
  from?: MotionStyle;
  /** Target state (element fully visible) */
  to?: MotionStyle;
  /** Target state (alias for to) */
  animate?: MotionStyle;
  /** Transition configuration */
  transition?: {
    type?: 'spring' | 'tween';
    stiffness?: number;
    damping?: number;
    mass?: number;
    velocity?: number;
    duration?: number;
    delay?: number;
    easing?: MotionEasing;
    repeat?: number | 'infinite';
  };
  /** State applied on `:hover` via pure CSS */
  hover?: MotionStyle;
  /** State applied on `:active` (mouse-down / tap) via pure CSS */
  tap?: MotionStyle;
  /** State applied on `:focus-visible` via pure CSS */
  focus?: MotionStyle;

  // ── Keyframes API (complex multi-step animations) ─────────────────────
  /** Multi-step keyframe animation. Overrides from/to when provided. */
  keyframes?: MotionStyle[];
  /** Repeat keyframes infinitely */
  loop?: boolean;
  /** Keyframe iteration count (overrides loop) */
  iterations?: number | 'infinite';
  /** Keyframe direction: normal, reverse, alternate, alternate-reverse */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  /** Keyframe fill mode */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';

  // ── Timing ────────────────────────────────────────────────────────────
  /** Duration in milliseconds @default 500 */
  duration?: number;
  /** Easing curve (name shortcut or raw cubic-bezier) @default 'apple' */
  easing?: MotionEasing;
  /** Delay before animation starts (ms) @default 0 */
  delay?: number;

  // ── Triggers ──────────────────────────────────────────────────────────
  /** Animate when element enters viewport @default true */
  viewport?: boolean;
  /** Custom IntersectionObserver threshold @default 0.1 */
  viewportThreshold?: number;
  /** Custom IntersectionObserver rootMargin @default '0px' */
  viewportMargin?: string;
  /** Manual show/hide control (overrides viewport) */
  visible?: boolean;
  /** Animate only on first entrance @default true */
  once?: boolean;
  /** Trigger animation on hover enter/leave (show from on leave) */
  whileHover?: boolean;

  // ── Accessibility ─────────────────────────────────────────────────────
  /** Respect prefers-reduced-motion system setting @default true */
  respectReducedMotion?: boolean;

  // ── Rendering ─────────────────────────────────────────────────────────
  /** Render as child element (no wrapper div) */
  asChild?: boolean;
  /** HTML tag to render as (ignored when asChild is true) @default 'div' */
  as?: keyof React.JSX.IntrinsicElements;
  /** Callback fired when entrance transition/animation ends */
  onComplete?: () => void;
  /** Callback fired when exit transition starts (visible → false) */
  onExitStart?: () => void;
  /** Ref forwarding */
  innerRef?: React.Ref<HTMLDivElement>;
  /** Custom physical spring configuration. Automatically enables WAAPI spring keyframes when set. */
  spring?: SpringConfig;
  /** Enable automatic layout (FLIP) transition on layout/children updates */
  layout?: boolean | 'position' | 'size';
  /** Shared layout transition ID. Syncs and morphs unmounted to mounted elements. */
  layoutId?: string;
  /** Custom dependencies to trigger layout measurement updates */
  layoutDependency?: any;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EASING_MAP: Record<string, string> = {
  linear: 'linear',
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  apple: 'cubic-bezier(0.16, 1, 0.3, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  snappy: 'cubic-bezier(0.2, 0, 0, 1)',
  'elastic-out': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

const PRESET_DEFINITIONS: Record<MotionPreset, { from: MotionStyle; to: MotionStyle }> = {
  fade: {
    from: { opacity: 0, y: 16 },
    to: { opacity: 1, y: 0 },
  },
  spring: {
    from: { opacity: 0, scale: 0.95, y: 16 },
    to: { opacity: 1, scale: 1, y: 0 },
  },
  'slide-right': {
    from: { opacity: 0, x: -32 },
    to: { opacity: 1, x: 0 },
  },
  'slide-left': {
    from: { opacity: 0, x: 32 },
    to: { opacity: 1, x: 0 },
  },
  blur: {
    from: { opacity: 0, blur: 8, scale: 1.05 },
    to: { opacity: 1, blur: 0, scale: 1 },
  },
  '3d-flip': {
    from: { opacity: 0, rotateX: 90 },
    to: { opacity: 1, rotateX: 0 },
  },
  bounce: {
    from: { opacity: 0, y: 40, scale: 0.8 },
    to: { opacity: 1, y: 0, scale: 1 },
  },
  elastic: {
    from: { opacity: 0, scale: 0.5, rotate: -5 },
    to: { opacity: 1, scale: 1, rotate: 0 },
  },
  'zoom-in': {
    from: { opacity: 0, scale: 0.3 },
    to: { opacity: 1, scale: 1 },
  },
  'zoom-out': {
    from: { opacity: 0, scale: 1.5 },
    to: { opacity: 1, scale: 1 },
  },
  'rotate-in': {
    from: { opacity: 0, rotate: -180, scale: 0.5 },
    to: { opacity: 1, rotate: 0, scale: 1 },
  },
  'flip-x': {
    from: { opacity: 0, rotateY: 90 },
    to: { opacity: 1, rotateY: 0 },
  },
  'flip-y': {
    from: { opacity: 0, rotateX: 90 },
    to: { opacity: 1, rotateX: 0 },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveEasing(easing: MotionEasing): string {
  return EASING_MAP[easing] || easing;
}

function px(value: number | string | undefined): string {
  if (value === undefined) return '0px';
  return typeof value === 'number' ? `${value}px` : value;
}

function deg(value: number | string | undefined): string {
  if (value === undefined) return '0deg';
  return typeof value === 'number' ? `${value}deg` : value;
}

/** Build a CSS `transform` string from a MotionStyle */
function buildTransform(s: MotionStyle): string {
  const parts: string[] = [];
  parts.push(`translate3d(${px(s.x)}, ${px(s.y)}, 0)`);
  if (s.scale !== undefined) parts.push(`scale(${s.scale})`);
  if (s.scaleX !== undefined) parts.push(`scaleX(${s.scaleX})`);
  if (s.scaleY !== undefined) parts.push(`scaleY(${s.scaleY})`);
  if (s.rotate !== undefined) parts.push(`rotate(${deg(s.rotate)})`);
  if (s.rotateX !== undefined) parts.push(`rotateX(${deg(s.rotateX)})`);
  if (s.rotateY !== undefined) parts.push(`rotateY(${deg(s.rotateY)})`);
  if (s.skewX !== undefined) parts.push(`skewX(${deg(s.skewX)})`);
  if (s.skewY !== undefined) parts.push(`skewY(${deg(s.skewY)})`);
  return parts.join(' ');
}

/** Build a CSS `filter` string from a MotionStyle */
function buildFilter(s: MotionStyle): string {
  const parts: string[] = [];
  if (s.filter) parts.push(s.filter);
  if (s.blur !== undefined) {
    parts.push(`blur(${typeof s.blur === 'number' ? `${s.blur}px` : s.blur})`);
  }
  if (s.brightness !== undefined) parts.push(`brightness(${s.brightness})`);
  if (s.saturate !== undefined) parts.push(`saturate(${s.saturate})`);
  return parts.length ? parts.join(' ') : 'none';
}

/** Collect CSS custom properties (--xxx) from a MotionStyle */
function extractCustomProps(s: MotionStyle): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(s)) {
    if (k.startsWith('--') && v !== undefined) {
      result[k] = v;
    }
  }
  return result;
}

/** Build inline style properties from a MotionStyle (excluding transform/filter) */
function buildExtraStyles(s: MotionStyle): Record<string, string> {
  const result: Record<string, string> = {};
  if (s.backgroundColor) result['background-color'] = s.backgroundColor;
  if (s.color) result.color = s.color;
  if (s.borderColor) result['border-color'] = s.borderColor;
  if (s.boxShadow) result['box-shadow'] = s.boxShadow;
  if (s.borderRadius !== undefined) result['border-radius'] = px(s.borderRadius);
  if (s.width !== undefined) result.width = px(s.width);
  if (s.height !== undefined) result.height = px(s.height);
  if (s.padding !== undefined) result.padding = px(s.padding);
  if (s.gap !== undefined) result.gap = px(s.gap);
  return result;
}

/** Build a full CSS declaration block from a MotionStyle */
function buildCSSBlock(s: MotionStyle): string {
  const lines: string[] = [];
  if (s.opacity !== undefined) lines.push(`opacity: ${s.opacity} !important;`);

  // Transform
  const t = buildTransform(s);
  if (t !== 'translate3d(0px, 0px, 0)') {
    lines.push(`transform: ${t} !important;`);
  }

  // Filter
  const f = buildFilter(s);
  if (f !== 'none') lines.push(`filter: ${f} !important;`);

  // Extra properties
  const extras = buildExtraStyles(s);
  for (const [k, v] of Object.entries(extras)) {
    lines.push(`${k}: ${v} !important;`);
  }

  // Custom properties
  const custom = extractCustomProps(s);
  for (const [k, v] of Object.entries(custom)) {
    lines.push(`${k}: ${v} !important;`);
  }

  return lines.join('\n            ');
}

/** Build keyframes CSS from an array of MotionStyle */
function buildKeyframesCSS(name: string, steps: any[]): string {
  if (steps.length === 0) return '';

  const lines: string[] = [];
  lines.push(`@keyframes ${name} {`);

  steps.forEach((step, i) => {
    const pct = steps.length === 1 ? 100 : Math.round((i / (steps.length - 1)) * 100);
    const transform = buildTransform(step);
    const filter = buildFilter(step);

    lines.push(`  ${pct}% {`);
    if (step.opacity !== undefined) lines.push(`    opacity: ${step.opacity};`);
    lines.push(`    transform: ${transform};`);
    if (filter !== 'none') lines.push(`    filter: ${filter};`);

    const extras = buildExtraStyles(step);
    for (const [k, v] of Object.entries(extras)) {
      lines.push(`    ${k}: ${v};`);
    }
    const custom = extractCustomProps(step);
    for (const [k, v] of Object.entries(custom)) {
      lines.push(`    ${k}: ${v};`);
    }
    lines.push(`  }`);
  });

  lines.push('}');
  return lines.join('\n');
}

// Shared Layout Registry for Page-wide elements matching layoutId
const sharedLayoutRegistry = new Map<string, { rect: DOMRect; timestamp: number }>();

  /**
   * @deprecated Prefer `motion.*` (ex: `motion.div`) for the unified Motion VNext API.
   * Planned removal date: after 2026-09-30.
   */
export function Motion({
  children,
  // Preset
  preset,
  // Custom
  from: fromProp,
  to: toProp,
  animate,
  transition,
  hover,
  tap,
  focus,
  // Keyframes
  keyframes,
  loop = false,
  iterations,
  direction = 'normal',
  fillMode = 'both',
  // Timing
  duration = 500,
  easing = 'apple',
  delay = 0,
  // Triggers
  viewport = true,
  viewportThreshold = 0.1,
  viewportMargin,
  visible,
  once = true,
  whileHover = false,
  // Accessibility
  respectReducedMotion = true,
  // Rendering
  asChild = false,
  as = 'div',
  onComplete,
  onExitStart,
  innerRef,
  spring,
  className,
  style,
  // Layout Props
  layout,
  layoutId,
  layoutDependency,
  ...props
}: MotionProps) {
  // ── Accessibility: reduced motion ─────────────────────────────────────
  const prefersReduced = useReducedMotion();
  const shouldSkipAnimation = respectReducedMotion && prefersReduced;

  // ── Resolve from/to from preset or custom props ───────────────────────
  const isCustom = !!(fromProp || toProp || animate || keyframes);
  const presetDef = preset ? PRESET_DEFINITIONS[preset] : PRESET_DEFINITIONS.spring;
  const from = useMemo((): MotionStyle => {
    return isCustom ? { opacity: 0, ...fromProp } : presetDef.from;
  }, [isCustom, fromProp, presetDef]);

  const to = useMemo((): MotionStyle => {
    return isCustom
      ? { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, blur: 0, ...toProp, ...animate }
      : presetDef.to;
  }, [isCustom, toProp, animate, presetDef]);

  // ── Scoped class for injected CSS ─────────────────────────────────────
  const rawId = useId();
  const safeId = (typeof rawId === 'string' ? rawId : '').split(':').join('');
  const scopeClass = `px-motion-${safeId}`;
  const kfName = `pxKf_${safeId}`;
  const isInfinite = loop || iterations === 'infinite' || transition?.repeat === 'infinite' || transition?.repeat === Infinity;

  // ── Viewport / visibility ─────────────────────────────────────────────
  const { ref, isInView, hasAnimated } = useInView({
    threshold: viewportThreshold,
    rootMargin: viewportMargin,
    enabled: viewport && visible === undefined,
  });

  // ── Hover-based visibility ────────────────────────────────────────────
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<Animation | null>(null);
  const waapiSigRef = useRef<{
    frames: Keyframe[];
    duration: number;
    easing: string;
    fill: MotionProps['fillMode'];
    delay: number;
    iterations: number;
    direction: MotionProps['direction'];
  } | null>(null);
  
  // ── Abort Controller ──────────────────────────────────────────────────
  const abortRef = useRef(new AbortController());
  useEffect(() => {
    if (shouldSkipAnimation) return;
    abortRef.current.abort();
    abortRef.current = new AbortController();
  }, [animate, preset, fromProp, toProp, keyframes, spring, transition, duration, delay]);

  useEffect(() => {
    return () => {
      abortRef.current.abort();
    };
  }, []);

  const effectiveIsInView = viewport ? isInView : true;
  const internalShow = viewport ? (once ? hasAnimated : isInView) : true;
  let shouldShow = visible !== undefined ? visible : internalShow;

  // whileHover: override visibility based on mouse state
  if (whileHover) {
    shouldShow = isHovered;
  }

  // Track exit for onExitStart
  const prevShow = useRef(shouldShow);

  useEffect(() => {
    if (prevShow.current && !shouldShow && onExitStart) {
      onExitStart();
    }
    prevShow.current = shouldShow;
  }, [shouldShow, onExitStart]);

  // ── Skip animations for reduced motion ────────────────────────────────
  if (shouldSkipAnimation) {
    // Show content instantly in final state, no animation
    const Comp = asChild ? Slot : (as as any);
    return (
      <Comp
        ref={(node: HTMLDivElement | null) => {
          // Merge refs
          if (typeof innerRef === 'function') innerRef(node);
          else if (innerRef) (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={className}
        style={style}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  // ── Resolved spring physical keyframes compiler ──────────────────────
  const isSpringEasing = easing === 'spring' || !!spring || transition?.type === 'spring';

  const { springKeyframes, springDuration, waapiFrames } = useMemo(() => {
    // 1. Array-based Keyframes Mode
    if (keyframes && Array.isArray(keyframes)) {
      return {
        springKeyframes: null,
        springDuration: duration,
        waapiFrames: keyframes.map((kf) => parseStyleShortcuts(kf)) as Keyframe[],
      };
    }

    // 2. Spring Physics Mode
    if (isSpringEasing) {
      // Solves spring trajectory
      let progress: number[] = [];
      let sDuration = duration;

      if (transition?.type === 'spring') {
        const solver = cachedSpringKeyframes({
          stiffness: transition.stiffness,
          damping: transition.damping,
          mass: transition.mass,
          velocity: transition.velocity,
        });
        progress = solver.keyframes;
        sDuration = solver.duration;
      } else {
        const traj = generateSpringTrajectory(0, 1, spring);
        progress = traj.progress;
        sDuration = traj.duration;
      }

      const steps = progress.length;
      const animKeys = new Set<keyof MotionStyle>();
      [...Object.keys(from), ...Object.keys(to)].forEach((k) => {
        const key = k as keyof MotionStyle;
        if (
          key !== 'backgroundColor' &&
          key !== 'color' &&
          key !== 'borderColor' &&
          key !== 'boxShadow'
        ) {
          animKeys.add(key);
        }
      });

      const springKeys: Keyframe[] = [];
      const parseVal = (v: any, fallback = 0): number => {
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          const parsed = parseFloat(v);
          return isNaN(parsed) ? fallback : parsed;
        }
        return fallback;
      };

      const getSuffix = (v: any, fallback = ''): string => {
        if (typeof v === 'string') {
          const match = v.match(/[a-zA-Z%]+$/);
          return match ? match[0] : fallback;
        }
        return fallback;
      };

      for (let i = 0; i < steps; i++) {
        const p = progress[i]!;
        const keyframe: any = {};

        animKeys.forEach((k) => {
          const startVal = parseVal(from[k], k === 'scale' || k === 'scaleX' || k === 'scaleY' ? 1 : 0);
          const endVal = parseVal(to[k], k === 'scale' || k === 'scaleX' || k === 'scaleY' ? 1 : 0);
          const suffix = getSuffix(to[k] !== undefined ? to[k] : from[k], k === 'x' || k === 'y' ? 'px' : '');

          const interpolated = startVal + (endVal - startVal) * p;
          if (suffix) {
            keyframe[k] = `${interpolated}${suffix}`;
          } else {
            keyframe[k] = interpolated;
          }
        });
        springKeys.push(parseStyleShortcuts(keyframe));
      }

      return {
        springKeyframes: springKeys,
        springDuration: sDuration,
        waapiFrames: springKeys,
      };
    }

    // 3. Simple Tween / Transitions Mode (Standard WAAPI)
    return {
      springKeyframes: null,
      springDuration: duration,
      waapiFrames: [
        parseStyleShortcuts({ ...from }),
        parseStyleShortcuts({ ...to })
      ] as Keyframe[]
    };
  }, [isSpringEasing, keyframes, from, to, duration, spring, transition]);

  // Override keyframe parameters if spring is enabled
  const resolvedKeyframes = isSpringEasing ? springKeyframes : keyframes;
  const isKeyframeMode = !!(resolvedKeyframes && resolvedKeyframes.length > 0);
  const resolvedDuration = isSpringEasing ? springDuration : duration;
  const easingCSS = isSpringEasing ? 'linear' : resolveEasing(easing);

  // ── Native FLIP Layout & Shared Layout Registry System ───────────────
  const layoutRef = useRef<DOMRect | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!layout && !layoutId) return;
    const el = ref.current;
    if (!el) return;

    // Get current visual position (could be currently animating)
    const animatingRect = el.getBoundingClientRect();

    // Cancel active FLIP animations to snap element to its clean DOM destination layout
    const activeAnims = el.getAnimations ? el.getAnimations() : [];
    let wasAnimating = false;
    activeAnims.forEach((anim) => {
      if (anim.id === 'pixon-flip') {
        wasAnimating = true;
        anim.cancel();
      }
    });

    // Measure the clean un-transformed destination layout
    const currentRect = el.getBoundingClientRect();
    let prev: DOMRect | null = null;

    if (wasAnimating) {
      // Smoothly continue animation from its current visual position
      prev = animatingRect;
    } else if (layoutId) {
      const cached = sharedLayoutRegistry.get(layoutId);
      if (cached && Date.now() - cached.timestamp < 150) {
        prev = cached.rect;
        sharedLayoutRegistry.delete(layoutId);
      }
    }

    if (!prev && layout && layoutRef.current) {
      prev = layoutRef.current;
    }

    if (prev) {
      const dx = prev.left - currentRect.left;
      const dy = prev.top - currentRect.top;
      const dw = prev.width / (currentRect.width || 1);
      const dh = prev.height / (currentRect.height || 1);

      // Filter animations based on layout types ('position' or 'size')
      const animatePosition = layout !== 'size';
      const animateSize = layout !== 'position';

      const tx = animatePosition ? dx : 0;
      const ty = animatePosition ? dy : 0;
      const sx = animateSize ? dw : 1;
      const sy = animateSize ? dh : 1;

      if (tx !== 0 || ty !== 0 || sx !== 1 || sy !== 1) {
        // Trigger high-performance hardware-accelerated off-thread animation
        el.animate(
          [
            {
              transform: `translate3d(${tx}px, ${ty}px, 0) scale(${sx}, ${sy})`,
              transformOrigin: 'top left',
            },
            {
              transform: 'translate3d(0px, 0px, 0) scale(1, 1)',
              transformOrigin: 'top left',
            },
          ],
          {
            id: 'pixon-flip',
            duration: resolvedDuration,
            easing: easingCSS,
          }
        );
      }
    }

    layoutRef.current = currentRect;
  });

  // ── Unified WAAPI Animation Control & Viewport Optimization ──────────
  useEffect(() => {
    // Keep infinite, viewport-driven loops alive while off-screen so we can pause/resume smoothly.
    const needsAnimation = shouldShow || (viewport && isInfinite && visible === undefined && !whileHover);
    if (!needsAnimation || !waapiFrames || !ref.current || shouldSkipAnimation) {
      if (animationRef.current) {
        animationRef.current.cancel();
        animationRef.current = null;
        waapiSigRef.current = null;
        setIsAnimating(false);
      }
      return;
    }
    
    const currentSignal = abortRef.current.signal;
    if (currentSignal.aborted) return;

    // Start or Reuse Animation
    let animation = animationRef.current;

    // If keyframes/timing options change, recreate to avoid stale animations.
    const resolvedDelay = (delay ?? transition?.delay ?? 0);
    const nextSig = {
      frames: waapiFrames,
      duration: resolvedDuration,
      easing: isSpringEasing ? 'linear' : resolveEasing(easing),
      fill: fillMode,
      delay: resolvedDelay,
      iterations: isInfinite ? Infinity : (iterations ?? 1),
      direction,
    } as const;

    const prevSig = waapiSigRef.current;
    const sigChanged = !!prevSig && (
      prevSig.frames !== nextSig.frames ||
      prevSig.duration !== nextSig.duration ||
      prevSig.easing !== nextSig.easing ||
      prevSig.fill !== nextSig.fill ||
      prevSig.delay !== nextSig.delay ||
      prevSig.iterations !== nextSig.iterations ||
      prevSig.direction !== nextSig.direction
    );

    if (animation && sigChanged) {
      try { animation.cancel(); } catch {}
      animation = null;
      animationRef.current = null;
      waapiSigRef.current = null;
      setIsAnimating(false);
    }
    
    if (!animation) {
      setIsAnimating(true);
      animation = ref.current.animate(waapiFrames, {
        duration: resolvedDuration,
        easing: isSpringEasing ? 'linear' : resolveEasing(easing),
        fill: fillMode,
        delay: resolvedDelay,
        iterations: isInfinite ? Infinity : (iterations ?? 1),
        direction: direction as any,
      });
      animationRef.current = animation;
      waapiSigRef.current = nextSig as any;

      animation.onfinish = () => {
        if (currentSignal.aborted) return;
        setIsAnimating(false);
        animationRef.current = null;
        waapiSigRef.current = null;
        if (onComplete) onComplete();
      };
    } else {
      waapiSigRef.current = nextSig as any;
    }

    // Viewport Optimization: Pause/Play
    if (viewport) {
      if (!isInView && animation.playState === 'running') {
        animation.pause();
      } else if (isInView && animation.playState === 'paused') {
        animation.play();
      }
    }
  }, [shouldShow, isInView, viewport, waapiFrames, resolvedDuration, fillMode, delay, transition, shouldSkipAnimation, onComplete, isInfinite, isSpringEasing, easing, iterations, direction]);

  // Ensure we always cancel on unmount to avoid orphaned WAAPI animations (especially infinite loops).
  useEffect(() => {
    return () => {
      const a = animationRef.current;
      if (a) {
        try { a.cancel(); } catch {}
      }
      animationRef.current = null;
      waapiSigRef.current = null;
    };
  }, []);


  useIsomorphicLayoutEffect(() => {
    if (!layoutId) return;
    return () => {
      const el = ref.current;
      if (el) {
        sharedLayoutRegistry.set(layoutId, {
          rect: el.getBoundingClientRect(),
          timestamp: Date.now(),
        });
      }
    };
  }, [layoutId]);

  // For non-keyframe mode: build inline styles for the current state
  const activeStyle = shouldShow ? to : from;
  const transform = buildTransform(activeStyle);
  const filter = buildFilter(activeStyle);
  const extras = buildExtraStyles(activeStyle);
  const customFromProps = extractCustomProps(from);
  const customToProps = extractCustomProps(to);
  const activeCustom = shouldShow ? customToProps : customFromProps;

  // Transition properties that animate
  const transitionProps = [
    'opacity',
    'transform',
    'filter',
    'background-color',
    'color',
    'border-color',
    'box-shadow',
    'border-radius',
    'width',
    'height',
    'padding',
    'gap',
  ].join(', ');

  // ── Build inline styles ───────────────────────────────────────────────
  const shouldWillChange = (isAnimating || isInfinite) && effectiveIsInView;
  const inlineStyles: React.CSSProperties = {
    willChange: shouldWillChange && !shouldSkipAnimation ? 'transform, opacity, filter' : 'auto',
    ...style,
  };

  if (waapiFrames && shouldShow) {
    // If using WAAPI, we set the final inline style to `to` to hold it
    // because WAAPI will handle the transition, but we want it sticky after.
    Object.assign(inlineStyles, {
      opacity: activeStyle.opacity ?? 1,
      transform,
      filter: filter !== 'none' ? filter : undefined,
    });
  } else if (isKeyframeMode && !waapiFrames) {
    // Keyframe mode: all animations are via @keyframes
    if (shouldShow) {
      const iterCount = iterations !== undefined
        ? iterations
        : loop ? 'infinite' : 1;

      Object.assign(inlineStyles, {
        animation: `${kfName} ${resolvedDuration}ms ${easingCSS} ${delay}ms ${iterCount} ${direction} ${fillMode}`,
      });
    } else {
      // Before triggering: apply first keyframe state
      const first = (resolvedKeyframes as any)![0] || {};
      Object.assign(inlineStyles, {
        opacity: first.opacity ?? 0,
        transform: buildTransform(first),
        filter: buildFilter(first) !== 'none' ? buildFilter(first) : undefined,
      });
    }
  } else {
    // Transition mode: CSS transitions between from ↔ to
    Object.assign(inlineStyles, {
      transitionProperty: transitionProps,
      transitionDuration: `${resolvedDuration}ms`,
      transitionTimingFunction: easingCSS,
      transitionDelay: `${delay}ms`,
      opacity: activeStyle.opacity ?? 1,
      transform,
      filter: filter !== 'none' ? filter : undefined,
      ...Object.fromEntries(
        Object.entries(extras).map(([k, v]) => {
          return [
            String(k).replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
            v,
          ];
        })
      ),
      // Spread custom CSS properties
      ...activeCustom,
    });
  }

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.target === e.currentTarget) {
      setIsAnimating(false);
      if (onComplete && shouldShow && !abortRef.current.signal.aborted) onComplete();
    }
  }, [onComplete, shouldShow]);

  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    if (e.target === e.currentTarget) {
      setIsAnimating(false);
      if (onComplete && !abortRef.current.signal.aborted) onComplete();
    }
  }, [onComplete]);

  const hoverHandlers = {
    ...(whileHover ? {
      onMouseEnter: () => {
        setIsHovered(true);
        setIsAnimating(true);
      },
      onMouseLeave: () => {
        setIsHovered(false);
        setIsAnimating(true);
      },
    } : {}),
    ...(tap ? {
      onPointerDown: () => setIsAnimating(true),
      onPointerUp: () => setIsAnimating(true),
    } : {}),
    ...(focus ? {
      onFocus: () => setIsAnimating(true),
      onBlur: () => setIsAnimating(true),
    } : {}),
  };

  // ── Render ────────────────────────────────────────────────────────────
  const Comp = asChild ? Slot : (as as any);

  // Build injected <style> for :hover, :active, :focus-visible, and @keyframes
  const needsStyle = !!(hover || tap || focus || isKeyframeMode);

  const injectedCSS = useMemo(() => {
    const blocks: string[] = [];

    // Base transition for hover/tap/focus (ensures smooth in & out)
    if (hover || tap || focus) {
      blocks.push(`
        [data-pixon-id="${rawId}"] {
          transition-property: ${transitionProps};
          transition-duration: ${resolvedDuration}ms;
          transition-timing-function: ${easingCSS};
        }
      `);
    }

    if (hover) {
      blocks.push(`
        [data-pixon-id="${rawId}"]:hover {
          ${buildCSSBlock(hover)}
        }
      `);
    }

    if (tap) {
      blocks.push(`
        [data-pixon-id="${rawId}"]:active {
          ${buildCSSBlock(tap)}
        }
      `);
    }

    if (focus) {
      blocks.push(`
        [data-pixon-id="${rawId}"]:focus-visible {
          ${buildCSSBlock(focus)}
        }
      `);
    }

    if (isKeyframeMode && resolvedKeyframes && !waapiFrames) {
      blocks.push(buildKeyframesCSS(kfName, resolvedKeyframes as any));
    }

    return blocks.join('\n');
  }, [rawId, hover, tap, focus, isKeyframeMode, resolvedKeyframes, waapiFrames, kfName, resolvedDuration, easingCSS, transitionProps]);

  useEffect(() => {
    if (!needsStyle || !injectedCSS) return;
    return insertScopedRules(rawId, injectedCSS);
  }, [needsStyle, injectedCSS, rawId]);

  return (
    <>
      <Comp
        data-pixon-id={rawId}
        ref={(node: HTMLDivElement | null) => {
          // Merge refs: internal IntersectionObserver ref + user innerRef
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof innerRef === 'function') innerRef(node);
          else if (innerRef) (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn(scopeClass, className)}
        style={inlineStyles}
        onTransitionEnd={handleTransitionEnd}
        onAnimationEnd={handleAnimationEnd}
        {...hoverHandlers}
        {...props}
      >
        {children}
      </Comp>
    </>
  );
}

Motion.displayName = 'Motion';

