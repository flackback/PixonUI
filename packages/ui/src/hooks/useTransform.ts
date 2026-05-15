import { useMemo } from 'react';

/**
 * Highly optimized value transformation hook.
 * Supports single value interpolation and multiple value combination.
 */
export function useTransform<T, U>(
  value: T | T[],
  inputRangeOrTransformer: number[] | ((v: T[]) => U),
  outputRange?: U[]
): U {
  return useMemo(() => {
    // Case 1: Multi-value combination (e.g. useTransform([x, y], ([vx, vy]) => ...))
    if (Array.isArray(value) && typeof inputRangeOrTransformer === 'function') {
      return inputRangeOrTransformer(value);
    }

    // Case 2: Single value interpolation
    if (typeof value === 'number' && Array.isArray(inputRangeOrTransformer) && Array.isArray(outputRange)) {
      const v = value as number;
      const input = inputRangeOrTransformer;
      const output = outputRange;

      if (input.length !== output.length || input.length < 2) return output[0] as U;

      let i = 1;
      while (i < input.length - 1 && v > input[i]!) i++;

      const inStart = input[i - 1]!;
      const inEnd = input[i]!;
      const outStart = output[i - 1]!;
      const outEnd = output[i]!;

      const progress = Math.max(0, Math.min(1, (v - inStart) / (inEnd - inStart)));

      if (typeof outStart === 'number' && typeof outEnd === 'number') {
        return (outStart + progress * (outEnd - outStart)) as unknown as U;
      }

      const sStart = String(outStart);
      const sEnd = String(outEnd);
      const numStart = parseFloat(sStart) || 0;
      const numEnd = parseFloat(sEnd) || 0;
      const unit = sStart.replace(/[0-9.-]/g, '');
      
      return `${numStart + progress * (numEnd - numStart)}${unit}` as unknown as U;
    }

    return (outputRange ? outputRange[0] : (Array.isArray(value) ? value[0] : value)) as unknown as U;
  }, [value, inputRangeOrTransformer, outputRange]);
}
