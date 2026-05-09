import React from 'react';
import { cn } from '../utils/cn';

export type KbdVariant = 'default' | 'outline' | 'ghost';
export type KbdSize = 'sm' | 'md' | 'lg';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Visual variant */
  variant?: KbdVariant;
  /** Size */
  size?: KbdSize;
}

const variantStyles: Record<KbdVariant, string> = {
  default: 'bg-zinc-100 dark:bg-white/[0.06] border-zinc-200 dark:border-white/10 border-b-2 border-b-zinc-300 dark:border-b-white/[0.15] text-zinc-600 dark:text-zinc-300 shadow-sm',
  outline: 'bg-transparent border-zinc-300 dark:border-white/15 text-zinc-500 dark:text-zinc-400',
  ghost: 'bg-transparent border-transparent text-zinc-400 dark:text-zinc-500',
};

const sizeStyles: Record<KbdSize, string> = {
  sm: 'px-1 py-0.5 text-[10px] min-w-[18px] rounded',
  md: 'px-1.5 py-0.5 text-[11px] min-w-[22px] rounded-md',
  lg: 'px-2 py-1 text-xs min-w-[26px] rounded-lg',
};

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ children, variant = 'default', size = 'md', className, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center border font-mono font-semibold leading-none select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </kbd>
    );
  }
);

Kbd.displayName = 'Kbd';

// ─── KbdCombo ───────────────────────────────────────────────────────────────

export interface KbdComboProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Array of key names to display */
  keys: string[];
  /** Separator between keys */
  separator?: string;
  /** Visual variant */
  variant?: KbdVariant;
  /** Size */
  size?: KbdSize;
}

/** Displays a keyboard shortcut combination */
export function KbdCombo({
  keys,
  separator = '+',
  variant = 'default',
  size = 'md',
  className,
  ...props
}: KbdComboProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)} {...props}>
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">{separator}</span>
          )}
          <Kbd variant={variant} size={size}>{key}</Kbd>
        </React.Fragment>
      ))}
    </span>
  );
}

KbdCombo.displayName = 'KbdCombo';
