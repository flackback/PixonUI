import React from 'react';
import { cn } from '../../utils/cn';
import { X, Reply } from 'lucide-react';
import type { Message } from './types';

interface ReplyPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  message: Message;
  onCancel?: () => void;
}

export function ReplyPreview({ message, onCancel, className, ...props }: ReplyPreviewProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-2 rounded-xl bg-blue-500/5 border-l-4 border-blue-500 animate-in slide-in-from-bottom-2",
        className
      )} 
      {...props}
    >
      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
        <Reply className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-blue-500">Replying to</p>
        <p className="text-sm text-gray-600 dark:text-white/60 truncate">{message.content}</p>
      </div>
      {onCancel && (
        <button 
          onClick={onCancel}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
