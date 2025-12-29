import { useSyncExternalStore, useMemo, useCallback } from 'react';
import type { Conversation, Message, PresenceStatus } from '../components/chat/types';

interface ChatState {
  conversations: Map<string, Conversation>;
  messages: Map<string, Message[]>; // chatId -> messages
  activeChatId: string | null;
  presence: Map<string, PresenceStatus>; // userId -> status
}

class ChatStore {
  private state: ChatState = {
    conversations: new Map(),
    messages: new Map(),
    activeChatId: null,
    presence: new Map(),
  };

  private listeners = new Set<() => void>();

  getState = () => this.state;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emitChange(newState: ChatState) {
    this.state = newState;
    for (const listener of this.listeners) {
      listener();
    }
  }

  // Actions
  setConversations(conversations: Conversation[]) {
    this.emitChange({
      ...this.state,
      conversations: new Map(conversations.map(c => [c.id, c]))
    });
  }

  upsertConversation(conversation: Partial<Conversation> & { id: string }) {
    const conversations = new Map(this.state.conversations);
    const existing = conversations.get(conversation.id);
    conversations.set(conversation.id, {
      ...(existing || { unreadCount: 0 }),
      ...conversation,
    } as Conversation);
    
    this.emitChange({
      ...this.state,
      conversations
    });
  }

  setMessages(chatId: string, messages: Message[]) {
    const allMessages = new Map(this.state.messages);
    allMessages.set(chatId, messages);
    this.emitChange({
      ...this.state,
      messages: allMessages
    });
  }

  addMessage(chatId: string, message: Message) {
    const current = this.state.messages.get(chatId) || [];
    if (current.some(m => m.id === message.id)) return;
    
    const allMessages = new Map(this.state.messages);
    allMessages.set(chatId, [...current, message]);
    
    let newState = {
      ...this.state,
      messages: allMessages
    };

    // Update last message in conversation
    const conv = this.state.conversations.get(chatId);
    if (conv) {
      const conversations = new Map(this.state.conversations);
      conversations.set(chatId, {
        ...conv,
        lastMessage: message,
        unreadCount: this.state.activeChatId === chatId ? 0 : (conv.unreadCount || 0) + 1
      });
      newState.conversations = conversations;
    }
    
    this.emitChange(newState);
  }

  updateMessageStatus(chatId: string, messageId: string, status: Message['status']) {
    const current = this.state.messages.get(chatId);
    if (!current) return;

    const index = current.findIndex(m => m.id === messageId);
    if (index !== -1) {
      const updated = [...current];
      const msg = updated[index];
      if (msg) {
        updated[index] = { ...msg, status } as Message;
        const allMessages = new Map(this.state.messages);
        allMessages.set(chatId, updated);
        this.emitChange({
          ...this.state,
          messages: allMessages
        });
      }
    }
  }

  updateMessage(chatId: string, messageId: string, updates: Partial<Message>) {
    const current = this.state.messages.get(chatId);
    if (!current) return;

    const index = current.findIndex(m => m.id === messageId);
    if (index !== -1) {
      const updated = [...current];
      updated[index] = { ...updated[index], ...updates } as Message;
      const allMessages = new Map(this.state.messages);
      allMessages.set(chatId, updated);
      this.emitChange({
        ...this.state,
        messages: allMessages
      });
    }
  }

  addReaction(chatId: string, messageId: string, emoji: string, userId: string) {
    const current = this.state.messages.get(chatId);
    if (!current) return;

    const index = current.findIndex(m => m.id === messageId);
    if (index !== -1) {
      const updated = [...current];
      const msg = { ...updated[index] };
      const reactions = { ...(msg.reactions || {}) };
      const users = [...(reactions[emoji] || [])];
      
      if (!users.includes(userId)) {
        users.push(userId);
        reactions[emoji] = users;
        msg.reactions = reactions;
        updated[index] = msg as Message;
        
        const allMessages = new Map(this.state.messages);
        allMessages.set(chatId, updated);
        this.emitChange({ ...this.state, messages: allMessages });
      }
    }
  }

  removeReaction(chatId: string, messageId: string, emoji: string, userId: string) {
    const current = this.state.messages.get(chatId);
    if (!current) return;

    const index = current.findIndex(m => m.id === messageId);
    if (index !== -1) {
      const updated = [...current];
      const msg = { ...updated[index] };
      const reactions = { ...(msg.reactions || {}) };
      
      if (reactions[emoji]) {
        reactions[emoji] = reactions[emoji].filter(id => id !== userId);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
        msg.reactions = reactions;
        updated[index] = msg as Message;
        
        const allMessages = new Map(this.state.messages);
        allMessages.set(chatId, updated);
        this.emitChange({ ...this.state, messages: allMessages });
      }
    }
  }

  deleteMessage(chatId: string, messageId: string) {
    const current = this.state.messages.get(chatId);
    if (!current) return;

    const index = current.findIndex(m => m.id === messageId);
    if (index !== -1) {
      const updated = [...current];
      updated[index] = {
        ...updated[index],
        type: 'revoked',
        content: 'Esta mensagem foi apagada',
        attachments: [],
        reactions: {},
      } as Message;
      
      const allMessages = new Map(this.state.messages);
      allMessages.set(chatId, updated);
      this.emitChange({ ...this.state, messages: allMessages });
    }
  }

  setActiveChat(chatId: string | null) {
    let newState = {
      ...this.state,
      activeChatId: chatId
    };

    if (chatId) {
      const conv = this.state.conversations.get(chatId);
      if (conv && conv.unreadCount > 0) {
        const conversations = new Map(this.state.conversations);
        conversations.set(chatId, { ...conv, unreadCount: 0 });
        newState.conversations = conversations;
      }
    }
    
    this.emitChange(newState);
  }

  setUserPresence(userId: string, status: PresenceStatus) {
    const presence = new Map(this.state.presence);
    presence.set(userId, status);
    this.emitChange({
      ...this.state,
      presence
    });
  }
}

export const chatStore = new ChatStore();

export function useChatStore<T>(selector: (state: ChatState) => T): T {
  const state = useSyncExternalStore(
    chatStore.subscribe,
    chatStore.getState
  );
  
  // We use a stable selector if possible, but since users pass anonymous functions,
  // we should at least ensure we don't loop.
  return useMemo(() => selector(state), [state, selector]);
}

const conversationsSelector = (state: ChatState) => 
  Array.from(state.conversations.values())
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const timeA = a.lastMessage?.timestamp.getTime() || 0;
      const timeB = b.lastMessage?.timestamp.getTime() || 0;
      return timeB - timeA;
    });

export function useConversations() {
  return useChatStore(conversationsSelector);
}

export function useMessages(chatId: string | null) {
  const selector = useCallback((state: ChatState) => 
    chatId ? state.messages.get(chatId) || [] : [], 
  [chatId]);
  
  return useChatStore(selector);
}

export function useActiveChat() {
  const selector = useCallback((state: ChatState) => 
    state.activeChatId ? state.conversations.get(state.activeChatId) : null,
  []);
  
  return useChatStore(selector);
}

export function useUserPresence(userId: string) {
  const selector = useCallback((state: ChatState) => 
    state.presence.get(userId) || 'unavailable',
  [userId]);
  
  return useChatStore(selector);
}
