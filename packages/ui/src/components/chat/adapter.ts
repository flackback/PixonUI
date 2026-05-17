import type { Conversation, Message, PresenceStatus } from './types';
import type { MessageCursor } from './helpers';

export interface FetchMessagesParams {
  chatId: string;
  cursor?: MessageCursor;
  limit: number;
  direction?: 'older' | 'newer';
  signal?: AbortSignal;
}

export interface FetchMessagesResult {
  messages: Message[];
  nextCursor?: MessageCursor;
  hasMore?: boolean;
}

export interface SendMessageInput {
  chatId: string;
  content: string;
  senderId: string;
  type?: Message['type'];
  attachments?: Message['attachments'];
  replyToId?: string;
  replyTo?: Message;
  clientId?: string;
}

export type ChatFilterOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'in'
  | 'between'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte';

export interface ChatFilterRule<TField extends string = string> {
  field: TField;
  operator: ChatFilterOperator;
  value: unknown;
}

export interface ChatFilterGroup<TField extends string = string> {
  combinator?: 'and' | 'or';
  rules: Array<ChatFilterRule<TField> | ChatFilterGroup<TField>>;
}

export type MessageFilterField =
  | 'content'
  | 'senderId'
  | 'type'
  | 'status'
  | 'timestamp'
  | 'hasAttachments'
  | 'isPinned'
  | 'starred';

export type ConversationFilterField =
  | 'status'
  | 'assigneeId'
  | 'teamId'
  | 'inboxId'
  | 'labels'
  | 'unreadCount'
  | 'isPinned'
  | 'isArchived'
  | 'updatedAt'
  | 'lastMessageAt';

export interface SearchMessagesParams {
  chatId?: string;
  query: string;
  filters?: ChatFilterGroup<MessageFilterField>;
  cursor?: MessageCursor;
  limit: number;
  signal?: AbortSignal;
}

export interface SearchMessagesResult {
  messages: Message[];
  nextCursor?: MessageCursor;
  hasMore?: boolean;
  total?: number;
}

export interface FilterConversationsParams {
  query?: string;
  filters?: ChatFilterGroup<ConversationFilterField>;
  cursor?: MessageCursor;
  limit: number;
  signal?: AbortSignal;
}

export interface FilterConversationsResult {
  conversations: Conversation[];
  nextCursor?: MessageCursor;
  hasMore?: boolean;
  total?: number;
}

export interface ChatSubscriptionHandlers {
  onMessage?: (message: Message) => void;
  onMessageUpdate?: (messageId: string, update: Partial<Message>) => void;
  onMessageDelete?: (messageId: string) => void;
  onPresence?: (userId: string, presence: PresenceStatus) => void;
  onConversationUpdate?: (conversation: Partial<Conversation> & { id: string }) => void;
}

export interface ChatBackendAdapter {
  fetchMessages?: (params: FetchMessagesParams) => Promise<FetchMessagesResult>;
  searchMessages?: (params: SearchMessagesParams) => Promise<SearchMessagesResult>;
  filterConversations?: (params: FilterConversationsParams) => Promise<FilterConversationsResult>;
  sendMessage?: (input: SendMessageInput) => Promise<Message>;
  updateMessage?: (chatId: string, messageId: string, update: Partial<Message>) => Promise<Message | Partial<Message>>;
  deleteMessage?: (chatId: string, messageId: string) => Promise<void>;
  reactToMessage?: (chatId: string, messageId: string, emoji: string, userId: string) => Promise<Message | Partial<Message> | void>;
  markAsRead?: (chatId: string, messageIds: string[]) => Promise<void>;
  subscribe?: (chatId: string, handlers: ChatSubscriptionHandlers) => () => void;
}
