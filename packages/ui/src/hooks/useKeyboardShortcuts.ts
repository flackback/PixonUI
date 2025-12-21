import { useEffect, useRef } from 'react';

export type ShortcutHandler = (event: KeyboardEvent) => void;

export interface ShortcutMap {
  /** 
   * Key combination string (e.g., 'mod+s', 'shift+enter', 'escape').
   * 'mod' maps to Command on Mac and Ctrl on Windows/Linux.
   */
  [shortcut: string]: ShortcutHandler;
}

/**
 * A hook to manage global keyboard shortcuts with automatic cleanup.
 * 
 * @example
 * useKeyboardShortcuts({
 *   'mod+s': (e) => { e.preventDefault(); save(); },
 *   'escape': () => close(),
 * });
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keys = [];
      const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      
      if (event.ctrlKey || event.metaKey) {
        // Handle 'mod' abstraction
        keys.push('mod');
      }
      
      if (event.shiftKey) keys.push('shift');
      if (event.altKey) keys.push('alt');
      
      const key = event.key.toLowerCase();
      if (!['control', 'meta', 'shift', 'alt'].includes(key)) {
        keys.push(key);
      }

      const shortcutStr = keys.join('+');
      
      // Try exact match first, then fallback to single key
      const handler = shortcutsRef.current[shortcutStr] || shortcutsRef.current[key];

      if (handler) {
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
