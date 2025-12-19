import React from 'react';
import { useInView } from '../../hooks/useInView';
import { cn } from '../../utils/cn';

interface TextMotionProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  type?: 'char' | 'word';
  stagger?: number;
  delay?: number;
}

export function TextMotion({ 
  text, 
  type = 'char', 
  stagger = 30, 
  delay = 0,
  className,
  ...props 
}: TextMotionProps) {
  const { ref, hasAnimated } = useInView({ threshold: 0.2 });
  
  const items = type === 'char' ? text.split('') : text.split(' ');

  return (
    <div 
      ref={ref} 
      className={cn('flex flex-wrap', className)} 
      aria-label={text}
      {...props}
    >
      {items.map((item, i) => (
        <span
          key={i}
          className={cn(
            'inline-block whitespace-pre transition-all duration-500 ease-out will-change-transform',
            hasAnimated 
              ? 'opacity-100 translate-y-0 blur-0' 
              : 'opacity-0 translate-y-4 blur-sm'
          )}
          style={{ 
            transitionDelay: `${delay + (i * stagger)}ms` 
          }}
        >
          {item}{type === 'word' && i !== items.length - 1 ? ' ' : ''}
        </span>
      ))}
    </div>
  );
}
