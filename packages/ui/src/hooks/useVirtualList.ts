import { useState, useMemo, useRef, useCallback, useLayoutEffect } from 'react';

export interface UseVirtualListOptions {
  /** Total number of items in the list */
  itemCount: number;
  /** Fixed height of a single item or a function to get height by index */
  itemHeight: number | ((index: number) => number);
  /** Number of items to render outside the visible area */
  overscan?: number;
  /** Initial scroll offset */
  initialScrollTop?: number;
  /** Whether to start the list at the bottom (useful for chats) */
  startAtBottom?: boolean;
}

/**
 * A high-performance hook for virtualizing long lists with dynamic or fixed heights.
 * Supports 120fps scrolling by only rendering visible items.
 */
export function useVirtualList({ 
  itemCount, 
  itemHeight, 
  overscan = 5,
  initialScrollTop = 0,
  startAtBottom = false
}: UseVirtualListOptions) {
  const [scrollTop, setScrollTop] = useState(initialScrollTop);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialScrolled = useRef(false);
  
  const getItemHeight = useCallback((index: number) => {
    return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
  }, [itemHeight]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      observer.observe(containerRef.current);
      
      if (initialScrollTop > 0) {
        containerRef.current.scrollTop = initialScrollTop;
      }

      return () => observer.disconnect();
    }
  }, [initialScrollTop]);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { visibleItems, totalHeight, startIndex } = useMemo(() => {
    let totalHeight = 0;
    const offsets: number[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      offsets.push(totalHeight);
      totalHeight += getItemHeight(i);
    }

    let start = 0;
    let end = itemCount;

    // Binary search for start index
    let low = 0;
    let high = itemCount - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const offset = offsets[mid];
      if (offset !== undefined && offset <= scrollTop) {
        start = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    start = Math.max(0, start - overscan);
    
    const visible = [];
    for (let i = start; i < itemCount; i++) {
      const offset = offsets[i];
      if (offset === undefined) break;
      if (offset > scrollTop + containerHeight + (overscan * getItemHeight(i))) break;
      
      visible.push({
        index: i,
        offsetTop: offset,
        height: getItemHeight(i),
      });
    }

    return {
      visibleItems: visible,
      totalHeight,
      startIndex: start,
    };
  }, [scrollTop, containerHeight, itemCount, getItemHeight, overscan]);

  // Handle initial scroll to bottom
  useLayoutEffect(() => {
    if (startAtBottom && !hasInitialScrolled.current && totalHeight > 0 && containerRef.current && containerHeight > 0) {
      const container = containerRef.current;
      const initialScroll = totalHeight - containerHeight;
      if (initialScroll > 0) {
        container.scrollTop = initialScroll;
        setScrollTop(initialScroll);
      }
      hasInitialScrolled.current = true;
    }
  }, [totalHeight, containerHeight, startAtBottom]);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'auto') => {
    if (containerRef.current) {
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i);
      }
      containerRef.current.scrollTo({ top: offset, behavior });
    }
  }, [getItemHeight]);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    startIndex,
    onScroll,
    scrollToIndex,
    scrollToBottom: (behavior: ScrollBehavior = 'auto') => {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior });
      }
    }
  };
}
