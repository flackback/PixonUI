import { useState, useMemo } from 'react';
import type { Message } from '../components/chat/types';

export function useChatSearch(messages: Message[]) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return messages.filter(m => 
      m.content.toLowerCase().includes(lowerQuery)
    );
  }, [messages, query]);

  return {
    query,
    setQuery,
    results
  };
}
