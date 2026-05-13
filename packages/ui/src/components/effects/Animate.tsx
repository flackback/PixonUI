import React, { useEffect, useLayoutEffect, forwardRef, useState } from 'react';
import { usePixonAnimate } from '../../hooks/usePixonAnimate';
import { SpringConfig } from '../../utils/motion';
import { usePresenceContext } from './AnimatePresence';
import { useLayoutGroup } from './LayoutGroup';
import { VariantProvider, useVariantContext } from './VariantContext';

export interface AnimateProps extends React.HTMLAttributes<HTMLDivElement> {
  layoutId?: string;
  variants?: Record<string, Record<string, any>>;
  initial?: string | Record<string, any>;
  animate?: string | Record<string, any>;
  exit?: string | Record<string, any>;
  whileHover?: string | Record<string, any>;
  whileTap?: string | Record<string, any>;
  whileInView?: string | Record<string, any>;
  transition?: {
    type?: 'spring' | 'tween';
    duration?: number;
    delay?: number;
    stiffness?: number;
    damping?: number;
    mass?: number;
    easing?: string;
    staggerChildren?: number;
    delayChildren?: number;
  };
  as?: keyof React.JSX.IntrinsicElements;
}

export const PixonMotion = forwardRef<HTMLElement, AnimateProps>(
  (
    {
      layoutId,
      variants,
      initial,
      animate: targetAnimate,
      exit: targetExit,
      whileHover,
      whileTap,
      whileInView,
      transition,
      as: Component = 'div',
      style,
      children,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      ...props
    },
    forwardedRef
  ) => {
    const { ref: internalRef, animate, cancel } = usePixonAnimate();
    const presence = usePresenceContext();
    const layoutGroup = useLayoutGroup();
    const variantContext = useVariantContext();

    // Determine staggering index if applicable
    const [staggerIndex] = useState(() => variantContext?.registerChild?.() ?? 0);

    // Resolve variant strings
    const resolveVariant = (val: any, contextVal?: any) => {
      const finalVal = val !== undefined ? val : contextVal;
      if (typeof finalVal === 'string' && variants) return variants[finalVal];
      return typeof finalVal === 'object' ? finalVal : undefined;
    };

    const resolvedInitial = resolveVariant(initial, variantContext?.initial);
    const resolvedAnimate = resolveVariant(targetAnimate, variantContext?.animate);
    const resolvedExit = resolveVariant(targetExit, variantContext?.exit);
    const resolvedWhileHover = resolveVariant(whileHover);
    const resolvedWhileTap = resolveVariant(whileTap);
    const resolvedWhileInView = resolveVariant(whileInView);
    
    // Setup generic ref merging
    const setRefs = (element: HTMLElement | null) => {
      (internalRef as any).current = element;
      if (typeof forwardedRef === 'function') {
        forwardedRef(element);
      } else if (forwardedRef) {
        (forwardedRef as any).current = element;
      }
    };

    // Built-in Intersection observer for whileInView
    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
      if (!whileInView || !internalRef.current) return;
      const observer = new IntersectionObserver(([entry]) => {
        setIsInView(entry?.isIntersecting ?? false);
      }, { threshold: 0.1 });
      observer.observe(internalRef.current);
      return () => observer.disconnect();
    }, [whileInView]);

    // FLIP Shared Layout Animation
    useLayoutEffect(() => {
      if (!layoutId || !layoutGroup || !internalRef.current) return;
      
      const oldRect = layoutGroup.getRect(layoutId);
      const el = internalRef.current;
      const newRect = el.getBoundingClientRect();

      // If we have an old position, invert and play!
      if (oldRect && (oldRect.left !== newRect.left || oldRect.top !== newRect.top || oldRect.width !== newRect.width || oldRect.height !== newRect.height)) {
        const deltaX = oldRect.left - newRect.left;
        const deltaY = oldRect.top - newRect.top;
        const deltaW = oldRect.width / (newRect.width || 1);
        const deltaH = oldRect.height / (newRect.height || 1);

        el.style.transformOrigin = 'top left';
        // Invert
        el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${deltaW}, ${deltaH})`;

        // Play to identity
        el.animate([
          { transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${deltaW}, ${deltaH})` },
          { transform: 'none' }
        ], {
          duration: transition?.duration ?? 400,
          easing: transition?.easing ?? 'cubic-bezier(0.2, 0.8, 0.2, 1)'
        }).onfinish = () => {
          el.style.transform = '';
        };
      }

      // Save rect on unmount
      return () => {
        if (internalRef.current) {
          layoutGroup.setRect(layoutId, internalRef.current.getBoundingClientRect());
        }
      };
    }, [layoutId, layoutGroup]);

    const springConfig: SpringConfig | undefined = transition?.type === 'spring' ? {
      stiffness: transition.stiffness,
      damping: transition.damping,
      mass: transition.mass,
    } : undefined;

    // Base initial state
    const baseStyle = { ...(resolvedInitial || {}), ...style };

    const triggerAnimation = (target: Record<string, any> | undefined) => {
      if (!target || !internalRef.current) return null;
      
      const staggerDelay = (variantContext?.delayChildren ?? 0) * 1000 + staggerIndex * (variantContext?.staggerChildren ?? 0) * 1000;
      
      const mappedTarget = { ...target };
      if (mappedTarget.pathLength !== undefined) {
        mappedTarget.strokeDasharray = '1 1';
        mappedTarget.strokeDashoffset = 1 - (mappedTarget.pathLength as number);
        delete mappedTarget.pathLength;
      }
      if (mappedTarget.pathOffset !== undefined) {
        mappedTarget.strokeDashoffset = (mappedTarget.strokeDashoffset || 0) - (mappedTarget.pathOffset as number);
        delete mappedTarget.pathOffset;
      }

      return animate([mappedTarget], {
        duration: transition?.duration,
        delay: (transition?.delay ?? 0) + staggerDelay,
        easing: transition?.easing,
        spring: springConfig,
      });
    };

    useEffect(() => {
      // Main animate trigger
      if (presence && !presence.isPresent) {
        // We are exiting!
        if (resolvedExit) {
          const animation = triggerAnimation(resolvedExit);
          if (animation) {
            animation.onfinish = () => {
              presence.onExitComplete?.();
            };
          } else {
            presence.onExitComplete?.();
          }
        } else {
          presence.onExitComplete?.();
        }
        return;
      }

      if (resolvedAnimate && !resolvedWhileInView) {
        triggerAnimation(resolvedAnimate);
      }
    }, [resolvedAnimate, resolvedExit, resolvedWhileInView, animate, presence?.isPresent]); // stringify or deeply compare in a real app if objects recreate

    useEffect(() => {
      if (presence && !presence.isPresent) return; // Don't trigger view updates while exiting
      // whileInView trigger
      if (resolvedWhileInView) {
        if (isInView) {
          triggerAnimation(resolvedWhileInView);
        } else if (resolvedInitial) {
          // Revert to initial when out of view
          triggerAnimation(resolvedInitial);
        }
      }
    }, [isInView, resolvedWhileInView, resolvedInitial, animate, presence?.isPresent]);

    const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
      if (resolvedWhileHover) triggerAnimation(resolvedWhileHover);
      onPointerEnter?.(e);
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
      // Revert to targetAnimate or initial on leave
      if (resolvedWhileHover) {
        triggerAnimation(resolvedAnimate || resolvedInitial || {});
      }
      onPointerLeave?.(e);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (resolvedWhileTap) triggerAnimation(resolvedWhileTap);
      onPointerDown?.(e);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (resolvedWhileTap) {
        // Revert to hover state if hovering, else target animate
        triggerAnimation(resolvedWhileHover || resolvedAnimate || resolvedInitial || {});
      }
      onPointerUp?.(e);
    };

    const isSVGGeometry = typeof Component === 'string' && ['path', 'line', 'circle', 'rect', 'polygon', 'polyline'].includes(Component);

    const element = React.createElement(
      Component,
      {
        ...props,
        ref: setRefs,
        style: baseStyle,
        pathLength: isSVGGeometry ? 1 : undefined,
        onPointerEnter: resolvedWhileHover ? handlePointerEnter : onPointerEnter,
        onPointerLeave: resolvedWhileHover ? handlePointerLeave : onPointerLeave,
        onPointerDown: resolvedWhileTap ? handlePointerDown : onPointerDown,
        onPointerUp: resolvedWhileTap ? handlePointerUp : onPointerUp,
        onPointerCancel: resolvedWhileTap ? handlePointerUp : undefined,
      },
      children
    );

    return (
      <VariantProvider
        initial={initial}
        animate={targetAnimate}
        exit={targetExit}
        staggerChildren={transition?.staggerChildren}
        delayChildren={transition?.delayChildren}
      >
        {element}
      </VariantProvider>
    );
  }
);

PixonMotion.displayName = 'PixonMotion';
