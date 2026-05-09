import React, { useRef, useMemo } from 'react';
import { cn } from '../../utils/cn';
import type { Message } from './types';
import { MessageBubble } from './MessageBubble';
import { useVirtualList } from '../../hooks/useVirtualList';
import { StickyDateHeader } from './StickyDateHeader';

interface VirtualizedMessageListProps {
  messages: Message[];
  currentUserId: string;
  onReply?: (message: Message) => void;
  onImageClick?: (url: string) => void;
  className?: string;
  itemHeight?: number; // Estimated height
}

export function VirtualizedMessageList({ 
  messages, 
  currentUserId, 
  onReply,
  onImageClick,
  className,
  itemHeight = 80
}: VirtualizedMessageListProps) {
  const { 
    containerRef, 
    visibleItems, 
    totalHeight, 
    onScroll 
  } = useVirtualList({
    itemCount: messages.length,
    itemHeight: itemHeight,
    startAtBottom: true,
    overscan: 10
  });

  return (
    <div 
      ref={containerRef}
      onScroll={onScroll}
      className={cn("flex-1 overflow-y-auto relative no-scrollbar", className)}
    >
      <div 
        className="w-full relative"
        style={{ height: `${totalHeight}px` }}
      >
        {visibleItems.map(({ index, offsetTop, height }) => {
          const message = messages[index];
          if (!message) return null;

          // Check if we should show a date header
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const showDate = !prevMessage || 
            new Date(prevMessage.timestamp).toDateString() !== new Date(message.timestamp).toDateString();

          return (
            <div 
              key={message.id}
              className="absolute left-0 w-full px-4"
              style={{ top: `${offsetTop}px`, height: `${height}px` }}
            >
              {showDate && (
                <StickyDateHeader 
                  date={message.timestamp} 
                  sticky={false} // In virtualized list, we handle sticky differently if needed
                />
              )}
              <MessageBubble 
                message={message}
                isOwn={message.senderId === currentUserId}
                onReply={() => onReply?.(message)}
                onImageClick={onImageClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
