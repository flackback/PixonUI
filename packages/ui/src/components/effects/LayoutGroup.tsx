import React, { createContext, useContext, useRef } from 'react';

export interface LayoutGroupContextType {
  getRect: (layoutId: string) => DOMRect | undefined;
  setRect: (layoutId: string, rect?: DOMRect) => void;
}

export const LayoutGroupContext = createContext<LayoutGroupContextType | null>(null);

export const useLayoutGroup = () => useContext(LayoutGroupContext);

export interface LayoutGroupProps {
  children: React.ReactNode;
  id?: string;
}

/**
 * Provides an isolated namespace for shared layout animations (FLIP).
 * Wrap your components in this to allow `<PixonMotion layoutId="item" />` 
 * to seamlessly morph between each other.
 */
export function LayoutGroup({ children, id }: LayoutGroupProps) {
  // Store DOMRects keyed by layoutId
  const rectsRef = useRef<Map<string, DOMRect>>(new Map());

  const getRect = (layoutId: string) => {
    return rectsRef.current.get(layoutId);
  };

  const setRect = (layoutId: string, rect?: DOMRect) => {
    if (rect) rectsRef.current.set(layoutId, rect);
    else rectsRef.current.delete(layoutId);
  };

  return (
    <LayoutGroupContext.Provider value={{ getRect, setRect }}>
      {children}
    </LayoutGroupContext.Provider>
  );
}
