import { generateSpringKeyframes, SpringOptions } from './spring';

type SpringResult = { keyframes: number[]; duration: number };

const MAX_CACHE_SIZE = 100;
const cache = new Map<string, SpringResult>();

/**
 * Wraps `generateSpringKeyframes` with an LRU cache to avoid redundant Verlet integrations.
 */
export function cachedSpringKeyframes(opts: SpringOptions = {}): SpringResult {
  const {
    stiffness = 100,
    damping = 10,
    mass = 1,
    velocity = 0,
    precision = 0.01,
    fps = 60,
    restSpeed = 0.005,
    restDelta = 0.005,
  } = opts;

  const key = `${stiffness}|${damping}|${mass}|${velocity}|${precision}|${fps}|${restSpeed}|${restDelta}`;

  if (cache.has(key)) {
    const result = cache.get(key)!;
    // LRU hit: Move to end
    cache.delete(key);
    cache.set(key, result);
    return result;
  }

  const result = generateSpringKeyframes(opts);

  if (cache.size >= MAX_CACHE_SIZE) {
    // Evict oldest (first item in Map iteration)
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) {
      cache.delete(firstKey);
    }
  }

  cache.set(key, result);
  return result;
}

/**
 * Utility for test isolation.
 */
export function clearSpringCache() {
  cache.clear();
}

