import React from 'react';
import { cn } from '../../../../utils/cn';
import { CheckSquare, Square } from 'lucide-react';
import type { ChecklistItem } from '../types';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle?: (id: string) => void;
  className?: string;
}

export function Checklist({ items, onToggle, className }: ChecklistProps) {
  if (!items || items.length === 0) return null;

  const completedCount = items.filter(i => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-wider font-bold">
        <span>Checklist</span>
        <span>{completedCount}/{items.length}</span>
      </div>
      
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div 
            key={item.id}
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => onToggle?.(item.id)}
          >
            {item.completed ? (
              <CheckSquare className="h-4 w-4 text-blue-500" />
            ) : (
              <Square className="h-4 w-4 text-white/20 group-hover:text-white/40" />
            )}
            <span className={cn(
              "text-sm transition-colors",
              item.completed ? "text-white/40 line-through" : "text-white/80"
            )}>
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
