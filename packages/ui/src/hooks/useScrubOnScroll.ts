import type { RefObject } from 'react';
import { useScroll } from '../motion/hooks';
import type { TimelineController } from '../utils/motion';
import { useTimelineScrub } from './useTimelineScrub';

export interface UseScrubOnScrollOptions {
  axis?: 'x' | 'y';
  from?: number;
  to?: number;
  clamp?: boolean;
  immediate?: boolean;
  enabled?: boolean;
  container?: RefObject<HTMLElement | null>;
}

/**
 * Official one-line preset for scroll-driven timeline scrub.
 * Example:
 * `useScrubOnScroll(ctrl, { from: 0.1, to: 0.9 })`
 */
export function useScrubOnScroll(
  controller: TimelineController | null | undefined,
  options: UseScrubOnScrollOptions = {}
) {
  const {
    axis = 'y',
    from = 0,
    to = 1,
    clamp = true,
    immediate = true,
    enabled = true,
    container,
  } = options;

  const { scrollXProgress, scrollYProgress } = useScroll({ axis, enabled, container });
  const source = axis === 'x' ? scrollXProgress : scrollYProgress;
  useTimelineScrub(controller, source, { from, to, clamp, immediate, enabled });
}

