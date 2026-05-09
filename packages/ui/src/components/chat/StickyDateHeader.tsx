import React from 'react';
import { cn } from '../../utils/cn';
import { Calendar } from 'lucide-react';

interface StickyDateHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  date: string | Date;
  sticky?: boolean;
}

export function StickyDateHeader({ date, sticky = true, className, ...props }: StickyDateHeaderProps) {
  const formattedDate = typeof date === 'string' ? date : date.toLocaleDateString('pt-BR', { 
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
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md shadow-lg">
        <Calendar size={12} className="text-white/40" />
        <span className="text-[11px] font-bold text-white/60 tracking-wider uppercase">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}
