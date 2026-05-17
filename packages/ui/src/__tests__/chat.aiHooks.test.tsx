import React, { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAssistantTyping, useStreamingMessage, useToolCalls } from '../hooks';
import type { Message } from '../components/chat/types';

describe('chat AI hooks', () => {
  it('streams assistant content into a chat controller', async () => {
    const messages = new Map<string, Message>();
    const chat = {
      appendMessage: vi.fn((message: Message) => messages.set(message.id, message)),
      updateMessage: vi.fn((messageId: string, update: Partial<Message>) => {
        const current = messages.get(messageId);
        if (current) messages.set(messageId, { ...current, ...update });
      }),
    };

    function Probe() {
      const stream = useStreamingMessage({ chat });

      useEffect(() => {
        void stream.start({
          id: 'assistant-1',
          onStream: ({ append }) => {
            append('Olá');
            append(' cliente');
          },
        });
      }, []);

      return <div>{stream.isStreaming ? 'streaming' : 'idle'}</div>;
    }

    render(<Probe />);

    await waitFor(() => {
      expect(messages.get('assistant-1')?.content).toBe('Olá cliente');
      expect(messages.get('assistant-1')?.status).toBe('sent');
    });
  });

  it('tracks tool calls without backend coupling', () => {
    function Probe() {
      const tools = useToolCalls();

      useEffect(() => {
        tools.start({ id: 'crm', name: 'Buscar cliente' });
        tools.complete('crm', { plan: 'pro' });
      }, []);

      return <div>{tools.calls[0]?.status}:{String((tools.calls[0]?.result as any)?.plan)}</div>;
    }

    render(<Probe />);

    expect(screen.getByText('success:pro')).toBeInTheDocument();
  });

  it('keeps assistant typing visible for the minimum duration', () => {
    vi.useFakeTimers();

    function Probe() {
      const typing = useAssistantTyping({ minDuration: 500, idleDelay: 100 });

      useEffect(() => {
        typing.setThinking();
        typing.stop();
      }, []);

      return <div>{typing.state}:{typing.label}</div>;
    }

    render(<Probe />);

    expect(screen.getByText('thinking:Pensando...')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(screen.getByText('thinking:Pensando...')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText('idle:')).toBeInTheDocument();

    vi.useRealTimers();
  });
});
