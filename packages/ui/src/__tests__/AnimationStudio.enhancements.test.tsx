import { expect, test, describe } from 'vitest';
import { calculateSpringCurve, valueAt, interpolateSvgPaths } from '../components/effects/AnimationStudio';
import type { AnimationStudioTrack } from '../components/effects/AnimationStudio';

describe('AnimationStudio Enhancements - Custom Spring Physics', () => {
  test('calculateSpringCurve generates correct bounds', () => {
    const springFn = calculateSpringCurve(1, 100, 10);
    expect(springFn(0)).toBe(0);
    expect(springFn(1)).toBe(1);
    
    // Intermediate point should be computed
    const val = springFn(0.5);
    expect(val).toBeGreaterThan(0);
    expect(val).toBeLessThan(2); // might overshoot slightly but stays bounded
  });

  test('calculateSpringCurve respects different damping and stiffness values', () => {
    const underdamped = calculateSpringCurve(1, 200, 5); // very bouncy
    const highlyDamped = calculateSpringCurve(1, 100, 45); // heavy friction, slow
    
    // An underdamped spring will overshoot 1
    let overshot = false;
    for (let t = 0.1; t < 0.9; t += 0.05) {
      if (underdamped(t) > 1.05) {
        overshot = true;
        break;
      }
    }
    expect(overshot).toBe(true);

    // Highly damped spring will climb slowly and not overshoot
    let highlyDampedOvershot = false;
    for (let t = 0.1; t < 0.9; t += 0.05) {
      if (highlyDamped(t) > 1.0) {
        highlyDampedOvershot = true;
        break;
      }
    }
    expect(highlyDampedOvershot).toBe(false);
  });

  test('valueAt correctly uses custom spring curves to interpolate tracks', () => {
    const track: AnimationStudioTrack = {
      id: 'test-track',
      label: 'Position X',
      channel: 'x',
      keyframes: [
        { id: 'k1', t: 0, v: 10, easing: 'spring-custom', mass: 1, stiffness: 100, damping: 10 },
        { id: 'k2', t: 1000, v: 110, easing: 'linear' }
      ]
    };

    // At t=0, it should be the start value
    expect(valueAt(track, 0)).toBe(10);
    // At t=1000, it should be the end value
    expect(valueAt(track, 1000)).toBe(110);

    // At t=500 (halfway), custom spring easing should produce a value that is NOT exactly linear (60)
    const midVal = valueAt(track, 500);
    expect(midVal).not.toBe(60);
    expect(midVal).toBeGreaterThan(10);
    expect(midVal).toBeLessThan(150);
  });
});

describe('AnimationStudio Enhancements - SVG Morphing & Path Interpolation', () => {
  test('interpolateSvgPaths correctly aligns point counts and interpolates paths', () => {
    // Both are line commands (e.g. M 0 0 L 10 10 vs M 100 100 L 200 200)
    const pathA = 'M 0 0 L 10 10';
    const pathB = 'M 100 100 L 200 200';
    
    // Halfway interpolation
    const interpolated = interpolateSvgPaths(pathA, pathB, 0.5);
    expect(interpolated).toBe('M 50 50 L 105 105');
  });

  test('interpolateSvgPaths handles unequal path point lengths by repeating last points', () => {
    const pathA = 'M 0 0';
    const pathB = 'M 100 100 L 200 200';

    const interpolated = interpolateSvgPaths(pathA, pathB, 0.5);
    // pathA has 2 numbers (0, 0), pathB has 6 numbers.
    // The parser aligned pathA by duplicating its last values.
    expect(interpolated).toBe('M 50 50 M 100 100');
  });

  test('valueAt correctly handles path strings in tracks', () => {
    const pathTrack: AnimationStudioTrack = {
      id: 'path-track',
      label: 'Path Data',
      channel: 'd',
      keyframes: [
        { id: 'k1', t: 0, v: 'M 0 0 L 10 10', easing: 'linear' },
        { id: 'k2', t: 1000, v: 'M 100 100 L 200 200', easing: 'linear' }
      ]
    };

    expect(valueAt(pathTrack, 0)).toBe('M 0 0 L 10 10');
    expect(valueAt(pathTrack, 1000)).toBe('M 100 100 L 200 200');
    expect(valueAt(pathTrack, 500)).toBe('M 50 50 L 105 105');
  });
});
