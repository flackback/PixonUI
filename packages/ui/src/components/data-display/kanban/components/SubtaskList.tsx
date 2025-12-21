import React from 'react';
import { cn } from '../../../../utils/cn';
import { CheckCircle2, Circle } from 'lucide-react';
import type { Subtask } from '../types';

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggle?: (id: string) => void;
  className?: string;
}

export function SubtaskList({ subtasks, onToggle, className }: SubtaskListProps) {
  if (!subtasks || subtasks.length === 0) return null;

  return (
    <div className={cn("space-y-1", className)}>
      {subtasks.map((subtask) => (
        <div 
          key={subtask.id}
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => onToggle?.(subtask.id)}
        >
          {subtask.completed ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Circle className="h-3.5 w-3.5 text-white/20 group-hover:text-white/40" />
          )}
          <span className={cn(
            "text-xs transition-colors",
            subtask.completed ? "text-white/40 line-through" : "text-white/70"
          )}>
            {subtask.title}
          </span>
        </div>
      ))}
    </div>
  );
}
