import type { RefObject } from 'react';
import { useCallback, useRef } from 'react';
import { timeline, type TimelineBuilder, type TimelineFactoryOptions } from '../utils/motion';

export interface UseTimelineScopeReturn<T extends HTMLElement = HTMLDivElement> {
  ref: RefObject<T>;
  createTimeline: (options?: TimelineFactoryOptions) => TimelineBuilder;
}

/**
 * React helper for creating timelines scoped to a container ref.
 * String selectors inside the created timeline are resolved within `ref.current`.
 */
export function useTimelineScope<T extends HTMLElement = HTMLDivElement>(
  defaults?: TimelineFactoryOptions
): UseTimelineScopeReturn<T> {
  const ref = useRef<T>(null as unknown as T);

  const createTimeline = useCallback((options?: TimelineFactoryOptions) => {
    const tl = timeline(options ?? defaults);
    tl.scope(ref.current);
    return tl;
  }, [defaults]);

  return { ref, createTimeline };
}
