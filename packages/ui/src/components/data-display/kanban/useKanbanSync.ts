import { useState, useEffect, useCallback } from 'react';
import type { KanbanTask, KanbanColumnDef } from './types';

interface UseKanbanSyncProps {
  onSync?: (data: { tasks: KanbanTask[], columns: KanbanColumnDef[] }) => Promise<void>;
  interval?: number;
  enabled?: boolean;
}

export function useKanbanSync({ onSync, interval = 30000, enabled = false }: UseKanbanSyncProps) {
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sync = useCallback(async (data: { tasks: KanbanTask[], columns: KanbanColumnDef[] }) => {
    if (!onSync) return;
    
    setIsSyncing(true);
    setError(null);
    
    try {
      await onSync(data);
      setLastSynced(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sync failed'));
    } finally {
      setIsSyncing(false);
    }
  }, [onSync]);

  return {
    sync,
    isSyncing,
    lastSynced,
    error
  };
}
