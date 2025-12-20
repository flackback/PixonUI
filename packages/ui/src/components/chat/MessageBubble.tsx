import React from 'react';
import { cn } from '../../utils/cn';
import type { Message } from './types';
import { Check, CheckCheck, MoreHorizontal, Reply, Trash2, Copy, Smile } from 'lucide-react';
import { Motion } from '../feedback/Motion';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../overlay/DropdownMenu';
import { Image } from '../data-display/Image';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showStatus?: boolean;
  className?: string;
  onReply?: (message: Message) => void;
  onReact?: (message: Message, emoji: string) => void;
  onDelete?: (message: Message) => void;
}

export function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar, 
  showStatus = true, 
  className,
  onReply,
  onReact,
  onDelete
}: MessageBubbleProps) {
  return (
    <Motion 
      preset="spring"
      className={cn(
        "flex w-full gap-2 mb-1 group relative",
        isOwn ? "justify-end" : "justify-start",
        className
      )}
    >
      {/* Actions Menu (Hover) */}
      <div className={cn(
        "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10",
        isOwn ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isOwn ? "end" : "start"}>
            <DropdownMenuItem onClick={() => onReply?.(message)}>
              <Reply className="h-4 w-4 mr-2" /> Reply
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onReact?.(message, '👍')}>
              <Smile className="h-4 w-4 mr-2" /> React
            </DropdownMenuItem>
            {isOwn && (
              <DropdownMenuItem onClick={() => onDelete?.(message)} className="text-red-500">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={cn(
        "relative max-w-[70%] px-4 py-2 rounded-2xl shadow-sm transition-all",
        isOwn 
          ? "bg-blue-600 text-white rounded-tr-sm" 
          : "bg-white dark:bg-white/[0.06] text-gray-900 dark:text-white rounded-tl-sm border border-gray-200 dark:border-transparent"
      )}>
        {/* Reply Context */}
        {message.replyToId && (
          <div className={cn(
            "mb-2 rounded px-2 py-1 text-xs border-l-2 opacity-80",
            isOwn ? "bg-white/[0.06] border-white/50" : "bg-gray-100 dark:bg-black/20 border-blue-500"
          )}>
            Replying to message...
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 space-y-2">
            {message.attachments.map(att => (
              att.type === 'image' ? (
                <Image 
                  key={att.id} 
                  src={att.url} 
                  alt="Attachment" 
                  className="rounded-2xl max-h-60 object-cover w-full"
                />
              ) : (
                <div key={att.id} className="flex items-center gap-2 p-2 rounded bg-black/5 dark:bg-white/[0.06]">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-white/20 rounded flex items-center justify-center text-xs font-bold">
                    FILE
                  </div>
                  <div className="text-xs truncate flex-1">{att.name || 'File'}</div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Content */}
        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>

        {/* Metadata */}
        <div className={cn(
          "flex items-center justify-end gap-1 mt-1 select-none",
          isOwn ? "text-blue-100" : "text-gray-400 dark:text-white/40"
        )}>
          <span className="text-[10px]">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && showStatus && (
            <span className="flex items-center">
              {message.status === 'read' ? (
                <CheckCheck className="h-3 w-3 text-blue-200" />
              ) : message.status === 'delivered' ? (
                <CheckCheck className="h-3 w-3 text-blue-200/50" />
              ) : (
                <Check className="h-3 w-3 text-blue-200/50" />
              )}
            </span>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="absolute -bottom-2 right-4 flex gap-1">
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <div key={emoji} className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-white/10 rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1">
                <span>{emoji}</span>
                <span className="text-gray-500">{users.length}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Motion>
  );
}
