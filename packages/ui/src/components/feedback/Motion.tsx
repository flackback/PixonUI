import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';
import { useInView } from '../../hooks/useInView';

const motionVariants = cva(
  'transition-all duration-700 ease-out', 
  {
    variants: {
      preset: {
        'fade': 'opacity-0 translate-y-4',
        'spring': 'opacity-0 scale-95 translate-y-4',
        'slide-right': 'opacity-0 -translate-x-8',
        'slide-left': 'opacity-0 translate-x-8',
        'blur': 'opacity-0 blur-sm scale-105',
        '3d-flip': 'opacity-0 rotate-x-90',
      },
      visibleState: {
        'fade': 'opacity-100 translate-y-0',
        'spring': 'opacity-100 scale-100 translate-y-0 animate-enter-spring',
        'slide-right': 'opacity-100 translate-x-0',
        'slide-left': 'opacity-100 translate-x-0',
        'blur': 'opacity-100 blur-0 scale-100',
        '3d-flip': 'opacity-100 rotate-x-0',
      }
    },
    defaultVariants: {
      preset: 'spring',
    },
  }
);

export interface MotionProps extends React.HTMLAttributes<HTMLDivElement>, Omit<VariantProps<typeof motionVariants>, 'visibleState'> {
  asChild?: boolean;
  viewport?: boolean; // If true, animates only when entering the viewport
  visible?: boolean; // Manual control override
  delay?: number; // Delay in ms
  once?: boolean; // If true, animates only once
}

export function Motion({ 
  className, 
  preset = 'spring', 
  viewport = true, 
  visible,
  delay = 0,
  once = true,
  asChild = false,
  children, 
  style,
  ...props 
}: MotionProps) {
  const { ref, isInView, hasAnimated } = useInView({ threshold: 0.1, enabled: viewport && visible === undefined });
  
  // Determine if we should show the final state
  const internalShow = viewport ? (once ? hasAnimated : isInView) : true;
  const shouldShow = visible !== undefined ? visible : internalShow;

  // We manually construct the class string to ensure the correct preset is applied in the visible state
  // This is a bit of a hack because CVA doesn't support "conditional variants" based on external state easily
  // without defining a new variant like "state: visible".
  // But here we want to map 'preset' to 'visible' styles when shouldShow is true.
  
  // Let's simplify:
  // If shouldShow is true, we want the styles from `visible: [preset]`.
  // If shouldShow is false, we want the styles from `preset: [preset]`.
  
  // However, CVA `visible` variant keys match `preset` keys.
  // So we can just pass `visible: shouldShow ? preset : null`? No, that would remove the base styles.
  
  // Correct approach with the current CVA definition:
  // The `preset` variant defines the INITIAL state (hidden).
  // The `visible` variant defines the FINAL state (shown).
  // We need to apply `preset` ALWAYS (as base), and then override with `visible` when shown?
  // No, `preset` has opacity-0. If we keep it, we need `visible` to have opacity-100 and override it.
  // Tailwind classes override based on order in CSS, but here they are utility classes.
  // `opacity-100` usually overrides `opacity-0` if generated later, but `cn` merges them.
  
  // Let's try to be cleaner:
  // We will use the `preset` prop to get the initial state classes.
  // And we will manually append the visible classes if `shouldShow` is true.
  
  const initialClasses = motionVariants({ preset });
  const visibleClasses = shouldShow ? motionVariants({ visibleState: preset as any }) : '';
  
  // If visibleClasses is applied, we want it to win over initialClasses.
  // `cn` (tailwind-merge) handles this conflict resolution perfectly.
  
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      ref={ref}
      className={cn(
        initialClasses,
        visibleClasses,
        className
      )}
      style={{ 
        transitionDelay: `${delay}ms`,
        willChange: 'transform, opacity',
        ...style 
      }}
      {...props}
    >
      {children}
    </Comp>
  );
}
