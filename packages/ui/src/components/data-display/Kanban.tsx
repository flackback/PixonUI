import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Surface } from '../../primitives/Surface';
import { Badge } from '../../primitives/Badge';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';
import { Button } from '../button/Button';
import { Checkbox } from '../form/Checkbox';
import { Separator } from '../data-display/Separator';
import { ScrollArea } from './ScrollArea';
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
  Settings,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  CalendarDays,
  AlertTriangle
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
  customFields?: Record<string, unknown>;
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
  onTaskMove?: (taskId: string, targetColumnId: string, targetTaskId?: string, position?: 'top' | 'bottom') => void;
  onColumnMove?: (columnId: string, targetColumnId: string, position: 'left' | 'right') => void;
  onTaskClick?: (task: KanbanTask) => void;
  onTaskAdd?: (columnId: string, title: string) => void;
  onTaskFullAdd?: (columnId: string) => void;
  onTaskTimerToggle?: (taskId: string) => void;
  onTaskSelectionChange?: (selectedIds: string[]) => void;
  onColumnAction?: (columnId: string, action: string) => void;
  onTaskDragStart?: (taskId: string) => void;
  onTaskDragEnd?: (taskId: string) => void;
  onTaskDrop?: (taskId: string, fromColumnId: string, toColumnId: string, index: number) => void;
  onTaskRemove?: (taskId: string) => void;
  renderCard?: (task: KanbanTask) => React.ReactNode;
  groupBy?: string;
  activeTimerTaskId?: string | null;
  selectedTaskIds?: string[];
  selectable?: boolean;
  showDividers?: boolean;
  className?: string;
  cardClassName?: string;
  columnClassName?: string;
  showTaskCount?: boolean;
  accentColor?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'blue';
  pageSize?: number;
  columnHeight?: string | number;
}

const LoadMoreTrigger = ({ 
  columnId, 
  root, 
  onLoadMore 
}: { 
  columnId: string, 
  root: HTMLElement | null,
  onLoadMore: (columnId: string) => void
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          onLoadMore(columnId);
        }
      },
      { 
        threshold: 0.1,
        root: root
      }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [columnId, root, onLoadMore]);

  return (
    <div ref={triggerRef} className="h-20 w-full flex items-center justify-center">
      <div className="flex items-center gap-2 text-white/20">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 animate-bounce" />
      </div>
    </div>
  );
};

interface KanbanColumnContentProps {
  column: KanbanColumn;
  columnMap: Record<string, KanbanTask[]>;
  groupName: string;
  visibleCount: number;
  pageSize: number;
  columnHeight: string | number;
  draggedTaskId: string | null;
  draggedColumnId: string | null;
  dragOverTaskId: string | null;
  dragOverColumnId: string | null;
  dropPosition: 'top' | 'bottom' | 'left' | 'right' | null;
  quickAddColumnId: string | null;
  quickAddValue: string;
  selectedTaskIds: string[];
  activeTimerTaskId?: string | null;
  handleDragStart: (e: React.DragEvent, id: string, type: 'task' | 'column') => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent, columnId: string, taskId?: string) => void;
  handleDrop: (e: React.DragEvent, toColumnId: string, toTaskId?: string) => void;
  handleTouchStart: (e: React.TouchEvent, id: string, type: 'task' | 'column') => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent, taskId: string, columnId: string) => void;
  handleLoadMore: (columnId: string) => void;
  handleSetQuickAdd: (columnId: string, groupName?: string) => void;
  handleQuickAdd: (columnId: string, groupName?: string) => void;
  setQuickAddValue: (value: string) => void;
  setQuickAddColumnId: (id: string | null) => void;
  onTaskClick?: (e: React.MouseEvent, task: KanbanTask) => void;
  onTaskFullAdd?: (columnId: string) => void;
  TaskCard: React.ComponentType<{ task: KanbanTask, columnId: string }>;
}

const KanbanColumnContent = ({
  column,
  columnMap,
  groupName,
  visibleCount,
  pageSize,
  columnHeight,
  draggedTaskId,
  draggedColumnId,
  dragOverTaskId,
  dragOverColumnId,
  dropPosition,
  quickAddColumnId,
  quickAddValue,
  selectedTaskIds,
  activeTimerTaskId,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleKeyDown,
  handleLoadMore,
  handleSetQuickAdd,
  handleQuickAdd,
  setQuickAddValue,
  setQuickAddColumnId,
  onTaskClick,
  onTaskFullAdd,
  TaskCard
}: KanbanColumnContentProps) => {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const tasks = columnMap[column.id] || [];
  const visibleTasks = tasks.slice(0, visibleCount);

  return (
    <div 
      className={cn(
        "flex-1 flex flex-col min-h-0 rounded-2xl transition-colors duration-200 overflow-hidden",
        dragOverColumnId === column.id && !dragOverTaskId && !draggedColumnId ? "bg-white/[0.02] ring-2 ring-dashed ring-white/10" : ""
      )}
      onDragOver={(e) => {
        if (e.target === e.currentTarget) {
          handleDragOver(e, column.id);
        }
      }}
    >
      <ScrollArea 
        ref={setScrollEl}
        className="flex-1"
      >
        <div className="flex flex-col gap-6 p-2">
          {visibleTasks.map((task) => (
            <div
              key={task.id}
              data-task-id={task.id}
              onDragOver={(e) => {
                e.stopPropagation();
                handleDragOver(e, column.id, task.id);
              }}
              onDrop={(e) => {
                e.stopPropagation();
                handleDrop(e, column.id, task.id);
              }}
              onTouchStart={(e) => handleTouchStart(e, task.id, 'task')}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative"
            >
              {dragOverTaskId === task.id && draggedTaskId !== task.id && dropPosition === 'top' && (
                <div className="h-24 w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] mb-4 animate-pulse pointer-events-none" />
              )}
              
              <div
                draggable
                tabIndex={0}
                role="listitem"
                aria-grabbed={draggedTaskId === task.id}
                onDragStart={(e) => handleDragStart(e, task.id, 'task')}
                onDragEnd={handleDragEnd}
                onKeyDown={(e) => handleKeyDown(e, task.id, column.id)}
                onClick={(e) => onTaskClick?.(e, task)}
                className={cn(
                  "group relative cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-2xl transition-all duration-300",
                  draggedTaskId === task.id ? "opacity-20 scale-95" : "opacity-100 scale-100"
                )}
              >
                <TaskCard task={task} columnId={column.id} />
                {draggedTaskId === task.id && selectedTaskIds.length > 1 && selectedTaskIds.includes(task.id) && (
                  <div className="absolute -top-2 -right-2 bg-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-30 animate-enter-spring">
                    +{selectedTaskIds.length - 1}
                  </div>
                )}
              </div>

              {dragOverTaskId === task.id && draggedTaskId !== task.id && dropPosition === 'bottom' && (
                <div className="h-24 w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] mt-4 animate-pulse pointer-events-none" />
              )}
            </div>
          ))}

          {tasks.length > visibleCount && (
            <LoadMoreTrigger 
              columnId={column.id} 
              root={scrollEl}
              onLoadMore={handleLoadMore} 
            />
          )}

          {dragOverColumnId === column.id && !dragOverTaskId && draggedTaskId && (
            <div className="h-24 w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] animate-pulse" />
          )}

          {tasks.length === 0 && !quickAddColumnId && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl min-h-[100px]">
              <Text className="text-[10px] text-white/10 uppercase tracking-widest">Empty Column</Text>
            </div>
          )}
        </div>
      </ScrollArea>
      
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
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                className="h-7 px-3 text-[10px] uppercase font-bold tracking-wider"
                onClick={() => handleQuickAdd(column.id, groupName)}
              >
                Add Task
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-3 text-[10px] uppercase font-bold tracking-wider text-white/40"
                onClick={() => {
                  setQuickAddColumnId(null);
                  setQuickAddValue('');
                }}
              >
                Cancel
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 text-white/20 hover:text-white"
              onClick={() => onTaskFullAdd?.(column.id)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Surface>
      ) : (
        <Button
          variant="ghost"
          className="mt-2 w-full justify-start gap-2 text-white/30 hover:text-white/60 hover:bg-white/[0.02] border border-dashed border-white/5 rounded-xl py-2 h-auto"
          onClick={() => handleSetQuickAdd(column.id, groupName)}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Add Task</span>
        </Button>
      )}
    </div>
  );
};

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
  onTaskDragStart,
  onTaskDragEnd,
  onTaskDrop,
  onTaskRemove,
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
  accentColor = 'cyan',
  pageSize = 10,
  columnHeight = 'calc(100vh - 120px)'
}: KanbanProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);
  const [quickAddColumnId, setQuickAddColumnId] = useState<string | null>(null);
  const [quickAddValue, setQuickAddValue] = useState('');
  const [sortConfig, setSortConfig] = useState<{ field: 'title' | 'priority' | 'dueDate', direction: 'asc' | 'desc' } | null>(null);

  // Initialize visible counts
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>(() => {
    const initialCounts: Record<string, number> = {};
    columns.forEach(col => {
      initialCounts[col.id] = pageSize;
    });
    return initialCounts;
  });

  // Horizontal Scroll State
  const boardRef = useRef<HTMLDivElement>(null);
  const [isDraggingBoard, setIsDraggingBoard] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleBoardMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking the board background or non-interactive areas
    if (draggedTaskId || draggedColumnId) return;
    
    const target = e.target as HTMLElement;
    const isDraggable = target.closest('[draggable="true"]');
    const isButton = target.closest('button');
    const isInput = target.closest('input, textarea, [contenteditable="true"]');
    
    if (isDraggable || isButton || isInput) return;

    setIsDraggingBoard(true);
    setStartX(e.pageX - (boardRef.current?.offsetLeft || 0));
    setScrollLeft(boardRef.current?.scrollLeft || 0);
  };

  const handleBoardMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingBoard || !boardRef.current) return;
    e.preventDefault();
    const x = e.pageX - boardRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    boardRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleBoardMouseUp = () => {
    setIsDraggingBoard(false);
  };

  // Update visible counts if columns or pageSize change
  useEffect(() => {
    setVisibleCounts(prev => {
      const next = { ...prev };
      columns.forEach(col => {
        if (next[col.id] === undefined) {
          next[col.id] = pageSize;
        }
      });
      return next;
    });
  }, [columns, pageSize]);

  const handleLoadMore = (columnId: string) => {
    setVisibleCounts(prev => ({
      ...prev,
      [columnId]: (prev[columnId] || pageSize) + pageSize
    }));
  };

  const touchTimer = useRef<any>(null);
  const lastTouchPos = useRef<{ x: number, y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent, id: string, type: 'task' | 'column') => {
    const touch = e.touches[0];
    if (!touch) return;
    lastTouchPos.current = { x: touch.clientX, y: touch.clientY };

    // Long press to start drag
    touchTimer.current = setTimeout(() => {
      if (type === 'task') {
        setDraggedTaskId(id);
      } else {
        setDraggedColumnId(id);
      }
      // Vibrate if supported
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedTaskId && !draggedColumnId) {
      clearTimeout(touchTimer.current);
      return;
    }

    e.preventDefault(); // Prevent scrolling while dragging
    const touch = e.touches[0];
    if (!touch) return;

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    // Find the closest column or task element
    const columnEl = element.closest('[data-column-id]');
    const taskEl = element.closest('[data-task-id]');

    if (columnEl) {
      const columnId = columnEl.getAttribute('data-column-id')!;
      const taskId = taskEl?.getAttribute('data-task-id') || undefined;
      
      // Simulate drag over
      const rect = columnEl.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      
      setDragOverColumnId(columnId);
      if (taskId) {
        setDragOverTaskId(taskId);
        setDropPosition(touch.clientY < midpoint ? 'top' : 'bottom');
      } else {
        setDragOverTaskId(null);
        setDropPosition(null);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    clearTimeout(touchTimer.current);
    
    if (draggedTaskId || draggedColumnId) {
      if (dragOverColumnId) {
        // Simulate drop
        handleDrop({ 
          preventDefault: () => {}, 
          dataTransfer: { getData: () => '' } 
        } as any, dragOverColumnId, dragOverTaskId || undefined);
      } else {
        handleDragEnd();
      }
    }
  };

  const tasksByGroupAndColumn = useMemo(() => {
    const groups: Record<string, Record<string, KanbanTask[]>> = {};
    
    // Apply sorting first
    let processedTasks = [...tasks];
    if (sortConfig) {
      processedTasks.sort((a, b) => {
        let valA: any = (a as any)[sortConfig.field] || '';
        let valB: any = (b as any)[sortConfig.field] || '';

        if (sortConfig.field === 'priority') {
          const priorityMap = { urgent: 4, high: 3, medium: 2, low: 1, neutral: 0 };
          valA = priorityMap[a.priority as keyof typeof priorityMap] || 0;
          valB = priorityMap[b.priority as keyof typeof priorityMap] || 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Initialize groups
    const groupValues = groupBy 
      ? Array.from(new Set(processedTasks.map(t => String((t as any)[groupBy] || 'Uncategorized'))))
      : ['default'];

    groupValues.forEach(group => {
      groups[group] = {};
      columns.forEach(col => {
        groups[group]![col.id] = [];
      });
    });

    processedTasks.forEach(task => {
      const group = groupBy ? String((task as any)[groupBy] || 'Uncategorized') : 'default';
      const colTasks = groups[group]?.[task.columnId];
      if (colTasks) {
        colTasks.push(task);
      }
    });

    return groups;
  }, [columns, tasks, groupBy, sortConfig]);

  const handleDragStart = (e: React.DragEvent, id: string, type: 'task' | 'column') => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);

    if (type === 'task') {
      e.dataTransfer.setData('taskId', id);
      onTaskDragStart?.(id);
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
    if (draggedTaskId) {
      onTaskDragEnd?.(draggedTaskId);
    }
    setDraggedTaskId(null);
    setDraggedColumnId(null);
    setDragOverColumnId(null);
    setDragOverTaskId(null);
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string, taskId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedColumnId) {
      setDragOverColumnId(columnId);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      setDropPosition(e.clientX < midpoint ? 'left' : 'right');
    } else {
      setDragOverColumnId(columnId);
      
      if (taskId) {
        setDragOverTaskId(taskId);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        setDropPosition(e.clientY < midpoint ? 'top' : 'bottom');
      } else if (e.target === e.currentTarget) {
        setDragOverTaskId(null);
        setDropPosition(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, toColumnId: string, toTaskId?: string) => {
    e.preventDefault();
    const taskId = draggedTaskId || e.dataTransfer.getData('taskId');
    const columnId = draggedColumnId || e.dataTransfer.getData('columnId');

    if (columnId && onColumnMove) {
      onColumnMove(columnId, toColumnId, dropPosition === 'right' ? 'right' : 'left');
    } else if (taskId && onTaskMove) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Multi-task move support
      const tasksToMove = selectedTaskIds.includes(taskId) 
        ? selectedTaskIds 
        : [taskId];

      // Move each task
      tasksToMove.forEach((id) => {
        const currentTask = tasks.find(t => t.id === id);
        const fromColumnId = currentTask?.columnId || '';
        onTaskMove(id, toColumnId, toTaskId, dropPosition === 'bottom' ? 'bottom' : 'top');
        onTaskDrop?.(id, fromColumnId, toColumnId, 0);
      });
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

  const handleTaskClickInternal = (e: React.MouseEvent, task: KanbanTask) => {
    if (selectable && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      const isSelected = selectedTaskIds.includes(task.id);
      const newSelection = isSelected
        ? selectedTaskIds.filter(id => id !== task.id)
        : [...selectedTaskIds, task.id];
      onTaskSelectionChange?.(newSelection);
    } else {
      onTaskClick?.(task);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string, columnId: string) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (draggedTaskId === taskId) {
        const taskIdToDrop = draggedTaskId;
        if (taskIdToDrop && onTaskMove) {
          onTaskMove(taskIdToDrop, columnId);
        }
        handleDragEnd();
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

      const columnTasks = tasksByGroupAndColumn[currentGroupName]?.[columnId] || [];

      if (e.key === 'ArrowRight' && colIndex < columns.length - 1) {
        onTaskMove?.(taskId, columns[colIndex + 1]!.id);
      } else if (e.key === 'ArrowLeft' && colIndex > 0) {
        onTaskMove?.(taskId, columns[colIndex - 1]!.id);
      } else if (e.key === 'ArrowDown' && taskIndex < columnTasks.length - 1) {
        const nextTask = columnTasks[taskIndex + 1];
        if (nextTask) onTaskMove?.(taskId, columnId, nextTask.id, 'bottom');
      } else if (e.key === 'ArrowUp' && taskIndex > 0) {
        const prevTask = columnTasks[taskIndex - 1];
        if (prevTask) onTaskMove?.(taskId, columnId, prevTask.id, 'top');
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
          "p-6 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 rounded-2xl",
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
    <div 
      ref={boardRef}
      onMouseDown={handleBoardMouseDown}
      onMouseMove={handleBoardMouseMove}
      onMouseUp={handleBoardMouseUp}
      onMouseLeave={handleBoardMouseUp}
      className={cn(
        "flex flex-col overflow-x-auto overflow-y-hidden pb-4 select-none board-scroll-container snap-x snap-mandatory scroll-smooth",
        isDraggingBoard ? "cursor-grabbing" : "cursor-grab",
        className
      )}
      style={{ height: typeof columnHeight === 'number' ? `${columnHeight}px` : columnHeight }}
    >
      {/* Column Headers (Sticky) */}
      <div className="flex sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 w-fit">
        {columns.map((column, idx) => {
          const columnTasks = tasks.filter(t => t.columnId === column.id);
          const isOverLimit = column.limit && columnTasks.length > column.limit;

          return (
            <div 
              key={column.id}
              className={cn(
                "flex-shrink-0 w-[480px] flex items-center justify-between px-8 py-6 group/header snap-start",
                showDividers && idx > 0 && "border-l border-white/10"
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, column.id, 'column')}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, column.id, 'column')}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="flex items-center gap-3 cursor-grab active:cursor-grabbing flex-1 min-w-0"
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                  style={{ backgroundColor: column.color || `var(--${accentColor}-500)` }} 
                />
                <Heading as="h4" className="text-sm font-bold uppercase tracking-[0.1em] text-white/90 truncate">
                  {column.title}
                </Heading>
                {showTaskCount && (
                  <Badge 
                    variant={isOverLimit ? "danger" : "neutral"} 
                    className={cn(
                      "ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold",
                      !isOverLimit && "bg-white/10 border-white/5 text-white/60"
                    )}
                  >
                    {columnTasks.length}{column.limit ? ` / ${column.limit}` : ''}
                  </Badge>
                )}
                {isOverLimit && (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover/header:opacity-100 transition-all duration-200">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-white/10 rounded-full text-white/40 hover:text-white"
                  onClick={() => handleSetQuickAdd(column.id)}
                >
                  <Plus className="h-4.5 w-4.5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 p-0 hover:bg-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors">
                    <MoreHorizontal className="h-4.5 w-4.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 p-1.5 shadow-2xl z-50 rounded-xl">
                    <div className="px-2 py-1.5 mb-1">
                      <Text className="text-[10px] font-bold uppercase tracking-widest text-white/30">Column Actions</Text>
                    </div>
                    
                    <DropdownMenuItem 
                      onClick={() => onColumnAction?.(column.id, 'settings')}
                      className="gap-2.5 text-xs text-white/70 hover:text-white hover:bg-white/5 rounded-lg py-2"
                    >
                      <Settings className="h-4 w-4" /> Column Settings
                    </DropdownMenuItem>

                    <div className="h-px bg-white/5 my-1.5" />
                    
                    <div className="px-2 py-1.5 mb-1">
                      <Text className="text-[10px] font-bold uppercase tracking-widest text-white/30">Sort Tasks</Text>
                    </div>

                    <DropdownMenuItem 
                      onClick={() => setSortConfig({ field: 'title', direction: sortConfig?.field === 'title' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                      className={cn(
                        "gap-2.5 text-xs hover:bg-white/5 rounded-lg py-2",
                        sortConfig?.field === 'title' ? "text-cyan-400 bg-cyan-500/5" : "text-white/70 hover:text-white"
                      )}
                    >
                      <SortAsc className="h-4 w-4" /> Sort by Title
                      {sortConfig?.field === 'title' && (
                        <span className="ml-auto text-[10px] uppercase font-bold opacity-50">{sortConfig.direction}</span>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => setSortConfig({ field: 'priority', direction: sortConfig?.field === 'priority' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
                      className={cn(
                        "gap-2.5 text-xs hover:bg-white/5 rounded-lg py-2",
                        sortConfig?.field === 'priority' ? "text-cyan-400 bg-cyan-500/5" : "text-white/70 hover:text-white"
                      )}
                    >
                      <ArrowUpDown className="h-4 w-4" /> Sort by Priority
                      {sortConfig?.field === 'priority' && (
                        <span className="ml-auto text-[10px] uppercase font-bold opacity-50">{sortConfig.direction}</span>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => setSortConfig({ field: 'dueDate', direction: sortConfig?.field === 'dueDate' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                      className={cn(
                        "gap-2.5 text-xs hover:bg-white/5 rounded-lg py-2",
                        sortConfig?.field === 'dueDate' ? "text-cyan-400 bg-cyan-500/5" : "text-white/70 hover:text-white"
                      )}
                    >
                      <CalendarDays className="h-4 w-4" /> Sort by Date
                      {sortConfig?.field === 'dueDate' && (
                        <span className="ml-auto text-[10px] uppercase font-bold opacity-50">{sortConfig.direction}</span>
                      )}
                    </DropdownMenuItem>

                    <div className="h-px bg-white/5 my-1.5" />

                    <DropdownMenuItem className="gap-2.5 text-xs text-white/70 hover:text-white hover:bg-white/5 rounded-lg py-2">
                      <Archive className="h-4 w-4" /> Archive All Tasks
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="gap-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg py-2">
                      <Trash2 className="h-4 w-4" /> Delete Column
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Swimlanes / Groups */}
      <div className="flex-1 min-h-0 overflow-y-auto w-fit">
        {Object.entries(tasksByGroupAndColumn).map(([groupName, columnMap]) => (
          <div key={groupName} className="flex flex-col h-full min-h-0">
            {groupBy && (
              <div className="sticky top-0 z-10 flex items-center gap-3 px-6 py-2 bg-[#0a0a0a]/60 backdrop-blur-sm border-b border-white/5">
                <Badge variant="neutral" className="bg-white/10 border-white/10 text-[10px] uppercase font-bold tracking-widest px-3">
                  {groupName}
                </Badge>
                <div className="h-px flex-1 bg-white/5" />
              </div>
            )}
            
            <div className="flex min-w-max h-full min-h-0">
              {columns.map((column, idx) => (
              <React.Fragment key={column.id}>
                {/* Column Ghost Placeholder LEFT */}
                {draggedColumnId && dragOverColumnId === column.id && dropPosition === 'left' && draggedColumnId !== column.id && (
                  <div className="flex-shrink-0 w-1 bg-cyan-500/50 mx-2 rounded-full animate-pulse" />
                )}

                <div 
                  key={column.id}
                  data-column-id={column.id}
                  className={cn(
                    "flex-shrink-0 w-[480px] flex flex-col gap-6 transition-all duration-300 p-4 rounded-[2rem] snap-start h-full min-h-0 overflow-hidden",
                    showDividers && idx > 0 && "border-l border-white/10",
                    draggedColumnId === column.id ? "opacity-20" : "opacity-100",
                    dragOverColumnId === column.id && draggedColumnId ? "bg-cyan-500/5" : "",
                    column.limit && (columnMap[column.id] || []).length > column.limit && "bg-red-500/[0.02] ring-1 ring-inset ring-red-500/20",
                    columnClassName
                  )}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <KanbanColumnContent 
                    column={column}
                    columnMap={columnMap}
                    groupName={groupName}
                    visibleCount={visibleCounts[column.id] || pageSize}
                    pageSize={pageSize}
                    columnHeight={columnHeight}
                    draggedTaskId={draggedTaskId}
                    draggedColumnId={draggedColumnId}
                    dragOverTaskId={dragOverTaskId}
                    dragOverColumnId={dragOverColumnId}
                    dropPosition={dropPosition}
                    quickAddColumnId={quickAddColumnId}
                    quickAddValue={quickAddValue}
                    selectedTaskIds={selectedTaskIds}
                    activeTimerTaskId={activeTimerTaskId}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    handleTouchStart={handleTouchStart}
                    handleTouchMove={handleTouchMove}
                    handleTouchEnd={handleTouchEnd}
                    handleKeyDown={handleKeyDown}
                    handleLoadMore={handleLoadMore}
                    handleSetQuickAdd={handleSetQuickAdd}
                    handleQuickAdd={handleQuickAdd}
                    setQuickAddValue={setQuickAddValue}
                    setQuickAddColumnId={setQuickAddColumnId}
                    onTaskClick={handleTaskClickInternal}
                    onTaskFullAdd={onTaskFullAdd}
                    TaskCard={TaskCard}
                  />
                </div>

                {/* Column Ghost Placeholder RIGHT */}
                {draggedColumnId && dragOverColumnId === column.id && dropPosition === 'right' && draggedColumnId !== column.id && (
                  <div className="flex-shrink-0 w-1 bg-cyan-500/50 mx-2 rounded-full animate-pulse" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
