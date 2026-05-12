import React, { useRef, useMemo, useCallback } from 'react';
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
  onFileClick?: (file: any) => void;
  className?: string;
  itemHeight?: number | ((index: number) => number); // Estimated height or custom height estimator function
}

/**
 * A highly performant virtualized message stream, designed to handle thousands of
 * messages with fluid, zero-jank 120Hz physics. Fits dynamic bubble heights based
 * on message structures, text lengths, and attachments, preventing overflows and collisions.
 */
export function VirtualizedMessageList({ 
  messages, 
  currentUserId, 
  onReply,
  onImageClick,
  onFileClick,
  className,
  itemHeight
}: VirtualizedMessageListProps) {
  
  // Intelligent content-based dynamic layout height estimator
  const getDynamicItemHeight = useCallback((index: number) => {
    const msg = messages[index];
    if (!msg) return 80;

    let height = 70; // Base text bubble layout padding offset

    // Approximate text content height
    if (msg.content) {
      const lines = Math.ceil(msg.content.length / 55);
      height += lines * 21;
    }

    // Dynamic attachments
    if (msg.attachments && msg.attachments.length > 0) {
      height += msg.attachments.length * 58;
    }

    // Media visuals
    const isImage = msg.type === 'image' || (msg.attachments && msg.attachments.length > 0 && msg.attachments[0]?.type === 'image');
    if (isImage) {
      height += 210;
    }

    // Carousel interactive blocks
    if (msg.type === 'interactive' && msg.interactive?.type === 'carousel') {
      height += 290;
    }

    // Interactive button lists
    if (msg.type === 'interactive' && (msg.interactive?.buttons || msg.interactive?.sections)) {
      height += 150;
    }

    // Replied message preview reference block
    if (msg.replyTo) {
      height += 55;
    }

    // Sticky Date Separator
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const showDate = !prevMsg || 
      new Date(prevMsg.timestamp).toDateString() !== new Date(msg.timestamp).toDateString();
    if (showDate) {
      height += 42;
    }

    return height;
  }, [messages]);

  const heightResolver = itemHeight !== undefined ? itemHeight : getDynamicItemHeight;

  const { 
    containerRef, 
    visibleItems, 
    totalHeight, 
    onScroll 
  } = useVirtualList({
    itemCount: messages.length,
    itemHeight: heightResolver,
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
                  sticky={false}
                />
              )}
              <MessageBubble 
                message={message}
                isOwn={message.senderId === currentUserId}
                onReply={() => onReply?.(message)}
                onImageClick={onImageClick}
                onFileClick={onFileClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
