import React from 'react';
import { cn } from '../../utils/cn';

export interface LetterPullupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The text to animate
   */
  text: string;
  /**
   * Delay between each letter animation in seconds
   * @default 0.05
   */
  delay?: number;
}

export const LetterPullup = ({ text, delay = 0.05, className, ...props }: LetterPullupProps) => {
  const letters = text.split('');
  
  return (
    <div className={cn('flex flex-wrap justify-center overflow-hidden py-2', className)} {...props}>
      {letters.map((letter, i) => (
        <span
          key={i}
          className="inline-block animate-pullup opacity-0"
          style={{ 
            animation: `pullup 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
            animationDelay: `${i * delay}s`,
            whiteSpace: letter === ' ' ? 'pre' : 'normal'
          }}
        >
          {letter}
        </span>
      ))}
      <style>{`
        @keyframes pullup {
          from { 
            opacity: 0; 
            transform: translateY(100%); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
      `}</style>
    </div>
  );
};

LetterPullup.displayName = 'LetterPullup';
