import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface TypewriterProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Array of strings to cycle through
   */
  words: string[];
  /**
   * Typing speed in milliseconds per character
   * @default 80
   */
  speed?: number;
  /**
   * Deleting speed in milliseconds per character
   * @default 40
   */
  deleteSpeed?: number;
  /**
   * Delay in milliseconds before starting to delete
   * @default 1500
   */
  delay?: number;
  /**
   * Whether to loop infinitely
   * @default true
   */
  loop?: boolean;
  /**
   * Character representing the typing cursor
   * @default "|"
   */
  cursorChar?: string;
  /**
   * Custom className for the typing text
   */
  className?: string;
  /**
   * Custom className for the cursor caret
   */
  cursorClassName?: string;
}

type TypewriterState = 'typing' | 'pausing' | 'deleting';

export const Typewriter = ({
  words,
  speed = 80,
  deleteSpeed = 40,
  delay = 1500,
  loop = true,
  cursorChar = '|',
  className,
  cursorClassName,
  ...props
}: TypewriterProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [state, setState] = useState<TypewriterState>('typing');

  useEffect(() => {
    if (words.length === 0) return;

    let timer: NodeJS.Timeout;
    const fullWord = words[currentWordIndex] || '';

    if (state === 'typing') {
      timer = setTimeout(() => {
        const nextText = fullWord.slice(0, currentText.length + 1);
        setCurrentText(nextText);

        if (nextText === fullWord) {
          setState('pausing');
        }
      }, speed);
    } else if (state === 'pausing') {
      timer = setTimeout(() => {
        setState('deleting');
      }, delay);
    } else if (state === 'deleting') {
      timer = setTimeout(() => {
        const nextText = fullWord.slice(0, currentText.length - 1);
        setCurrentText(nextText);

        if (nextText === '') {
          setState('typing');
          if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex((prev) => prev + 1);
          } else if (loop) {
            setCurrentWordIndex(0);
          }
        }
      }, deleteSpeed);
    }

    return () => clearTimeout(timer);
  }, [currentText, state, currentWordIndex, words, speed, deleteSpeed, delay, loop]);

  return (
    <span className={cn('inline-flex items-center', className)} {...props}>
      <span>{currentText}</span>
      <span 
        className={cn('ml-0.5 inline-block font-normal animate-caret-blink', cursorClassName)}
        style={{ color: 'inherit' }}
      >
        {cursorChar}
      </span>
      <style>{`
        @keyframes caretBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-caret-blink {
          animation: caretBlink 0.8s step-end infinite;
        }
      `}</style>
    </span>
  );
};

Typewriter.displayName = 'Typewriter';
