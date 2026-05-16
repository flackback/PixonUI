import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { normalizeTimeMs } from '../utils/motion';
import { parallax, revealOnScroll, staggerChildren } from '../motion/presets';

describe('motion timing normalizer', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('keeps valid ms values as-is', () => {
    expect(normalizeTimeMs(600, 0, { prop: 'duration', source: 'test' })).toBe(600);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns and converts legacy second-like values', () => {
    expect(normalizeTimeMs(0.6, 0, { prop: 'duration', source: 'test' })).toBe(600);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('falls back for invalid values', () => {
    expect(normalizeTimeMs(undefined, 400, { prop: 'duration', source: 'test' })).toBe(400);
    expect(normalizeTimeMs('abc', 200, { prop: 'delay', source: 'test' })).toBe(200);
  });
});

describe('motion presets', () => {
  it('returns revealOnScroll defaults in ms', () => {
    expect(revealOnScroll()).toEqual({
      distance: 32,
      scale: 0.96,
      duration: 600,
      delay: 0,
      amount: 0.25,
      once: true,
      easing: 'elite-out',
      rootMargin: '0px',
    });
  });

  it('returns parallax defaults and accepts overrides', () => {
    expect(parallax()).toMatchObject({ axis: 'y', range: [0, -120], source: 'page', clamp: true });
    expect(parallax({ axis: 'x', from: 10, to: 120, source: 'container' })).toMatchObject({
      axis: 'x',
      range: [10, 120],
      source: 'container',
    });
  });

  it('returns stagger defaults and overrides', () => {
    expect(staggerChildren()).toEqual({
      stagger: 80,
      delayChildren: 0,
      from: 'first',
      grid: [1, 1],
    });
    expect(staggerChildren({ stagger: 120, delayChildren: 40, from: 'center', grid: [4, 3] })).toEqual({
      stagger: 120,
      delayChildren: 40,
      from: 'center',
      grid: [4, 3],
    });
  });
});
