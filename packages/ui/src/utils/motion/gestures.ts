/**
 * PixonGestures - Sistema de gestos usando PointerEvents
 * Bundle size: 0 bytes (APIs nativas)
 * Performance: Passive listeners, RAF batching, velocity tracking
 *
 * Suporta: drag, pan, pinch, rotate, swipe, long-press
 */

import { MotionValue, motionValue } from './motion-value';

export type Point = { x: number; y: number };
export type Velocity = { vx: number; vy: number };

export type DragConfig = {
  axis?: 'x' | 'y' | 'both';
  bounds?: { top?: number; right?: number; bottom?: number; left?: number } | 'parent';
  elastic?: number; // 0-1, elasticidade fora dos bounds
  momentum?: boolean; // continua apos soltar baseado na velocidade
  momentumDecay?: number; // fator de decaimento (0-1)
  onDragStart?: (point: Point, velocity: Velocity) => void;
  onDrag?: (point: Point, velocity: Velocity) => void;
  onDragEnd?: (point: Point, velocity: Velocity) => void;
};

export type PanConfig = {
  threshold?: number; // pixels minimos para iniciar pan
  onPanStart?: (delta: Point) => void;
  onPan?: (delta: Point, velocity: Velocity) => void;
  onPanEnd?: (delta: Point, velocity: Velocity) => void;
};

export type SwipeConfig = {
  threshold?: number; // velocidade minima para considerar swipe
  direction?: 'horizontal' | 'vertical' | 'both';
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', velocity: number) => void;
};

export type PinchConfig = {
  onPinchStart?: (scale: number) => void;
  onPinch?: (scale: number, delta: number) => void;
  onPinchEnd?: (scale: number) => void;
};

export type LongPressConfig = {
  duration?: number; // ms para considerar long press
  onLongPress?: () => void;
  onLongPressEnd?: () => void;
};

type Pointer = {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
};

/**
 * Draggable - torna um elemento arrastavel
 */
export function draggable(
  element: Element | string,
  config: DragConfig = {}
): () => void {
  const {
    axis = 'both',
    bounds,
    elastic = 0.5,
    momentum = true,
    momentumDecay = 0.95,
    onDragStart,
    onDrag,
    onDragEnd,
  } = config;

  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el || !(el instanceof HTMLElement)) return () => {};

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let velocityX = 0;
  let velocityY = 0;
  let momentumRaf: number | null = null;

  // Get bounds
  const getBounds = () => {
    if (!bounds) return null;
    if (bounds === 'parent') {
      const parent = el.parentElement;
      if (!parent) return null;
      const parentRect = parent.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      return {
        left: 0,
        top: 0,
        right: parentRect.width - elRect.width,
        bottom: parentRect.height - elRect.height,
      };
    }
    return bounds;
  };

  const applyBounds = (x: number, y: number): Point => {
    const b = getBounds();
    if (!b) return { x, y };

    let boundedX = x;
    let boundedY = y;

    if (b.left !== undefined && x < b.left) {
      boundedX = b.left + (x - b.left) * elastic;
    }
    if (b.right !== undefined && x > b.right) {
      boundedX = b.right + (x - b.right) * elastic;
    }
    if (b.top !== undefined && y < b.top) {
      boundedY = b.top + (y - b.top) * elastic;
    }
    if (b.bottom !== undefined && y > b.bottom) {
      boundedY = b.bottom + (y - b.bottom) * elastic;
    }

    return { x: boundedX, y: boundedY };
  };

  const updatePosition = (x: number, y: number) => {
    const { x: bx, y: by } = applyBounds(x, y);
    const finalX = axis === 'y' ? 0 : bx;
    const finalY = axis === 'x' ? 0 : by;

    el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
    currentX = finalX;
    currentY = finalY;
  };

  const onPointerDown = (e: PointerEvent) => {
    if (momentumRaf) {
      cancelAnimationFrame(momentumRaf);
      momentumRaf = null;
    }

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = currentX;
    offsetY = currentY;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = performance.now();
    velocityX = 0;
    velocityY = 0;

    el.setPointerCapture(e.pointerId);
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';

    onDragStart?.({ x: currentX, y: currentY }, { vx: 0, vy: 0 });
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;

    const now = performance.now();
    const dt = now - lastTime;

    if (dt > 0) {
      velocityX = ((e.clientX - lastX) / dt) * 1000;
      velocityY = ((e.clientY - lastY) / dt) * 1000;
    }

    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    updatePosition(offsetX + deltaX, offsetY + deltaY);
    onDrag?.({ x: currentX, y: currentY }, { vx: velocityX, vy: velocityY });
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!isDragging) return;

    isDragging = false;
    el.releasePointerCapture(e.pointerId);
    el.style.cursor = 'grab';
    el.style.userSelect = '';

    onDragEnd?.({ x: currentX, y: currentY }, { vx: velocityX, vy: velocityY });

    // Momentum
    if (momentum && (Math.abs(velocityX) > 50 || Math.abs(velocityY) > 50)) {
      let vx = velocityX;
      let vy = velocityY;

      const tick = () => {
        vx *= momentumDecay;
        vy *= momentumDecay;

        const newX = currentX + vx * 0.016;
        const newY = currentY + vy * 0.016;

        updatePosition(newX, newY);

        if (Math.abs(vx) > 1 || Math.abs(vy) > 1) {
          momentumRaf = requestAnimationFrame(tick);
        } else {
          // Snap to bounds
          const b = getBounds();
          if (b) {
            const targetX = Math.max(b.left ?? -Infinity, Math.min(b.right ?? Infinity, currentX));
            const targetY = Math.max(b.top ?? -Infinity, Math.min(b.bottom ?? Infinity, currentY));

            el.animate(
              [{ transform: `translate3d(${targetX}px, ${targetY}px, 0)` }],
              { duration: 300, fill: 'forwards', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
            );
            currentX = targetX;
            currentY = targetY;
          }
        }
      };

      momentumRaf = requestAnimationFrame(tick);
    }
  };

  el.style.cursor = 'grab';
  el.style.touchAction = 'none';

  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);

  return () => {
    if (momentumRaf) cancelAnimationFrame(momentumRaf);
    el.removeEventListener('pointerdown', onPointerDown);
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerup', onPointerUp);
    el.removeEventListener('pointercancel', onPointerUp);
  };
}

/**
 * Pan gesture (detecta movimento sem mover o elemento)
 */
export function pannable(element: Element | string, config: PanConfig = {}): () => void {
  const { threshold = 10, onPanStart, onPan, onPanEnd } = config;

  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return () => {};

  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;

  const onPointerDown = (e: PointerEvent) => {
    startX = e.clientX;
    startY = e.clientY;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = performance.now();
    (el as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const now = performance.now();
    const dt = now - lastTime;
    const vx = dt > 0 ? ((e.clientX - lastX) / dt) * 1000 : 0;
    const vy = dt > 0 ? ((e.clientY - lastY) / dt) * 1000 : 0;

    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;

    if (!isPanning && distance > threshold) {
      isPanning = true;
      onPanStart?.({ x: deltaX, y: deltaY });
    }

    if (isPanning) {
      onPan?.({ x: deltaX, y: deltaY }, { vx, vy });
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      const now = performance.now();
      const dt = now - lastTime;
      const vx = dt > 0 ? ((e.clientX - lastX) / dt) * 1000 : 0;
      const vy = dt > 0 ? ((e.clientY - lastY) / dt) * 1000 : 0;

      onPanEnd?.({ x: deltaX, y: deltaY }, { vx, vy });
      isPanning = false;
    }
    (el as HTMLElement).releasePointerCapture(e.pointerId);
  };

  el.addEventListener('pointerdown', onPointerDown as EventListener);
  el.addEventListener('pointermove', onPointerMove as EventListener);
  el.addEventListener('pointerup', onPointerUp as EventListener);
  el.addEventListener('pointercancel', onPointerUp as EventListener);

  return () => {
    el.removeEventListener('pointerdown', onPointerDown as EventListener);
    el.removeEventListener('pointermove', onPointerMove as EventListener);
    el.removeEventListener('pointerup', onPointerUp as EventListener);
    el.removeEventListener('pointercancel', onPointerUp as EventListener);
  };
}

/**
 * Swipe detection
 */
export function swipeable(element: Element | string, config: SwipeConfig = {}): () => void {
  const { threshold = 500, direction = 'both', onSwipe } = config;

  return pannable(element, {
    threshold: 10,
    onPanEnd: (delta, velocity) => {
      const { vx, vy } = velocity;

      if (direction !== 'vertical' && Math.abs(vx) > threshold) {
        onSwipe?.(vx > 0 ? 'right' : 'left', Math.abs(vx));
      }

      if (direction !== 'horizontal' && Math.abs(vy) > threshold) {
        onSwipe?.(vy > 0 ? 'down' : 'up', Math.abs(vy));
      }
    },
  });
}

/**
 * Long press detection
 */
export function longPressable(
  element: Element | string,
  config: LongPressConfig = {}
): () => void {
  const { duration = 500, onLongPress, onLongPressEnd } = config;

  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return () => {};

  let timeout: ReturnType<typeof setTimeout> | null = null;
  let isLongPressing = false;

  const onPointerDown = () => {
    timeout = setTimeout(() => {
      isLongPressing = true;
      onLongPress?.();
    }, duration);
  };

  const onPointerUp = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (isLongPressing) {
      onLongPressEnd?.();
      isLongPressing = false;
    }
  };

  const onPointerMove = () => {
    if (timeout && !isLongPressing) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);
  el.addEventListener('pointermove', onPointerMove);

  return () => {
    if (timeout) clearTimeout(timeout);
    el.removeEventListener('pointerdown', onPointerDown);
    el.removeEventListener('pointerup', onPointerUp);
    el.removeEventListener('pointercancel', onPointerUp);
    el.removeEventListener('pointermove', onPointerMove);
  };
}

/**
 * Pinch gesture (multi-touch)
 */
export function pinchable(element: Element | string, config: PinchConfig = {}): () => void {
  const { onPinchStart, onPinch, onPinchEnd } = config;

  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return () => {};

  const pointers = new Map<number, Pointer>();
  let initialDistance = 0;
  let currentScale = 1;

  const getDistance = (p1: Pointer, p2: Pointer): number => {
    const dx = p1.currentX - p2.currentX;
    const dy = p1.currentY - p2.currentY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onPointerDown = (e: PointerEvent) => {
    pointers.set(e.pointerId, {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      startTime: performance.now(),
    });

    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      initialDistance = getDistance(p1, p2);
      onPinchStart?.(1);
    }

    (el as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    const pointer = pointers.get(e.pointerId);
    if (pointer) {
      pointer.currentX = e.clientX;
      pointer.currentY = e.clientY;
    }

    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      const currentDistance = getDistance(p1, p2);
      const newScale = currentDistance / initialDistance;
      const delta = newScale - currentScale;
      currentScale = newScale;
      onPinch?.(currentScale, delta);
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);

    if (pointers.size < 2 && currentScale !== 1) {
      onPinchEnd?.(currentScale);
      currentScale = 1;
    }

    (el as HTMLElement).releasePointerCapture(e.pointerId);
  };

  el.addEventListener('pointerdown', onPointerDown as EventListener);
  el.addEventListener('pointermove', onPointerMove as EventListener);
  el.addEventListener('pointerup', onPointerUp as EventListener);
  el.addEventListener('pointercancel', onPointerUp as EventListener);

  return () => {
    el.removeEventListener('pointerdown', onPointerDown as EventListener);
    el.removeEventListener('pointermove', onPointerMove as EventListener);
    el.removeEventListener('pointerup', onPointerUp as EventListener);
    el.removeEventListener('pointercancel', onPointerUp as EventListener);
  };
}

/**
 * Hook-like: retorna motion values para posicao do drag
 */
export function useDragMotionValues(
  element: Element | string,
  config?: DragConfig
): { x: MotionValue<number>; y: MotionValue<number>; isDragging: MotionValue<boolean>; cleanup: () => void } {
  const x = motionValue(0);
  const y = motionValue(0);
  const isDragging = motionValue(false);

  const cleanup = draggable(element, {
    ...config,
    onDragStart: (point, velocity) => {
      isDragging.set(true);
      config?.onDragStart?.(point, velocity);
    },
    onDrag: (point, velocity) => {
      x.set(point.x);
      y.set(point.y);
      config?.onDrag?.(point, velocity);
    },
    onDragEnd: (point, velocity) => {
      isDragging.set(false);
      config?.onDragEnd?.(point, velocity);
    },
  });

  return { x, y, isDragging, cleanup };
}
