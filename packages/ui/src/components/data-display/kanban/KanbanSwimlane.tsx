import React from 'react';
import { cn } from '../../../utils/cn';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface KanbanSwimlaneProps {
  title: string;
  count: number;
  isCollapsed?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function KanbanSwimlane({ 
  title, 
  count, 
  isCollapsed, 
  onToggle, 
  children, 
  className 
}: KanbanSwimlaneProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <button 
        onClick={onToggle}
        className="flex items-center gap-3 w-full group"
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? <ChevronRight className="h-4 w-4 text-white/20" /> : <ChevronDown className="h-4 w-4 text-white/20" />}
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">
            {title}
          </h4>
        </div>
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/20">
          {count}
        </span>
      </button>

      {!isCollapsed && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}
