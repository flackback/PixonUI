import { expect, test, describe } from 'vitest';
import { generateSpringTrajectory as generateSpringKeyframes } from "../utils/motion/spring";

describe('generateSpringKeyframes', () => {
  test('generates valid keyframes starting at 0 and ending at 1', () => {
    const { keyframes, duration } = generateSpringKeyframes(0, 1, {
      stiffness: 100,
      damping: 10,
    });

    expect(keyframes.length).toBeGreaterThan(0);
    expect(keyframes[0]).toBe(0);
    expect(keyframes[keyframes.length - 1]).toBe(1);
    expect(duration).toBeGreaterThan(0);
  });

  test('respects high damping (settles faster when critically damped vs underdamped)', () => {
    const underdamped = generateSpringKeyframes(0, 1, { stiffness: 100, damping: 2 });
    const criticallyDamped = generateSpringKeyframes(0, 1, { stiffness: 100, damping: 20 });

    expect(criticallyDamped.duration).toBeLessThan(underdamped.duration);
  });
});
