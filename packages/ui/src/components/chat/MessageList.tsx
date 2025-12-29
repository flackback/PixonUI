import React, { useRef, useEffect, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { cn } from '../../utils/cn';
import type { Message } from './types';
import { MessageBubble } from './MessageBubble';
import { useVirtualList } from '../../hooks/useVirtualList';
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
  onSelect?: (message: Message) => void;
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
  onSelect,
  onLoadMore,
  hasMore,
  isLoadingMore,
  selectedMessages = [],
  dateFormat = 'MMMM d, yyyy',
  groupByDate = true,
  ...props 
}: MessageListProps) {
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const isPrependingRef = useRef(false);
  const lastTotalHeightRef = useRef(0);
  
  // Estimate height based on message type and content length
  const getMessageHeight = useCallback((index: number) => {
    const msg = messages[index];
    if (!msg) return 0;
    
    let height = 60; // Base height
    if (msg.type === 'image' || msg.type === 'video') height += 200;
    if (msg.type === 'audio') height += 40;
    if (msg.content) height += Math.ceil(msg.content.length / 50) * 20;
    if (msg.replyTo) height += 50;
    if (msg.reactions && Object.keys(msg.reactions).length > 0) height += 30;
    
    return height + 16; // Add padding
  }, [messages]);

  const { containerRef, visibleItems, totalHeight, onScroll, scrollToBottom } = useVirtualList({
    itemCount: messages.length,
    itemHeight: getMessageHeight,
    overscan: 15,
    startAtBottom: true,
  });

  // Maintain scroll position after prepending
  useLayoutEffect(() => {
    if (isPrependingRef.current && containerRef.current) {
      const heightDiff = totalHeight - lastTotalHeightRef.current;
      if (heightDiff > 0) {
        containerRef.current.scrollTop += heightDiff;
      }
      isPrependingRef.current = false;
    }
    lastTotalHeightRef.current = totalHeight;
  }, [totalHeight]);

  useEffect(() => {
    if (shouldAutoScroll && !isPrependingRef.current) {
      scrollToBottom('smooth');
    }
  }, [messages.length, shouldAutoScroll, scrollToBottom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e);
    const target = e.currentTarget;
    const isAtBottom = Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) < 100;
    setShouldAutoScroll(isAtBottom);

    if (target.scrollTop === 0 && hasMore && !isLoadingMore && onLoadMore) {
      isPrependingRef.current = true;
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
        className="h-full overflow-y-auto scrollbar-hide p-4"
      >
        <div className="relative" style={{ height: totalHeight }}>
          {visibleItems.map(({ index, offsetTop, height }) => {
            const message = messages[index];
            if (!message) return null;

            const isOwn = message.senderId === currentUserId;
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showAvatar = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId);

            return (
              <div 
                key={message.id} 
                className="absolute left-0 right-0"
                style={{ top: offsetTop, height }}
              >
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
                  onSelect={() => onSelect?.(message)}
                  isSelected={selectedMessages.includes(message.id)}
                />
              </div>
            );
          })}
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
