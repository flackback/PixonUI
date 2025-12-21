import React from 'react';
import { cn } from '../../utils/cn';

interface SystemMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
}

export function SystemMessage({ content, className, ...props }: SystemMessageProps) {
  return (
    <div className={cn("flex justify-center py-2", className)} {...props}>
      <div className="px-4 py-1 rounded-lg bg-gray-100/50 dark:bg-white/[0.02] text-[11px] font-medium text-gray-500 dark:text-white/30 border border-gray-200/50 dark:border-white/5">
        {content}
      </div>
    </div>
  );
}
