import type { SpringOptions } from './hooks';
import { normalizeTimeMs } from '../utils/motion';

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
  clamp?: boolean;
}

export interface StaggerChildrenOptions {
  stagger?: number;
  delayChildren?: number;
  from?: 'first' | 'last' | 'center' | number;
  grid?: [columns: number, rows: number];
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
