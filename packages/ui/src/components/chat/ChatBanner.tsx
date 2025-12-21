import React from 'react';
import { cn } from '../../utils/cn';
import { Info, AlertCircle, X, CheckCircle2 } from 'lucide-react';

interface ChatBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'info' | 'warning' | 'error' | 'success';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export function ChatBanner({ 
  type = 'info', 
  message, 
  action, 
  onClose, 
  className, 
  ...props 
}: ChatBannerProps) {
  const icons = {
    info: Info,
    warning: AlertCircle,
    error: AlertCircle,
    success: CheckCircle2
  };

  const colors = {
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    success: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
  };

  const Icon = icons[type];

  return (
    <div 
      className={cn(
        "flex items-center gap-3 px-4 py-2 border-b text-sm animate-in slide-in-from-top duration-300",
        colors[type],
        className
      )} 
      {...props}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <p className="flex-1 font-medium">{message}</p>
      
      {action && (
        <button 
          onClick={action.onClick}
          className="text-xs font-bold uppercase tracking-wider hover:underline"
        >
          {action.label}
        </button>
      )}

      {onClose && (
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
