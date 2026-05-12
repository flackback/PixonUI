import React, { useEffect, useState, useRef, useMemo, useId } from 'react';
import { cn } from '../../utils/cn';

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
 * New items added dynamically also animate in. Perfect for notification
 * feeds, activity logs, and dynamic lists.
 *
 * @example
 * ```tsx
 * <AnimatedList stagger={80} animation="fade-up">
 *   {notifications.map(n => (
 *     <NotificationCard key={n.id} {...n} />
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

  // Stagger reveal via direct DOM manipulation
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
      const timeoutId = setTimeout(() => {
        item.classList.add('visible');
      }, index * stagger);
      timeoutIds.push(timeoutId);
    });

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [isInView, childArray.map(c => (c as React.ReactElement).key).join(','), stagger, scopeClass, once]);

  const anim = ANIMATION_STYLES[animation];

  return (
    <>
      <style>{`
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
      `}</style>
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
