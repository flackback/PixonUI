import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/Popover';
import { Calendar } from '../data-display/Calendar';
import { cn } from '../../utils/cn';
import { Calendar as CalendarIcon } from 'lucide-react';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (newDate: Date) => {
    setDate(newDate);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        onMouseMove={handleMouseMove}
        className={cn(
          "group relative flex h-11 w-full items-center justify-between rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-4 py-2 text-sm text-gray-900 dark:text-white transition-all duration-200 overflow-hidden",
          "hover:bg-gray-100 dark:hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-white/15",
          !date && "text-gray-400 dark:text-white/40",
          className
        )}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
             style={{
               background: `radial-gradient(600px circle at var(--x) var(--y), rgba(255,255,255,0.06), transparent 40%)`
             }}
        />
        <span className="relative z-10">{date ? formatDate(date) : placeholder}</span>
        <CalendarIcon className="relative z-10 h-4 w-4 text-white/40" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="start">
        <Calendar
          value={date}
          onChange={handleSelect}
          className="shadow-2xl shadow-black/50"
        />
      </PopoverContent>
    </Popover>
  );
}
