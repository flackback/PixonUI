import { useState, useCallback, useMemo } from 'react';
import type { Message, MessageStatus } from '../components/chat/types';

export function useChatMessages(initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessageStatus = useCallback((id: string, status: MessageStatus) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  const editMessage = useCallback((id: string, content: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content, isEdited: true } : m));
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string, userId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      
      const reactions = { ...(m.reactions || {}) };
      const users = reactions[emoji] || [];
      
      if (users.includes(userId)) {
        reactions[emoji] = users.filter(id => id !== userId);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji] = [...users, userId];
      }
      
      return { ...m, reactions };
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    addMessage,
    updateMessageStatus,
    deleteMessage,
    editMessage,
    addReaction,
    clearMessages
  };
}
