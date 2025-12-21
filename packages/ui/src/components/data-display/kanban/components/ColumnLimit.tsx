import React from 'react';
import { cn } from '../../../../utils/cn';
import { AlertCircle } from 'lucide-react';

interface ColumnLimitProps {
  count: number;
  limit?: number;
  className?: string;
}

export function ColumnLimit({ count, limit, className }: ColumnLimitProps) {
  if (!limit) return null;

  const isOverLimit = count > limit;
  const percentage = Math.min((count / limit) * 100, 100);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-500",
            isOverLimit ? "bg-red-500" : percentage > 80 ? "bg-orange-500" : "bg-blue-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={cn(
        "flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full",
        isOverLimit ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white/40"
      )}>
        {isOverLimit && <AlertCircle className="h-3 w-3" />}
        {count}/{limit}
      </div>
    </div>
  );
}
