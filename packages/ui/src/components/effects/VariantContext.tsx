import React, { createContext, useContext, useRef, useMemo } from 'react';

export interface VariantContextType {
  initial?: string | Record<string, any>;
  animate?: string | Record<string, any>;
  exit?: string | Record<string, any>;
  interactive?: string | null;
  index?: number;
  staggerChildren?: number;
  delayChildren?: number;
  registerChild: () => number;
}

export const VariantContext = createContext<VariantContextType | null>(null);

export const useVariantContext = () => useContext(VariantContext);

interface VariantProviderProps {
  children: React.ReactNode;
  initial?: string | Record<string, any>;
  animate?: string | Record<string, any>;
  exit?: string | Record<string, any>;
  interactive?: string | null;
  staggerChildren?: number;
  delayChildren?: number;
}

export function VariantProvider({
  children,
  initial,
  animate,
  exit,
  interactive,
  staggerChildren,
  delayChildren,
}: VariantProviderProps) {
  const parentContext = useVariantContext();
  
  // We track the number of registered children to assign them an index
  const childCount = useRef(0);
  
  // Reset the count whenever the animate state changes significantly
  // In a full implementation, this might be more granular, but for Pixon UI this works.
  const prevAnimate = useRef(animate);
  if (prevAnimate.current !== animate) {
    childCount.current = 0;
    prevAnimate.current = animate;
  }

  const contextValue = useMemo(() => ({
    initial: initial !== undefined ? initial : parentContext?.initial,
    animate: animate !== undefined ? animate : parentContext?.animate,
    exit: exit !== undefined ? exit : parentContext?.exit,
    interactive: interactive !== undefined ? interactive : parentContext?.interactive,
    staggerChildren,
    delayChildren,
    registerChild: () => {
      const index = childCount.current;
      childCount.current += 1;
      return index;
    }
  }), [initial, animate, exit, staggerChildren, delayChildren, parentContext]);

  return (
    <VariantContext.Provider value={contextValue}>
      {children}
    </VariantContext.Provider>
  );
}
