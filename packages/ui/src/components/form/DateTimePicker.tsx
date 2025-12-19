import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/Popover';
import { Calendar } from '../data-display/Calendar';
import { ScrollArea } from '../data-display/ScrollArea';
import { cn } from '../../utils/cn';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({ value, onChange, placeholder = "Pick date & time", className }: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value);
  const [isOpen, setIsOpen] = useState(false);
  
  // Time state
  const [hours, setHours] = useState(value ? value.getHours() : 12);
  const [minutes, setMinutes] = useState(value ? value.getMinutes() : 0);

  useEffect(() => {
    if (value) {
      setDate(value);
      setHours(value.getHours());
      setMinutes(value.getMinutes());
    }
  }, [value]);

  const handleDateSelect = (newDate: Date) => {
    const updatedDate = new Date(newDate);
    updatedDate.setHours(hours);
    updatedDate.setMinutes(minutes);
    setDate(updatedDate);
    onChange?.(updatedDate);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', val: string) => {
    let num = parseInt(val, 10);
    if (isNaN(num)) return;

    let newHours = hours;
    let newMinutes = minutes;

    if (type === 'hours') {
      num = Math.max(0, Math.min(23, num));
      setHours(num);
      newHours = num;
    } else {
      num = Math.max(0, Math.min(59, num));
      setMinutes(num);
      newMinutes = num;
    }

    const baseDate = date || new Date();
    const updatedDate = new Date(baseDate);
    updatedDate.setHours(newHours);
    updatedDate.setMinutes(newMinutes);
    setDate(updatedDate);
    onChange?.(updatedDate);
  };

  const formatDateTime = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
               background: `radial-gradient(600px circle at var(--x) var(--y), rgba(0,0,0,0.06), transparent 40%)`
             }}
        />
        <span className="relative z-10">{date ? formatDateTime(date) : placeholder}</span>
        <div className="flex items-center gap-2 text-gray-400 dark:text-white/40">
          <CalendarIcon className="h-4 w-4" />
          <Clock className="h-4 w-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="start">
        <div className="flex flex-col rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-xl shadow-2xl dark:shadow-black/50">
          <div className="flex">
            <div className="p-4 border-r border-gray-200 dark:border-white/10">
              <Calendar
                value={date}
                onChange={handleDateSelect}
                className="border-0 p-0 bg-transparent backdrop-blur-none shadow-none rounded-none"
              />
            </div>
            
            <div className="flex flex-col p-4 w-[160px] h-[340px]">
              <div className="mb-3 text-sm font-medium text-gray-700 dark:text-white/70">Time</div>
              <div className="flex flex-1 gap-2 min-h-0 overflow-hidden">
                <ScrollArea className="flex-1 flex flex-col gap-1" scrollbarSize="sm">
                  <div className="text-xs text-gray-400 dark:text-white/40 text-center mb-1 sticky top-0 bg-white dark:bg-[#0A0A0A] py-1 z-10">Hr</div>
                  <div className="flex flex-col gap-1">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleTimeChange('hours', i.toString())}
                        className={cn(
                          "w-full rounded-lg px-1 py-1.5 text-sm transition-colors text-center shrink-0",
                          hours === i 
                            ? "bg-emerald-500 dark:bg-emerald-600/80 text-white font-medium" 
                            : "text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        {i.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
                <div className="w-[1px] bg-gray-200 dark:bg-white/10" />
                <ScrollArea className="flex-1 flex flex-col gap-1" scrollbarSize="sm">
                  <div className="text-xs text-gray-400 dark:text-white/40 text-center mb-1 sticky top-0 bg-white dark:bg-[#0A0A0A] py-1 z-10">Min</div>
                  <div className="flex flex-col gap-1">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleTimeChange('minutes', i.toString())}
                        className={cn(
                          "w-full rounded-lg px-1 py-1.5 text-sm transition-colors text-center shrink-0",
                          minutes === i 
                            ? "bg-emerald-500 dark:bg-emerald-600/80 text-white font-medium" 
                            : "text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        {i.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
