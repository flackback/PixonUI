import { describe, it, expect } from 'vitest';
import { cachedSpringKeyframes } from '../utils/springCache';

describe('springCache LRU behavior', () => {
  it('caches generated keyframes', () => {
    const config = { stiffness: 100, damping: 20, mass: 1, velocity: 0 };
    
    // First run (miss)
    const result1 = cachedSpringKeyframes(config);
    // Second run (hit)
    const result2 = cachedSpringKeyframes(config);

    // They should be referentially identical due to caching
    expect(result1).toBe(result2);
  });

  it('limits cache size to 100 items', () => {
    // Generate 100 unique configs
    for (let i = 0; i < 100; i++) {
      cachedSpringKeyframes({ stiffness: 100 + i, damping: 20, mass: 1, velocity: 0 });
    }

    const firstConfig = { stiffness: 100, damping: 20, mass: 1, velocity: 0 };
    const firstResult = cachedSpringKeyframes(firstConfig);

    // Generate 1 more to evict the first
    cachedSpringKeyframes({ stiffness: 999, damping: 20, mass: 1, velocity: 0 });

    const newFirstResult = cachedSpringKeyframes(firstConfig);

    // Since it was evicted and recomputed, the reference should change
    expect(firstResult).not.toBe(newFirstResult);
  });
});
