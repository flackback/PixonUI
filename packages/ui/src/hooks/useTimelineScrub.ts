import { useEffect } from 'react';
import type { MotionValue } from '../motion/value';
import type { TimelineController } from '../utils/motion';

export interface UseTimelineScrubOptions {
  from?: number;
  to?: number;
  clamp?: boolean;
  immediate?: boolean;
  enabled?: boolean;
}

/**
 * Binds a MotionValue progress source to a running timeline controller scrub.
 * Keeps animation fully off React render loop (zero re-render per frame).
 */
export function useTimelineScrub(
  controller: TimelineController | null | undefined,
  source: MotionValue<number> | null | undefined,
  options: UseTimelineScrubOptions = {}
) {
  const { from = 0, to = 1, clamp = true, immediate = true, enabled = true } = options;

  useEffect(() => {
    if (!enabled || !controller || !source) return;
    return controller.bindScrub(source, { from, to, clamp, immediate });
  }, [enabled, controller, source, from, to, clamp, immediate]);
}

