import React, { useState } from 'react';
import { cn } from '../../../utils/cn';
import { Plus, X } from 'lucide-react';
import { Button } from '../../button/Button';

interface KanbanQuickAddProps {
  columnId: string;
  onAdd: (columnId: string, title: string) => void;
  placeholder?: string;
  className?: string;
}

export function KanbanQuickAdd({ columnId, onAdd, placeholder = "Add task...", className }: KanbanQuickAddProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;
    onAdd(columnId, title);
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className={cn(
          "w-full flex items-center gap-2 p-3 rounded-2xl border border-dashed border-white/10 text-white/40 hover:border-white/20 hover:bg-white/5 transition-all text-sm",
          className
        )}
      >
        <Plus className="h-4 w-4" />
        {placeholder}
      </button>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn("bg-white/[0.03] border border-white/10 rounded-2xl p-3 space-y-3", className)}
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsAdding(false);
        }}
      />
      <div className="flex items-center justify-end gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsAdding(false)}
          className="h-8 text-white/40 hover:text-white"
        >
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleSubmit()}
          disabled={!title.trim()}
          className="h-8"
        >
          Add Task
        </Button>
      </div>
    </form>
  );
}
