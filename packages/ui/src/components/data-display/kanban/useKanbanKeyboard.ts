import { useEffect } from 'react';

interface UseKanbanKeyboardProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onSearch?: () => void;
  onNewTask?: () => void;
  onNewColumn?: () => void;
  enabled?: boolean;
}

export function useKanbanKeyboard({
  onUndo,
  onRedo,
  onSearch,
  onNewTask,
  onNewColumn,
  enabled = true
}: UseKanbanKeyboardProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
      }
      
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        onRedo?.();
      }

      // Search: Ctrl+F or /
      if (((e.ctrlKey || e.metaKey) && e.key === 'f') || (e.key === '/' && document.activeElement === document.body)) {
        e.preventDefault();
        onSearch?.();
      }

      // New Task: N
      if (e.key === 'n' && document.activeElement === document.body) {
        e.preventDefault();
        onNewTask?.();
      }

      // New Column: C
      if (e.key === 'c' && document.activeElement === document.body) {
        e.preventDefault();
        onNewColumn?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onUndo, onRedo, onSearch, onNewTask, onNewColumn]);
}
