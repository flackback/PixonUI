import React, { forwardRef } from 'react';
import { useDrag, DragOptions, DragState } from '../../hooks/useDrag';
import { Slot } from '../../utils/Slot';
import { cn } from '../../utils/cn';

export interface DragProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  children: React.ReactNode;
  asChild?: boolean;
  drag?: boolean | 'x' | 'y';
  dragConstraints?: { top?: number; bottom?: number; left?: number; right?: number };
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
  const constrain = (offset: { x: number; y: number }) => {
    let { x, y } = offset;

    if (drag === 'y') x = 0;
    if (drag === 'x') y = 0;

    if (dragConstraints) {
      if (dragConstraints.left !== undefined && x < dragConstraints.left) {
        x = dragConstraints.left + (x - dragConstraints.left) * dragElastic;
      }
      if (dragConstraints.right !== undefined && x > dragConstraints.right) {
        x = dragConstraints.right + (x - dragConstraints.right) * dragElastic;
      }
      if (dragConstraints.top !== undefined && y < dragConstraints.top) {
        y = dragConstraints.top + (y - dragConstraints.top) * dragElastic;
      }
      if (dragConstraints.bottom !== undefined && y > dragConstraints.bottom) {
        y = dragConstraints.bottom + (y - dragConstraints.bottom) * dragElastic;
      }
    }

    return { x, y };
  };

  const handleDrag = (state: DragState) => {
    if (onDrag) onDrag(state);
    if (!state.isDragging && onDragEnd) {
      onDragEnd(state);
    }
  };

  const { dragProps, offset, isDragging } = useDrag(handleDrag, constrain, {
    inertia: dragInertia
  });

  const Comp = asChild ? Slot : 'div';

  const mergedProps = drag ? {
    ...props,
    ...dragProps,
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
      if (onDragStart) onDragStart();
      dragProps.onMouseDown(e as any);
      if (props.onMouseDown) props.onMouseDown(e);
    },
    onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => {
      if (onDragStart) onDragStart();
      dragProps.onTouchStart(e as any);
      if (props.onTouchStart) props.onTouchStart(e);
    }
  } : props;

  return (
    <Comp
      ref={ref}
      className={cn(className)}
      style={{
        ...style,
        ...(drag ? {
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          willChange: isDragging ? 'transform' : 'auto',
          zIndex: isDragging ? 50 : undefined,
          ...dragProps.style,
        } : {})
      }}
      {...mergedProps}
    >
      {children}
    </Comp>
  );
});

Drag.displayName = 'Drag';
