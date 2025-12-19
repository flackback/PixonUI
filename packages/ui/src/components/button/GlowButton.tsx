import React, { useRef } from 'react';
import { cn } from '../../utils/cn';

export interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ children, className, leftIcon, rightIcon, ...props }, ref) => {
    const localRef = useRef<HTMLButtonElement>(null);

    const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = localRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--x', `${x}px`);
      el.style.setProperty('--y', `${y}px`);
    };

    // Merge refs
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

    return (
      <button
        ref={localRef}
        onMouseMove={handleMove}
        type={props.type ?? 'button'}
        className={cn(
          'group relative inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3',
          'bg-white/[0.03] border border-white/10',
          'text-white font-semibold tracking-tight overflow-hidden',
          'transition-all duration-300',
          'hover:bg-white/[0.05] hover:scale-[1.02]',
          'active:scale-[0.98]',
          'focus:outline-none focus:ring-2 focus:ring-purple-400/40',
          className
        )}
        {...props}
      >
        {/* Mouse follow glow */}
        <div 
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: 'radial-gradient(600px circle at var(--x) var(--y), rgba(255,255,255,0.4), transparent 40%)'
          }}
        />
        
        {/* Border glow */}
        <div 
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: 'radial-gradient(300px circle at var(--x) var(--y), rgba(255,255,255,0.6), transparent 40%)',
            maskImage: 'linear-gradient(#fff, #fff), linear-gradient(#fff, #fff)',
            maskClip: 'content-box, border-box',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px'
          }}
        />

        <span className="relative inline-flex items-center gap-2 z-10">
          {leftIcon}
          {children}
          {rightIcon}
        </span>
      </button>
    );
  }
);

GlowButton.displayName = 'GlowButton';
