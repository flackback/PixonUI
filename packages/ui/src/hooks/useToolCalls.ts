import { useCallback, useMemo, useReducer } from 'react';

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

export interface ToolCallState<TResult = unknown> {
  id: string;
  name: string;
  status: ToolCallStatus;
  input?: unknown;
  result?: TResult;
  error?: Error;
  startedAt?: Date;
  completedAt?: Date;
}

type ToolAction =
  | { type: 'start'; call: Omit<ToolCallState, 'status' | 'startedAt'> & { status?: ToolCallStatus } }
  | { type: 'complete'; id: string; result?: unknown }
  | { type: 'fail'; id: string; error: Error }
  | { type: 'clear'; id?: string };

function toolReducer(state: ToolCallState[], action: ToolAction): ToolCallState[] {
  switch (action.type) {
    case 'start': {
      const next: ToolCallState = {
        ...action.call,
        status: action.call.status ?? 'running',
        startedAt: new Date(),
      };
      return [...state.filter((item) => item.id !== next.id), next];
    }
    case 'complete':
      return state.map((item) => item.id === action.id ? {
        ...item,
        status: 'success',
        result: action.result,
        completedAt: new Date(),
      } : item);
    case 'fail':
      return state.map((item) => item.id === action.id ? {
        ...item,
        status: 'error',
        error: action.error,
        completedAt: new Date(),
      } : item);
    case 'clear':
      return action.id ? state.filter((item) => item.id !== action.id) : [];
    default:
      return state;
  }
}

export function useToolCalls(initialCalls: ToolCallState[] = []) {
  const [calls, dispatch] = useReducer(toolReducer, initialCalls);

  const start = useCallback((call: Omit<ToolCallState, 'status' | 'startedAt'> & { status?: ToolCallStatus }) => {
    dispatch({ type: 'start', call });
  }, []);

  const complete = useCallback((id: string, result?: unknown) => {
    dispatch({ type: 'complete', id, result });
  }, []);

  const fail = useCallback((id: string, error: Error | string) => {
    dispatch({ type: 'fail', id, error: error instanceof Error ? error : new Error(error) });
  }, []);

  const clear = useCallback((id?: string) => {
    dispatch({ type: 'clear', id });
  }, []);

  const activeCalls = useMemo(
    () => calls.filter((call) => call.status === 'pending' || call.status === 'running'),
    [calls]
  );

  return {
    calls,
    activeCalls,
    isRunning: activeCalls.length > 0,
    start,
    complete,
    fail,
    clear,
  };
}
