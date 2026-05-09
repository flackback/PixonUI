import React from 'react';
import { cn } from '../../utils/cn';
import type { Message } from './types';
import { Check, CheckCheck, MoreHorizontal, Reply, Trash2, Copy, Smile, Forward, Pin, Edit2, MapPin, User as UserIcon, FileText } from 'lucide-react';
import { Motion } from '../feedback/Motion';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../overlay/DropdownMenu';
import { Image } from '../data-display/Image';
import { AudioPlayer } from './AudioPlayer';
import { ReadReceipt } from './ReadReceipt';
import { LinkPreview } from './LinkPreview';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showStatus?: boolean;
  className?: string;
  onReply?: () => void;
  onReact?: (emoji: string) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onForward?: () => void;
  onCopy?: () => void;
  onPin?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar, 
  showStatus = true, 
  className,
  onReply,
  onReact,
  onDelete,
  onEdit,
  onForward,
  onCopy,
  onPin,
  onSelect,
  isSelected
}: MessageBubbleProps) {
  const renderContent = () => {
    switch (message.type) {
      case 'audio':
        return (
          <AudioPlayer 
            src={message.attachments?.[0]?.url || ""} 
            duration={message.attachments?.[0]?.duration} 
            isMe={isOwn} 
          />
        );
      case 'location':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-inherit">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">{message.location?.address || "Shared Location"}</span>
            </div>
            <div className="aspect-video rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
              <MapPin className="h-8 w-8 opacity-20" />
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-100 dark:bg-white/10">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 text-inherit">
              <p className="text-sm font-bold truncate">{message.contact?.name}</p>
              <p className="text-xs opacity-60 truncate">{message.contact?.phone}</p>
            </div>
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/5">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="flex-1 min-w-0 text-inherit">
              <p className="text-sm font-medium truncate">{message.attachments?.[0]?.name || "File"}</p>
              <p className="text-[10px] opacity-60 uppercase">{message.attachments?.[0]?.size || "Unknown size"}</p>
            </div>
          </div>
        );
      default:
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = message.content.match(urlRegex);
        
        return (
          <div className="space-y-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            {urls && urls.map((url, i) => (
              <LinkPreview 
                key={i} 
                url={url} 
                className={cn(
                  "mt-2",
                  isOwn ? "bg-white/10 border-white/20" : "bg-gray-100 dark:bg-black/20"
                )} 
              />
            ))}
          </div>
        );
    }
  };

  return (
    <Motion 
      preset="spring"
      className={cn(
        "flex w-full gap-2 mb-1 group relative",
        isOwn ? "justify-end" : "justify-start",
        isSelected && "bg-blue-500/5",
        className
      )}
      onClick={() => onSelect?.()}
    >
      {/* Quick Emoji Reaction Bar (Hover) */}
      <div className={cn(
        "absolute -top-7 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-10 flex items-center gap-1 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-gray-200 dark:border-neutral-800 p-1 rounded-full shadow-lg",
        isOwn ? "right-4" : "left-4"
      )}>
        {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => {
          const hasReacted = message.reactions?.[emoji]?.includes('me') || message.reactions?.[emoji]?.includes('You');
          return (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation();
                onReact?.(emoji);
              }}
              className={cn(
                "hover:scale-125 transition-transform p-1 text-sm duration-150 rounded-full",
                hasReacted && "bg-blue-500/10 scale-110"
              )}
            >
              {emoji}
            </button>
          );
        })}
        <div className="w-px h-3 bg-gray-200 dark:bg-neutral-800 mx-1" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReply?.();
          }}
          className="p-1 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all"
          title="Reply"
        >
          <Reply className="h-3.5 w-3.5" />
        </button>
      </div>

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
            <DropdownMenuItem onClick={() => onReply?.()}>
              <Reply className="h-4 w-4 mr-2" /> Reply
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit?.()}>
                <Edit2 className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onCopy?.()}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onForward?.()}>
              <Forward className="h-4 w-4 mr-2" /> Forward
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPin?.()}>
              <Pin className="h-4 w-4 mr-2" /> Pin
            </DropdownMenuItem>
            {isOwn && onDelete && (
              <DropdownMenuItem onClick={() => onDelete?.()} className="text-red-500">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col max-w-[70%]">
        <div className={cn(
          "relative px-4 py-2 rounded-2xl shadow-sm transition-all",
          isOwn 
            ? "bg-blue-600 text-white rounded-tr-sm" 
            : "bg-white dark:bg-white/[0.06] text-gray-900 dark:text-white rounded-tl-sm border border-gray-200 dark:border-transparent",
          message.isPinned && "ring-2 ring-blue-500/50"
        )}>
          {/* Reply Context */}
          {message.replyTo && (
            <div className={cn(
              "mb-2 rounded px-2 py-1 text-xs border-l-2 opacity-80",
              isOwn ? "bg-white/[0.1] border-white/50" : "bg-gray-100 dark:bg-black/20 border-blue-500"
            )}>
              <p className="font-bold opacity-60">Replying to</p>
              <p className="truncate text-gray-700 dark:text-gray-300">{message.replyTo.content}</p>
            </div>
          )}

          {/* Attachments (Images) */}
          {message.attachments && message.attachments.length > 0 && message.type === 'image' && (
            <div className="mb-2 space-y-2">
              {message.attachments.map(att => (
                <Image 
                  key={att.id} 
                  src={att.url} 
                  alt="Attachment" 
                  className="rounded-2xl max-h-60 object-cover w-full"
                />
              ))}
            </div>
          )}

          {renderContent()}

          <div className={cn(
            "flex items-center justify-end gap-1 mt-1 text-[10px]",
            isOwn ? "text-white/60" : "text-gray-400"
          )}>
            {message.isEdited && <span>edited</span>}
            <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {isOwn && message.status && <ReadReceipt status={message.status} />}
          </div>
        </div>

        {/* Reactions List */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className={cn(
            "flex flex-wrap gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start"
          )}>
            {Object.entries(message.reactions).map(([emoji, users]) => {
              if (!users || users.length === 0) return null;
              const hasReacted = users.includes('me') || users.includes('You');
              return (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReact?.(emoji);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all duration-200 active:scale-95 group/react relative",
                    hasReacted
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold"
                      : "bg-gray-100 dark:bg-white/[0.05] border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                  )}
                >
                  <span>{emoji}</span>
                  <span className="text-[9px]">{users.length}</span>
                  
                  {/* Tooltip for who reacted */}
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/react:opacity-100 pointer-events-none transition-opacity duration-150 z-20 bg-gray-900/90 backdrop-blur-sm text-white text-[9px] px-2 py-1 rounded shadow-md whitespace-nowrap">
                    {users.join(', ')}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Motion>
  );
}
