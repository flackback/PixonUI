import React, { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ChatBackendAdapter } from '../components/chat/adapter';
import type { Conversation, Message } from '../components/chat/types';
import { useChatSearchController } from '../hooks/useChatSearchController';
import { useConversationFilters } from '../hooks/useConversationFilters';

const message = (id: string, content: string): Message => ({
  id,
  content,
  senderId: 'u1',
  timestamp: new Date(`2026-01-01T10:0${id}:00Z`),
  status: 'sent',
});

function SearchProbe({ adapter }: { adapter?: ChatBackendAdapter }) {
  const search = useChatSearchController({ chatId: 'c1', adapter, localMessages: [message('1', 'hello pixon'), message('2', 'other')] });
  useEffect(() => {
    (window as any).__search = search;
  }, [search]);
  return <div data-testid="results">{search.results.map((item) => item.content).join('|')}</div>;
}

function FilterProbe({ adapter }: { adapter: ChatBackendAdapter }) {
  const filters = useConversationFilters({ adapter });
  useEffect(() => {
    (window as any).__filters = filters;
  }, [filters]);
  return <div data-testid="conversations">{filters.conversations.map((item) => item.id).join('|')}</div>;
}

describe('chat backend search and filters', () => {
  it('falls back to local loaded-message search when no backend search exists', async () => {
    render(<SearchProbe />);
    act(() => {
      (window as any).__search.setQuery('pixon');
    });
    await waitFor(() => expect(screen.getByTestId('results').textContent).toBe('hello pixon'));
  });

  it('delegates message search to adapter with filters and cursor', async () => {
    const adapter: ChatBackendAdapter = {
      searchMessages: vi.fn().mockResolvedValue({ messages: [message('3', 'server result')], nextCursor: 'n2', hasMore: true }),
    };
    render(<SearchProbe adapter={adapter} />);
    await act(async () => {
      await (window as any).__search.search('server');
    });
    expect(adapter.searchMessages).toHaveBeenCalledWith(expect.objectContaining({ chatId: 'c1', query: 'server', limit: 50 }));
    expect(screen.getByTestId('results').textContent).toBe('server result');
  });

  it('delegates conversation filters to adapter', async () => {
    const conversation: Conversation = { id: 'c1', unreadCount: 0 };
    const adapter: ChatBackendAdapter = {
      filterConversations: vi.fn().mockResolvedValue({ conversations: [conversation], hasMore: false }),
    };
    render(<FilterProbe adapter={adapter} />);
    await waitFor(() => expect(screen.getByTestId('conversations').textContent).toBe('c1'));
    expect(adapter.filterConversations).toHaveBeenCalledWith(expect.objectContaining({ limit: 50 }));
  });
});
