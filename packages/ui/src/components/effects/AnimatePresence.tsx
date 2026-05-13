import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  Children,
  isValidElement,
  cloneElement,
  useRef
} from 'react';

export interface PresenceContextType {
  isPresent: boolean;
  onExitComplete?: () => void;
  custom?: any;
}

export const PresenceContext = createContext<PresenceContextType | null>(null);

export const usePresenceContext = () => useContext(PresenceContext);

interface AnimatePresenceProps {
  children: React.ReactNode;
  /** Custom data passed to exiting children */
  custom?: any;
}

export function AnimatePresence({ children, custom }: AnimatePresenceProps) {
  // We keep track of the currently "mounted" children (even if they are exiting)
  const [presentChildren, setPresentChildren] = useState<React.ReactElement[]>([]);
  
  // Track children that are currently exiting
  const exitingKeys = useRef<Set<string | number>>(new Set());
  
  const currentChildren = Children.toArray(children).filter(isValidElement);

  useEffect(() => {
    setPresentChildren((prev) => {
      const next: React.ReactElement[] = [...currentChildren];
      
      // Find children that were in prev but are missing in current (they are exiting)
      const currentKeys = new Set(currentChildren.map(c => c.key));
      
      prev.forEach((prevChild) => {
        const key = prevChild.key!;
        if (!currentKeys.has(key) && !exitingKeys.current.has(key)) {
          // This child was removed, it should start exiting
          exitingKeys.current.add(key);
          next.push(prevChild);
        } else if (exitingKeys.current.has(key) && !currentKeys.has(key)) {
          // Keep it in next until it finishes exiting
          next.push(prevChild);
        } else if (exitingKeys.current.has(key) && currentKeys.has(key)) {
          // It came back before finishing the exit! Cancel exit.
          exitingKeys.current.delete(key);
        }
      });
      
      return next;
    });
  }, [children]); // Trigger when children prop changes

  const handleExitComplete = (key: string | number) => {
    exitingKeys.current.delete(key);
    setPresentChildren((prev) => prev.filter((child) => child.key !== key));
  };

  return (
    <>
      {presentChildren.map((child) => {
        const key = child.key!;
        const isPresent = !exitingKeys.current.has(key);

        return (
          <PresenceContext.Provider
            key={key}
            value={{
              isPresent,
              custom,
              onExitComplete: () => handleExitComplete(key)
            }}
          >
            {child}
          </PresenceContext.Provider>
        );
      })}
    </>
  );
}
