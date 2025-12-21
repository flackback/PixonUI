import { useState, useEffect, useRef, useCallback } from 'react';

export interface DragState {
  isDragging: boolean;
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
}

/**
 * Hook to provide basic drag gesture support.
 * Zero dependencies, works with mouse and touch.
 */
export function useDrag(onDrag?: (state: DragState) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  const startPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(Date.now());
  const velocity = useRef({ x: 0, y: 0 });

  const handleStart = useCallback((x: number, y: number) => {
    setIsDragging(true);
    startPos.current = { x: x - offset.x, y: y - offset.y };
    lastPos.current = { x, y };
    lastTime.current = Date.now();
  }, [offset]);

  const handleMove = useCallback((x: number, y: number) => {
    if (!isDragging) return;

    const newX = x - startPos.current.x;
    const newY = y - startPos.current.y;
    
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime.current;
    
    if (deltaTime > 0) {
      velocity.current = {
        x: (x - lastPos.current.x) / deltaTime,
        y: (y - lastPos.current.y) / deltaTime,
      };
    }

    setOffset({ x: newX, y: newY });
    lastPos.current = { x, y };
    lastTime.current = currentTime;

    onDrag?.({ isDragging: true, offset: { x: newX, y: newY }, velocity: velocity.current });
  }, [isDragging, onDrag]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    onDrag?.({ isDragging: false, offset, velocity: velocity.current });
  }, [offset, onDrag]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onMouseUp = () => handleEnd();
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return {
    isDragging,
    offset,
    dragProps: {
      onMouseDown: (e: React.MouseEvent) => handleStart(e.clientX, e.clientY),
      onTouchStart: (e: React.TouchEvent) => {
        if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
      },
      style: { cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }
    }
  };
}
