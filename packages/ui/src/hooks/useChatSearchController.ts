import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatBackendAdapter, ChatFilterGroup, MessageFilterField } from '../components/chat/adapter';
import { sortMessages, type MessageCursor } from '../components/chat/helpers';
import type { Message } from '../components/chat/types';

export interface UseChatSearchControllerOptions {
  chatId?: string;
  adapter?: ChatBackendAdapter;
  localMessages?: Message[];
  filters?: ChatFilterGroup<MessageFilterField>;
  limit?: number;
  debounceMs?: number;
  minQueryLength?: number;
}

const matchesLocalFilters = (message: Message, filters?: ChatFilterGroup<MessageFilterField>): boolean => {
  if (!filters?.rules?.length) return true;
  const results = filters.rules.map((rule) => {
    if ('rules' in rule) return matchesLocalFilters(message, rule);
    const value = (message as any)[rule.field];
    if (rule.field === 'hasAttachments') return Boolean(message.attachments?.length) === Boolean(rule.value);
    if (rule.operator === 'eq') return value === rule.value;
    if (rule.operator === 'neq') return value !== rule.value;
    if (rule.operator === 'contains') return String(value ?? '').toLowerCase().includes(String(rule.value ?? '').toLowerCase());
    if (rule.operator === 'in') return Array.isArray(rule.value) && rule.value.includes(value);
    if (rule.operator === 'between' && Array.isArray(rule.value)) {
      const time = new Date(value).getTime();
      return time >= new Date(rule.value[0]).getTime() && time <= new Date(rule.value[1]).getTime();
    }
    return true;
  });
  return (filters.combinator ?? 'and') === 'or' ? results.some(Boolean) : results.every(Boolean);
};

export function useChatSearchController({
  chatId,
  adapter,
  localMessages = [],
  filters,
  limit = 50,
  debounceMs = 250,
  minQueryLength = 2,
}: UseChatSearchControllerOptions = {}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<MessageCursor>();
  const [hasMore, setHasMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const localSearch = useCallback((value: string) => {
    const q = value.trim().toLowerCase();
    return sortMessages(localMessages)
      .filter((message) => message.content.toLowerCase().includes(q) && matchesLocalFilters(message, filters))
      .slice(0, limit);
  }, [filters, limit, localMessages]);

  const search = useCallback(async (value = query, nextCursor?: MessageCursor) => {
    const normalized = value.trim();
    if (normalized.length < minQueryLength) {
      setResults([]);
      setCursor(undefined);
      setHasMore(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsSearching(true);
    setError(null);

    try {
      if (adapter?.searchMessages) {
        const response = await adapter.searchMessages({ chatId, query: normalized, filters, cursor: nextCursor, limit, signal: controller.signal });
        setResults((prev) => nextCursor ? sortMessages([...prev, ...response.messages]) : sortMessages(response.messages));
        setCursor(response.nextCursor);
        setHasMore(Boolean(response.hasMore));
      } else {
        setResults(localSearch(normalized));
        setCursor(undefined);
        setHasMore(false);
      }
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (!controller.signal.aborted) setIsSearching(false);
    }
  }, [adapter, chatId, filters, limit, localSearch, minQueryLength, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => void search(query), debounceMs);
    return () => window.clearTimeout(timer);
  }, [debounceMs, query, search]);

  const loadMore = useCallback(() => {
    if (hasMore && !isSearching) return search(query, cursor);
  }, [cursor, hasMore, isSearching, query, search]);

  const highlight = useCallback((content: string) => {
    const q = query.trim();
    if (!q) return [{ text: content, match: false }];
    return content.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig')).map((text) => ({
      text,
      match: text.toLowerCase() === q.toLowerCase(),
    }));
  }, [query]);

  return useMemo(() => ({
    query,
    setQuery,
    results,
    isSearching,
    hasMore,
    error,
    search,
    loadMore,
    highlight,
  }), [error, hasMore, highlight, isSearching, loadMore, query, results, search]);
}
