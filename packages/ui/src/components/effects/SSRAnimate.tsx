import React from 'react';

type SafeHTMLTags = 'div' | 'section' | 'article' | 'span' | 'li' | 'ul' | 'main' | 'header' | 'footer' | 'nav';

export interface SSRAnimateProps extends React.HTMLAttributes<HTMLElement> {
  initial?: {
    opacity?: number;
    x?: number | string;
    y?: number | string;
    translateX?: number | string;
    translateY?: number | string;
    scale?: number;
    rotate?: number;
    rotateX?: number;
    rotateY?: number;
    skewX?: number;
    skewY?: number;
    blur?: number | string;
  };
  animate?: {
    opacity?: number;
    x?: number | string;
    y?: number | string;
    translateX?: number | string;
    translateY?: number | string;
    scale?: number;
    rotate?: number;
    rotateX?: number;
    rotateY?: number;
    skewX?: number;
    skewY?: number;
    blur?: number | string;
  };
  transition?: {
    duration?: number;
    delay?: number;
    easing?: string;
    iterations?: number | 'infinite';
    direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    playState?: 'running' | 'paused';
  };
  trigger?: 'load' | 'view';
  as?: SafeHTMLTags;
}

function formatUnit(val: number | string | undefined, defaultUnit = 'px'): string {
  if (val === undefined) return '';
  if (typeof val === 'number') return `${val}${defaultUnit}`;
  return val;
}

/**
 * PixonSSRAnimate
 * A revolutionary React Server Component (RSC) compatible animation wrapper.
 * Requires ZERO JavaScript on the client side, running entirely on CSS Variables + Native CSS Animation Engine.
 * 100% immune to hydration mismatches and completely SEO friendly.
 */
export function PixonSSRAnimate({
  initial,
  animate = {},
  transition = {},
  trigger = 'load',
  as: Component = 'div',
  style,
  className,
  children,
  ...props
}: SSRAnimateProps) {
  // Smart default logic for opacity:
  // If `animate` provides opacity and `initial` does not exist OR does not provide opacity, infer intent as 0.
  // Otherwise, fallback to 1.
  const inferredInitialOpacity = initial?.opacity ?? (animate.opacity !== undefined ? 0 : 1);
  const safeInitial = initial ?? {};

  const initX = safeInitial.x ?? safeInitial.translateX ?? 0;
  const initY = safeInitial.y ?? safeInitial.translateY ?? 0;
  const animX = animate.x ?? animate.translateX ?? 0;
  const animY = animate.y ?? animate.translateY ?? 0;

  const ssrStyles = {
    ...style,
    '--pixon-init-opacity': inferredInitialOpacity,
    '--pixon-init-x': formatUnit(initX),
    '--pixon-init-y': formatUnit(initY),
    '--pixon-init-scale': safeInitial.scale ?? 1,
    '--pixon-init-rotate': formatUnit(safeInitial.rotate ?? 0, 'deg'),
    '--pixon-init-rotateX': formatUnit(safeInitial.rotateX ?? 0, 'deg'),
    '--pixon-init-rotateY': formatUnit(safeInitial.rotateY ?? 0, 'deg'),
    '--pixon-init-skewX': formatUnit(safeInitial.skewX ?? 0, 'deg'),
    '--pixon-init-skewY': formatUnit(safeInitial.skewY ?? 0, 'deg'),
    '--pixon-init-blur': formatUnit(safeInitial.blur ?? 0, 'px'),

    '--pixon-anim-opacity': animate.opacity ?? 1,
    '--pixon-anim-x': formatUnit(animX),
    '--pixon-anim-y': formatUnit(animY),
    '--pixon-anim-scale': animate.scale ?? 1,
    '--pixon-anim-rotate': formatUnit(animate.rotate ?? 0, 'deg'),
    '--pixon-anim-rotateX': formatUnit(animate.rotateX ?? 0, 'deg'),
    '--pixon-anim-rotateY': formatUnit(animate.rotateY ?? 0, 'deg'),
    '--pixon-anim-skewX': formatUnit(animate.skewX ?? 0, 'deg'),
    '--pixon-anim-skewY': formatUnit(animate.skewY ?? 0, 'deg'),
    '--pixon-anim-blur': formatUnit(animate.blur ?? 0, 'px'),

    '--pixon-dur': `${transition.duration ?? 400}ms`,
    '--pixon-delay': `${transition.delay ?? 0}ms`,
    '--pixon-ease': transition.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)',
    '--pixon-iterations': transition.iterations ?? 1,
    '--pixon-direction': transition.direction ?? 'normal',
    '--pixon-playstate': transition.playState ?? 'running',
  } as React.CSSProperties;

  const combinedClassName = `pixon-ssr-animate${trigger === 'view' ? ' pixon-ssr-view-trigger' : ''}${className ? ` ${className}` : ''}`;

  return (
    <>
      {/* @ts-ignore: precedence and href are React 19 specific for deduplication */}
      <style precedence="default" href="pixon-ssr-animate">{`
        @keyframes pixon-ssr-kf {
          from {
            opacity: var(--pixon-init-opacity, 1);
            transform: translate3d(var(--pixon-init-x, 0px), var(--pixon-init-y, 0px), 0px) scale(var(--pixon-init-scale, 1)) rotate(var(--pixon-init-rotate, 0deg)) rotateX(var(--pixon-init-rotateX, 0deg)) rotateY(var(--pixon-init-rotateY, 0deg)) skewX(var(--pixon-init-skewX, 0deg)) skewY(var(--pixon-init-skewY, 0deg));
            filter: blur(var(--pixon-init-blur, 0px));
          }
          to {
            opacity: var(--pixon-anim-opacity, 1);
            transform: translate3d(var(--pixon-anim-x, 0px), var(--pixon-anim-y, 0px), 0px) scale(var(--pixon-anim-scale, 1)) rotate(var(--pixon-anim-rotate, 0deg)) rotateX(var(--pixon-anim-rotateX, 0deg)) rotateY(var(--pixon-anim-rotateY, 0deg)) skewX(var(--pixon-anim-skewX, 0deg)) skewY(var(--pixon-anim-skewY, 0deg));
            filter: blur(var(--pixon-anim-blur, 0px));
          }
        }

        .pixon-ssr-animate {
          animation-name: pixon-ssr-kf;
          animation-duration: var(--pixon-dur, 400ms);
          animation-delay: var(--pixon-delay, 0ms);
          animation-timing-function: var(--pixon-ease, cubic-bezier(0.16, 1, 0.3, 1));
          animation-fill-mode: forwards;
          animation-iteration-count: var(--pixon-iterations, 1);
          animation-direction: var(--pixon-direction, normal);
          animation-play-state: var(--pixon-playstate, running);
          
          will-change: transform, opacity, filter;
          
          /* Fallback before animation applies */
          opacity: var(--pixon-init-opacity, 1);
          transform: translate3d(var(--pixon-init-x, 0px), var(--pixon-init-y, 0px), 0px) scale(var(--pixon-init-scale, 1)) rotate(var(--pixon-init-rotate, 0deg)) rotateX(var(--pixon-init-rotateX, 0deg)) rotateY(var(--pixon-init-rotateY, 0deg)) skewX(var(--pixon-init-skewX, 0deg)) skewY(var(--pixon-init-skewY, 0deg));
          filter: blur(var(--pixon-init-blur, 0px));
        }

        .pixon-ssr-view-trigger {
          animation-timeline: view();
          animation-range: entry 10% cover 30%;
        }

        @media (prefers-reduced-motion: reduce) {
          .pixon-ssr-animate {
            animation: none !important;
            opacity: var(--pixon-anim-opacity, 1) !important;
            transform: translate3d(var(--pixon-anim-x, 0px), var(--pixon-anim-y, 0px), 0px) scale(var(--pixon-anim-scale, 1)) rotate(var(--pixon-anim-rotate, 0deg)) rotateX(var(--pixon-anim-rotateX, 0deg)) rotateY(var(--pixon-anim-rotateY, 0deg)) skewX(var(--pixon-anim-skewX, 0deg)) skewY(var(--pixon-anim-skewY, 0deg)) !important;
            filter: blur(var(--pixon-anim-blur, 0px)) !important;
          }
        }
      `}</style>
      {React.createElement(
        Component,
        {
          ...props,
          className: combinedClassName,
          style: ssrStyles,
        },
        children
      )}
    </>
  );
}
export default PixonSSRAnimate;
