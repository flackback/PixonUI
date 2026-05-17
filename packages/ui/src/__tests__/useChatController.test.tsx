import React, { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useChatController } from '../hooks/useChatController';
import type { ChatBackendAdapter } from '../components/chat/adapter';
import type { Message } from '../components/chat/types';

const makeMessage = (id: string, content = id): Message => ({
  id,
  content,
  senderId: 'remote',
  timestamp: new Date(`2026-01-01T10:0${id}:00Z`),
  status: 'sent',
});

function Probe({ adapter }: { adapter: ChatBackendAdapter }) {
  const chat = useChatController({ chatId: 'c1', currentUserId: 'me', adapter, pageSize: 2 });

  useEffect(() => {
    (window as any).__chat = chat;
  }, [chat]);

  return <div data-testid="count">{chat.messages.length}:{chat.messages.map((message) => `${message.id}-${message.status}`).join('|')}</div>;
}

describe('useChatController', () => {
  it('loads, prepends and sends messages through a backend adapter', async () => {
    const adapter: ChatBackendAdapter = {
      fetchMessages: vi.fn()
        .mockResolvedValueOnce({ messages: [makeMessage('2'), makeMessage('1')], nextCursor: 'older', hasMore: true })
        .mockResolvedValueOnce({ messages: [makeMessage('0')], nextCursor: null, hasMore: false }),
      sendMessage: vi.fn(async (input) => ({
        id: input.clientId || 'server-1',
        content: input.content,
        senderId: input.senderId,
        timestamp: new Date('2026-01-01T10:04:00Z'),
        status: 'sent',
      })),
    };

    render(<Probe adapter={adapter} />);

    await waitFor(() => expect(screen.getByTestId('count').textContent).toContain('2:1-sent|2-sent'));

    await act(async () => {
      await (window as any).__chat.loadOlderMessages();
    });
    expect(screen.getByTestId('count').textContent).toContain('3:0-sent|1-sent|2-sent');

    await act(async () => {
      await (window as any).__chat.sendMessage('hello');
    });

    expect(adapter.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ chatId: 'c1', senderId: 'me', content: 'hello' }));
    expect(screen.getByTestId('count').textContent).toContain('sent');
  });

  it('subscribes to realtime messages without replacing the loaded list', async () => {
    let emit: ((message: Message) => void) | undefined;
    const adapter: ChatBackendAdapter = {
      fetchMessages: vi.fn().mockResolvedValue({ messages: [makeMessage('1')], hasMore: false }),
      subscribe: vi.fn((_chatId, handlers) => {
        emit = handlers.onMessage;
        return vi.fn();
      }),
    };

    render(<Probe adapter={adapter} />);
    await waitFor(() => expect(screen.getByTestId('count').textContent).toContain('1:1-sent'));

    act(() => {
      emit?.(makeMessage('2'));
    });

    expect(screen.getByTestId('count').textContent).toContain('2:1-sent|2-sent');
  });
});
