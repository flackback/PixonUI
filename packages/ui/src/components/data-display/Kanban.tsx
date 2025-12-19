import React, { useState, useMemo, useCallback, useRef } from 'react';
import { cn } from '../../utils/cn';
import { Surface } from '../../primitives/Surface';
import { Badge } from '../../primitives/Badge';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';
import { Button } from '../button/Button';
import { Checkbox } from '../form/Checkbox';
import { Separator } from '../data-display/Separator';
import { 
  MoreHorizontal, 
  Plus, 
  GripVertical, 
  MessageSquare, 
  Paperclip, 
  Clock, 
  Trash2, 
  Archive, 
  AlertCircle,
  Lock,
  Play,
  Pause,
  CheckSquare,
  Calendar as CalendarIcon,
  Filter as FilterIcon,
  Settings
} from 'lucide-react';
import { Motion } from '../feedback/Motion';
import { MotionGroup } from '../feedback/MotionGroup';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuItem
} from '../overlay/DropdownMenu';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  assignee?: {
    name: string;
    avatar?: string;
  };
  comments?: number;
  attachments?: number;
  dueDate?: string;
  columnId: string;
  progress?: number; // 0 to 100
  blockedBy?: string[]; // IDs of tasks that block this one
  timeSpent?: number; // in seconds
  archived?: boolean;
  customFields?: Record<string, any>;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  limit?: number; // WIP Limit
}

export interface KanbanProps {
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  onTaskMove?: (taskId: string, toColumnId: string, newIndex?: number) => void;
  onColumnMove?: (columnId: string, newIndex: number) => void;
  onTaskClick?: (task: KanbanTask) => void;
  onTaskAdd?: (columnId: string, title?: string) => void;
  onTaskFullAdd?: (columnId: string) => void;
  onTaskTimerToggle?: (taskId: string) => void;
  onTaskSelectionChange?: (selectedIds: string[]) => void;
  onColumnAction?: (columnId: string) => void;
  renderCard?: (task: KanbanTask) => React.ReactNode;
  groupBy?: keyof KanbanTask;
  activeTimerTaskId?: string;
  selectedTaskIds?: string[];
  selectable?: boolean;
  showDividers?: boolean;
  className?: string;
  cardClassName?: string;
  columnClassName?: string;
  showTaskCount?: boolean;
  accentColor?: string;
}

export function Kanban({
  columns,
  tasks,
  onTaskMove,
  onColumnMove,
  onTaskClick,
  onTaskAdd,
  onTaskFullAdd,
  onTaskTimerToggle,
  onTaskSelectionChange,
  onColumnAction,
  renderCard,
  groupBy,
  activeTimerTaskId,
  selectedTaskIds = [],
  selectable = false,
  showDividers = false,
  className,
  cardClassName,
  columnClassName,
  showTaskCount = true,
  accentColor = 'cyan'
}: KanbanProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [quickAddColumnId, setQuickAddColumnId] = useState<string | null>(null);
  const [quickAddValue, setQuickAddValue] = useState('');

  const tasksByGroupAndColumn = useMemo(() => {
    const groups: Record<string, Record<string, KanbanTask[]>> = {};
    
    // Initialize groups
    const groupValues = groupBy 
      ? Array.from(new Set(tasks.map(t => String(t[groupBy] || 'Uncategorized'))))
      : ['default'];

    groupValues.forEach(group => {
      groups[group] = {};
      columns.forEach(col => {
        groups[group]![col.id] = [];
      });
    });

    tasks.forEach(task => {
      const group = groupBy ? String(task[groupBy] || 'Uncategorized') : 'default';
      const colTasks = groups[group]?.[task.columnId];
      if (colTasks) {
        colTasks.push(task);
      }
    });

    return groups;
  }, [columns, tasks, groupBy]);

  const handleDragStart = (e: React.DragEvent, id: string, type: 'task' | 'column') => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);

    if (type === 'task') {
      e.dataTransfer.setData('taskId', id);
      // Delay setting state to allow browser to capture drag image
      setTimeout(() => {
        setDraggedTaskId(id);
      }, 0);
    } else {
      e.dataTransfer.setData('columnId', id);
      setTimeout(() => {
        setDraggedColumnId(id);
      }, 0);
    }
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDraggedColumnId(null);
    setDragOverColumnId(null);
    setDragOverTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string, taskId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedColumnId) {
      setDragOverColumnId(columnId);
    } else {
      setDragOverColumnId(columnId);
      setDragOverTaskId(taskId || null);
    }
  };

  const handleDrop = (e: React.DragEvent, toColumnId: string, toTaskId?: string) => {
    e.preventDefault();
    const taskId = draggedTaskId || e.dataTransfer.getData('taskId');
    const columnId = draggedColumnId || e.dataTransfer.getData('columnId');

    if (columnId && onColumnMove) {
      const newIndex = columns.findIndex(c => c.id === toColumnId);
      onColumnMove(columnId, newIndex);
    } else if (taskId && onTaskMove) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const columnTasks = tasks.filter(t => t.columnId === toColumnId);
      let newIndex = columnTasks.length;
      
      if (toTaskId) {
        newIndex = columnTasks.findIndex(t => t.id === toTaskId);
      }

      onTaskMove(taskId, toColumnId, newIndex);
    }

    handleDragEnd();
  };

  const handleSetQuickAdd = (columnId: string, groupName: string = 'default') => {
    setQuickAddColumnId(`${groupName}-${columnId}`);
  };

  const handleQuickAdd = (columnId: string, groupName: string = 'default') => {
    if (quickAddValue.trim() && onTaskAdd) {
      onTaskAdd(columnId, quickAddValue.trim());
      setQuickAddValue('');
      setQuickAddColumnId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string, columnId: string) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (draggedTaskId === taskId) {
        handleDrop(e as any, columnId);
      } else {
        setDraggedTaskId(taskId);
      }
    }

    if (draggedTaskId === taskId) {
      const colIndex = columns.findIndex(c => c.id === columnId);
      
      // Find task index across all groups
      let taskIndex = -1;
      let currentGroupName = 'default';
      
      for (const [groupName, columnMap] of Object.entries(tasksByGroupAndColumn)) {
        const tasks = columnMap[columnId] || [];
        const idx = tasks.findIndex(t => t.id === taskId);
        if (idx !== -1) {
          taskIndex = idx;
          currentGroupName = groupName;
          break;
        }
      }

      if (e.key === 'ArrowRight' && colIndex < columns.length - 1) {
        onTaskMove?.(taskId, columns[colIndex + 1]!.id, 0);
      } else if (e.key === 'ArrowLeft' && colIndex > 0) {
        onTaskMove?.(taskId, columns[colIndex - 1]!.id, 0);
      } else if (e.key === 'ArrowDown') {
        onTaskMove?.(taskId, columnId, taskIndex + 1);
      } else if (e.key === 'ArrowUp' && taskIndex > 0) {
        onTaskMove?.(taskId, columnId, taskIndex - 1);
      }
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'neutral';
    }
  };

  // Memoized Task Card Component
  const TaskCard = useCallback(({ task, columnId }: { task: KanbanTask, columnId: string }) => {
    if (renderCard) return renderCard(task);

    return (
      <Surface 
        className={cn(
          "p-4 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200",
          task.blockedBy && task.blockedBy.length > 0 && "border-red-500/30 bg-red-500/[0.02]",
          selectedTaskIds.includes(task.id) && "ring-2 ring-cyan-500/50 bg-cyan-500/[0.02]",
          cardClassName
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {selectable && (
                <Checkbox 
                  checked={selectedTaskIds.includes(task.id)}
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
            <GripVertical className="h-4 w-4 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
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
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
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
              <Badge key={tag} variant="neutral" className="text-[10px] px-1.5 py-0 bg-white/5 border-white/5">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
            <div className="flex items-center gap-3 text-[10px] text-white/30">
              {task.timeSpent !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors",
                  activeTimerTaskId === task.id ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5"
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
                <div className="h-6 w-6 rounded-full border-2 border-[#0a0a0a] bg-white/10 flex items-center justify-center text-[10px] font-bold overflow-hidden">
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
  }, [renderCard, selectedTaskIds, cardClassName, selectable, activeTimerTaskId, onTaskSelectionChange, onTaskTimerToggle]);

  return (
    <div className={cn("flex flex-col overflow-x-auto pb-4 min-h-[600px] scrollbar-thin scrollbar-thumb-white/10", className)}>
      {/* Column Headers (Sticky) */}
      <div className="flex sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        {columns.map((column, idx) => {
          const columnTasks = tasks.filter(t => t.columnId === column.id);
          const isOverLimit = column.limit && columnTasks.length > column.limit;

          return (
            <div 
              key={column.id}
              className={cn(
                "flex-shrink-0 w-80 flex items-center justify-between px-6 py-4 group/header",
                showDividers && idx > 0 && "border-l border-white/10"
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, column.id, 'column')}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1"
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: column.color || `var(--${accentColor}-500)` }} 
                />
                <Heading as="h4" className="text-sm font-semibold uppercase tracking-wider">
                  {column.title}
                </Heading>
                {showTaskCount && (
                  <Badge 
                    variant={isOverLimit ? "danger" : "neutral"} 
                    className={cn(
                      "ml-1 text-[10px] px-1.5 py-0",
                      !isOverLimit && "bg-white/5 border-white/10"
                    )}
                  >
                    {columnTasks.length}{column.limit ? ` / ${column.limit}` : ''}
                  </Badge>
                )}
                {isOverLimit && (
                  <AlertCircle className="h-3 w-3 text-red-500 animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-white/5"
                  onClick={() => handleSetQuickAdd(column.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 p-0 hover:bg-white/5 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1a] border border-white/10 p-1 shadow-2xl z-50">
                    <DropdownMenuItem 
                      onClick={() => onColumnAction?.(column.id)}
                      className="gap-2 text-xs text-white/70 hover:text-white"
                    >
                      <Settings className="h-3.5 w-3.5" /> Column Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-xs text-white/70 hover:text-white">
                      <Archive className="h-3.5 w-3.5" /> Archive All
                    </DropdownMenuItem>
                    <div className="h-px bg-white/5 my-1" />
                    <DropdownMenuItem className="gap-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="h-3.5 w-3.5" /> Delete Column
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Swimlanes / Groups */}
      {Object.entries(tasksByGroupAndColumn).map(([groupName, columnMap]) => (
        <div key={groupName} className="flex flex-col">
          {groupBy && (
            <div className="sticky top-[65px] z-10 flex items-center gap-3 px-6 py-2 bg-[#0a0a0a]/60 backdrop-blur-sm border-b border-white/5">
              <Badge variant="neutral" className="bg-white/10 border-white/10 text-[10px] uppercase font-bold tracking-widest px-3">
                {groupName}
              </Badge>
              <div className="h-px flex-1 bg-white/5" />
            </div>
          )}
          
          <div className="flex">
            {columns.map((column, idx) => (
              <div 
                key={column.id}
                className={cn(
                  "flex-shrink-0 w-80 flex flex-col gap-4 transition-all duration-200 min-h-[200px] p-3",
                  showDividers && idx > 0 && "border-l border-white/10",
                  draggedColumnId === column.id ? "opacity-20" : "opacity-100",
                  dragOverColumnId === column.id && draggedColumnId ? "bg-cyan-500/5" : "",
                  columnClassName
                )}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Tasks Container */}
                <div 
                  className={cn(
                    "flex-1 flex flex-col gap-4 p-1 rounded-2xl transition-colors duration-200",
                    dragOverColumnId === column.id && !dragOverTaskId && !draggedColumnId ? "bg-white/[0.02] ring-2 ring-dashed ring-white/10" : ""
                  )}
                >
                  {(columnMap[column.id] || []).map((task) => (
                    <React.Fragment key={task.id}>
                      {/* Ghost Placeholder */}
                      {dragOverTaskId === task.id && draggedTaskId !== task.id && (
                        <div className="h-24 w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] mb-4 animate-pulse" />
                      )}
                      
                      <div
                        draggable
                        tabIndex={0}
                        role="listitem"
                        aria-grabbed={draggedTaskId === task.id}
                        onDragStart={(e) => handleDragStart(e, task.id, 'task')}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, column.id, task.id)}
                        onKeyDown={(e) => handleKeyDown(e, task.id, column.id)}
                        onClick={() => onTaskClick?.(task)}
                        className={cn(
                          "group relative cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-2xl transition-opacity",
                          draggedTaskId === task.id ? "opacity-20" : "opacity-100"
                        )}
                      >
                        <TaskCard task={task} columnId={column.id} />
                      </div>
                    </React.Fragment>
                  ))}

                  {/* Ghost Placeholder for end of column */}
                  {dragOverColumnId === column.id && !dragOverTaskId && draggedTaskId && (
                    <div className="h-24 w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] animate-pulse" />
                  )}
                  
                  {/* Quick Add Input */}
                  {quickAddColumnId === `${groupName}-${column.id}` ? (
                    <Surface className="p-2 border-cyan-500/50 bg-cyan-500/5 mt-2">
                      <textarea
                        autoFocus
                        className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none p-1 placeholder:text-white/20"
                        placeholder="What needs to be done?"
                        rows={3}
                        value={quickAddValue}
                        onChange={(e) => setQuickAddValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleQuickAdd(column.id, groupName);
                          }
                          if (e.key === 'Escape') {
                            setQuickAddColumnId(null);
                            setQuickAddValue('');
                          }
                        }}
                      />
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <Button variant="ghost" size="sm" onClick={() => setQuickAddColumnId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleQuickAdd(column.id, groupName)}>Add Task</Button>
                      </div>
                    </Surface>
                  ) : (
                    <div className="group/add relative mt-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2 text-white/40 hover:text-white/60 hover:bg-white/5 border border-dashed border-transparent hover:border-white/10 rounded-xl py-2"
                        onClick={() => handleSetQuickAdd(column.id, groupName)}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-xs">Add Task</span>
                      </Button>
                      
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/add:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-7 px-2 text-[10px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetQuickAdd(column.id, groupName);
                          }}
                        >
                          Quick
                        </Button>
                        <Button 
                          size="sm" 
                          variant="primary" 
                          className="h-7 px-2 text-[10px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskFullAdd?.(column.id);
                          }}
                        >
                          Full
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {(columnMap[column.id] || []).length === 0 && !quickAddColumnId && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl min-h-[60px]">
                      <Text className="text-[10px] text-white/10 uppercase tracking-widest">Empty</Text>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
