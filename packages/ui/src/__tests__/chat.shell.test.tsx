import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChatProvider, ChatShell, useChatContext } from '../components/chat';
import { useChatNotifications } from '../hooks/useChatNotifications';
import type { Message } from '../components/chat/types';

const messages: Message[] = [
  {
    id: 'm1',
    content: 'Mensagem inicial',
    senderId: 'remote',
    timestamp: new Date('2026-01-01T10:00:00Z'),
    status: 'sent',
  },
];

describe('ChatShell', () => {
  it('renders a production chat layout with customizable slots', () => {
    render(
      <ChatShell
        chatId="c1"
        currentUserId="me"
        initialMessages={messages}
        activeUser={{ id: 'remote', name: 'Sarah' }}
        features={{ virtualized: false }}
        slots={{
          Header: () => <div>Header custom</div>,
          Composer: () => <div>Composer custom</div>,
        }}
      />
    );

    expect(screen.getByText('Header custom')).toBeInTheDocument();
    expect(screen.getByText('Mensagem inicial')).toBeInTheDocument();
    expect(screen.getByText('Composer custom')).toBeInTheDocument();
  });

  it('provides controller state through ChatProvider', () => {
    function Probe() {
      const chat = useChatContext();
      return <div>{chat.messages.length}</div>;
    }

    render(
      <ChatProvider chatId="c1" currentUserId="me" initialMessages={messages} autoLoad={false}>
        <Probe />
      </ChatProvider>
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });
});

describe('useChatNotifications', () => {
  it('emits incoming messages and ignores own messages', () => {
    const onNotify = vi.fn();

    function Probe() {
      const notifications = useChatNotifications({ currentUserId: 'me', onNotify });

      useEffect(() => {
        notifications.notifyMessage(messages[0]!);
        notifications.notifyMessage({ ...messages[0]!, id: 'own', senderId: 'me' });
      }, [notifications]);

      return null;
    }

    render(<Probe />);

    expect(onNotify).toHaveBeenCalledTimes(1);
    expect(onNotify).toHaveBeenCalledWith(expect.objectContaining({ type: 'message' }));
  });
});
