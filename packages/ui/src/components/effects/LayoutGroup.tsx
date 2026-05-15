import React, { createContext, useContext, useRef, useCallback } from 'react';

export interface LayoutGroupContextType {
  getRect: (layoutId: string) => DOMRect | undefined;
  setRect: (layoutId: string, rect?: DOMRect) => void;
  register: (layoutId: string, el: HTMLElement) => () => void;
  getOwner: (layoutId: string) => HTMLElement | undefined;
}

export const LayoutGroupContext = createContext<LayoutGroupContextType | null>(null);

export const useLayoutGroup = () => useContext(LayoutGroupContext);

export interface LayoutGroupProps {
  children: React.ReactNode;
  id?: string;
}

/**
 * LayoutGroup: The deterministic orchestrator for shared element transitions.
 * V4: Tracks active owners to prevent ghosting during portals.
 */
export function LayoutGroup({ children }: LayoutGroupProps) {
  const rectsRef = useRef<Map<string, DOMRect>>(new Map());
  const ownersRef = useRef<Map<string, HTMLElement>>(new Map());

  const getRect = useCallback((layoutId: string) => rectsRef.current.get(layoutId), []);
  const getOwner = useCallback((layoutId: string) => ownersRef.current.get(layoutId), []);

  const setRect = useCallback((layoutId: string, rect?: DOMRect) => {
    if (rect) rectsRef.current.set(layoutId, rect);
    else rectsRef.current.delete(layoutId);
  }, []);

  const register = useCallback((layoutId: string, el: HTMLElement) => {
    ownersRef.current.set(layoutId, el);
    return () => {
      if (ownersRef.current.get(layoutId) === el) {
        ownersRef.current.delete(layoutId);
      }
    };
  }, []);

  return (
    <LayoutGroupContext.Provider value={{ getRect, setRect, register, getOwner }}>
      {children}
    </LayoutGroupContext.Provider>
  );
}
