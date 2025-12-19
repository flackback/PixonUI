import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Surface } from '../../primitives/Surface';
import { Text } from '../typography/Text';
import { Button } from '../button/Button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { KanbanTask } from './Kanban';

interface KanbanCalendarViewProps {
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
      // Simple string matching for demo, in real app use proper date objects
      // Assuming dueDate is like "Dec 24" or ISO string
      const taskDate = new Date(task.dueDate);
      if (isNaN(taskDate.getTime())) {
        // Fallback for demo strings like "Dec 24"
        const currentYear = new Date().getFullYear();
        const d = new Date(`${task.dueDate} ${currentYear}`);
        return d.getDate() === date.getDate() && 
               d.getMonth() === date.getMonth() && 
               d.getFullYear() === date.getFullYear();
      }
      return taskDate.getDate() === date.getDate() && 
             taskDate.getMonth() === date.getMonth() && 
             taskDate.getFullYear() === date.getFullYear();
    });
  };

  return (
    <Surface className={cn("flex flex-col h-[700px] overflow-hidden", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex flex-col">
          <Text className="text-xl font-bold text-white">{monthNames[month]} {year}</Text>
          <Text className="text-xs text-white/40 uppercase tracking-widest font-bold">Monthly Schedule</Text>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center">
            <Text className="text-xs font-bold text-white/40 uppercase tracking-wider">{day}</Text>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="border-r border-b border-white/5 bg-white/[0.01]" />;
          
          const dateTasks = getTasksForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div 
              key={date.toISOString()} 
              className={cn(
                "group relative border-r border-b border-white/10 p-2 min-h-[100px] transition-colors hover:bg-white/[0.02]",
                isToday && "bg-cyan-500/[0.03]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                  isToday ? "bg-cyan-500 text-white" : "text-white/60 group-hover:text-white"
                )}>
                  {date.getDate()}
                </span>
                <button 
                  onClick={() => onAddTask?.(date)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-md transition-all text-white/40 hover:text-white"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-1">
                {dateTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className={cn(
                      "px-2 py-1 text-[10px] rounded-md border cursor-pointer transition-all truncate",
                      task.priority === 'urgent' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                      task.priority === 'high' ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                      task.priority === 'medium' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                      "bg-gray-500/10 border-gray-500/20 text-gray-400"
                    )}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
