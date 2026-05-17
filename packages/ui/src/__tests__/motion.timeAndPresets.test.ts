import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type React from 'react';
import { normalizeTimeMs } from '../utils/motion';
import { createTimelineComposer, parallax, revealOnScroll, scrubOnScroll, scrollTimelinePreset, staggerChildren, timelinePreset } from '../motion/presets';

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

  it('warns for legacy second-like values without auto-conversion', () => {
    expect(normalizeTimeMs(0.6, 0, { prop: 'duration', source: 'test' })).toBe(0.6);
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

  it('warns but does not convert legacy second-like values in presets', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(revealOnScroll({ duration: 0.6, delay: 0.2 })).toMatchObject({
      duration: 0.6,
      delay: 0.2,
    });
    expect(staggerChildren({ stagger: 0.08, delayChildren: 0.04 })).toMatchObject({
      stagger: 0.08,
      delayChildren: 0.04,
    });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns parallax defaults and accepts overrides', () => {
    expect(parallax()).toMatchObject({ axis: 'y', range: [0, -120], source: 'page', clamp: true });
    const container = { current: null } as React.RefObject<HTMLElement | null>;
    expect(parallax({ axis: 'x', from: 10, to: 120, source: 'container', container })).toMatchObject({
      axis: 'x',
      range: [10, 120],
      source: 'container',
      container,
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

  it('returns scrubOnScroll defaults and overrides', () => {
    expect(scrubOnScroll()).toEqual({
      axis: 'y',
      from: 0,
      to: 1,
      clamp: true,
      immediate: true,
    });
    expect(scrubOnScroll({ axis: 'x', from: 0.15, to: 0.85, clamp: false })).toEqual({
      axis: 'x',
      from: 0.15,
      to: 0.85,
      clamp: false,
      immediate: true,
    });
  });

  it('returns timeline presets with ms contract', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(timelinePreset('fadeUp')).toMatchObject({
      options: { duration: 520, delay: 0, stagger: 0, easing: 'elite-out' },
    });

    expect(timelinePreset('staggerFadeUp', { duration: 0.6, stagger: 0.08, at: 'intro+=120' })).toMatchObject({
      options: { duration: 0.6, stagger: 0.08, at: 'intro+=120' },
    });

    expect(timelinePreset('popIn', { scale: 0.8 })).toMatchObject({
      keyframes: [
        { opacity: 0, transform: 'scale(0.8)' },
        { opacity: 1, transform: 'scale(1)' },
      ],
    });
    warnSpy.mockRestore();
  });

  it('creates domain timeline composer with stable defaults', () => {
    const composer = createTimelineComposer({ easing: 'elite-out' });
    expect(composer.hero().options).toMatchObject({ duration: 720, easing: 'elite-out' });
    expect(composer.cards({ stagger: 90 }).options).toMatchObject({ stagger: 90, duration: 560 });
    expect(composer.navbar({ duration: 300 }).options).toMatchObject({ duration: 300 });
    expect(composer.preset('cards').options).toMatchObject({ stagger: 70 });
  });

  it('returns unified timeline + scrub presets for scroll-driven scenes', () => {
    const reveal = scrollTimelinePreset('revealSection');
    expect(reveal.timeline.options).toMatchObject({ duration: 520, easing: 'elite-out' });
    expect(reveal.scrub).toMatchObject({ axis: 'y', from: 0, to: 1, clamp: true, immediate: true });

    const stagger = scrollTimelinePreset('staggerSection', { duration: 640, stagger: 90, from: 0.2, to: 0.95 });
    expect(stagger.timeline.options).toMatchObject({ duration: 640, stagger: 90 });
    expect(stagger.scrub).toMatchObject({ from: 0.2, to: 0.95 });

    const hero = scrollTimelinePreset('heroScrub', { axis: 'x', from: 0.15, to: 0.85 });
    expect(hero.timeline.options).toMatchObject({ duration: 720 });
    expect(hero.scrub).toMatchObject({ axis: 'x', from: 0.15, to: 0.85 });
  });
});
