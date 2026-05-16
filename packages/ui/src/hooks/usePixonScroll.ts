import type { RefObject } from 'react';
import { useScroll, useTransform } from '../motion/hooks';
import type { MotionValue } from '../motion/value';

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

/**
 * @deprecated Use `useTransform` directly.
 * Interpolates a MotionValue from an input range to an output range.
 */
export function usePixonTransform<T extends number | string>(
  value: MotionValue<number>,
  inputRange: number[],
  outputRange: T[]
): MotionValue<T> {
  return useTransform(value, inputRange, outputRange);
}
