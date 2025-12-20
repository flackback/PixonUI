import type { RefObject } from 'react';
import { useState, useLayoutEffect, useCallback } from 'react';

export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';

interface UseFloatingOptions {
  side?: Side;
  align?: Align;
  sideOffset?: number;
  alignOffset?: number;
  isOpen?: boolean;
}

interface Position {
  top: number;
  left: number;
}

export function useFloating(
  triggerRef: RefObject<HTMLElement>,
  contentRef: RefObject<HTMLElement>,
  options: UseFloatingOptions = {}
) {
  const {
    side = 'bottom',
    align = 'center',
    sideOffset = 4,
    alignOffset = 0,
    isOpen = false,
  } = options;

  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current || !isOpen) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;

    // Calculate base position based on side
    switch (side) {
      case 'top':
        top = triggerRect.top - contentRect.height - sideOffset;
        break;
      case 'bottom':
        top = triggerRect.bottom + sideOffset;
        break;
      case 'left':
        left = triggerRect.left - contentRect.width - sideOffset;
        break;
      case 'right':
        left = triggerRect.right + sideOffset;
        break;
    }

    // Calculate alignment
    if (side === 'top' || side === 'bottom') {
      switch (align) {
        case 'start':
          left = triggerRect.left + alignOffset;
          break;
        case 'center':
          left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2) + alignOffset;
          break;
        case 'end':
          left = triggerRect.right - contentRect.width + alignOffset;
          break;
      }
    } else {
      switch (align) {
        case 'start':
          top = triggerRect.top + alignOffset;
          break;
        case 'center':
          top = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2) + alignOffset;
          break;
        case 'end':
          top = triggerRect.bottom - contentRect.height + alignOffset;
          break;
      }
    }

    // Boundary checks (simple viewport containment)
    const padding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) left = padding;
    if (left + contentRect.width > viewportWidth - padding) {
      left = viewportWidth - contentRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + contentRect.height > viewportHeight - padding) {
      top = viewportHeight - contentRect.height - padding;
    }

    setPosition({ top, left });
    setIsPositioned(true);
  }, [triggerRef, contentRef, side, align, sideOffset, alignOffset, isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) {
      if (isPositioned) setIsPositioned(false);
      return;
    }

    updatePosition();

    // Use ResizeObserver for more robust updates
    const resizeObserver = new ResizeObserver(() => updatePosition());
    if (triggerRef.current) resizeObserver.observe(triggerRef.current);
    if (contentRef.current) resizeObserver.observe(contentRef.current);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition, triggerRef, contentRef]);

  return {
    position,
    isPositioned,
    updatePosition,
  };
}
