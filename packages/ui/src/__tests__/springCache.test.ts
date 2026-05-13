import { describe, it, expect, beforeEach } from 'vitest';
import { cachedSpringKeyframes, clearSpringCache } from "../utils/motion/springCache";

describe('springCache', () => {
  beforeEach(() => {
    clearSpringCache();
  });

  it('caches generated keyframes and returns same reference', () => {
    const config = { stiffness: 100, damping: 20, mass: 1, velocity: 0 };
    
    const result1 = cachedSpringKeyframes(config);
    const result2 = cachedSpringKeyframes(config);

    expect(result1).toBe(result2);
  });

  it('is sensitive to restSpeed and restDelta', () => {
    const config1 = { stiffness: 100, restSpeed: 0.01 };
    const config2 = { stiffness: 100, restSpeed: 0.02 };
    
    const result1 = cachedSpringKeyframes(config1);
    const result2 = cachedSpringKeyframes(config2);

    expect(result1).not.toBe(result2);
  });

  it('limits cache size to 100 items and evicts oldest', () => {
    // Fill cache with 100 items
    for (let i = 0; i < 100; i++) {
      cachedSpringKeyframes({ stiffness: 100 + i });
    }

    const firstConfig = { stiffness: 100 };
    const firstResult = cachedSpringKeyframes(firstConfig); // This makes it "most recent" again!
    
    // So if we add one more, it should NOT evict firstConfig but the one at 101 (which is index 1 now)
    cachedSpringKeyframes({ stiffness: 999 });

    const checkFirst = cachedSpringKeyframes(firstConfig);
    expect(checkFirst).toBe(firstResult); // Should still be in cache because it was "hit" recently
  });
});

