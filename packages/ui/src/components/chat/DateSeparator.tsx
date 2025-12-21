import React from 'react';
import { cn } from '../../utils/cn';
import { Calendar } from 'lucide-react';

interface DateSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  date: string;
}

export function DateSeparator({ date, className, ...props }: DateSeparatorProps) {
  return (
    <div className={cn("flex justify-center sticky top-0 z-10 py-4", className)} {...props}>
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100/80 dark:bg-white/5 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-white/40 border border-gray-200 dark:border-white/10 shadow-sm">
        <Calendar className="h-3 w-3" />
        {date}
      </div>
    </div>
  );
}
