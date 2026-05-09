import React from 'react';
import { usePresence } from '../hooks/usePresence';

interface PresenceProps {
  present: boolean;
  children: React.ReactElement;
  exitDuration?: number;
}

/**
 * A lightweight alternative to framer-motion's AnimatePresence.
 * It ensures the child stays in the DOM until the exit duration completes.
 */
export function Presence({ present, children, exitDuration = 200 }: PresenceProps) {
  const shouldRender = usePresence(present, exitDuration);

  if (!shouldRender) return null;

  return React.cloneElement(children, {
    show: present,
    duration: exitDuration,
  } as any);
}
