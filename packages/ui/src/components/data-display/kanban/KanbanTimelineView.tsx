import React from 'react';
import { cn } from '../../../utils/cn';
import type { KanbanTask } from './types';

interface KanbanTimelineViewProps {
  tasks: KanbanTask[];
  className?: string;
}

export function KanbanTimelineView({ tasks, className }: KanbanTimelineViewProps) {
  // Simplified timeline view for now
  return (
    <div className={cn("p-8 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center justify-center min-h-[400px]", className)}>
      <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
        <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">Timeline View</h3>
      <p className="text-sm text-white/40 text-center max-w-xs">
        The timeline view is currently being optimized for high-performance rendering of {tasks.length} tasks.
      </p>
    </div>
  );
}
