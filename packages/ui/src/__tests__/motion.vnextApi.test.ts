import { describe, expect, it } from 'vitest';
import { MOTION_VNEXT_DEPRECATIONS, MOTION_VNEXT_PUBLIC_API, MOTION_VNEXT_VERSION } from '../motion/vnext-api';

describe('motion vNext API contract', () => {
  it('exposes frozen version and stable public api groups', () => {
    expect(MOTION_VNEXT_VERSION).toBe('1.0.0');
    expect(Array.isArray(MOTION_VNEXT_PUBLIC_API.declarative)).toBe(true);
    expect(MOTION_VNEXT_PUBLIC_API.declarative).toContain('drag');
    expect(MOTION_VNEXT_PUBLIC_API.presets).toContain('scrubOnScroll');
    expect(MOTION_VNEXT_PUBLIC_API.timeline).toContain('scrollTimelinePreset');
  });

  it('declares deprecation policy with removal date', () => {
    expect(MOTION_VNEXT_DEPRECATIONS.Motion).toContain('2026-09-30');
    expect(MOTION_VNEXT_DEPRECATIONS.PixonMotion).toContain('2026-09-30');
  });
});
