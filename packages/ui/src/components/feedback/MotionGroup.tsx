import React from 'react';
import { useInView } from '../../hooks/useInView';
import { cn } from '../../utils/cn';

interface MotionGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  stagger?: number; // Delay between items in ms
  delay?: number;   // Initial delay in ms
}

export function MotionGroup({ 
  children, 
  stagger = 100, 
  delay = 0, 
  className, 
  ...props 
}: MotionGroupProps) {
  const { ref, hasAnimated } = useInView({ threshold: 0.1 });

  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            // Force child to wait for group
            visible: hasAnimated,
            // Disable child's internal observer to save resources
            viewport: false,
            // Calculate stagger delay
            delay: delay + (index * stagger),
          });
        }
        return child;
      })}
    </div>
  );
}
