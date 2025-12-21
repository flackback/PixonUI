import { useEffect, useRef, useCallback } from 'react';

export interface UseInfiniteScrollOptions {
  /** Callback function to load more data */
  onLoadMore: () => void;
  /** Whether more data is currently being loaded */
  isLoading: boolean;
  /** Whether there is more data to load */
  hasMore: boolean;
  /** Distance from the bottom in pixels to trigger loading */
  threshold?: number;
  /** Root element for the IntersectionObserver (defaults to viewport) */
  root?: Element | null;
}

/**
 * A hook to implement infinite scrolling using the Intersection Observer API.
 * 
 * @example
 * const loaderRef = useInfiniteScroll({ onLoadMore: fetchNextPage, hasMore, isLoading });
 * return <div ref={loaderRef}>{isLoading && <Spinner />}</div>;
 */
export function useInfiniteScroll({
  onLoadMore,
  isLoading,
  hasMore,
  threshold = 100,
  root = null,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target && target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      root,
      rootMargin: `0px 0px ${threshold}px 0px`,
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, root, threshold]);

  return triggerRef;
}
