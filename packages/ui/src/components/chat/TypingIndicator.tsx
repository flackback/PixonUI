import React from 'react';
import { cn } from '../../utils/cn';

interface TypingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  users?: string[];
  variant?: 'default' | 'bubble';
}

export function TypingIndicator({ users = [], variant = 'default', className, ...props }: TypingIndicatorProps) {
  const text = users.length === 0 
    ? 'Someone is typing' 
    : users.length === 1 
      ? `${users[0]} is typing` 
      : users.length === 2 
        ? `${users[0]} and ${users[1]} are typing`
        : `${users[0]} and ${users.length - 1} others are typing`;

  if (variant === 'bubble') {
    return (
      <div className={cn("flex items-center gap-1 px-3 py-2 rounded-2xl bg-gray-100 dark:bg-white/[0.03] w-fit", className)} {...props}>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 italic", className)} {...props}>
      <div className="flex gap-0.5">
        <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1 h-1 rounded-full bg-current animate-bounce" />
      </div>
      {text}
    </div>
  );
}
