import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ChatBackendAdapter, SendMessageInput } from '../components/chat/adapter';
import {
  buildOptimisticMessage,
  groupMessagesByDate,
  markMessageStatus,
  mergeMessageUpdate,
  replaceMessage,
  sortMessages,
  trimMessageWindow,
  upsertMessages,
  type MessageCursor,
} from '../components/chat/helpers';
import type { Message, MessageStatus } from '../components/chat/types';

const EMPTY_MESSAGES: Message[] = [];

export interface UseChatControllerOptions {
  chatId: string | null;
  currentUserId: string;
  adapter?: ChatBackendAdapter;
  initialMessages?: Message[];
  pageSize?: number;
  autoLoad?: boolean;
  maxMessages?: number;
}

interface ChatControllerState {
  messages: Message[];
  cursor?: MessageCursor;
  hasMore: boolean;
  isLoadingInitial: boolean;
  isLoadingOlder: boolean;
  isSending: boolean;
  error: Error | null;
}

type Action =
  | { type: 'reset'; messages: Message[] }
  | { type: 'load:start'; initial: boolean }
  | { type: 'load:success'; messages: Message[]; cursor?: MessageCursor; hasMore?: boolean; mode: 'replace' | 'prepend' }
  | { type: 'load:error'; error: Error }
  | { type: 'message:add'; message: Message }
  | { type: 'message:addBatch'; messages: Message[] }
  | { type: 'message:update'; messageId: string; update: Partial<Message> }
  | { type: 'message:replace'; optimisticId: string; message: Message }
  | { type: 'message:status'; messageId: string; status: MessageStatus }
  | { type: 'message:delete'; messageId: string }
  | { type: 'sending'; value: boolean };

function reducer(state: ChatControllerState, action: Action, maxMessages?: number): ChatControllerState {
  switch (action.type) {
    case 'reset':
      return { ...state, messages: trimMessageWindow(sortMessages(action.messages), maxMessages), cursor: undefined, hasMore: true, error: null };
    case 'load:start':
      return { ...state, isLoadingInitial: action.initial, isLoadingOlder: !action.initial, error: null };
    case 'load:success':
      return {
        ...state,
        messages: trimMessageWindow(
          action.mode === 'replace' ? sortMessages(action.messages) : upsertMessages(state.messages, action.messages, 'prepend'),
          maxMessages,
          action.mode === 'prepend' ? 'newest' : 'oldest'
        ),
        cursor: action.cursor,
        hasMore: action.hasMore ?? action.messages.length > 0,
        isLoadingInitial: false,
        isLoadingOlder: false,
      };
    case 'load:error':
      return { ...state, error: action.error, isLoadingInitial: false, isLoadingOlder: false };
    case 'message:add':
      return { ...state, messages: trimMessageWindow(upsertMessages(state.messages, action.message, 'append'), maxMessages, 'oldest') };
    case 'message:addBatch':
      return { ...state, messages: trimMessageWindow(upsertMessages(state.messages, action.messages, 'append'), maxMessages, 'oldest') };
    case 'message:update':
      return { ...state, messages: state.messages.map((message) => message.id === action.messageId ? mergeMessageUpdate(message, action.update) : message) };
    case 'message:replace':
      return { ...state, messages: replaceMessage(state.messages, action.optimisticId, action.message) };
    case 'message:status':
      return { ...state, messages: markMessageStatus(state.messages, action.messageId, action.status) };
    case 'message:delete':
      return { ...state, messages: state.messages.map((message) => message.id === action.messageId ? { ...message, type: 'revoked', content: '', attachments: [], reactions: {} } : message) };
    case 'sending':
      return { ...state, isSending: action.value };
    default:
      return state;
  }
}

const toError = (error: unknown) => error instanceof Error ? error : new Error(String(error));

export function useChatController({
  chatId,
  currentUserId,
  adapter,
  initialMessages = EMPTY_MESSAGES,
  pageSize = 50,
  autoLoad = true,
  maxMessages = 2000,
}: UseChatControllerOptions) {
  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;

  const [state, dispatchBase] = useReducer((state: ChatControllerState, action: Action) => reducer(state, action, maxMessages), {
    messages: trimMessageWindow(sortMessages(initialMessages), maxMessages),
    hasMore: true,
    isLoadingInitial: false,
    isLoadingOlder: false,
    isSending: false,
    error: null,
  });
  const dispatch = dispatchBase;
  const realtimeQueueRef = useRef<Message[]>([]);
  const realtimeFlushRef = useRef<number | null>(null);

  useEffect(() => {
    dispatch({ type: 'reset', messages: initialMessages });
  }, [chatId, initialMessages, maxMessages]);

  const loadInitialMessages = useCallback(async () => {
    if (!chatId || !adapterRef.current?.fetchMessages) return;
    const controller = new AbortController();
    dispatch({ type: 'load:start', initial: true });
    try {
      const result = await adapterRef.current.fetchMessages({ chatId, limit: pageSize, direction: 'older', signal: controller.signal });
      dispatch({ type: 'load:success', messages: result.messages, cursor: result.nextCursor, hasMore: result.hasMore, mode: 'replace' });
    } catch (error) {
      if (!controller.signal.aborted) dispatch({ type: 'load:error', error: toError(error) });
    }
    return () => controller.abort();
  }, [chatId, pageSize]);

  const loadOlderMessages = useCallback(async () => {
    if (!chatId || !state.hasMore || state.isLoadingOlder || !adapterRef.current?.fetchMessages) return;
    dispatch({ type: 'load:start', initial: false });
    try {
      const result = await adapterRef.current.fetchMessages({ chatId, cursor: state.cursor, limit: pageSize, direction: 'older' });
      dispatch({ type: 'load:success', messages: result.messages, cursor: result.nextCursor, hasMore: result.hasMore, mode: 'prepend' });
    } catch (error) {
      dispatch({ type: 'load:error', error: toError(error) });
    }
  }, [chatId, pageSize, state.cursor, state.hasMore, state.isLoadingOlder]);

  useEffect(() => {
    if (autoLoad) void loadInitialMessages();
  }, [autoLoad, loadInitialMessages]);

  useEffect(() => {
    if (!chatId || !adapterRef.current?.subscribe) return;
    const flushRealtime = () => {
      realtimeFlushRef.current = null;
      const messages = realtimeQueueRef.current;
      realtimeQueueRef.current = [];
      if (messages.length) dispatch({ type: 'message:addBatch', messages });
    };
    const scheduleRealtimeFlush = () => {
      if (realtimeFlushRef.current !== null) return;
      realtimeFlushRef.current = window.setTimeout(flushRealtime, 0);
    };
    const unsubscribe = adapterRef.current.subscribe(chatId, {
      onMessage: (message) => {
        realtimeQueueRef.current.push(message);
        scheduleRealtimeFlush();
      },
      onMessageUpdate: (messageId, update) => dispatch({ type: 'message:update', messageId, update }),
      onMessageDelete: (messageId) => dispatch({ type: 'message:delete', messageId }),
    });
    return () => {
      if (realtimeFlushRef.current !== null) window.clearTimeout(realtimeFlushRef.current);
      realtimeFlushRef.current = null;
      realtimeQueueRef.current = [];
      unsubscribe?.();
    };
  }, [chatId]);

  const sendMessage = useCallback(async (contentOrInput: string | Omit<SendMessageInput, 'chatId' | 'senderId'>) => {
    if (!chatId) return null;
    const input = typeof contentOrInput === 'string' ? { content: contentOrInput } : contentOrInput;
    if (!input.content?.trim() && !input.attachments?.length) return null;

    const optimistic = buildOptimisticMessage({ ...input, chatId, senderId: currentUserId, id: input.clientId });
    dispatch({ type: 'message:add', message: optimistic });
    dispatch({ type: 'sending', value: true });

    try {
      const serverMessage = adapterRef.current?.sendMessage
        ? await adapterRef.current.sendMessage({ ...input, chatId, senderId: currentUserId, clientId: optimistic.id })
        : { ...optimistic, status: 'sent' as const };
      dispatch({ type: 'message:replace', optimisticId: optimistic.id, message: serverMessage });
      return serverMessage;
    } catch (error) {
      dispatch({ type: 'message:status', messageId: optimistic.id, status: 'failed' });
      dispatch({ type: 'load:error', error: toError(error) });
      return null;
    } finally {
      dispatch({ type: 'sending', value: false });
    }
  }, [chatId, currentUserId]);

  const retryMessage = useCallback(async (messageId: string) => {
    const message = state.messages.find((item) => item.id === messageId);
    if (!chatId || !message || message.status !== 'failed') return null;
    dispatch({ type: 'message:status', messageId, status: 'sending' });
    try {
      const serverMessage = adapterRef.current?.sendMessage
        ? await adapterRef.current.sendMessage({
            chatId,
            content: message.content,
            senderId: currentUserId,
            type: message.type,
            attachments: message.attachments,
            replyToId: message.replyToId,
            replyTo: message.replyTo,
            clientId: message.id,
          })
        : { ...message, status: 'sent' as const };
      dispatch({ type: 'message:replace', optimisticId: message.id, message: serverMessage });
      return serverMessage;
    } catch (error) {
      dispatch({ type: 'message:status', messageId, status: 'failed' });
      dispatch({ type: 'load:error', error: toError(error) });
      return null;
    }
  }, [chatId, currentUserId, state.messages]);

  const updateMessage = useCallback(async (messageId: string, update: Partial<Message>) => {
    if (!chatId) return;
    dispatch({ type: 'message:update', messageId, update });
    const result = await adapterRef.current?.updateMessage?.(chatId, messageId, update);
    if (result) dispatch({ type: 'message:update', messageId, update: result });
  }, [chatId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!chatId) return;
    dispatch({ type: 'message:delete', messageId });
    await adapterRef.current?.deleteMessage?.(chatId, messageId);
  }, [chatId]);

  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    if (!chatId) return;
    const result = await adapterRef.current?.reactToMessage?.(chatId, messageId, emoji, currentUserId);
    if (result) dispatch({ type: 'message:update', messageId, update: result });
  }, [chatId, currentUserId]);

  const markAsRead = useCallback(async (messageIds = state.messages.map((message) => message.id)) => {
    if (!chatId || messageIds.length === 0) return;
    await adapterRef.current?.markAsRead?.(chatId, messageIds);
  }, [chatId, state.messages]);

  const groupedMessages = useMemo(() => groupMessagesByDate(state.messages), [state.messages]);

  return {
    ...state,
    groupedMessages,
    loadInitialMessages,
    loadOlderMessages,
    sendMessage,
    retryMessage,
    updateMessage,
    deleteMessage,
    reactToMessage,
    markAsRead,
  };
}
