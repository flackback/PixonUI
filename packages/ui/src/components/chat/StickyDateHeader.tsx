import React from 'react';
import { cn } from '../../utils/cn';
import { Calendar } from 'lucide-react';

interface StickyDateHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  date: string | Date;
  sticky?: boolean;
}

export function StickyDateHeader({ date, sticky = true, className, ...props }: StickyDateHeaderProps) {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const formattedDate = isNaN(dateObj.getTime()) 
    ? String(date) 
    : dateObj.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });

  return (
    <div 
      className={cn(
        "flex justify-center my-6 z-20",
        sticky && "sticky top-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100/90 dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/10 backdrop-blur-md shadow-sm dark:shadow-lg">
        <Calendar size={12} className="text-zinc-500 dark:text-white/40" />
        <span className="text-[11px] font-bold text-zinc-600 dark:text-white/60 tracking-wider uppercase">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}
