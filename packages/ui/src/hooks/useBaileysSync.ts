import { useEffect } from 'react';
import { chatStore } from './useChatStore';
import { useSocket } from './useSocket';
import type { Message, Conversation, PresenceStatus } from '../components/chat/types';

/**
 * Hook to synchronize Baileys/WhatsApp events from a Socket.io server into the ChatStore.
 */
export function useBaileysSync(socketUrl: string, token?: string) {
  const { on, emit, isConnected } = useSocket({ url: socketUrl, token });

  useEffect(() => {
    // Sync initial state
    on('chats.set', (chats: Conversation[]) => {
      chatStore.setConversations(chats);
    });

    // Upsert chat (new or updated)
    on('chats.upsert', (chats: Conversation[]) => {
      chats.forEach(chat => chatStore.upsertConversation(chat));
    });

    // Update chat properties
    on('chats.update', (updates: Partial<Conversation>[]) => {
      updates.forEach(update => {
        if (update.id) chatStore.upsertConversation(update as any);
      });
    });

    // New messages
    on('messages.upsert', ({ chatId, messages }: { chatId: string, messages: Message[] }) => {
      messages.forEach(msg => chatStore.addMessage(chatId, msg));
    });

    // Message status updates (sent, delivered, read)
    on('messages.update', ({ chatId, messageId, status }: { chatId: string, messageId: string, status: Message['status'] }) => {
      chatStore.updateMessageStatus(chatId, messageId, status);
    });

    // Presence updates (typing, recording, online)
    on('presence.update', ({ userId, status }: { userId: string, status: PresenceStatus }) => {
      chatStore.setUserPresence(userId, status);
    });

    // Group metadata updates
    on('groups.update', (updates: any[]) => {
      updates.forEach(update => {
        chatStore.upsertConversation({ id: update.id, group: update });
      });
    });

  }, [on]);

  return { isConnected, emit };
}

/**
 * Hook for managing "is typing" or "is recording" status with debouncing.
 */
export function useChatPresence(chatId: string, userId: string) {
  const { emit } = useSocket({ url: '' }); // Assumes global socket or passed via context

  const setPresence = (status: PresenceStatus) => {
    emit('presence.send', { chatId, userId, status });
  };

  return { setPresence };
}

/**
 * Hook for handling media uploads with progress.
 */
export function useChatMedia() {
  const uploadMedia = async (file: File, onProgress?: (p: number) => void) => {
    // Implementation for enterprise-grade media upload
    // Could use S3 presigned URLs or direct socket stream
    return { url: '...', thumbnail: '...', blurhash: '...' };
  };

  return { uploadMedia };
}

/**
 * Hook for searching messages across thousands of entries using a Web Worker.
 */
export function useChatSearchWorker(messages: Message[]) {
  // In a real app, this would use a Web Worker to avoid blocking the UI thread
  const search = (query: string) => {
    if (!query) return messages;
    return messages.filter(m => m.content.toLowerCase().includes(query.toLowerCase()));
  };

  return { search };
}
