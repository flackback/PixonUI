import { useCallback, useEffect, useRef, useState } from 'react';

export type AssistantTypingState = 'idle' | 'thinking' | 'tool' | 'streaming';

export interface UseAssistantTypingOptions {
  minDuration?: number;
  idleDelay?: number;
}

export function useAssistantTyping({
  minDuration = 500,
  idleDelay = 200,
}: UseAssistantTypingOptions = {}) {
  const [state, setState] = useState<AssistantTypingState>('idle');
  const [label, setLabel] = useState('');
  const startedAtRef = useRef(0);
  const stopTimerRef = useRef<number | null>(null);

  const clearStopTimer = useCallback(() => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  }, []);

  const setActive = useCallback((nextState: AssistantTypingState, nextLabel: string) => {
    clearStopTimer();
    startedAtRef.current = performance.now();
    setState(nextState);
    setLabel(nextLabel);
  }, [clearStopTimer]);

  const stop = useCallback(() => {
    clearStopTimer();
    const elapsed = performance.now() - startedAtRef.current;
    const wait = Math.max(0, minDuration - elapsed) + idleDelay;
    stopTimerRef.current = window.setTimeout(() => {
      setState('idle');
      setLabel('');
      stopTimerRef.current = null;
    }, wait);
  }, [clearStopTimer, idleDelay, minDuration]);

  useEffect(() => clearStopTimer, [clearStopTimer]);

  return {
    state,
    label,
    isTyping: state !== 'idle',
    setThinking: () => setActive('thinking', 'Pensando...'),
    setToolRunning: (toolName: string) => setActive('tool', `Executando ${toolName}...`),
    setStreaming: () => setActive('streaming', 'Respondendo...'),
    stop,
  };
}
