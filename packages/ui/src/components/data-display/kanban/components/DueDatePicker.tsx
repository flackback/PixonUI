import React from 'react';
import { cn } from '../../../../utils/cn';
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { Button } from '../../../button/Button';

interface DueDatePickerProps {
  date?: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
}

export function DueDatePicker({ date, onChange, className }: DueDatePickerProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-bold flex items-center gap-2">
        <CalendarIcon className="h-3 w-3" />
        Due Date
      </h4>
      
      {date ? (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-[10px] text-white/40">
              {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/20 hover:text-red-400"
            onClick={() => onChange(undefined)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-12 rounded-2xl border border-dashed border-white/10 text-white/40 hover:border-white/20 hover:bg-white/5"
          onClick={() => onChange(new Date())}
        >
          <CalendarIcon className="h-4 w-4" />
          Set due date
        </Button>
      )}
    </div>
  );
}
