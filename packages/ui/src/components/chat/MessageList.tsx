import React, { useRef, useEffect, useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Message } from './types';
import { MessageBubble } from './MessageBubble';
import { ScrollArea } from '../data-display/ScrollArea';
import { MessageSquare } from 'lucide-react';

interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  messages: Message[];
  currentUserId: string;
  onReply?: (message: Message) => void;
  onReact?: (message: Message, emoji: string) => void;
  onDelete?: (message: Message) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function MessageList({ 
  messages, 
  currentUserId, 
  className, 
  onReply,
  onReact,
  onDelete,
  onLoadMore,
  hasMore,
  isLoadingMore,
  ...props 
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (shouldAutoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) < 50;
    setShouldAutoScroll(isAtBottom);

    if (target.scrollTop === 0 && hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    return messages.reduce((groups, message) => {
      const date = message.timestamp.toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {} as Record<string, Message[]>);
  }, [messages]);

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
    <ScrollArea 
      className={cn("flex-1 p-4", className)} 
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      {...props}
    >
      <div className="space-y-6 pb-4">
        {hasMore && (
          <div className="flex justify-center py-4">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-xs text-white/40">
                <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                Loading older messages...
              </div>
            ) : (
              <button 
                onClick={onLoadMore}
                className="text-xs text-cyan-500/60 hover:text-cyan-500 transition-colors"
              >
                Load older messages
              </button>
            )}
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center sticky top-0 z-10 py-2">
              <span className="px-3 py-1 rounded-full bg-gray-100/80 dark:bg-white/[0.03] text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-white/40 backdrop-blur-md border border-white/5 shadow-sm">
                {date}
              </span>
            </div>
            
            <div className="space-y-1">
              {msgs.map((msg, index) => {
                const isOwn = msg.senderId === currentUserId;
                const prevMsg = msgs[index - 1];
                const nextMsg = msgs[index + 1];
                
                // Logic to group bubbles visually
                const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
                const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

                return (
                  <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    isOwn={isOwn}
                    className={cn(
                      !isLastInGroup && "mb-0.5"
                    )}
                    onReply={onReply}
                    onReact={onReact}
                    onDelete={onDelete}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} className="h-px" />
      </div>
    </ScrollArea>
  );
}
