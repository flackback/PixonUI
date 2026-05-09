import { useState, useCallback, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  metadata?: Record<string, any>;
}

export interface UseChatOptions {
  /** Initial messages to populate the chat */
  initialMessages?: ChatMessage[];
  /** Callback function to handle sending messages to a backend */
  onSendMessage?: (content: string) => Promise<void>;
  /** Threshold in pixels to trigger auto-scroll */
  scrollThreshold?: number;
  /** Unique key to persist drafted input in local storage */
  draftKey?: string;
}

/**
 * A comprehensive hook for managing chat state, optimistic updates, and scroll behavior.
 * 
 * @example
 * const { messages, sendMessage, scrollRef } = useChat({
 *   onSendMessage: async (content) => await api.post('/messages', { content })
 * });
 */
export function useChat({ 
  initialMessages = [], 
  onSendMessage,
  scrollThreshold = 100,
  draftKey
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);
  const messagesRef = useRef(messages);

  // Keep messages reference updated for stable callback dependencies
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Draft state management
  const [draft, setDraftState] = useState<string>(() => {
    if (draftKey && typeof window !== 'undefined') {
      return localStorage.getItem(draftKey) || '';
    }
    return '';
  });

  // Track draftKey changes
  useEffect(() => {
    if (draftKey && typeof window !== 'undefined') {
      setDraftState(localStorage.getItem(draftKey) || '');
    }
  }, [draftKey]);

  const setDraft = useCallback((value: string | ((prev: string) => string)) => {
    setDraftState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      if (draftKey && typeof window !== 'undefined') {
        if (next) {
          localStorage.setItem(draftKey, next);
        } else {
          localStorage.removeItem(draftKey);
        }
      }
      return next;
    });
  }, [draftKey]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  // Handle scroll events to detect if user is at bottom
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      isAtBottom.current = scrollHeight - scrollTop - clientHeight < scrollThreshold;
    }
  }, [scrollThreshold]);

  // Auto-scroll when new messages arrive if user was already at bottom
  useEffect(() => {
    if (isAtBottom.current) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  /**
   * Sends a message with optimistic update support.
   */
  const sendMessage = useCallback(async (content: string, senderId: string) => {
    if (!content.trim()) return;

    const tempId = crypto.randomUUID();
    const newMessage: ChatMessage = {
      id: tempId,
      content,
      senderId,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      if (onSendMessage) {
        await onSendMessage(content);
      }
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, status: 'sent' } : msg))
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, status: 'error' } : msg))
      );
    }
  }, [onSendMessage]);

  /**
   * Retries sending a failed message.
   */
  const retryMessage = useCallback(async (messageId: string) => {
    const messageToRetry = messagesRef.current.find((msg) => msg.id === messageId);
    if (!messageToRetry || messageToRetry.status !== 'error') return;

    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, status: 'sending' as const } : msg))
    );

    try {
      if (onSendMessage) {
        await onSendMessage(messageToRetry.content);
      }
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: 'sent' as const } : msg))
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: 'error' as const } : msg))
      );
    }
  }, [onSendMessage]);

  /**
   * Clears all messages from the state.
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    sendMessage,
    retryMessage,
    clearMessages,
    draft,
    setDraft,
    isTyping,
    setIsTyping,
    isLoading,
    setIsLoading,
    scrollRef,
    handleScroll,
    scrollToBottom,
  };
}
