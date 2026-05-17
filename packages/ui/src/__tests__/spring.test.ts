import { expect, test, describe } from 'vitest';
import { compileSpringKeyframes, generateSpringTrajectory as generateSpringKeyframes } from "../utils/motion";

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

  test('clamps spring opacity keyframes between 0 and 1', () => {
    const compiled = compileSpringKeyframes(
      { opacity: 0 } as any,
      { opacity: 1 } as any,
      { stiffness: 80, damping: 6 }
    );
    const opacities = compiled.keyframes.map((kf) => Number((kf as any).opacity ?? 0));
    expect(opacities.every((v) => v >= 0 && v <= 1)).toBe(true);
  });
});
