import React from 'react';
import { cn } from '../../utils/cn';

export interface WordRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The text content to animate word-by-word
   */
  text: string;
  /**
   * Delay between each word animation in seconds
   * @default 0.06
   */
  delay?: number;
  /**
   * Duration of each word animation in seconds
   * @default 0.5
   */
  duration?: number;
}

export const WordReveal = ({ 
  text, 
  delay = 0.06, 
  duration = 0.5, 
  className, 
  ...props 
}: WordRevealProps) => {
  const words = text.split(' ');

  return (
    <div 
      className={cn('flex flex-wrap justify-center gap-x-[0.25em] gap-y-1 overflow-hidden py-1', className)} 
      {...props}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block opacity-0 animate-word-reveal"
          style={{
            animation: `wordReveal ${duration}s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
            animationDelay: `${i * delay}s`,
          }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes wordReveal {
          from {
            opacity: 0;
            transform: translateY(16px);
            filter: blur(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
      `}</style>
    </div>
  );
};

WordReveal.displayName = 'WordReveal';
