import { useCallback, useLayoutEffect, useMemo, useState, type RefObject } from 'react';

export type AnchoredPopoverAnimation = 'none' | 'fade' | 'scale' | 'slide';

export interface AnchoredPopoverOptions {
  isOpen: boolean;
  sideOffset?: number;
  viewportPadding?: number;
}

export interface AnchoredPopoverState {
  top: number;
  left: number;
  width: number;
  transformOrigin: string;
  isPositioned: boolean;
}

const defaultState: AnchoredPopoverState = {
  top: 0,
  left: 0,
  width: 0,
  transformOrigin: 'top left',
  isPositioned: false,
};

export function useAnchoredPopover(
  triggerRef: RefObject<HTMLElement>,
  contentRef: RefObject<HTMLElement>,
  { isOpen, sideOffset = 8, viewportPadding = 8 }: AnchoredPopoverOptions
) {
  const [state, setState] = useState<AnchoredPopoverState>(defaultState);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;

    if (!isOpen || !trigger || !content) return;

    const triggerRect = trigger.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const fitsBottom = triggerRect.bottom + sideOffset + contentRect.height <= viewportHeight - viewportPadding;
    const fitsTop = triggerRect.top - sideOffset - contentRect.height >= viewportPadding;

    const nextTop = fitsBottom || !fitsTop
      ? triggerRect.bottom + sideOffset
      : triggerRect.top - contentRect.height - sideOffset;

    const nextLeft = Math.min(
      Math.max(triggerRect.left, viewportPadding),
      Math.max(viewportPadding, viewportWidth - contentRect.width - viewportPadding)
    );

    setState({
      top: nextTop,
      left: nextLeft,
      width: triggerRect.width,
      transformOrigin: fitsBottom || !fitsTop ? 'top left' : 'bottom left',
      isPositioned: true,
    });
  }, [contentRef, isOpen, sideOffset, triggerRef, viewportPadding]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setState(defaultState);
      return;
    }

    updatePosition();

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
  }, [contentRef, isOpen, triggerRef, updatePosition]);

  return useMemo(() => ({
    ...state,
    updatePosition,
  }), [state, updatePosition]);
}
