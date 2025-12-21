/**
 * Utility to map a value from one range to another.
 */
function interpolate(
  value: number,
  inputRange: [number, number],
  outputRange: [number, number]
): number {
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;
  
  const progress = (value - inputMin) / (inputMax - inputMin);
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  return outputMin + clampedProgress * (outputMax - outputMin);
}

/**
 * Hook to map a value (usually scroll progress) to a specific output range.
 * Useful for parallax translations, rotations, and opacity changes.
 */
export function useScrollTransform(
  value: number,
  inputRange: [number, number],
  outputRange: [number, number]
): number {
  return interpolate(value, inputRange, outputRange);
}
