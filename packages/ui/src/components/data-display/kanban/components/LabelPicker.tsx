import React from 'react';
import { cn } from '../../../../utils/cn';
import { Check, Tag } from 'lucide-react';
import type { KanbanLabel } from '../types';

interface LabelPickerProps {
  labels: KanbanLabel[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  className?: string;
}

export function LabelPicker({ labels, selectedIds, onToggle, className }: LabelPickerProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-bold flex items-center gap-2">
        <Tag className="h-3 w-3" />
        Labels
      </h4>
      <div className="flex flex-wrap gap-2">
        {labels.map((label) => {
          const isSelected = selectedIds.includes(label.id);
          return (
            <button
              key={label.id}
              onClick={() => onToggle(label.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 border",
                isSelected 
                  ? "bg-white/10 border-white/20 text-white" 
                  : "bg-transparent border-white/5 text-white/40 hover:border-white/10"
              )}
            >
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: label.color }} 
              />
              {label.name}
              {isSelected && <Check className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
