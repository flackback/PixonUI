import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarProps {
  className?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function Calendar({ className, value, onChange, minDate, maxDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(value || new Date());
  const [viewDate, setViewDate] = useState(value || new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (onChange) {
      onChange(newDate);
    }
    setCurrentDate(newDate);
  };

  const isSelected = (day: number) => {
    return value && 
      value.getDate() === day &&
      value.getMonth() === viewDate.getMonth() &&
      value.getFullYear() === viewDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear();
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const selected = isSelected(day);
      const today = isToday(day);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          type="button"
          className={cn(
            "h-9 w-9 rounded-xl text-sm font-medium transition-all duration-200",
            "hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-white/20",
            selected && "bg-gray-900 text-white dark:bg-white dark:text-black shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:bg-gray-800 dark:hover:bg-white/90",
            !selected && today && "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10",
            !selected && !today && "text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={cn("p-4 bg-white dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl w-fit", className)}>
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="font-semibold text-gray-900 dark:text-white">
          {MONTHS[viewDate.getMonth()]} <span className="text-gray-500 dark:text-white/50">{viewDate.getFullYear()}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            type="button"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNextMonth}
            type="button"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {DAYS.map(day => (
          <div key={day} className="h-9 w-9 flex items-center justify-center text-xs font-medium text-gray-400 dark:text-white/40">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
}
