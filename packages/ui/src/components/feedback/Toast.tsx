import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastProps {
  id: string;
  title?: string;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  onDismiss: (id: string) => void;
}

const Icons = {
  loading: (
    <svg className="animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

export const Toast = ({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  onDismiss,
}: ToastProps) => {
  useEffect(() => {
    if (duration === Infinity) return;

    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onDismiss]);

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto relative flex w-full max-w-sm items-start gap-4 overflow-hidden rounded-2xl border p-4 shadow-lg transition-all",
        "animate-in slide-in-from-right-full fade-in duration-300",
        "bg-white dark:bg-[#0A0A0A]/90 backdrop-blur-md border-gray-200 dark:border-white/10",
        variant === 'error' && "border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10",
        variant === 'success' && "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/10",
        variant === 'warning' && "border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-950/10",
        variant === 'info' && "border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-950/10",
        variant === 'loading' && "border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-950/10"
      )}
    >
      {variant !== 'default' && Icons[variant] && (
        <div className="shrink-0 pt-0.5">
          {Icons[variant]}
        </div>
      )}
      
      <div className="flex-1 gap-1">
        {title && <div className="text-sm font-semibold text-gray-900 dark:text-white">{title}</div>}
        {description && <div className="text-sm text-gray-600 dark:text-white/80">{description}</div>}
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded-md p-1 text-gray-400 dark:text-white/50 opacity-0 transition-opacity hover:text-gray-900 dark:hover:text-white group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};
