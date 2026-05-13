import React from 'react';

export interface SSRAnimateProps extends React.HTMLAttributes<HTMLDivElement> {
  initial?: {
    opacity?: number;
    x?: number | string;
    y?: number | string;
    translateX?: number | string;
    translateY?: number | string;
    scale?: number;
    rotate?: number;
  };
  animate?: {
    opacity?: number;
    x?: number | string;
    y?: number | string;
    translateX?: number | string;
    translateY?: number | string;
    scale?: number;
    rotate?: number;
  };
  transition?: {
    duration?: number;
    delay?: number;
    easing?: string;
  };
  as?: keyof React.JSX.IntrinsicElements;
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
  initial = {},
  animate = {},
  transition = {},
  as: Component = 'div',
  style,
  className,
  children,
  ...props
}: SSRAnimateProps) {
  const initX = initial.x ?? initial.translateX ?? 0;
  const initY = initial.y ?? initial.translateY ?? 0;
  const animX = animate.x ?? animate.translateX ?? 0;
  const animY = animate.y ?? animate.translateY ?? 0;

  const ssrStyles = {
    ...style,
    '--pixon-init-opacity': initial.opacity ?? 1,
    '--pixon-init-x': formatUnit(initX),
    '--pixon-init-y': formatUnit(initY),
    '--pixon-init-scale': initial.scale ?? 1,
    '--pixon-init-rotate': formatUnit(initial.rotate ?? 0, 'deg'),

    '--pixon-anim-opacity': animate.opacity ?? 1,
    '--pixon-anim-x': formatUnit(animX),
    '--pixon-anim-y': formatUnit(animY),
    '--pixon-anim-scale': animate.scale ?? 1,
    '--pixon-anim-rotate': formatUnit(animate.rotate ?? 0, 'deg'),

    '--pixon-dur': `${transition.duration ?? 400}ms`,
    '--pixon-delay': `${transition.delay ?? 0}ms`,
    '--pixon-ease': transition.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)',
  } as React.CSSProperties;

  const combinedClassName = `pixon-ssr-animate${className ? ` ${className}` : ''}`;

  return (
    <>
      <style>{`
        @keyframes pixon-ssr-kf {
          from {
            opacity: var(--pixon-init-opacity, 1);
            transform: translate3d(var(--pixon-init-x, 0px), var(--pixon-init-y, 0px), 0px) scale(var(--pixon-init-scale, 1)) rotate(var(--pixon-init-rotate, 0deg));
          }
          to {
            opacity: var(--pixon-anim-opacity, 1);
            transform: translate3d(var(--pixon-anim-x, 0px), var(--pixon-anim-y, 0px), 0px) scale(var(--pixon-anim-scale, 1)) rotate(var(--pixon-anim-rotate, 0deg));
          }
        }

        .pixon-ssr-animate {
          animation-name: pixon-ssr-kf;
          animation-duration: var(--pixon-dur, 400ms);
          animation-delay: var(--pixon-delay, 0ms);
          animation-timing-function: var(--pixon-ease, cubic-bezier(0.16, 1, 0.3, 1));
          animation-fill-mode: forwards;
          
          opacity: var(--pixon-init-opacity, 1);
          transform: translate3d(var(--pixon-init-x, 0px), var(--pixon-init-y, 0px), 0px) scale(var(--pixon-init-scale, 1)) rotate(var(--pixon-init-rotate, 0deg));
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
