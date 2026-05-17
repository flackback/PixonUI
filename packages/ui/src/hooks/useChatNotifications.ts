import { useCallback } from 'react';
import type { Message } from '../components/chat/types';

export type ChatNotificationType = 'message' | 'error' | 'connection';

export interface ChatNotificationEvent {
  type: ChatNotificationType;
  title: string;
  description?: string;
  message?: Message;
  error?: Error;
}

export interface UseChatNotificationsOptions {
  currentUserId: string;
  enabled?: boolean;
  title?: string;
  onNotify?: (event: ChatNotificationEvent) => void;
}

const canUseBrowserNotification = () =>
  typeof window !== 'undefined' &&
  'Notification' in window;

export function useChatNotifications({
  currentUserId,
  enabled = true,
  title = 'Nova mensagem',
  onNotify,
}: UseChatNotificationsOptions) {
  const emit = useCallback((event: ChatNotificationEvent) => {
    if (!enabled) return;
    onNotify?.(event);

    if (
      canUseBrowserNotification() &&
      window.Notification.permission === 'granted'
    ) {
      new window.Notification(event.title, {
        body: event.description,
        tag: event.message?.id ?? event.type,
      });
    }
  }, [enabled, onNotify]);

  const requestPermission = useCallback(async () => {
    if (!canUseBrowserNotification()) return 'unsupported' as const;
    if (window.Notification.permission === 'granted') return 'granted' as const;
    return window.Notification.requestPermission();
  }, []);

  const notifyMessage = useCallback((message: Message) => {
    if (message.senderId === currentUserId) return;
    emit({
      type: 'message',
      title,
      description: message.content,
      message,
    });
  }, [currentUserId, emit, title]);

  const notifyError = useCallback((error: Error) => {
    emit({
      type: 'error',
      title: 'Erro no chat',
      description: error.message,
      error,
    });
  }, [emit]);

  const notifyConnection = useCallback((description: string) => {
    emit({
      type: 'connection',
      title: 'Conexão do chat',
      description,
    });
  }, [emit]);

  return {
    notifyMessage,
    notifyError,
    notifyConnection,
    requestPermission,
  };
}
