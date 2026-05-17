import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatBackendAdapter, ChatFilterGroup, ConversationFilterField } from '../components/chat/adapter';
import type { MessageCursor } from '../components/chat/helpers';
import type { Conversation } from '../components/chat/types';

export interface UseConversationFiltersOptions {
  adapter?: ChatBackendAdapter;
  initialConversations?: Conversation[];
  initialFilters?: ChatFilterGroup<ConversationFilterField>;
  limit?: number;
}

export function useConversationFilters({
  adapter,
  initialConversations = [],
  initialFilters,
  limit = 50,
}: UseConversationFiltersOptions = {}) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ChatFilterGroup<ConversationFilterField> | undefined>(initialFilters);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [cursor, setCursor] = useState<MessageCursor>();
  const [hasMore, setHasMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const applyFilters = useCallback(async (nextCursor?: MessageCursor) => {
    if (!adapter?.filterConversations) {
      const q = query.trim().toLowerCase();
      setConversations(initialConversations.filter((conversation) => {
        const target = `${conversation.user?.name ?? ''} ${conversation.group?.name ?? ''} ${conversation.lastMessage?.content ?? ''}`.toLowerCase();
        return !q || target.includes(q);
      }));
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsFiltering(true);
    setError(null);

    try {
      const response = await adapter.filterConversations({ query, filters, cursor: nextCursor, limit, signal: controller.signal });
      setConversations((prev) => nextCursor ? [...prev, ...response.conversations] : response.conversations);
      setCursor(response.nextCursor);
      setHasMore(Boolean(response.hasMore));
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (!controller.signal.aborted) setIsFiltering(false);
    }
  }, [adapter, filters, initialConversations, limit, query]);

  useEffect(() => {
    void applyFilters();
  }, [applyFilters]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFiltering) return applyFilters(cursor);
  }, [applyFilters, cursor, hasMore, isFiltering]);

  return useMemo(() => ({
    query,
    setQuery,
    filters,
    setFilters,
    conversations,
    isFiltering,
    hasMore,
    error,
    applyFilters,
    loadMore,
  }), [applyFilters, conversations, error, filters, hasMore, isFiltering, loadMore, query]);
}
