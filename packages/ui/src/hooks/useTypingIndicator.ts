import { useState, useCallback, useRef, useEffect } from 'react';

export function useTypingIndicator(timeout = 3000) {
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<number | null>(null);

  const setTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (typing) {
      timerRef.current = window.setTimeout(() => {
        setIsTyping(false);
      }, timeout);
    }
  }, [timeout]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { isTyping, setTyping };
}
