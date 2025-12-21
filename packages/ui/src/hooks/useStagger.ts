/**
 * Hook to calculate stagger delays for group animations.
 */
export function useStagger(index: number, staggerDelay: number = 100, baseDelay: number = 0) {
  return baseDelay + (index * staggerDelay);
}

/**
 * Hook to manage a sequence of animations.
 */
export function useSequence(count: number, interval: number = 100) {
  // This could be expanded to return an array of booleans or progress values
  // for each item in the sequence.
  return Array.from({ length: count }, (_, i) => i * interval);
}
