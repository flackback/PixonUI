import React, { useState } from 'react';
import { cn } from '../../../utils/cn';
import { Surface } from '../../../primitives/Surface';
import { Text } from '../../typography/Text';
import { Button } from '../../button/Button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { KanbanTask } from './types';

export interface KanbanCalendarViewProps {
  tasks: KanbanTask[];
  onTaskClick?: (task: KanbanTask) => void;
  onAddTask?: (date: Date) => void;
  className?: string;
}

export function KanbanCalendarView({ 
  tasks, 
  onTaskClick, 
  onAddTask,
  className 
}: KanbanCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = [];
  // Add empty slots for previous month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  // Add days of current month
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const d = new Date(task.dueDate);
      return d.getDate() === date.getDate() && 
             d.getMonth() === date.getMonth() && 
             d.getFullYear() === date.getFullYear();
    });
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Heading level={3} className="text-white">{monthNames[month]} {year}</Heading>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
          Today
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden flex-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="bg-white/[0.02] p-3 text-center">
            <Text size="xs" className="text-white/40 font-medium uppercase tracking-wider">{day}</Text>
          </div>
        ))}

        {days.map((date, i) => (
          <div 
            key={i} 
            className={cn(
              "bg-gray-900/50 min-h-[120px] p-2 group transition-colors hover:bg-white/[0.02]",
              !date && "bg-transparent"
            )}
          >
            {date && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    date.toDateString() === new Date().toDateString() 
                      ? "bg-blue-500 text-white" 
                      : "text-white/40"
                  )}>
                    {date.getDate()}
                  </span>
                  <button 
                    onClick={() => onAddTask?.(date)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Plus className="h-3 w-3 text-white/40" />
                  </button>
                </div>
                <div className="space-y-1">
                  {getTasksForDate(date).map(task => (
                    <div 
                      key={task.id}
                      onClick={() => onTaskClick?.(task)}
                      className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-all"
                    >
                      <Text size="xs" className="text-blue-400 truncate">{task.title}</Text>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Heading({ children, level, className }: { children: React.ReactNode, level: number, className?: string }) {
  const Tag = `h${level}` as any;
  return <Tag className={cn("font-semibold", className)}>{children}</Tag>;
}
