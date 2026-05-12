import React, { useEffect, useState, useRef, useMemo, useId } from 'react';
import { cn } from '../../utils/cn';
import { generateSpringTrajectory, calculateStagger } from '../../utils/motion';
import type { SpringConfig } from '../../utils/motion';

export interface AnimatedListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Delay between each item appearing (ms) @default 100 */
  stagger?: number;
  /** Animation duration per item (ms) @default 400 */
  duration?: number;
  /** Animation type */
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'blur';
  /** Trigger animation when in viewport @default true */
  viewport?: boolean;
  /** Only animate once @default true */
  once?: boolean;
  /** Easing model: standard bezier curves or pre-compiled physical springs @default 'bezier' */
  easing?: 'bezier' | 'spring';
  /** Custom physical spring coefficients or true for elastic bouncy preset */
  spring?: boolean | SpringConfig;
  /** Columns count when displayed as a grid (enables premium Euclidean Radial/Diagonal waves) */
  columns?: number;
  /** Starting anchor point for grid staggering calculations @default 'first' */
  from?: 'first' | 'last' | 'center' | number;
}

const ANIMATION_STYLES = {
  'fade-up': { from: 'translate3d(0, 16px, 0) scale(0.97)', to: 'translate3d(0, 0, 0) scale(1)', filterFrom: '', filterTo: '' },
  'fade-left': { from: 'translate3d(-24px, 0, 0)', to: 'translate3d(0, 0, 0)', filterFrom: '', filterTo: '' },
  'fade-right': { from: 'translate3d(24px, 0, 0)', to: 'translate3d(0, 0, 0)', filterFrom: '', filterTo: '' },
  'scale': { from: 'scale(0.8)', to: 'scale(1)', filterFrom: '', filterTo: '' },
  'blur': { from: 'translate3d(0, 8px, 0) scale(0.98)', to: 'translate3d(0, 0, 0) scale(1)', filterFrom: 'blur(4px)', filterTo: 'blur(0)' },
};

/**
 * Automatically animates children into view with staggered timing.
 * New items added dynamically also animate in. Supports cinema-grade physical spring
 * keyframes and 2D Euclidean grid waves, running off-thread on the GPU compositor.
 *
 * @example
 * ```tsx
 * <AnimatedList stagger={80} easing="spring" spring columns={3} from="center">
 *   {cards.map(c => (
 *     <GridCard key={c.id} {...c} />
 *   ))}
 * </AnimatedList>
 * ```
 */
export function AnimatedList({
  children,
  stagger = 100,
  duration = 400,
  animation = 'fade-up',
  viewport = true,
  once = true,
  easing = 'bezier',
  spring = false,
  columns,
  from = 'first',
  className,
  ...props
}: AnimatedListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!viewport);
  const rawId = useId();
  const scopeClass = `px-alist-${rawId.replace(/:/g, '')}`;

  const childArray = useMemo(
    () => React.Children.toArray(children),
    [children]
  );

  // Viewport detection
  useEffect(() => {
    if (!viewport || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [viewport, once]);

  // Spring physical trajectory pre-compilation
  const springConfig = useMemo<SpringConfig | null>(() => {
    if (easing !== 'spring' && !spring) return null;
    if (typeof spring === 'object') return spring;
    return { stiffness: 180, damping: 14, mass: 1 }; // Bouncy high-fidelity default preset
  }, [easing, spring]);

  const { progress, springDuration } = useMemo(() => {
    if (!springConfig) return { progress: null, springDuration: duration };
    const res = generateSpringTrajectory(0, 1, springConfig);
    return { progress: res.progress, springDuration: res.duration };
  }, [springConfig, duration]);

  // Stagger reveal via direct DOM manipulation using custom 2D stagger delays if columns are provided
  useEffect(() => {
    if (!containerRef.current) return;

    if (!isInView) {
      if (!once) {
        // Remove visible class from all items when out of view
        const items = containerRef.current.querySelectorAll(`.${scopeClass}-item.visible`);
        items.forEach((item) => item.classList.remove('visible'));
      }
      return;
    }

    const items = containerRef.current.querySelectorAll(`.${scopeClass}-item:not(.visible)`);
    if (items.length === 0) return;

    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    items.forEach((item, index) => {
      const delay = columns
        ? calculateStagger(index, items.length, { delay: stagger, grid: [columns, Math.ceil(items.length / columns)], from })
        : index * stagger;

      const timeoutId = setTimeout(() => {
        item.classList.add('visible');
      }, delay);
      timeoutIds.push(timeoutId);
    });

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [isInView, childArray.map((c, i) => (React.isValidElement(c) ? c.key : null) || i).join(','), stagger, scopeClass, once, columns, from]);

  // Dynamic CSS injector for standard transitions vs physical keyframe spring-paths
  const dynamicStyles = useMemo(() => {
    if (!progress || !springConfig) {
      const anim = ANIMATION_STYLES[animation];
      return `
        .${scopeClass}-item {
          opacity: 0;
          transform: ${anim.from};
          ${anim.filterFrom ? `filter: ${anim.filterFrom};` : ''}
          transition: opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)
                      ${anim.filterTo ? `, filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)` : ''};
        }
        .${scopeClass}-item.visible {
          opacity: 1;
          transform: ${anim.to};
          ${anim.filterTo ? `filter: ${anim.filterTo};` : ''}
        }
      `;
    }

    // Direct-compile discrete steps from analytical oscillator solver
    let keyframesStr = `@keyframes px-alist-spring-${scopeClass} {\n`;
    const steps = progress.length;

    progress.forEach((p, idx) => {
      const percentage = ((idx / (steps - 1)) * 100).toFixed(2);
      const opacity = Math.min(1, Math.max(0, p));

      let transformStr = '';
      let filterStr = '';

      switch (animation) {
        case 'fade-up': {
          const y = 16 * (1 - p);
          const s = 0.97 + (1 - 0.97) * p;
          transformStr = `translate3d(0, ${y}px, 0) scale(${s})`;
          break;
        }
        case 'fade-left': {
          const x = -24 * (1 - p);
          transformStr = `translate3d(${x}px, 0, 0)`;
          break;
        }
        case 'fade-right': {
          const x = 24 * (1 - p);
          transformStr = `translate3d(${x}px, 0, 0)`;
          break;
        }
        case 'scale': {
          const s = 0.8 + 0.2 * p;
          transformStr = `scale(${s})`;
          break;
        }
        case 'blur': {
          const y = 8 * (1 - p);
          const s = 0.98 + 0.02 * p;
          const blur = 4 * (1 - p);
          transformStr = `translate3d(0, ${y}px, 0) scale(${s})`;
          filterStr = `filter: blur(${Math.max(0, blur)}px);`;
          break;
        }
        default:
          break;
      }

      keyframesStr += `  ${percentage}% {
        opacity: ${opacity};
        transform: ${transformStr};
        ${filterStr ? `${filterStr}\n` : ''}
      }\n`;
    });

    keyframesStr += '}\n';

    return `
      ${keyframesStr}
      .${scopeClass}-item {
        opacity: 0;
      }
      .${scopeClass}-item.visible {
        animation: px-alist-spring-${scopeClass} ${springDuration}ms linear both;
      }
    `;
  }, [progress, springConfig, animation, duration, scopeClass, springDuration]);

  return (
    <>
      <style>{dynamicStyles}</style>
      <div
        ref={containerRef}
        className={cn('flex flex-col', className)}
        {...props}
      >
        {childArray.map((child, index) => (
          <div
            key={(child as React.ReactElement).key ?? index}
            className={`${scopeClass}-item`}
          >
            {child}
          </div>
        ))}
      </div>
    </>
  );
}

AnimatedList.displayName = 'AnimatedList';
