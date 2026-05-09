import React, { useEffect, useState, useId, useMemo, useCallback, useRef } from 'react';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

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
  children: React.ReactNode;

  // ── Preset API (backward compat) ──────────────────────────────────────
  /** Quick preset animation. Ignored when `from`/`to` are provided. */
  preset?: MotionPreset;

  // ── Custom animation API ──────────────────────────────────────────────
  /** Starting state (element invisible/off-screen) */
  from?: MotionStyle;
  /** Target state (element fully visible) */
  to?: MotionStyle;
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
function buildKeyframesCSS(name: string, steps: MotionStyle[]): string {
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Motion({
  children,
  // Preset
  preset,
  // Custom
  from: fromProp,
  to: toProp,
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
  className,
  style,
  ...props
}: MotionProps) {
  // ── Accessibility: reduced motion ─────────────────────────────────────
  const prefersReduced = useReducedMotion();
  const shouldSkipAnimation = respectReducedMotion && prefersReduced;

  // ── Resolve from/to from preset or custom props ───────────────────────
  const isCustom = !!(fromProp || toProp || keyframes);
  const presetDef = preset ? PRESET_DEFINITIONS[preset] : PRESET_DEFINITIONS.spring;
  const from: MotionStyle = isCustom
    ? { opacity: 0, ...fromProp }
    : presetDef.from;
  const to: MotionStyle = isCustom
    ? { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, blur: 0, ...toProp }
    : presetDef.to;

  // ── Scoped class for injected CSS ─────────────────────────────────────
  const rawId = useId();
  const scopeClass = useMemo(() => `px-motion-${rawId.replace(/:/g, '')}`, [rawId]);
  const kfName = `pxKf_${rawId.replace(/:/g, '')}`;

  // ── Viewport / visibility ─────────────────────────────────────────────
  const { ref, isInView, hasAnimated } = useInView({
    threshold: viewportThreshold,
    rootMargin: viewportMargin,
    enabled: viewport && visible === undefined,
  });

  // ── Hover-based visibility ────────────────────────────────────────────
  const [isHovered, setIsHovered] = useState(false);

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

  // ── Resolved easing ───────────────────────────────────────────────────
  const easingCSS = resolveEasing(easing);

  // ── Transition mode (from → to) ──────────────────────────────────────
  const isKeyframeMode = keyframes && keyframes.length > 0;

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
  const inlineStyles: React.CSSProperties = {
    willChange: 'transform, opacity, filter',
    ...style,
  };

  if (isKeyframeMode) {
    // Keyframe mode: all animations are via @keyframes
    if (shouldShow) {
      const iterCount = iterations !== undefined
        ? iterations
        : loop ? 'infinite' : 1;

      Object.assign(inlineStyles, {
        animation: `${kfName} ${duration}ms ${easingCSS} ${delay}ms ${iterCount} ${direction} ${fillMode}`,
      });
    } else {
      // Before triggering: apply first keyframe state
      const first = keyframes![0] || {};
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
      transitionDuration: `${duration}ms`,
      transitionTimingFunction: easingCSS,
      transitionDelay: `${delay}ms`,
      opacity: activeStyle.opacity ?? 1,
      transform,
      filter: filter !== 'none' ? filter : undefined,
      ...Object.fromEntries(
        Object.entries(extras).map(([k, v]) => [
          k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
          v,
        ])
      ),
      // Spread custom CSS properties
      ...activeCustom,
    });
  }

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.target === e.currentTarget && onComplete && shouldShow) onComplete();
  }, [onComplete, shouldShow]);

  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    if (e.target === e.currentTarget && onComplete) onComplete();
  }, [onComplete]);

  const hoverHandlers = whileHover ? {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  } : {};

  // ── Render ────────────────────────────────────────────────────────────
  const Comp = asChild ? Slot : (as as any);

  // Build injected <style> for :hover, :active, :focus-visible, and @keyframes
  const needsStyle = !!(hover || tap || focus || isKeyframeMode);

  const injectedCSS = useMemo(() => {
    const blocks: string[] = [];

    // Base transition for hover/tap/focus (ensures smooth in & out)
    if (hover || tap || focus) {
      blocks.push(`
        .${scopeClass} {
          transition-property: ${transitionProps};
          transition-duration: ${duration}ms;
          transition-timing-function: ${easingCSS};
        }
      `);
    }

    if (hover) {
      blocks.push(`
        .${scopeClass}:hover {
          ${buildCSSBlock(hover)}
        }
      `);
    }

    if (tap) {
      blocks.push(`
        .${scopeClass}:active {
          ${buildCSSBlock(tap)}
        }
      `);
    }

    if (focus) {
      blocks.push(`
        .${scopeClass}:focus-visible {
          ${buildCSSBlock(focus)}
        }
      `);
    }

    if (isKeyframeMode && keyframes) {
      blocks.push(buildKeyframesCSS(kfName, keyframes));
    }

    return blocks.join('\n');
  }, [scopeClass, hover, tap, focus, isKeyframeMode, keyframes, kfName, duration, easingCSS, transitionProps]);

  return (
    <>
      {needsStyle && <style>{injectedCSS}</style>}
      <Comp
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
