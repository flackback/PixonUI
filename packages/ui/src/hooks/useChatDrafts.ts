import { useState, useCallback, useEffect } from 'react';

export interface UseChatDraftsOptions {
  /** LocalStorage key for caching the draft messages map */
  storageKey?: string;
}

/**
 * Advanced React hook for preserving unsent chat inputs.
 * Caches drafts in localStorage mapped by conversation IDs, restoring them 
 * automatically when navigating between different chat threads.
 */
export function useChatDrafts({ storageKey = 'pixon-chat-drafts' }: UseChatDraftsOptions = {}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setDrafts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse chat drafts', e);
      }
    }
  }, [storageKey]);

  const saveDrafts = useCallback((newDrafts: Record<string, string>) => {
    setDrafts(newDrafts);
    localStorage.setItem(storageKey, JSON.stringify(newDrafts));
  }, [storageKey]);

  const getDraft = useCallback((chatId: string) => {
    return drafts[chatId] || '';
  }, [drafts]);

  const setDraft = useCallback((chatId: string, text: string) => {
    if (text.trim() === '') {
      const { [chatId]: _, ...rest } = drafts;
      saveDrafts(rest);
    } else {
      saveDrafts({ ...drafts, [chatId]: text });
    }
  }, [drafts, saveDrafts]);

  const clearDraft = useCallback((chatId: string) => {
    const { [chatId]: _, ...rest } = drafts;
    saveDrafts(rest);
  }, [drafts, saveDrafts]);

  return {
    drafts,
    getDraft,
    setDraft,
    clearDraft,
  };
}
