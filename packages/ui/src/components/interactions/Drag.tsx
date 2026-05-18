import React, { forwardRef, useCallback, useRef } from 'react';
import type { DragState } from '../../hooks/useDrag';
import { useDrag } from '../../hooks/useDrag';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';
import type { DragConstraintInput} from './dragConstraints';
import { resolveDragConstraintBounds } from './dragConstraints';

export interface DragProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  children: React.ReactNode;
  asChild?: boolean;
  drag?: boolean | 'x' | 'y';
  dragConstraints?: DragConstraintInput;
  dragElastic?: number;
  dragInertia?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (state: DragState) => void;
  onDrag?: (state: DragState) => void;
}

export const Drag = forwardRef<HTMLDivElement, DragProps>(({
  children,
  asChild = false,
  drag = true,
  dragConstraints,
  dragElastic = 0.5,
  dragInertia = true,
  onDragStart,
  onDragEnd,
  onDrag,
  className,
  style,
  ...props
}, ref) => {
  const nodeRef = useRef<HTMLElement | null>(null);
  const runtimeConstraintsRef = useRef<DragConstraintInput | null>(null);

  const setRefs = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
    if (typeof ref === 'function') ref(node as any);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node as HTMLDivElement | null;
  }, [ref]);

  const constrain = (offset: { x: number; y: number }) => {
    let { x, y } = offset;

    if (drag === 'y') x = 0;
    if (drag === 'x') y = 0;

    const bounds = resolveDragConstraintBounds(runtimeConstraintsRef.current ?? dragConstraints, nodeRef.current, x, y);
    if (bounds) {
      if (bounds.left !== undefined && x < bounds.left) {
        x = bounds.left + (x - bounds.left) * dragElastic;
      }
      if (bounds.right !== undefined && x > bounds.right) {
        x = bounds.right + (x - bounds.right) * dragElastic;
      }
      if (bounds.top !== undefined && y < bounds.top) {
        y = bounds.top + (y - bounds.top) * dragElastic;
      }
      if (bounds.bottom !== undefined && y > bounds.bottom) {
        y = bounds.bottom + (y - bounds.bottom) * dragElastic;
      }
    }

    return { x, y };
  };

  const handleDrag = (state: DragState) => {
    if (onDrag) onDrag(state);
    if (!state.isDragging && onDragEnd) {
      onDragEnd(state);
    }
    if (!state.isDragging) {
      runtimeConstraintsRef.current = null;
    }
  };

  const { dragProps, offset, isDragging } = useDrag(handleDrag, constrain, {
    inertia: dragInertia
  });
  const { style: dragInlineStyle, onMouseDown: dragMouseDown, onTouchStart: dragTouchStart, ...dragRestProps } = dragProps;

  const Comp = asChild ? Slot : 'div';

  const mergedProps = drag ? {
    ...props,
    ...dragRestProps,
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
      runtimeConstraintsRef.current = resolveDragConstraintBounds(dragConstraints, nodeRef.current, offset.x, offset.y);
      if (onDragStart) onDragStart();
      dragMouseDown?.(e as any);
      if (props.onMouseDown) props.onMouseDown(e);
    },
    onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => {
      runtimeConstraintsRef.current = resolveDragConstraintBounds(dragConstraints, nodeRef.current, offset.x, offset.y);
      if (onDragStart) onDragStart();
      dragTouchStart?.(e as any);
      if (props.onTouchStart) props.onTouchStart(e);
    }
  } : props;

  return (
    <Comp
      ref={setRefs as any}
      className={cn(className)}
      style={{
        ...style,
        ...(drag ? {
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          willChange: isDragging ? 'transform' : 'auto',
          zIndex: isDragging ? 50 : undefined,
          ...dragInlineStyle,
        } : {})
      }}
      {...mergedProps}
    >
      {children}
    </Comp>
  );
});

Drag.displayName = 'Drag';
