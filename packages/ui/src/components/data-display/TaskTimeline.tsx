import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Users, 
  Percent, 
  Check, 
  Play, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter, 
  X, 
  Sparkles,
  Flag,
  Activity
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { 
  TimelineGroup, 
  TaskItem, 
  TaskStatus, 
  TaskPriority, 
  TimelineDragState 
} from '../../hooks/useTaskTimeline';
import { Surface } from '../../primitives/Surface';
import { Badge } from '../../primitives/Badge';
import { Avatar } from './Avatar';

// Mapping group colors to Tailwind gradient & text classes
const colorMap: Record<string, {
  border: string;
  bg: string;
  text: string;
  bar: string;
  gauge: string;
  lightBg: string;
}> = {
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-500',
    text: 'text-purple-500 dark:text-purple-400',
    bar: 'from-purple-500 to-indigo-500 shadow-purple-500/10',
    gauge: 'bg-purple-500/20',
    lightBg: 'bg-purple-500/5',
  },
  emerald: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-500',
    text: 'text-emerald-500 dark:text-emerald-400',
    bar: 'from-emerald-500 to-teal-500 shadow-emerald-500/10',
    gauge: 'bg-emerald-500/20',
    lightBg: 'bg-emerald-500/5',
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-500',
    text: 'text-blue-500 dark:text-blue-400',
    bar: 'from-blue-500 to-sky-500 shadow-blue-500/10',
    gauge: 'bg-blue-500/20',
    lightBg: 'bg-blue-500/5',
  },
  pink: {
    border: 'border-pink-500',
    bg: 'bg-pink-500',
    text: 'text-pink-500 dark:text-pink-400',
    bar: 'from-pink-500 to-rose-500 shadow-pink-500/10',
    gauge: 'bg-pink-500/20',
    lightBg: 'bg-pink-500/5',
  },
  amber: {
    border: 'border-amber-500',
    bg: 'bg-amber-500',
    text: 'text-amber-500 dark:text-amber-400',
    bar: 'from-amber-500 to-orange-500 shadow-amber-500/10',
    gauge: 'bg-amber-500/20',
    lightBg: 'bg-amber-500/5',
  },
};

const statusMeta: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pendente', color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/10', icon: <Clock className="h-3 w-3" /> },
  in_progress: { label: 'Executando', color: 'bg-blue-500/10 text-blue-500 border-blue-500/10', icon: <Play className="h-3 w-3" /> },
  completed: { label: 'Concluído', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10', icon: <Check className="h-3 w-3" /> },
  on_hold: { label: 'Pausado', color: 'bg-amber-500/10 text-amber-500 border-amber-500/10', icon: <AlertCircle className="h-3 w-3" /> },
};

export interface TimelineMilestone {
  day: number;
  label: string;
  color?: 'purple' | 'emerald' | 'blue' | 'rose' | 'amber';
}

const priorityOptions: { value: TaskPriority; label: string; bg?: string; text?: string }[] = [
  { value: 'low', label: 'Baixa', bg: 'bg-zinc-100 dark:bg-white/5', text: 'text-zinc-500' },
  { value: 'medium', label: 'Média', bg: 'bg-blue-500/10 dark:bg-blue-500/5', text: 'text-blue-500' },
  { value: 'high', label: 'Alta', bg: 'bg-amber-500/10 dark:bg-amber-500/5', text: 'text-amber-500' },
  { value: 'critical', label: 'Crítica', bg: 'bg-rose-500/10 dark:bg-rose-500/5', text: 'text-rose-500' },
];

const statusOptions: { value: TaskStatus; label: string; bg?: string; text?: string }[] = [
  { value: 'pending', label: 'Pendente', bg: 'bg-zinc-500/10', text: 'text-zinc-500' },
  { value: 'in_progress', label: 'Executando', bg: 'bg-blue-500/10', text: 'text-blue-500' },
  { value: 'completed', label: 'Concluído', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  { value: 'on_hold', label: 'Pausado', bg: 'bg-amber-500/10', text: 'text-amber-500' },
];

interface CustomDropdownSelectProps<T extends string> {
  value: T;
  onChange: (val: T) => void;
  options: { value: T; label: string; bg?: string; text?: string }[];
}

function CustomDropdownSelect<T extends string>({
  value,
  onChange,
  options,
}: CustomDropdownSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className="relative inline-block text-left z-30">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "text-[10px] bg-zinc-100/50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-lg py-1 px-1.5 font-bold focus:outline-none text-zinc-600 dark:text-zinc-300 transition-all duration-200 flex items-center gap-1 min-w-[85px] justify-between shadow-sm active:scale-95 hover:bg-zinc-200/50 dark:hover:bg-white/10",
          selectedOption?.bg,
          selectedOption?.text
        )}
      >
        <span className="truncate">{selectedOption?.label || value}</span>
        <ChevronDown className={cn("h-3 w-3 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-24 rounded-xl shadow-2xl bg-white dark:bg-zinc-950 border border-gray-100 dark:border-white/10 p-1 backdrop-blur-md z-40 animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left text-[10px] font-bold px-2 py-1.5 rounded-lg transition-all flex items-center justify-between",
                opt.value === value 
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" 
                  : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5"
              )}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Check className="h-3 w-3 text-purple-500 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export interface TaskTimelineProps {
  groups: TimelineGroup[];
  columnsCount?: number;
  columnHeaders?: string[]; // Column header labels (e.g. Day 1, Day 2, etc.)
  collapsedGroups?: Record<string, boolean>;
  dragState?: TimelineDragState | null;
  onToggleGroup: (groupId: string) => void;
  onAddTask: (groupId: string, task: Partial<Omit<TaskItem, 'id'>>) => void;
  onUpdateTask: (taskId: string, fields: Partial<Omit<TaskItem, 'id'>>) => void;
  onDeleteTask: (taskId: string) => void;
  onStartDrag: (
    taskId: string,
    groupId: string,
    type: 'move' | 'resize-start' | 'resize-end',
    clientX: number,
    currentStartCol: number,
    currentDuration: number
  ) => void;
  onUpdateDrag: (clientX: number, colWidth: number) => void;
  onEndDrag: () => void;
  className?: string;
  colWidth?: number; // Width of timeline columns in pixels
  workloadStats?: Record<string, number[]>; // Realtime assignee workload stats from hook
  milestones?: TimelineMilestone[]; // vertical milestone flags
}

export function TaskTimeline({
  groups,
  columnsCount = 14,
  columnHeaders,
  collapsedGroups = {},
  dragState = null,
  onToggleGroup,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onStartDrag,
  onUpdateDrag,
  onEndDrag,
  className,
  colWidth = 50,
  workloadStats = {},
  milestones = [],
}: TaskTimelineProps) {
  const rightGridRef = useRef<HTMLDivElement>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string | null>(null);
  const [isWorkloadOpen, setIsWorkloadOpen] = useState(true);

  const defaultHeaders = useMemo(() => 
    Array.from({ length: columnsCount }).map((_, i) => `D${i + 1}`),
    [columnsCount]
  );
  const headers = columnHeaders || defaultHeaders;

  // Extract all unique assignees present to draw filters & workload Heatmap
  const assigneesList = useMemo(() => {
    const list: { name: string; avatar?: string }[] = [];
    const seen = new Set<string>();
    groups.forEach((g) => {
      g.tasks.forEach((t) => {
        if (t.assignee && !seen.has(t.assignee.name)) {
          seen.add(t.assignee.name);
          list.push(t.assignee);
        }
      });
    });
    return list;
  }, [groups]);

  // Filter groups and tasks based on search bar and assignee filter
  const filteredGroups = useMemo(() => {
    return groups.map((group) => {
      const filteredTasks = group.tasks.filter((task) => {
        const matchesQuery = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAssignee = !selectedAssigneeFilter || task.assignee?.name === selectedAssigneeFilter;
        return matchesQuery && matchesAssignee;
      });

      return {
        ...group,
        tasks: filteredTasks,
      };
    });
  }, [groups, searchQuery, selectedAssigneeFilter]);

  // Global mousemove and mouseup listeners to support drag and drop operations
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      onUpdateDrag(e.clientX, colWidth);
    };

    const handlePointerUp = () => {
      onEndDrag();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, colWidth, onUpdateDrag, onEndDrag]);

  const handleCreateTaskInline = (groupId: string) => {
    // Find matching group to grab a color or dependency helper
    onAddTask(groupId, {
      title: 'Nova Atividade',
      status: 'pending',
      priority: 'medium',
      startCol: 2,
      duration: 3,
      progress: 0,
      dependencies: [],
    });
  };

  // ADVANCED: Dynamic SVG Coordinate calculator for drawing dependency arrows
  const dependencyLines = useMemo(() => {
    const lines: {
      fromId: string;
      toId: string;
      path: string;
      isConflict: boolean; // Child starts before parent ends
    }[] = [];

    // Map task coordinates deterministically
    const coordMap: Record<string, { y: number; xStart: number; xEnd: number }> = {};
    let currentTop = 0;

    filteredGroups.forEach((group) => {
      const headerHeight = 44; // h-11
      const isCollapsed = collapsedGroups[group.id];
      
      if (!isCollapsed) {
        group.tasks.forEach((task, idx) => {
          const taskTop = currentTop + headerHeight + idx * 48 + 10;
          const xStart = (task.startCol - 1) * colWidth;
          const xEnd = xStart + task.duration * colWidth;
          
          coordMap[task.id] = {
            y: taskTop + 14, // center of 28px height bar
            xStart,
            xEnd,
          };
        });
        currentTop += headerHeight + group.tasks.length * 48;
      } else {
        currentTop += headerHeight;
      }
    });

    // Draw lines
    groups.forEach((g) => {
      g.tasks.forEach((task) => {
        if (task.dependencies) {
          task.dependencies.forEach((parentTaskId) => {
            const parent = coordMap[parentTaskId];
            const child = coordMap[task.id];

            if (parent && child) {
              const startX = parent.xEnd;
              const startY = parent.y;
              const endX = child.xStart;
              const endY = child.y;

              const isConflict = child.xStart < parent.xEnd;

              // Generate beautiful bezier curve points
              const deltaX = endX - startX;
              const controlX1 = startX + Math.max(20, deltaX * 0.4);
              const controlX2 = startX + Math.max(20, deltaX * 0.6);

              // S-curve connector
              const path = `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`;

              lines.push({
                fromId: parentTaskId,
                toId: task.id,
                path,
                isConflict,
              });
            }
          });
        }
      });
    });

    return lines;
  }, [groups, filteredGroups, collapsedGroups, colWidth]);

  return (
    <div className={cn("w-full border border-gray-200 dark:border-white/5 bg-white dark:bg-black/20 rounded-3xl overflow-hidden flex flex-col", className)}>
      <style>{`
        @keyframes dependencyFlow {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .animate-dependency-flow {
          stroke-dasharray: 6, 4;
          animation: dependencyFlow 1.2s linear infinite;
        }
      `}</style>
      
      {/* 🔍 TOP ENTERPRISE TOOLBAR */}
      <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-zinc-50/40 dark:bg-zinc-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-20">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Text Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar tarefa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-1.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/60 focus:outline-none focus:ring-1 focus:ring-purple-500 w-[180px] sm:w-[220px]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Assignee filter bubble pills */}
          <div className="flex items-center gap-1 border-l border-gray-200 dark:border-white/5 pl-2.5 ml-1">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hidden md:inline">Membros:</span>
            {assigneesList.map((member) => (
              <button
                key={member.name}
                onClick={() => setSelectedAssigneeFilter(selectedAssigneeFilter === member.name ? null : member.name)}
                className={cn(
                  "p-0.5 rounded-full border transition-all",
                  selectedAssigneeFilter === member.name
                    ? "border-purple-500 ring-2 ring-purple-500/20 scale-105"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
                title={`Filtrar por ${member.name}`}
              >
                <Avatar src={member.avatar} alt={member.name} fallback={member.name[0]} size="xs" />
              </button>
            ))}
            {selectedAssigneeFilter && (
              <button 
                onClick={() => setSelectedAssigneeFilter(null)}
                className="text-[10px] text-purple-500 dark:text-purple-400 font-bold hover:underline pl-1.5 flex items-center gap-0.5"
              >
                Limpar <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Toggle buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWorkloadOpen(!isWorkloadOpen)}
            className={cn(
              "text-xs font-black px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5",
              isWorkloadOpen 
                ? "bg-purple-500/10 border-purple-500/20 text-purple-500" 
                : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
            )}
          >
            <Activity className="h-3.5 w-3.5" /> Workload Balancing
          </button>
          
          {(searchQuery || selectedAssigneeFilter) && (
            <Badge variant="shimmer" className="bg-purple-500 text-white font-black uppercase text-[9px] animate-pulse">
              Filtros Ativos
            </Badge>
          )}
        </div>
      </div>

      <div className={cn(
        "flex w-full overflow-x-auto select-none relative",
        "[&::-webkit-scrollbar]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/[0.08]",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-white/20",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar]:h-2",
        "[scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.15)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.08)_transparent]"
      )}>
        
        {/* ─── LEFT FROZEN TABLE COLUMN ─── */}
        <div className="flex-shrink-0 w-[420px] border-r border-gray-100 dark:border-white/5 bg-white dark:bg-zinc-950/40 z-10 flex flex-col">
          {/* Header Row */}
          <div className="h-12 flex items-center px-4 border-b border-gray-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 text-xs font-black uppercase tracking-wider text-zinc-400">
            <span>Atividades & Métricas</span>
          </div>

          {/* Group Content Channel Rows */}
          <div className="flex-1 flex flex-col">
            {filteredGroups.map((group) => {
              const isCollapsed = collapsedGroups[group.id];
              const styles = (colorMap[group.color] || colorMap['purple'])!;

              return (
                <div key={group.id} className="flex flex-col">
                  {/* Group header bar */}
                  <div className="h-11 flex items-center justify-between px-4 border-b border-gray-100 dark:border-white/5 bg-zinc-50/20 dark:bg-white/[0.01]">
                    <button 
                      onClick={() => onToggleGroup(group.id)}
                      className="flex items-center gap-2 text-xs font-black focus:outline-none"
                    >
                      <div className={cn("w-2.5 h-2.5 rounded-full", styles.bg)} />
                      <span className={cn("capitalize tracking-tight text-zinc-700 dark:text-zinc-200", styles.text)}>{group.name}</span>
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-400" />
                      )}
                    </button>
                    
                    <button 
                      onClick={() => handleCreateTaskInline(group.id)}
                      className="h-6 w-6 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200/50 dark:hover:bg-white/10 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Tasks rows inside group */}
                  {!isCollapsed && (
                    <div className="flex flex-col">
                      {group.tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className={cn(
                            "h-12 flex items-center border-b border-gray-100 dark:border-white/5 px-4 justify-between transition-colors hover:bg-zinc-50/50 dark:hover:bg-white/[0.01]",
                            dragState?.taskId === task.id ? "bg-zinc-50 dark:bg-white/[0.02]" : ""
                          )}
                        >
                          {/* Title input field */}
                          <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                            <input
                              value={task.title}
                              onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
                              className="bg-transparent border-none text-xs font-extrabold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-0 truncate flex-1 min-w-0"
                            />
                          </div>

                           <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Priority option */}
                            <CustomDropdownSelect
                              value={task.priority}
                              onChange={(val) => onUpdateTask(task.id, { priority: val as TaskPriority })}
                              options={priorityOptions}
                            />

                            {/* Status Option */}
                            <CustomDropdownSelect
                              value={task.status}
                              onChange={(val) => onUpdateTask(task.id, { status: val as TaskStatus })}
                              options={statusOptions}
                            />

                            {/* Delete Button */}
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="text-zinc-400 hover:text-rose-500 h-7 w-7 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ─── WORKLOAD ASSIGNMENT NAMES (IF HEATMAP IS OPEN) ─── */}
          {isWorkloadOpen && assigneesList.length > 0 && (
            <div className="border-t-2 border-dashed border-gray-100 dark:border-white/5 bg-zinc-50/20 dark:bg-black/30 flex flex-col pt-2">
              <div className="h-9 px-4 flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <Users className="h-3.5 w-3.5 text-purple-500" /> Balanço de Recursos
              </div>
              {assigneesList.map((member) => (
                <div key={member.name} className="h-10 px-4 flex items-center gap-2.5 border-b border-gray-100/40 dark:border-white/[0.02]">
                  <Avatar src={member.avatar} alt={member.name} fallback={member.name[0]} size="xs" />
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 truncate">{member.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* ─── RIGHT TIMELINE CALENDAR CANVAS ─── */}
        <div 
          ref={rightGridRef}
          className="flex-1 min-w-[700px] bg-zinc-50/30 dark:bg-black/10 flex flex-col relative overflow-hidden"
        >
          {/* Timeline header row */}
          <div 
            className="h-12 flex border-b border-gray-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 items-center select-none"
            style={{ display: 'grid', gridTemplateColumns: `repeat(${columnsCount}, ${colWidth}px)` }}
          >
            {headers.map((hdr, idx) => (
              <div 
                key={idx} 
                className="text-center text-[10px] font-black text-zinc-400 border-r border-gray-100/30 dark:border-white/[0.02]"
              >
                {hdr}
              </div>
            ))}
          </div>

          {/* Group Channels & Interactive Bars Area */}
          <div className="flex-1 flex flex-col relative min-h-[160px]">
            
            {/* Grid helper column background stripes */}
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex" style={{ display: 'grid', gridTemplateColumns: `repeat(${columnsCount}, ${colWidth}px)` }}>
              {Array.from({ length: columnsCount }).map((_, i) => (
                <div key={i} className="h-full border-r border-gray-100/40 dark:border-white/[0.02]" />
              ))}
            </div>

            {/* 🚩 VERTICAL MILESTONES DASHED LINES OVERLAY */}
            {milestones.map((ms, idx) => {
              if (ms.day < 1 || ms.day > columnsCount) return null;
              const xPos = (ms.day - 1) * colWidth + colWidth / 2;
              return (
                <div 
                  key={idx} 
                  className="absolute inset-y-0 z-20 pointer-events-none flex flex-col items-center"
                  style={{ left: `${xPos}px` }}
                >
                  {/* Floating Flag Tag */}
                  <div className="absolute -top-1 px-1.5 py-0.5 rounded bg-rose-500 text-white font-black text-[8px] uppercase tracking-widest flex items-center gap-0.5 shadow-md -translate-x-1/2">
                    <Flag className="h-2 w-2" /> {ms.label}
                  </div>
                  {/* Dashed vertical neon guide line */}
                  <div className="w-[1.5px] h-full border-l-2 border-dashed border-rose-500/40 dark:border-rose-500/20" />
                </div>
              );
            })}

            {/* 🔗 ENTERPRISE SVG CANVAS FOR TASK DEPENDENCIES BEZIER CURVES */}
            {dependencyLines.length > 0 && (
              <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible">
                <defs>
                  {/* Arrow marker */}
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="currentColor" />
                  </marker>
                </defs>
                {dependencyLines.map((line, idx) => (
                  <path
                    key={idx}
                    d={line.path}
                    fill="none"
                    stroke={line.isConflict ? '#f43f5e' : '#a78bfa'}
                    strokeWidth={line.isConflict ? '2' : '1.5'}
                    strokeDasharray={line.isConflict ? '4,4' : undefined}
                    className={cn(
                      "transition-all duration-300",
                      line.isConflict ? "text-rose-500" : "text-purple-400 dark:text-purple-500/40 animate-dependency-flow"
                    )}
                    markerEnd="url(#arrow)"
                    opacity={dragState ? 0.2 : 0.8}
                  />
                ))}
              </svg>
            )}

            <div className="relative flex-1 flex flex-col">
              {filteredGroups.map((group) => {
                const isCollapsed = collapsedGroups[group.id];
                const styles = (colorMap[group.color] || colorMap['purple'])!;

                return (
                  <div key={group.id} className="flex flex-col relative">
                    {/* Header blank offset channel row */}
                    <div className="h-11 border-b border-gray-100 dark:border-white/5 bg-zinc-50/10 dark:bg-white/[0.005]" />

                    {/* Timeline rows */}
                    {!isCollapsed && (
                      <div className="flex flex-col relative">
                        {group.tasks.map((task) => (
                          <div 
                            key={task.id}
                            className={cn(
                              "h-12 border-b border-gray-100 dark:border-white/5 relative items-center flex transition-colors",
                              dragState?.taskId === task.id ? "bg-zinc-50/50 dark:bg-white/[0.015]" : ""
                            )}
                      onMouseEnter={() => setHoveredTask(task.id)}
                            onMouseLeave={() => setHoveredTask(null)}
                          >
                            
                            {/* Horizontal Task Bar Pill */}
                             <div
                               className={cn(
                                 "absolute h-8 rounded-xl border flex items-center px-3 justify-between shadow-sm z-10",
                                 dragState?.taskId === task.id 
                                   ? "cursor-grabbing shadow-lg scale-[1.01] ring-1 ring-white/10 select-none" 
                                   : "cursor-grab transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md",
                                 statusMeta[task.status].color
                               )}
                              style={{
                                left: `${(task.startCol - 1) * colWidth + 4}px`,
                                width: `${task.duration * colWidth - 8}px`,
                              }}
                              onPointerDown={(e) => {
                                if (e.button !== 0) return;
                                e.currentTarget.setPointerCapture(e.pointerId);
                                onStartDrag(task.id, group.id, 'move', e.clientX, task.startCol, task.duration);
                              }}
                            >
                              {/* Left edge resize handle */}
                              <div
                                className="absolute left-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-zinc-400/20 active:bg-zinc-400/40 transition-colors rounded-l-xl z-20"
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  e.currentTarget.setPointerCapture(e.pointerId);
                                  onStartDrag(task.id, group.id, 'resize-start', e.clientX, task.startCol, task.duration);
                                }}
                              />

                              {/* Inside-pill progress gauge background */}
                              <div 
                                className={cn("absolute inset-y-0 left-0 transition-all rounded-l-xl z-0", styles.gauge)}
                                style={{ 
                                  width: `${task.progress}%`,
                                  borderRadius: task.progress >= 98 ? '11px' : '11px 0 0 11px'
                                }}
                              />

                              {/* Pill labels */}
                              <div className="relative z-10 flex items-center justify-between w-full min-w-0">
                                <span className="text-[10px] font-black truncate pr-2">
                                  {task.progress}%
                                </span>
                                
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {task.assignee && (
                                    <Avatar 
                                      src={task.assignee.avatar} 
                                      alt={task.assignee.name} 
                                      fallback={task.assignee.name.substring(0, 1)}
                                      size="xs" 
                                      className="border border-white/20"
                                    />
                                  )}
                                  <div className="p-0.5 rounded bg-white/20 dark:bg-black/30 backdrop-blur-md">
                                    {statusMeta[task.status].icon}
                                  </div>
                                </div>
                              </div>

                              {/* Right edge resize handle */}
                              <div
                                className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-zinc-400/20 active:bg-zinc-400/40 transition-colors rounded-r-xl z-20"
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  e.currentTarget.setPointerCapture(e.pointerId);
                                  onStartDrag(task.id, group.id, 'resize-end', e.clientX, task.startCol, task.duration);
                                }}
                              />

                              {/* Tooltip Hover popup card */}
                              {hoveredTask === task.id && !dragState && (
                                <Surface className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3.5 bg-zinc-950/95 text-white rounded-2xl text-xs flex flex-col gap-1.5 border border-white/10 shadow-2xl backdrop-blur-md w-[220px] z-30">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-extrabold block truncate text-purple-300">{task.title}</span>
                                    {task.dependencies && task.dependencies.length > 0 && (
                                      <Badge variant="shimmer" className="bg-purple-500/20 text-purple-300 text-[8px] font-black tracking-widest border border-purple-500/30 shrink-0">
                                        LINKED
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                    <span>Início: Dia {task.startCol}</span>
                                    <span>Duração: {task.duration} dias</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1.5 border-t border-white/5 pt-1.5">
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3 text-cyan-400" />
                                      {task.assignee?.name || 'Não atribuído'}
                                    </span>
                                    <span className="font-extrabold text-emerald-400 flex items-center gap-0.5">
                                      <Percent className="h-3 w-3" /> {task.progress}%
                                    </span>
                                  </div>
                                </Surface>
                              )}

                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── WORKLOAD HEATMAP GRID ROWS (IF IS WORKLOAD HEATMAP OPEN) ─── */}
          {isWorkloadOpen && assigneesList.length > 0 && (
            <div className="border-t-2 border-dashed border-gray-100 dark:border-white/5 bg-zinc-50/20 dark:bg-black/30 flex flex-col pt-11 select-none relative">
              {assigneesList.map((member) => {
                const allocations = workloadStats[member.name] || Array(columnsCount).fill(0);

                return (
                  <div 
                    key={member.name} 
                    className="h-10 flex border-b border-gray-100/40 dark:border-white/[0.02] items-center relative"
                    style={{ display: 'grid', gridTemplateColumns: `repeat(${columnsCount}, ${colWidth}px)` }}
                  >
                    {allocations.map((allocVal, dayIdx) => {
                      // Workload status visual indicators mapping
                      let styleClasses = "border border-gray-200 dark:border-white/[0.01] text-zinc-400 dark:text-zinc-500";
                      let tooltipLabel = "Sem Alocações";

                      if (allocVal === 1) {
                        styleClasses = "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold";
                        tooltipLabel = "1 Atividade (Ideal)";
                      } else if (allocVal === 2) {
                        styleClasses = "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400 font-extrabold";
                        tooltipLabel = "2 Atividades (Atenção)";
                      } else if (allocVal >= 3) {
                        styleClasses = "bg-rose-500/20 border-rose-500/35 text-rose-700 dark:text-rose-400 font-black animate-pulse";
                        tooltipLabel = `${allocVal} Atividades (Sobrecarga!)`;
                      }

                      return (
                        <div 
                          key={dayIdx}
                          className={cn(
                            "h-7 w-10 mx-auto rounded-lg flex items-center justify-center text-[10px] cursor-help transition-all hover:scale-105",
                            styleClasses
                          )}
                          title={`${member.name} | Dia ${dayIdx + 1}: ${tooltipLabel}`}
                        >
                          {allocVal || '-'}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
