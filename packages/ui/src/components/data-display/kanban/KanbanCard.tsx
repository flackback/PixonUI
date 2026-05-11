import React from 'react';
import { Lock, Trash2, GripVertical, MessageSquare, Paperclip, Clock, Play, Pause, CheckSquare } from 'lucide-react';
import { Surface } from '../../../primitives/Surface';
import { Badge } from '../../../primitives/Badge';
import { Text } from '../../typography/Text';
import { Checkbox } from '../../form/Checkbox';
import { cn } from '../../../utils/cn';
import type { KanbanTask } from './types';

interface KanbanCardProps {
  task: KanbanTask;
  isSelected?: boolean;
  showTimer?: boolean;
  onEdit?: (task: KanbanTask) => void;
  onDelete?: (taskId: string) => void;
  draggable?: boolean;
  activeTimerTaskId?: string | null;
  selectable?: boolean;
  cardClassName?: string;
  onTaskClick?: (e: React.MouseEvent, task: KanbanTask) => void;
  onTaskSelectionChange?: (selectedIds: string[]) => void;
  onTaskTimerToggle?: (taskId: string) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  renderCard?: (task: KanbanTask) => React.ReactNode;
  isDragged?: boolean;
}

export const KanbanCard = React.memo(({
  task,
  isSelected,
  showTimer,
  onEdit,
  onDelete,
  draggable = true,
  activeTimerTaskId,
  selectable,
  cardClassName,
  onTaskClick,
  onTaskSelectionChange,
  onTaskTimerToggle,
  onDragStart,
  onDragOver,
  onDrop,
  renderCard,
  isDragged
}: KanbanCardProps) => {
  if (renderCard) return <>{renderCard(task)}</>;

  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasksCount = task.subtasks?.filter(s => s.completed).length || 0;
  const subtaskPercentage = subtasksCount > 0 ? Math.round((completedSubtasksCount / subtasksCount) * 100) : 0;

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'neutral';
    }
  };

  const hasSpinningBorder = task.effect === 'spinning-border' && !isDragged;

  const cardContent = (
    <Surface 
      onClick={(e) => onTaskClick?.(e, task)}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "p-6 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm hover:bg-gray-100/50 dark:hover:bg-white/[0.06] transition-all duration-200 rounded-2xl group cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-300 dark:hover:border-white/20 h-full w-full",
        task.blockedBy && task.blockedBy.length > 0 && "border-red-500/30 bg-red-500/[0.02]",
        isSelected && "ring-2 ring-cyan-500/50 bg-cyan-500/[0.02]",
        isDragged && "bg-white/40 dark:bg-black/40 backdrop-blur-md border-dashed border-cyan-500/40 dark:border-cyan-500/30 scale-[0.98] shadow-lg shadow-cyan-500/5 select-none pointer-events-none",
        hasSpinningBorder && "border-transparent dark:border-transparent bg-white/90 dark:bg-[#0f172a]/95",
        cardClassName
      )}
    >
      <div className={cn("flex flex-col gap-3 transition-all duration-300", isDragged && "opacity-10 blur-[4px] select-none pointer-events-none")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {selectable && (
              <Checkbox 
                checked={isSelected}
                onChange={(e) => {
                  // This should be handled by the parent now or via onTaskSelectionChange
                  onTaskSelectionChange?.(isSelected ? [] : [task.id]);
                }}
                onClick={(e) => e.stopPropagation()}
                className="mr-1"
              />
            )}
            {task.blockedBy && task.blockedBy.length > 0 && (
              <Lock className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
            )}
            <Text className={cn(
              "font-medium text-sm leading-tight text-gray-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors truncate",
              task.blockedBy && task.blockedBy.length > 0 && "text-red-400/80"
            )}>
              {task.title}
            </Text>
          </div>
          <div className="flex items-center gap-1">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="p-1 rounded-md hover:bg-red-500/10 dark:hover:bg-red-500/20 text-gray-400 dark:text-white/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            {draggable && <GripVertical className="h-4 w-4 text-gray-400 dark:text-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />}
          </div>
        </div>

        {task.description && (
          <Text className="text-xs text-gray-500 dark:text-white/50 line-clamp-2">
            {task.description}
          </Text>
        )}

        {task.prediction && (
          <div className={cn(
            "flex items-center gap-1.5 py-1 px-2.5 rounded-lg border text-[10px] font-semibold tracking-wide w-full shrink-0",
            task.prediction.risk === 'high' && "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400",
            task.prediction.risk === 'medium' && "bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400",
            task.prediction.risk === 'low' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400"
          )}>
            <span className={cn(
              "h-1.5 w-1.5 rounded-full animate-pulse",
              task.prediction.risk === 'high' && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
              task.prediction.risk === 'medium' && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
              task.prediction.risk === 'low' && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            )} />
            <span className="opacity-80 uppercase tracking-wider font-bold">Previsão IA:</span>
            <span className="truncate">{task.prediction.message}</span>
          </div>
        )}


        {task.progress !== undefined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400 dark:text-white/30 uppercase font-bold tracking-wider">Progress</span>
              <span className="text-gray-500 dark:text-white/50">{task.progress}%</span>
            </div>
            <div className="h-1 w-full bg-gray-100 dark:bg-white/[0.03] rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 transition-all duration-500" 
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}

        {subtasksCount > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400 dark:text-white/30 uppercase font-bold tracking-wider flex items-center gap-1">
                <CheckSquare className="h-3 w-3 text-cyan-500" /> Checklist
              </span>
              <span className="text-gray-500 dark:text-white/50 font-bold">{completedSubtasksCount}/{subtasksCount} ({subtaskPercentage}%)</span>
            </div>
            <div className="h-1 w-full bg-gray-100 dark:bg-white/[0.03] rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 transition-all duration-500" 
                style={{ width: `${subtaskPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-1">
          {task.priority && (
            <Badge variant={getPriorityColor(task.priority)} className="text-[10px] px-1.5 py-0 uppercase font-bold">
              {task.priority}
            </Badge>
          )}
          {task.tags?.map(tag => (
            <Badge key={tag} variant="neutral" className="text-[10px] px-1.5 py-0 bg-gray-100 dark:bg-white/[0.03] border-gray-200 dark:border-white/5">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-white/30">
            {task.timeSpent !== undefined && (
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors",
                activeTimerTaskId === task.id ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400" : "bg-gray-100 dark:bg-white/[0.03]"
              )}>
                {activeTimerTaskId === task.id ? (
                  <Pause 
                    className="h-2.5 w-2.5 cursor-pointer hover:scale-110 transition-transform" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskTimerToggle?.(task.id);
                    }}
                  />
                ) : (
                  <Play 
                    className="h-2.5 w-2.5 cursor-pointer hover:scale-110 transition-transform" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskTimerToggle?.(task.id);
                    }}
                  />
                )}
                <span className="font-mono">
                  {Math.floor(task.timeSpent / 3600)}h {Math.floor((task.timeSpent % 3600) / 60)}m {task.timeSpent % 60}s
                </span>
              </div>
            )}
            {task.comments !== undefined && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {task.comments}
              </div>
            )}
            {task.attachments !== undefined && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {task.attachments}
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.dueDate}
              </div>
            )}
          </div>
          
          {task.assignee && (
            <div className="flex -space-x-2">
              <div className={cn(
                "h-6 w-6 rounded-full border-2 bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-[10px] font-bold overflow-hidden transition-all duration-300",
                activeTimerTaskId === task.id 
                  ? "border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/20 animate-pulse" 
                  : "border-white dark:border-[#0a0a0a]"
              )}>
                {task.assignee.avatar ? (
                  <img src={task.assignee.avatar} alt={task.assignee.name} className="h-full w-full object-cover" />
                ) : (
                  task.assignee.name[0]
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Surface>
  );

  if (hasSpinningBorder) {
    return (
      <div className="relative p-[2px] rounded-2xl overflow-hidden group/spinning hover:shadow-xl dark:hover:shadow-cyan-500/10 transition-all duration-300">
        <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#06b6d4_0%,#3b82f6_25%,#f43f5e_50%,#3b82f6_75%,#06b6d4_100%)] opacity-80 group-hover/spinning:opacity-100 transition-opacity duration-300" />
        <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-white dark:bg-[#0f172a] z-10">
          {cardContent}
        </div>
      </div>
    );
  }

  return cardContent;
});

KanbanCard.displayName = 'KanbanCard';
