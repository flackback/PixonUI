import type { RefObject } from 'react';
import type { SpringOptions } from './hooks';
import { normalizeTimeMs } from '../utils/motion';
import type { TimelineAddOptions } from '../utils/motion';

export interface RevealOnScrollOptions {
  distance?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  amount?: 'some' | 'all' | number;
  once?: boolean;
  easing?: string;
  rootMargin?: string;
}

export interface ParallaxOptions {
  axis?: 'x' | 'y';
  from?: number;
  to?: number;
  speed?: number;
  range?: [start: number, end: number];
  smooth?: SpringOptions;
  source?: 'page' | 'container';
  container?: RefObject<HTMLElement | null>;
  clamp?: boolean;
}

export interface StaggerChildrenOptions {
  stagger?: number;
  delayChildren?: number;
  from?: 'first' | 'last' | 'center' | number;
  grid?: [columns: number, rows: number];
}

export interface ScrubOnScrollOptions {
  axis?: 'x' | 'y';
  from?: number;
  to?: number;
  clamp?: boolean;
  immediate?: boolean;
}

export type TimelinePresetName = 'fadeUp' | 'popIn' | 'staggerFadeUp';

export interface TimelinePresetOptions {
  distance?: number;
  scale?: number;
  opacityFrom?: number;
  opacityTo?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  easing?: string;
  at?: number | string;
}

export interface TimelinePresetResult {
  keyframes: Keyframe[];
  options: TimelineAddOptions;
}

export type TimelineDomainPresetName = 'hero' | 'cards' | 'navbar';

export interface TimelineDomainComposer {
  preset: (name: TimelineDomainPresetName, options?: TimelinePresetOptions) => TimelinePresetResult;
  hero: (options?: TimelinePresetOptions) => TimelinePresetResult;
  cards: (options?: TimelinePresetOptions) => TimelinePresetResult;
  navbar: (options?: TimelinePresetOptions) => TimelinePresetResult;
}

export function revealOnScroll(options: RevealOnScrollOptions = {}): Required<RevealOnScrollOptions> {
  return {
    distance: options.distance ?? 32,
    scale: options.scale ?? 0.96,
    duration: normalizeTimeMs(options.duration ?? 600, 600, { prop: 'revealOnScroll.duration', source: 'motion.preset' }),
    delay: normalizeTimeMs(options.delay ?? 0, 0, { prop: 'revealOnScroll.delay', source: 'motion.preset' }),
    amount: options.amount ?? 0.25,
    once: options.once ?? true,
    easing: options.easing ?? 'elite-out',
    rootMargin: options.rootMargin ?? '0px',
  };
}

export function parallax(options: ParallaxOptions = {}) {
  const axis = options.axis ?? 'y';
  const from = options.from ?? 0;
  const bySpeed = Math.round((options.speed ?? 1) * -120);
  const to = options.to ?? bySpeed;
  const range = options.range ?? [from, to];

  return {
    axis,
    from,
    to,
    range,
    smooth: options.smooth,
    source: options.source ?? 'page',
    container: options.container,
    clamp: options.clamp ?? true,
  } as const;
}

export function staggerChildren(options: StaggerChildrenOptions = {}): Required<StaggerChildrenOptions> {
  return {
    stagger: normalizeTimeMs(options.stagger ?? 80, 80, { prop: 'staggerChildren.stagger', source: 'motion.preset' }),
    delayChildren: normalizeTimeMs(options.delayChildren ?? 0, 0, { prop: 'staggerChildren.delayChildren', source: 'motion.preset' }),
    from: options.from ?? 'first',
    grid: options.grid ?? [1, 1],
  };
}

export function scrubOnScroll(options: ScrubOnScrollOptions = {}): Required<ScrubOnScrollOptions> {
  return {
    axis: options.axis ?? 'y',
    from: options.from ?? 0,
    to: options.to ?? 1,
    clamp: options.clamp ?? true,
    immediate: options.immediate ?? true,
  };
}

export function timelinePreset(name: TimelinePresetName, options: TimelinePresetOptions = {}): TimelinePresetResult {
  const duration = normalizeTimeMs(options.duration ?? 520, 520, { prop: `timelinePreset.${name}.duration`, source: 'motion.preset' });
  const delay = normalizeTimeMs(options.delay ?? 0, 0, { prop: `timelinePreset.${name}.delay`, source: 'motion.preset' });
  const stagger = normalizeTimeMs(options.stagger ?? (name === 'staggerFadeUp' ? 60 : 0), 0, { prop: `timelinePreset.${name}.stagger`, source: 'motion.preset' });
  const distance = options.distance ?? 24;
  const scale = options.scale ?? 0.94;
  const opacityFrom = options.opacityFrom ?? 0;
  const opacityTo = options.opacityTo ?? 1;
  const easing = options.easing ?? 'elite-out';

  if (name === 'popIn') {
    return {
      keyframes: [
        { opacity: opacityFrom, transform: `scale(${scale})` },
        { opacity: opacityTo, transform: 'scale(1)' },
      ],
      options: { duration, delay, stagger, easing, at: options.at },
    };
  }

  return {
    keyframes: [
      { opacity: opacityFrom, transform: `translate3d(0, ${distance}px, 0)${name === 'staggerFadeUp' ? ' scale(0.98)' : ''}` },
      { opacity: opacityTo, transform: 'translate3d(0, 0px, 0) scale(1)' },
    ],
    options: { duration, delay, stagger, easing, at: options.at },
  };
}

export function createTimelineComposer(baseOptions: TimelinePresetOptions = {}): TimelineDomainComposer {
  const byDomain: Record<TimelineDomainPresetName, { name: TimelinePresetName; defaults: TimelinePresetOptions }> = {
    hero: {
      name: 'fadeUp',
      defaults: { distance: 40, duration: 720, easing: 'elite-out' },
    },
    cards: {
      name: 'staggerFadeUp',
      defaults: { distance: 28, duration: 560, stagger: 70, easing: 'elite-out' },
    },
    navbar: {
      name: 'popIn',
      defaults: { scale: 0.92, duration: 420, easing: 'elite-out' },
    },
  };

  const resolve = (domain: TimelineDomainPresetName, options: TimelinePresetOptions = {}) => {
    const cfg = byDomain[domain];
    return timelinePreset(cfg.name, { ...baseOptions, ...cfg.defaults, ...options });
  };

  return {
    preset: (name, options) => resolve(name, options),
    hero: (options) => resolve('hero', options),
    cards: (options) => resolve('cards', options),
    navbar: (options) => resolve('navbar', options),
  };
}
