import React, { createContext, useContext, useRef, useLayoutEffect, useEffect } from 'react';
import { Motion } from '../feedback/Motion';
import { useDrag } from '../../hooks/useDrag';
import { cn } from '../../utils/cn';

interface ReorderContextValue {
  axis: 'x' | 'y';
  onReorder: (draggedIndex: number, targetIndex: number) => void;
}

const ReorderContext = createContext<ReorderContextValue | null>(null);

export interface ReorderProps<T> {
  axis?: 'x' | 'y';
  onReorder: (newOrder: T[]) => void;
  values: T[];
  className?: string;
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
}

export function Reorder<T>({
  axis = 'y',
  onReorder,
  values,
  className,
  children,
  as: Component = 'ul',
}: ReorderProps<T>) {
  const handleReorder = (draggedIndex: number, targetIndex: number) => {
    if (draggedIndex === targetIndex) return;
    const newValues = [...values];
    const item = newValues.splice(draggedIndex, 1)[0];
    if (item === undefined) return;
    newValues.splice(targetIndex, 0, item);
    onReorder(newValues);
  };

  return (
    <ReorderContext.Provider value={{ axis, onReorder: handleReorder }}>
      <Component className={cn('relative', className)}>
        {children}
      </Component>
    </ReorderContext.Provider>
  );
}

export interface ReorderItemProps {
  value: any;
  className?: string;
  children: React.ReactNode;
  dragConstraints?: { top?: number; bottom?: number; left?: number; right?: number };
}

export function ReorderItem({ value, className, children, dragConstraints }: ReorderItemProps) {
  const context = useContext(ReorderContext);
  if (!context) throw new Error('ReorderItem must be used within Reorder');

  const ref = useRef<HTMLDivElement>(null);
  const layoutRect = useRef<DOMRect | null>(null);

  // Read DOM siblings to find current index and collisions
  const getSiblings = () => Array.from(ref.current?.parentElement?.children || []) as HTMLElement[];
  const getIndex = () => getSiblings().indexOf(ref.current!);

  const constrain = (o: { x: number; y: number }) => {
    let { x, y } = o;
    if (context.axis === 'y') x = 0;
    if (context.axis === 'x') y = 0;
    
    if (dragConstraints) {
      if (dragConstraints.top !== undefined && y < dragConstraints.top) y = dragConstraints.top;
      if (dragConstraints.bottom !== undefined && y > dragConstraints.bottom) y = dragConstraints.bottom;
      if (dragConstraints.left !== undefined && x < dragConstraints.left) x = dragConstraints.left;
      if (dragConstraints.right !== undefined && x > dragConstraints.right) x = dragConstraints.right;
    }
    return { x, y };
  };

  const { isDragging, offset, setOffset, dragProps } = useDrag(
    (state) => {
      if (!ref.current || !state.isDragging) return;
      
      const rect = ref.current.getBoundingClientRect();
      const currentY = rect.top + state.offset.y + rect.height / 2;
      const currentX = rect.left + state.offset.x + rect.width / 2;

      const siblings = getSiblings();
      const currentIndex = siblings.indexOf(ref.current);
      if (currentIndex === -1) return;

      let targetIndex = currentIndex;

      for (let i = 0; i < siblings.length; i++) {
        if (i === currentIndex) continue;
        const sRect = siblings[i]?.getBoundingClientRect();
        if (!sRect) continue;
        
        if (context.axis === 'y') {
          if (currentY > sRect.top && currentY < sRect.bottom) {
            targetIndex = i;
            break;
          }
        } else {
          if (currentX > sRect.left && currentX < sRect.right) {
            targetIndex = i;
            break;
          }
        }
      }

      if (targetIndex !== currentIndex) {
        context.onReorder(currentIndex, targetIndex);
      }
    },
    constrain,
    { inertia: false }
  );

  const { style: dragStyle, ...restDragProps } = dragProps;

  // Compensate for DOM layout shifts during drag
  useLayoutEffect(() => {
    if (ref.current) {
      const currentRect = ref.current.getBoundingClientRect();
      if (isDragging && layoutRect.current) {
        const dx = currentRect.left - layoutRect.current.left;
        const dy = currentRect.top - layoutRect.current.top;
        if (dx !== 0 || dy !== 0) {
          setOffset({ x: offset.x - dx, y: offset.y - dy });
        }
      }
      layoutRect.current = currentRect;
    }
  });

  return (
    <Motion
      layout="position"
      layoutId={`reorder-${value}`}
      innerRef={ref}
      as="li"
      className={cn('relative list-none select-none', className)}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        zIndex: isDragging ? 50 : 1,
        willChange: isDragging ? 'transform' : 'auto',
        ...dragStyle,
      }}
      {...restDragProps}
    >
      {children}
    </Motion>
  );
}
