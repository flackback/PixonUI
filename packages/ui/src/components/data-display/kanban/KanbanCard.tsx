import React, { useState, useRef, useEffect } from 'react';
import { Lock, Trash2, GripVertical, MessageSquare, Paperclip, Clock, Play, Pause, CheckSquare } from 'lucide-react';
import { Surface } from '../../../primitives/Surface';
import { Badge } from '../../../primitives/Badge';
import { Text } from '../../typography/Text';
import { Checkbox } from '../../form/Checkbox';
import { cn } from '../../../utils/cn';
import type { KanbanTask } from './types';
import { PixonMotion } from '../../effects/Animate';

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
  spotlight?: boolean;
  spotlightColor?: string;
  spotlightSize?: number;
  isDragOver?: boolean;
  dropPosition?: 'top' | 'bottom' | null;
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
  isDragged,
  spotlight = true,
  spotlightColor,
  spotlightSize = 400,
  isDragOver,
  dropPosition
}: KanbanCardProps) => {
  if (renderCard) return <>{renderCard(task)}</>;

  const [isHovered, setIsHovered] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const cachedRect = useRef<DOMRect | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      cachedRect.current = cardRef.current.getBoundingClientRect();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !spotlight || !cachedRect.current) return;
    const rect = cachedRect.current;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--spotlight-x', `${x}px`);
    cardRef.current.style.setProperty('--spotlight-y', `${y}px`);
  };

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

   const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Exclude interactive elements so clicking buttons, links, timers or text fields works flawlessly
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('select') ||
      target.closest('[role="button"]') ||
      target.classList.contains('cursor-pointer')
    ) {
      return;
    }
    
    // Only left click triggers dragging
    if (e.button !== 0) return;

    // Prevent propagation and default actions so board scrolling and native column dragging are not triggered
    e.stopPropagation();
    e.preventDefault();

    const cardEl = e.currentTarget;
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Get exact offsets relative to card container
    const rect = cardEl.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // Create the premium glass drag ghost
    const ghost = document.createElement('div');
    ghost.id = 'pixon-drag-ghost';
    ghost.className = cn(
      "fixed pointer-events-none z-[9999] rounded-2xl p-6 border flex flex-col justify-between transition-transform duration-100 ease-out",
      isDarkMode 
        ? "bg-zinc-950/90 border-white/10 text-white shadow-xl" 
        : "bg-white/90 border-zinc-200 text-zinc-900 shadow-xl",
      cardClassName
    );
    
    // Apply heavy dropdown-like premium blur, dimensions and content
    ghost.style.backdropFilter = 'blur(24px)';
    (ghost.style as any).webkitBackdropFilter = 'blur(24px)';
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.innerHTML = cardEl.innerHTML;
    
    // Initial position matching pointer
    ghost.style.left = `${e.clientX - offsetX}px`;
    ghost.style.top = `${e.clientY - offsetY}px`;
    ghost.style.transform = 'scale(1.01)';
    ghost.style.opacity = '0.98';

    document.body.appendChild(ghost);

    // Call state-updater in KanbanBoard through onDragStart prop
    onDragStart?.({
      dataTransfer: { setData: () => {}, effectAllowed: 'move' }
    } as any);

    cardEl.classList.add('is-being-dragged-snapshot');
    document.body.classList.add('is-dragging-task');

    const handlePointerMove = (moveEvent: PointerEvent) => {
      ghost.style.left = `${moveEvent.clientX - offsetX}px`;
      ghost.style.top = `${moveEvent.clientY - offsetY}px`;

      // Collision checking using elementFromPoint!
      // Temporarily hide the ghost to avoid hitting it directly if there's any lag
      ghost.style.visibility = 'hidden';
      const hoverEl = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      ghost.style.visibility = 'visible';

      if (!hoverEl) return;

      const colEl = hoverEl.closest('[data-column-id]');
      const tEl = hoverEl.closest('[data-task-id]');
      const targetEl = tEl || colEl;

      if (targetEl) {
        // Dispatch standard dragover Event that bubbles up so React catches it on target column/card
        const mockDragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
        Object.defineProperties(mockDragOverEvent, {
          clientX: { value: moveEvent.clientX },
          clientY: { value: moveEvent.clientY },
          pageX: { value: moveEvent.pageX },
          pageY: { value: moveEvent.pageY },
          preventDefault: { value: () => {} },
          dataTransfer: {
            value: {
              dropEffect: 'move',
              effectAllowed: 'move',
              getData: (key: string) => (key === 'taskId' ? task.id : '')
            }
          },
          currentTarget: { value: targetEl }
        });
        targetEl.dispatchEvent(mockDragOverEvent);
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      ghost.remove();
      cardEl.classList.remove('is-being-dragged-snapshot');
      document.body.classList.remove('is-dragging-task');

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      // Find the element under the pointer on release to dispatch drop!
      ghost.style.visibility = 'hidden';
      const hoverEl = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      ghost.style.visibility = 'visible';

      const colEl = hoverEl?.closest('[data-column-id]');
      const tEl = hoverEl?.closest('[data-task-id]');
      const targetEl = tEl || colEl || cardEl.closest('[data-column-id]');

      if (targetEl) {
        // Dispatch standard drop Event on the target element!
        const mockDropEvent = new Event('drop', { bubbles: true, cancelable: true });
        Object.defineProperties(mockDropEvent, {
          clientX: { value: upEvent.clientX },
          clientY: { value: upEvent.clientY },
          preventDefault: { value: () => {} },
          dataTransfer: {
            value: {
              getData: (key: string) => (key === 'taskId' ? task.id : '')
            }
          },
          currentTarget: { value: targetEl }
        });
        targetEl.dispatchEvent(mockDropEvent);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const cardContent = (
    <PixonMotion 
      as={Surface as any}
      layoutId={task.id}
      layout="position"
      data-task-id={task.id}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        setIsHovered(false);
        cachedRect.current = null;
      }}
      onClick={(e: React.MouseEvent) => onTaskClick?.(e, task)}
      draggable={false}
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'none' }}
      className={cn(
        "relative overflow-hidden p-6 rounded-2xl transition-all duration-300 h-full w-full group",
        isDragged ? (
          "opacity-45 bg-white/20 dark:bg-white/[0.01] backdrop-blur-md border border-dashed border-cyan-500/50 shadow-sm pointer-events-none select-none z-0"
        ) : (
          cn(
            "border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-sm hover:shadow-lg hover:border-cyan-500/30 dark:hover:border-cyan-500/30 cursor-grab active:cursor-grabbing",
            task.blockedBy && task.blockedBy.length > 0 ? "border-red-500/30 bg-red-500/[0.02] hover:border-red-500/50" : "hover:bg-white/80 dark:hover:bg-white/[0.05]",
            isSelected && "ring-2 ring-cyan-500/50 bg-cyan-500/[0.02]",
            hasSpinningBorder && "border-transparent dark:border-transparent bg-white/95 dark:bg-[#0f172a]/95"
          )
        ),
        cardClassName
      )}
    >
      {isDragOver && dropPosition === 'top' && (
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-cyan-500 via-cyan-400 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.8)] rounded-full z-50 animate-in fade-in duration-200">
          <span className="absolute -left-1 -top-[3px] h-2.5 w-2.5 rounded-full bg-cyan-400 border-2 border-white dark:border-zinc-950 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        </div>
      )}
      {isDragOver && dropPosition === 'bottom' && (
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-gradient-to-r from-cyan-500 via-cyan-400 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.8)] rounded-full z-50 animate-in fade-in duration-200">
          <span className="absolute -left-1 -top-[3px] h-2.5 w-2.5 rounded-full bg-cyan-400 border-2 border-white dark:border-zinc-950 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        </div>
      )}
      {spotlight && !isDragged && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 ease-in-out"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(${spotlightSize}px circle at var(--spotlight-x, 0px) var(--spotlight-y, 0px), ${
              spotlightColor || (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)')
            }, transparent 80%)`,
          }}
        />
      )}
      <div className={cn("relative z-10 flex flex-col gap-3 transition-all duration-300", isDragged && "opacity-0 select-none pointer-events-none")}>
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
    </PixonMotion>
  );

  const cardWithSpacer = (
    <div className="flex flex-col gap-3 transition-all duration-300">
      {/* Dynamic top spacer to physically open space for incoming card */}
      {isDragOver && dropPosition === 'top' && (
        <div 
          className="w-full rounded-2xl border-2 border-dashed border-cyan-500/30 dark:border-cyan-500/20 bg-cyan-500/[0.02] flex items-center justify-center animate-in fade-in slide-in-from-top-3 duration-300 overflow-hidden"
          style={{ height: '110px' }}
        >
          <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-500/60 uppercase tracking-wider animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Soltar Card Aqui</span>
          </div>
        </div>
      )}

      {/* Actual Kanban Card Content */}
      {hasSpinningBorder ? (
        <div className="relative p-[2px] rounded-2xl overflow-hidden group/spinning hover:shadow-xl dark:hover:shadow-cyan-500/10 transition-all duration-300">
          <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#06b6d4_0%,#3b82f6_25%,#f43f5e_50%,#3b82f6_75%,#06b6d4_100%)] opacity-80 group-hover/spinning:opacity-100 transition-opacity duration-300" />
          <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-white dark:bg-[#0f172a] z-10">
            {cardContent}
          </div>
        </div>
      ) : (
        cardContent
      )}

      {/* Dynamic bottom spacer to physically open space for incoming card */}
      {isDragOver && dropPosition === 'bottom' && (
        <div 
          className="w-full rounded-2xl border-2 border-dashed border-cyan-500/30 dark:border-cyan-500/20 bg-cyan-500/[0.02] flex items-center justify-center animate-in fade-in slide-in-from-bottom-3 duration-300 overflow-hidden"
          style={{ height: '110px' }}
        >
          <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-500/60 uppercase tracking-wider animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Soltar Card Aqui</span>
          </div>
        </div>
      )}
    </div>
  );

  return cardWithSpacer;
});

KanbanCard.displayName = 'KanbanCard';
