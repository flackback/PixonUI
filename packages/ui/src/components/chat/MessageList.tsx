import React, { useRef, useEffect, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { cn } from '../../utils/cn';
import type { Message } from './types';
import { MessageBubble } from './MessageBubble';
import { StickyDateHeader } from './StickyDateHeader';
import { MessageSquare, Calendar, ArrowDown } from 'lucide-react';
import { VirtualizedMessageList } from './VirtualizedMessageList';

interface MessageListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onCopy' | 'onSelect'> {
  messages: Message[];
  currentUserId: string;
  onReply?: (message: Message) => void;
  onReact?: (message: Message, emoji: string) => void;
  onDelete?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onCopy?: (message: Message) => void;
  onPin?: (message: Message) => void;
  onStar?: (message: Message, starred: boolean) => void;
  onSelect?: (message: Message) => void;
  onAction?: (message: Message, action: any) => void;
  onImageClick?: (url: string) => void;
  onFileClick?: (file: any) => void;
  onTTS?: (message: Message) => void;
  onTranscribe?: (message: Message) => void;
  hasAi?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isLoading?: boolean;
  selectedMessages?: string[];
  dateFormat?: string;
  groupByDate?: boolean;
  virtualized?: boolean;
  itemHeight?: number | ((index: number) => number);
}

export function MessageList({ 
  messages, 
  currentUserId, 
  className, 
  onReply,
  onReact,
  onDelete,
  onEdit,
  onForward,
  onCopy,
  onPin,
  onStar,
  onSelect,
  onAction,
  onImageClick,
  onFileClick,
  onTTS,
  onTranscribe,
  hasAi,
  onLoadMore,
  hasMore,
  isLoadingMore,
  isLoading = false,
  selectedMessages = [],
  dateFormat = 'MMMM d, yyyy',
  groupByDate = true,
  virtualized = false,
  itemHeight,
  ...props 
}: MessageListProps) {
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom('smooth');
    }
  }, [messages.length, shouldAutoScroll, scrollToBottom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) < 100;
    setShouldAutoScroll(isAtBottom);

    if (target.scrollTop === 0 && hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex-1 overflow-hidden relative bg-transparent", className)} {...props}>
        <div className="h-full overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent">
          {/* Item 1: Received message */}
          <div className="flex items-end gap-3 max-w-[75%] animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/[0.06] shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 bg-gray-200 dark:bg-white/[0.06] rounded" />
              <div className="p-4 rounded-2xl rounded-bl-none bg-gray-100 dark:bg-white/[0.03] space-y-2">
                <div className="h-3 w-48 bg-gray-200 dark:bg-white/[0.06] rounded" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-white/[0.06] rounded" />
              </div>
            </div>
          </div>

          {/* Item 2: Sent message */}
          <div className="flex items-end justify-end gap-3 max-w-[75%] ml-auto animate-pulse">
            <div className="space-y-2 flex-1">
              <div className="p-4 rounded-2xl rounded-br-none bg-blue-500/10 dark:bg-blue-500/5 space-y-2 flex flex-col items-end">
                <div className="h-3 w-40 bg-blue-500/20 dark:bg-blue-500/10 rounded" />
                <div className="h-3 w-28 bg-blue-500/20 dark:bg-blue-500/10 rounded" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-500/5 shrink-0" />
          </div>

          {/* Item 3: Received message (rich-media skeleton) */}
          <div className="flex items-end gap-3 max-w-[75%] animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/[0.06] shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-16 bg-gray-200 dark:bg-white/[0.06] rounded" />
              <div className="p-3 rounded-2xl rounded-bl-none bg-gray-100 dark:bg-white/[0.03] space-y-3">
                <div className="h-28 w-52 bg-gray-200/60 dark:bg-white/[0.04] rounded-xl" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-white/[0.06] rounded" />
              </div>
            </div>
          </div>

          {/* Item 4: Sent message */}
          <div className="flex items-end justify-end gap-3 max-w-[75%] ml-auto animate-pulse">
            <div className="space-y-2 flex-1">
              <div className="p-4 rounded-2xl rounded-br-none bg-blue-500/10 dark:bg-blue-500/5 space-y-2 flex flex-col items-end">
                <div className="h-3 w-32 bg-blue-500/20 dark:bg-blue-500/10 rounded" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-500/5 shrink-0" />
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isLoadingMore) {
    return (
      <div className={cn("flex-1 flex items-center justify-center p-8 text-center text-gray-500 dark:text-white/40", className)} {...props}>
        <div className="max-w-sm space-y-4">
          <div className="w-24 h-24 bg-blue-500/10 dark:bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <MessageSquare className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">No messages yet</h3>
          <p>Start the conversation by sending a message below.</p>
        </div>
      </div>
    );
  }

  if (virtualized) {
    return (
      <VirtualizedMessageList
        messages={messages}
        currentUserId={currentUserId}
        onReply={onReply}
        onImageClick={onImageClick}
        onFileClick={onFileClick}
        itemHeight={itemHeight}
        className={className}
      />
    );
  }

  return (
    <div className={cn("flex-1 relative overflow-hidden", className)} {...props}>
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <div className="flex flex-col gap-4">
          {hasMore && isLoadingMore && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                Loading older messages...
              </div>
            </div>
          )}
          {messages.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const prevMessage = index > 0 ? messages[index - 1] : null;

            // Date processing
            const msgDate = new Date(message.timestamp);
            const prevMsgDate = prevMessage ? new Date(prevMessage.timestamp) : null;
            const showDate = groupByDate && (!prevMsgDate || msgDate.toDateString() !== prevMsgDate.toDateString());

            const showAvatar = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId || showDate);

            return (
              <React.Fragment key={message.id}>
                {showDate && (
                  <div className="my-4">
                    <StickyDateHeader date={message.timestamp} />
                  </div>
                )}
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  onReply={() => onReply?.(message)}
                  onReact={(emoji) => onReact?.(message, emoji)}
                  onDelete={() => onDelete?.(message)}
                  onEdit={() => onEdit?.(message)}
                  onForward={() => onForward?.(message)}
                  onCopy={() => onCopy?.(message)}
                  onPin={() => onPin?.(message)}
                  onStar={(starred) => onStar?.(message, starred)}
                  onSelect={() => onSelect?.(message)}
                  onAction={(action) => onAction?.(message, action)}
                  onImageClick={onImageClick}
                  onFileClick={onFileClick}
                  onTTS={onTTS ? () => onTTS(message) : undefined}
                  onTranscribe={onTranscribe}
                  hasAi={hasAi}
                  isSelected={selectedMessages.includes(message.id)}
                />
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {!shouldAutoScroll && (
        <button 
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-6 right-6 p-3 rounded-full bg-white dark:bg-white/10 backdrop-blur border border-gray-200 dark:border-white/10 shadow-lg text-gray-600 dark:text-white hover:scale-110 transition-all z-10"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
