import type { RefObject } from 'react';
import { useScroll } from '../motion/hooks';

export interface UseScrollOptions {
  container?: RefObject<HTMLElement>;
  axis?: 'x' | 'y';
}

/**
 * @deprecated Use `useScroll` directly. This adapter now returns MotionValues (no frame re-render).
 */
export function usePixonScroll({ container, axis = 'y' }: UseScrollOptions = {}) {
  return useScroll({ container: container as RefObject<HTMLElement | null>, axis });
}
