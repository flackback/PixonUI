import React from 'react';
import { useInView } from '../../hooks/useInView';
import { cn } from '../../utils/cn';

export interface MotionGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * Delay between each child animation (ms)
   * @default 100
   */
  stagger?: number;
  /**
   * Initial delay before the first child animates (ms)
   * @default 0
   */
  delay?: number;
  /**
   * Animate when entering viewport
   * @default true
   */
  viewport?: boolean;
  /**
   * Manual visibility control (overrides viewport)
   */
  visible?: boolean;
  /**
   * Animate only on first entrance
   * @default true
   */
  once?: boolean;
}

export function MotionGroup({
  children,
  stagger = 100,
  delay = 0,
  viewport = true,
  visible,
  once = true,
  className,
  ...props
}: MotionGroupProps) {
  const { ref, isInView, hasAnimated } = useInView({
    threshold: 0.1,
    enabled: viewport && visible === undefined,
  });

  const internalShow = viewport ? (once ? hasAnimated : isInView) : true;
  const shouldShow = visible !== undefined ? visible : internalShow;

  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            visible: shouldShow,
            viewport: false,
            delay: delay + index * stagger,
          });
        }
        return child;
      })}
    </div>
  );
}

MotionGroup.displayName = 'MotionGroup';
