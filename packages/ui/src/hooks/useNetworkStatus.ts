import { useState, useEffect, useCallback, useRef } from 'react';

export interface OfflineAction<TPayload = any> {
  id: string;
  type: string;
  payload: TPayload;
  timestamp: number;
}

export interface UseNetworkStatusOptions<TAction extends OfflineAction = OfflineAction> {
  /** LocalStorage key for caching the offline queue */
  storageKey?: string;
  /** Callback triggered when network connection is restored, passing the queued actions */
  onOnlineSync?: (actions: TAction[]) => Promise<void> | void;
}

/**
 * Advanced React hook for offline-first capabilities.
 * Monitors online/offline network status and manages a persistent queue of offline 
 * actions, triggering automated synchronizations and replays upon reconnection.
 */
export function useNetworkStatus<TAction extends OfflineAction = OfflineAction>({
  storageKey = 'pixon-offline-queue',
  onOnlineSync,
}: UseNetworkStatusOptions<TAction> = {}) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queue, setQueue] = useState<TAction[]>([]);
  const onOnlineSyncRef = useRef(onOnlineSync);
  onOnlineSyncRef.current = onOnlineSync;

  // Load offline queue on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setQueue(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse offline action queue', e);
      }
    }
  }, [storageKey]);

  // Update localStorage when queue changes
  const saveQueue = useCallback((newQueue: TAction[]) => {
    setQueue(newQueue);
    localStorage.setItem(storageKey, JSON.stringify(newQueue));
  }, [storageKey]);

  const queueAction = useCallback((type: string, payload: any) => {
    const action: OfflineAction = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      type,
      payload,
      timestamp: Date.now(),
    };
    saveQueue([...queue, action as TAction]);
  }, [queue, saveQueue]);

  const clearQueue = useCallback(() => {
    saveQueue([]);
  }, [saveQueue]);

  const removeAction = useCallback((id: string) => {
    saveQueue(queue.filter(act => act.id !== id));
  }, [queue, saveQueue]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const currentQueue = JSON.parse(localStorage.getItem(storageKey) || '[]') as TAction[];
      if (currentQueue.length > 0 && onOnlineSyncRef.current) {
        try {
          await onOnlineSyncRef.current(currentQueue);
          // Sync successful, clear queue
          saveQueue([]);
        } catch (err) {
          console.error('Failed to sync offline action queue on restoration', err);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [storageKey, saveQueue]);

  return {
    isOnline,
    queue,
    queueAction,
    removeAction,
    clearQueue,
  };
}
