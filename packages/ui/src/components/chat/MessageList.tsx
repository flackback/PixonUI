import React, { useRef, useEffect, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { cn } from '../../utils/cn';
import type { Message } from './types';
import { MessageBubble } from './MessageBubble';
import { MessageSquare, Calendar, ArrowDown } from 'lucide-react';

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
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  selectedMessages?: string[];
  dateFormat?: string;
  groupByDate?: boolean;
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
  onLoadMore,
  hasMore,
  isLoadingMore,
  selectedMessages = [],
  dateFormat = 'MMMM d, yyyy',
  groupByDate = true,
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

  return (
    <div className={cn("flex-1 relative overflow-hidden", className)} {...props}>
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showAvatar = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId);

            return (
              <MessageBubble
                key={message.id}
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
                isSelected={selectedMessages.includes(message.id)}
              />
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
