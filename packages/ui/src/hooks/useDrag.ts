import { useState, useEffect, useRef, useCallback } from 'react';

export interface DragState {
  isDragging: boolean;
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
}

export interface DragOptions {
  inertia?: boolean;
  friction?: number;
  bounce?: number;
}

/**
 * Hook to provide basic drag gesture support with optional physics (inertia & elastic bounce).
 * Zero dependencies, works with mouse and touch.
 */
export function useDrag(
  onDrag?: (state: DragState) => void,
  constrain?: (offset: { x: number; y: number }) => { x: number; y: number },
  options?: DragOptions
) {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  const startPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(Date.now());
  const velocity = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  const handleStart = useCallback((x: number, y: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsDragging(true);
    startPos.current = { x: x - offset.x, y: y - offset.y };
    lastPos.current = { x, y };
    lastTime.current = Date.now();
    velocity.current = { x: 0, y: 0 };
  }, [offset]);

  const handleMove = useCallback((x: number, y: number) => {
    if (!isDragging) return;

    let newX = x - startPos.current.x;
    let newY = y - startPos.current.y;
    
    if (constrain) {
      const constrained = constrain({ x: newX, y: newY });
      newX = constrained.x;
      newY = constrained.y;
    }

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
  }, [isDragging, onDrag, constrain]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    
    if (options?.inertia && (Math.abs(velocity.current.x) > 0.05 || Math.abs(velocity.current.y) > 0.05)) {
      let currentV = { ...velocity.current };
      let currentOffset = { ...offset };
      const friction = options.friction ?? 0.92;
      const bounce = options.bounce ?? 0.4;
      let lastFrame = Date.now();

      const inertiaLoop = () => {
        const now = Date.now();
        const dt = Math.min(now - lastFrame, 32); // Cap dt for smooth decay
        lastFrame = now;

        currentV.x *= Math.pow(friction, dt / 16);
        currentV.y *= Math.pow(friction, dt / 16);

        let nextX = currentOffset.x + currentV.x * dt;
        let nextY = currentOffset.y + currentV.y * dt;

        if (constrain) {
          const constrained = constrain({ x: nextX, y: nextY });
          if (Math.abs(constrained.x - nextX) > 0.5) {
             nextX = constrained.x;
             currentV.x *= -bounce;
          }
          if (Math.abs(constrained.y - nextY) > 0.5) {
             nextY = constrained.y;
             currentV.y *= -bounce;
          }
        }

        currentOffset = { x: nextX, y: nextY };
        setOffset(currentOffset);
        onDrag?.({ isDragging: false, offset: currentOffset, velocity: currentV });

        if (Math.abs(currentV.x) > 0.01 || Math.abs(currentV.y) > 0.01) {
          rafRef.current = requestAnimationFrame(inertiaLoop);
        }
      };
      
      rafRef.current = requestAnimationFrame(inertiaLoop);
    } else {
      onDrag?.({ isDragging: false, offset, velocity: velocity.current });
    }
  }, [offset, onDrag, options?.inertia, options?.friction, options?.bounce, constrain]);

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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDragging, handleMove, handleEnd]);

  return {
    isDragging,
    offset,
    setOffset,
    dragProps: {
      onMouseDown: (e: React.MouseEvent) => handleStart(e.clientX, e.clientY),
      onTouchStart: (e: React.TouchEvent) => {
        if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
      },
      style: { cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }
    }
  };
}
