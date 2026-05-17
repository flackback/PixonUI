import type { Message, MessageStatus } from './types';

export type MessageCursor = string | number | Date | null | undefined;

export interface BuildOptimisticMessageInput {
  chatId?: string;
  content: string;
  senderId: string;
  type?: Message['type'];
  attachments?: Message['attachments'];
  replyToId?: string;
  replyTo?: Message;
  timestamp?: Date;
  id?: string;
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

export function getMessageTime(message: Message): number {
  const value = message.timestamp instanceof Date ? message.timestamp.getTime() : new Date(message.timestamp).getTime();
  return Number.isFinite(value) ? value : 0;
}

export function sortMessages(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => {
    const delta = getMessageTime(a) - getMessageTime(b);
    return delta === 0 ? a.id.localeCompare(b.id) : delta;
  });
}

export function mergeMessageUpdate(message: Message, update: Partial<Message>): Message {
  return {
    ...message,
    ...update,
    attachments: update.attachments ?? message.attachments,
    reactions: update.reactions ?? message.reactions,
    interactive: update.interactive ?? message.interactive,
  };
}

export function upsertMessages(current: Message[], incoming: Message | Message[], mode: 'append' | 'prepend' = 'append'): Message[] {
  const next = mode === 'prepend' ? [...(Array.isArray(incoming) ? incoming : [incoming]), ...current] : [...current, ...(Array.isArray(incoming) ? incoming : [incoming])];
  const byId = new Map<string, Message>();
  for (const message of next) {
    const existing = byId.get(message.id);
    byId.set(message.id, existing ? mergeMessageUpdate(existing, message) : message);
  }
  return sortMessages(Array.from(byId.values()));
}

export function buildOptimisticMessage(input: BuildOptimisticMessageInput): Message {
  return {
    id: input.id ?? createId(),
    remoteJid: input.chatId,
    content: input.content,
    senderId: input.senderId,
    timestamp: input.timestamp ?? new Date(),
    status: 'sending',
    type: input.type ?? 'text',
    attachments: input.attachments,
    replyToId: input.replyToId,
    replyTo: input.replyTo,
  };
}

export function markMessageStatus(messages: Message[], messageId: string, status: MessageStatus): Message[] {
  return messages.map((message) => message.id === messageId ? { ...message, status } : message);
}

export function replaceMessage(messages: Message[], optimisticId: string, serverMessage: Message): Message[] {
  return sortMessages(messages.map((message) => message.id === optimisticId ? mergeMessageUpdate(message, serverMessage) : message));
}

export function groupMessagesByDate(messages: Message[]) {
  return sortMessages(messages).reduce<Record<string, Message[]>>((groups, message) => {
    const key = new Date(message.timestamp).toDateString();
    groups[key] = groups[key] ? [...groups[key], message] : [message];
    return groups;
  }, {});
}

export function isSameSenderGroup(previous: Message | null | undefined, current: Message, next?: Message | null): boolean {
  const neighbor = next ?? previous;
  if (!neighbor) return false;
  const sameSender = neighbor.senderId === current.senderId;
  const withinFiveMinutes = Math.abs(getMessageTime(neighbor) - getMessageTime(current)) < 5 * 60 * 1000;
  return sameSender && withinFiveMinutes;
}

export function isNearBottom(element: Pick<HTMLElement, 'scrollHeight' | 'scrollTop' | 'clientHeight'>, threshold = 120): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
}

export function preserveScrollAnchor(element: Pick<HTMLElement, 'scrollHeight' | 'scrollTop'>, previousScrollHeight: number, previousScrollTop: number): void {
  const delta = element.scrollHeight - previousScrollHeight;
  if (delta > 0) element.scrollTop = previousScrollTop + delta;
}
