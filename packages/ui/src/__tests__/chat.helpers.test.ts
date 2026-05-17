import { describe, expect, it } from 'vitest';
import {
  buildOptimisticMessage,
  groupMessagesByDate,
  isNearBottom,
  preserveScrollAnchor,
  sortMessages,
  upsertMessages,
} from '../components/chat/helpers';
import type { Message } from '../components/chat/types';

const msg = (id: string, timestamp: string): Message => ({
  id,
  content: id,
  senderId: 'u1',
  timestamp: new Date(timestamp),
  status: 'sent',
});

describe('chat helpers', () => {
  it('sorts, dedupes and merges messages deterministically', () => {
    const messages = upsertMessages(
      [msg('b', '2026-01-01T10:02:00Z'), msg('a', '2026-01-01T10:00:00Z')],
      { ...msg('b', '2026-01-01T10:02:00Z'), content: 'updated', status: 'read' },
      'append'
    );

    expect(messages.map((message) => message.id)).toEqual(['a', 'b']);
    expect(messages[1]?.content).toBe('updated');
    expect(messages[1]?.status).toBe('read');
  });

  it('creates optimistic messages with stable defaults', () => {
    const message = buildOptimisticMessage({ chatId: 'c1', content: 'hello', senderId: 'me', id: 'client-1' });
    expect(message).toMatchObject({ id: 'client-1', remoteJid: 'c1', content: 'hello', senderId: 'me', status: 'sending', type: 'text' });
  });

  it('groups messages by date after sorting', () => {
    const groups = groupMessagesByDate([
      msg('2', '2026-01-02T10:00:00Z'),
      msg('1', '2026-01-01T10:00:00Z'),
    ]);

    expect(Object.values(groups).flat().map((message) => message.id)).toEqual(['1', '2']);
  });

  it('preserves scroll anchor when older messages are prepended', () => {
    const element = { scrollHeight: 1400, scrollTop: 120 };
    preserveScrollAnchor(element, 1000, 120);
    expect(element.scrollTop).toBe(520);
    expect(isNearBottom({ scrollHeight: 1000, scrollTop: 860, clientHeight: 100 }, 50)).toBe(true);
  });

  it('keeps plain sorting immutable', () => {
    const source = [msg('b', '2026-01-01T10:02:00Z'), msg('a', '2026-01-01T10:00:00Z')];
    expect(sortMessages(source).map((message) => message.id)).toEqual(['a', 'b']);
    expect(source.map((message) => message.id)).toEqual(['b', 'a']);
  });
});
