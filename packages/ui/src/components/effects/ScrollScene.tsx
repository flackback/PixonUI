import React, { useEffect, useId } from 'react';
import type { SSRAnimateProps } from './SSRAnimate';
import { ensureTransformChannels } from '../../motion/transformChannels';

type SafeHTMLTags = 'div' | 'section' | 'article' | 'span' | 'li' | 'ul' | 'main' | 'header' | 'footer' | 'nav';

export interface ScrollSceneProps {
  children: React.ReactNode;
  timeline?: 'scroll' | 'view';
  axis?: 'block' | 'inline';
  range?: {
    start?: string;
    end?: string;
  };
  from: SSRAnimateProps['initial'];
  to: SSRAnimateProps['animate'];
  fallback?: 'static' | 'animate';
  as?: SafeHTMLTags;
  className?: string;
  style?: React.CSSProperties;
}

function formatUnit(val: number | string | undefined, defaultUnit = 'px'): string {
  if (val === undefined) return '';
  if (typeof val === 'number') return `${val}${defaultUnit}`;
  return val;
}

export function ScrollScene({
  children,
  timeline = 'view',
  axis = 'block',
  range,
  from = {},
  to = {},
  fallback = 'static',
  as: Component = 'div',
  className = '',
  style = {},
  ...props
}: ScrollSceneProps) {
  useEffect(() => {
    ensureTransformChannels();
  }, []);

  const rawId = useId();
  const id = (typeof rawId === 'string' ? rawId : '').split(':').join('');
  const animName = `scroll-scene-${id}`;

  const initX = from.x ?? from.translateX ?? 0;
  const initY = from.y ?? from.translateY ?? 0;
  const animX = to.x ?? to.translateX ?? 0;
  const animY = to.y ?? to.translateY ?? 0;

  const vars = {
    '--pixon-init-opacity': from.opacity ?? (to.opacity !== undefined ? 0 : 1),
    '--pixon-anim-opacity': to.opacity ?? 1,
    '--pixon-init-blur': formatUnit(from.blur ?? 0, 'px'),
    '--pixon-anim-blur': formatUnit(to.blur ?? 0, 'px'),

    // Scroll channel variables (suffix "s")
    '--pixon-init-x': formatUnit(initX),
    '--pixon-init-y': formatUnit(initY),
    '--pixon-init-scale': String(from.scale ?? 1),
    '--pixon-init-rotate': formatUnit(from.rotate ?? 0, 'deg'),
    '--pixon-init-rotateX': formatUnit(from.rotateX ?? 0, 'deg'),
    '--pixon-init-rotateY': formatUnit(from.rotateY ?? 0, 'deg'),
    '--pixon-init-skewX': formatUnit(from.skewX ?? 0, 'deg'),
    '--pixon-init-skewY': formatUnit(from.skewY ?? 0, 'deg'),

    '--pixon-anim-x': formatUnit(animX),
    '--pixon-anim-y': formatUnit(animY),
    '--pixon-anim-scale': String(to.scale ?? 1),
    '--pixon-anim-rotate': formatUnit(to.rotate ?? 0, 'deg'),
    '--pixon-anim-rotateX': formatUnit(to.rotateX ?? 0, 'deg'),
    '--pixon-anim-rotateY': formatUnit(to.rotateY ?? 0, 'deg'),
    '--pixon-anim-skewX': formatUnit(to.skewX ?? 0, 'deg'),
    '--pixon-anim-skewY': formatUnit(to.skewY ?? 0, 'deg'),
  } as React.CSSProperties;

  const rangeStart = range?.start ?? 'cover 0%';
  const rangeEnd = range?.end ?? 'cover 100%';

  return (
    <>
      <style {...({ precedence: 'default', href: `pixon-scroll-scene-${id}` } as any)}>{`
        @keyframes ${animName} {
          from {
            opacity: var(--pixon-init-opacity, 1);
            --px-xs: var(--pixon-init-x, 0px);
            --px-ys: var(--pixon-init-y, 0px);
            --px-scales: var(--pixon-init-scale, 1);
            --px-rotates: var(--pixon-init-rotate, 0deg);
            --px-rotateXs: var(--pixon-init-rotateX, 0deg);
            --px-rotateYs: var(--pixon-init-rotateY, 0deg);
            --px-skewXs: var(--pixon-init-skewX, 0deg);
            --px-skewYs: var(--pixon-init-skewY, 0deg);
            filter: blur(var(--pixon-init-blur, 0px));
          }
          to {
            opacity: var(--pixon-anim-opacity, 1);
            --px-xs: var(--pixon-anim-x, 0px);
            --px-ys: var(--pixon-anim-y, 0px);
            --px-scales: var(--pixon-anim-scale, 1);
            --px-rotates: var(--pixon-anim-rotate, 0deg);
            --px-rotateXs: var(--pixon-anim-rotateX, 0deg);
            --px-rotateYs: var(--pixon-anim-rotateY, 0deg);
            --px-skewXs: var(--pixon-anim-skewX, 0deg);
            --px-skewYs: var(--pixon-anim-skewY, 0deg);
            filter: blur(var(--pixon-anim-blur, 0px));
          }
        }

        .scroll-scene-wrapper-${id} {
          /* Fallback base styles for unsupported browsers */
          ${fallback === 'static' ? `
            opacity: var(--pixon-anim-opacity, 1);
            --px-xs: var(--pixon-anim-x, 0px);
            --px-ys: var(--pixon-anim-y, 0px);
            --px-scales: var(--pixon-anim-scale, 1);
            --px-rotates: var(--pixon-anim-rotate, 0deg);
            --px-rotateXs: var(--pixon-anim-rotateX, 0deg);
            --px-rotateYs: var(--pixon-anim-rotateY, 0deg);
            --px-skewXs: var(--pixon-anim-skewX, 0deg);
            --px-skewYs: var(--pixon-anim-skewY, 0deg);
            filter: blur(var(--pixon-anim-blur, 0px));
          ` : `
            animation: ${animName} 1s both;
          `}
        }

        @supports (animation-timeline: view()) {
          .scroll-scene-wrapper-${id} {
            animation-name: ${animName};
            animation-fill-mode: both;
            animation-timing-function: linear;
            animation-timeline: ${timeline}(${axis});
            animation-range: ${rangeStart} ${rangeEnd};
            will-change: transform, opacity, filter;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-scene-wrapper-${id} {
            animation: none !important;
            opacity: var(--pixon-anim-opacity, 1) !important;
            --px-xs: var(--pixon-anim-x, 0px) !important;
            --px-ys: var(--pixon-anim-y, 0px) !important;
            --px-scales: var(--pixon-anim-scale, 1) !important;
            --px-rotates: var(--pixon-anim-rotate, 0deg) !important;
            --px-rotateXs: var(--pixon-anim-rotateX, 0deg) !important;
            --px-rotateYs: var(--pixon-anim-rotateY, 0deg) !important;
            --px-skewXs: var(--pixon-anim-skewX, 0deg) !important;
            --px-skewYs: var(--pixon-anim-skewY, 0deg) !important;
            filter: blur(var(--pixon-anim-blur, 0px)) !important;
          }
        }
      `}</style>
      {React.createElement(
        Component,
        {
          ...props,
          className: `px-transform scroll-scene-wrapper-${id} ${className}`.trim(),
          style: { ...style, ...vars },
        },
        children
      )}
    </>
  );
}

export default ScrollScene;
