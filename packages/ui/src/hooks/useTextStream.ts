import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTextStreamOptions {
  /** Throttle interval in milliseconds (default: 40ms) */
  interval?: number;
}

/**
 * Enterprise-grade hook for rendering real-time streaming LLM/AI text responses.
 * Queues chunks in a buffer and drains them smoothly at scheduled intervals, 
 * avoiding browser paint-thread lockups and stuttering.
 */
export function useTextStream({ interval = 40 }: UseTextStreamOptions = {}) {
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const bufferRef = useRef<string>('');
  const textRef = useRef<string>('');
  const timerRef = useRef<number | null>(null);

  const append = useCallback((chunk: string) => {
    bufferRef.current += chunk;
    setIsStreaming(true);

    if (timerRef.current === null) {
      timerRef.current = window.setInterval(() => {
        if (bufferRef.current.length > 0) {
          // Dynamically drain buffer: take more characters if the buffer accumulates fast
          const charsToTake = Math.max(1, Math.ceil(bufferRef.current.length * 0.15));
          const chunkToAppend = bufferRef.current.substring(0, charsToTake);
          bufferRef.current = bufferRef.current.substring(charsToTake);
          
          textRef.current += chunkToAppend;
          setStreamedText(textRef.current);
        } else {
          // Clean up timer if the buffer is empty
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }, interval);
    }
  }, [interval]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    bufferRef.current = '';
    textRef.current = '';
    setStreamedText('');
    setIsStreaming(false);
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Instantly append remaining text in buffer
    if (bufferRef.current.length > 0) {
      textRef.current += bufferRef.current;
      setStreamedText(textRef.current);
      bufferRef.current = '';
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    streamedText,
    isStreaming,
    append,
    clear,
    stop,
  };
}
