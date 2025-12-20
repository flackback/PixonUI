import React from 'react';
import { Lock, Trash2, GripVertical, MessageSquare, Paperclip, Clock, Play, Pause } from 'lucide-react';
import { Surface } from '../../../primitives/Surface';
import { Badge } from '../../../primitives/Badge';
import { Text } from '../../typography/Text';
import { Checkbox } from '../../form/Checkbox';
import { cn } from '../../../utils/cn';
import { KanbanTask } from './types';

interface KanbanCardProps {
  task: KanbanTask;
  columnId: string;
  selectedTaskIds: string[];
  activeTimerTaskId?: string | null;
  selectable?: boolean;
  cardClassName?: string;
  onTaskClick?: (e: React.MouseEvent, task: KanbanTask) => void;
  onTaskSelectionChange?: (selectedIds: string[]) => void;
  onTaskRemove?: (taskId: string) => void;
  onTaskTimerToggle?: (taskId: string) => void;
  renderCard?: (task: KanbanTask) => React.ReactNode;
}

export const KanbanCard = React.memo(({
  task,
  columnId,
  selectedTaskIds,
  activeTimerTaskId,
  selectable,
  cardClassName,
  onTaskClick,
  onTaskSelectionChange,
  onTaskRemove,
  onTaskTimerToggle,
  renderCard
}: KanbanCardProps) => {
  if (renderCard) return <>{renderCard(task)}</>;

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'neutral';
    }
  };

  const isSelected = selectedTaskIds.includes(task.id);

  return (
    <Surface 
      onClick={(e) => onTaskClick?.(e, task)}
      className={cn(
        "p-6 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 rounded-2xl group",
        task.blockedBy && task.blockedBy.length > 0 && "border-red-500/30 bg-red-500/[0.02]",
        isSelected && "ring-2 ring-cyan-500/50 bg-cyan-500/[0.02]",
        cardClassName
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {selectable && (
              <Checkbox 
                checked={isSelected}
                onChange={(e) => {
                  const checked = e.target.checked;
                  const newSelection = checked 
                    ? [...selectedTaskIds, task.id]
                    : selectedTaskIds.filter(id => id !== task.id);
                  onTaskSelectionChange?.(newSelection);
                }}
                onClick={(e) => e.stopPropagation()}
                className="mr-1"
              />
            )}
            {task.blockedBy && task.blockedBy.length > 0 && (
              <Lock className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
            )}
            <Text className={cn(
              "font-medium text-sm leading-tight group-hover:text-cyan-400 transition-colors truncate",
              task.blockedBy && task.blockedBy.length > 0 && "text-red-400/80"
            )}>
              {task.title}
            </Text>
          </div>
          <div className="flex items-center gap-1">
            {onTaskRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskRemove(task.id);
                }}
                className="p-1 rounded-md hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <GripVertical className="h-4 w-4 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        </div>

        {task.description && (
          <Text className="text-xs text-white/50 line-clamp-2">
            {task.description}
          </Text>
        )}

        {task.progress !== undefined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/30 uppercase font-bold tracking-wider">Progress</span>
              <span className="text-white/50">{task.progress}%</span>
            </div>
            <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 transition-all duration-500" 
                style={{ width: `${task.progress}%` }}
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
            <Badge key={tag} variant="neutral" className="text-[10px] px-1.5 py-0 bg-white/[0.03] border-white/5">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
          <div className="flex items-center gap-3 text-[10px] text-white/30">
            {task.timeSpent !== undefined && (
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors",
                activeTimerTaskId === task.id ? "bg-cyan-500/20 text-cyan-400" : "bg-white/[0.03]"
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
                  {Math.floor(task.timeSpent / 3600)}h {Math.floor((task.timeSpent % 3600) / 60)}m
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
              <div className="h-6 w-6 rounded-full border-2 border-[#0a0a0a] bg-white/[0.06] flex items-center justify-center text-[10px] font-bold overflow-hidden">
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
});

KanbanCard.displayName = 'KanbanCard';
