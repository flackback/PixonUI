import { useCallback, useRef, useState } from 'react';
import type { Message } from '../components/chat/types';

export interface StreamingChatController {
  appendMessage: (message: Message) => void;
  updateMessage: (messageId: string, update: Partial<Message>) => void | Promise<void>;
}

export interface StreamHelpers {
  append: (chunk: string) => void;
  set: (content: string) => void;
  finish: (update?: Partial<Message>) => void;
  fail: (error: Error | string) => void;
  messageId: string;
}

export interface StartStreamingMessageOptions {
  id?: string;
  senderId?: string;
  initialContent?: string;
  type?: Message['type'];
  metadata?: Partial<Message>;
  onStream: (helpers: StreamHelpers) => Promise<void> | void;
}

export interface UseStreamingMessageOptions {
  chat: StreamingChatController;
  defaultSenderId?: string;
}

const createStreamId = () => `stream_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export function useStreamingMessage({
  chat,
  defaultSenderId = 'assistant',
}: UseStreamingMessageOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const activeMessageIdRef = useRef<string | null>(null);
  const bufferRef = useRef('');
  const frameRef = useRef<number | null>(null);

  const flush = useCallback((messageId: string) => {
    frameRef.current = null;
    void chat.updateMessage(messageId, {
      content: bufferRef.current,
      status: 'sending',
    });
  }, [chat]);

  const scheduleFlush = useCallback((messageId: string) => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => flush(messageId));
  }, [flush]);

  const start = useCallback(async ({
    id = createStreamId(),
    senderId = defaultSenderId,
    initialContent = '',
    type = 'text',
    metadata,
    onStream,
  }: StartStreamingMessageOptions) => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    activeMessageIdRef.current = id;
    setActiveMessageId(id);
    bufferRef.current = initialContent;
    setIsStreaming(true);

    chat.appendMessage({
      id,
      content: initialContent,
      senderId,
      timestamp: new Date(),
      status: 'sending',
      type,
      ...metadata,
    });

    let finished = false;

    const helpers: StreamHelpers = {
      messageId: id,
      append: (chunk) => {
        bufferRef.current += chunk;
        scheduleFlush(id);
      },
      set: (content) => {
        bufferRef.current = content;
        scheduleFlush(id);
      },
      finish: (update) => {
        finished = true;
        if (frameRef.current !== null) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        void chat.updateMessage(id, {
          content: bufferRef.current,
          status: 'sent',
          ...update,
        });
      },
      fail: (error) => {
        finished = true;
        if (frameRef.current !== null) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        void chat.updateMessage(id, {
          content: bufferRef.current,
          status: 'failed',
          transcription: error instanceof Error ? error.message : error,
        });
      },
    };

    try {
      await onStream(helpers);
      if (!finished) helpers.finish();
    } catch (error) {
      helpers.fail(error instanceof Error ? error : String(error));
    } finally {
      activeMessageIdRef.current = null;
      setActiveMessageId(null);
      setIsStreaming(false);
    }

    return id;
  }, [chat, defaultSenderId, scheduleFlush]);

  const cancel = useCallback(() => {
    const messageId = activeMessageIdRef.current;
    if (!messageId) return;
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    void chat.updateMessage(messageId, {
      content: bufferRef.current,
      status: 'failed',
      transcription: 'Streaming cancelled',
    });
    activeMessageIdRef.current = null;
    setActiveMessageId(null);
    setIsStreaming(false);
  }, [chat]);

  return {
    isStreaming,
    activeMessageId,
    start,
    cancel,
  };
}
