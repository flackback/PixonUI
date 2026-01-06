import React from 'react';
import { cn } from '../../utils/cn';
import type { Message } from './types';
import { Check, CheckCheck, MoreHorizontal, Reply, Trash2, Copy, Smile, Forward, Pin, Star, Edit2, MapPin, User as UserIcon, FileText, Volume2, Lock } from 'lucide-react';
import { Motion } from '../feedback/Motion';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../overlay/DropdownMenu';
import { Image } from '../data-display/Image';
import { AudioPlayer } from './AudioPlayer';
import { WaveformAudio } from './WaveformAudio';
import { ReadReceipt } from './ReadReceipt';
import { LinkPreview } from './LinkPreview';
import { Avatar } from '../data-display/Avatar';
import { InteractiveMessage } from './InteractiveMessage';
import { CarouselMessage } from './CarouselMessage';

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
  onStar?: (starred: boolean) => void;
  onSelect?: () => void;
  onAction?: (action: any) => void;
  onImageClick?: (url: string) => void;
  onTTS?: () => void;
  onTranscribe?: (message: Message) => void;
  hasAi?: boolean;
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
  onStar,
  onSelect,
  onAction,
  onTTS,
  onTranscribe,
  hasAi,
  onImageClick,
  isSelected
}: MessageBubbleProps) {
  const renderStatus = () => {
    if (!isOwn || !showStatus) return null;
    return <ReadReceipt status={message.status || 'sent'} className="ml-1" />;
  };

  const renderContent = () => {
    if (message.type === 'revoked') {
      return (
        <p className="text-sm italic opacity-50 flex items-center gap-2">
          <Trash2 className="h-3 w-3" /> This message was deleted
        </p>
      );
    }

    switch (message.type) {
      case 'audio':
        return (
          <div className="space-y-2">
            <WaveformAudio 
              src={message.attachments?.[0]?.url || ""} 
              duration={message.attachments?.[0]?.duration} 
              isMe={isOwn} 
            />
            {(message.transcription || message.isTranscribing || hasAi) && (
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                {message.isTranscribing ? (
                  <div className="flex items-center gap-2 text-[10px] text-blue-400 animate-pulse font-bold uppercase tracking-wider">
                    <MoreHorizontal className="h-3 w-3" />
                    Transcrevendo...
                  </div>
                ) : message.transcription ? (
                  <div className="bg-black/10 dark:bg-black/40 p-3 rounded-xl text-xs italic opacity-90 leading-relaxed border-l-2 border-primary/50">
                    {message.transcription}
                  </div>
                ) : hasAi && (
                  <button 
                    onClick={() => onTranscribe?.(message)}
                    className="text-[10px] flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all w-fit font-bold uppercase tracking-wider"
                  >
                    <Volume2 className="h-3 w-3" />
                    Transcrever com IA
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case 'location':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">{message.location?.address || "Shared Location"}</span>
            </div>
            <div className="aspect-video rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center overflow-hidden relative group/map">
              <MapPin className="h-8 w-8 opacity-20 group-hover/map:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-blue-500/5 group-hover/map:bg-blue-500/10 transition-colors" />
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-black/5 dark:bg-white/10 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{message.contact?.name}</p>
              <p className="text-xs opacity-60 truncate">{message.contact?.phone}</p>
            </div>
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/10 border border-white/5 hover:bg-black/10 dark:hover:bg-white/20 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.attachments?.[0]?.name || "File"}</p>
              <p className="text-[10px] opacity-60 uppercase">{message.attachments?.[0]?.size || "Unknown size"}</p>
            </div>
          </div>
        );
      case 'sticker':
        return (
          <div className="relative group/sticker">
            <img 
              src={message.attachments?.[0]?.url} 
              alt="Sticker" 
              className="w-32 h-32 object-contain"
            />
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            <div 
              className="relative rounded-2xl overflow-hidden border border-white/5 group/image cursor-pointer"
              onClick={() => onImageClick?.(message.attachments?.[0]?.url || "")}
            >
              <Image 
                src={message.attachments?.[0]?.url || ""} 
                alt={message.content || "Image"}
                className="max-h-[300px] w-auto object-contain bg-black/20 transition-transform duration-300 group-hover/image:scale-105"
              />
            </div>
            {message.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words px-1">{message.content}</p>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="space-y-2">
            <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-black/20 aspect-video flex items-center justify-center group/video">
              <video 
                src={message.attachments?.[0]?.url} 
                controls 
                className="max-h-[300px] w-full"
              />
            </div>
            {message.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words px-1">{message.content}</p>
            )}
          </div>
        );
      case 'interactive':
        if (message.interactive?.type === 'carousel' && message.interactive.cards) {
          return <CarouselMessage cards={message.interactive.cards} isOwn={isOwn} onAction={onAction} />;
        }
        if (message.interactive) {
          return <InteractiveMessage data={message.interactive} isOwn={isOwn} onAction={onAction} />;
        }
        return null;
      default:
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = message.content.match(urlRegex);
        
        return (
          <div className="space-y-2">
            {message.replyTo && (
              <div className="mb-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 border-l-4 border-blue-500 text-xs">
                <p className="font-bold text-blue-500 truncate">
                  {message.replyTo.senderId === message.senderId ? 'You' : 'Other'}
                </p>
                <p className="opacity-60 truncate">{message.replyTo.content}</p>
              </div>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            {urls && urls.map(url => <LinkPreview key={url} url={url} />)}
          </div>
        );
    }
  };

  return (
    <div className={cn(
      "flex w-full mb-4 group/bubble",
      isOwn ? "justify-end" : "justify-start",
      className
    )}>
      {!isOwn && showAvatar && (
        <div className="mr-2 mt-auto">
          <Avatar 
            src={message.contact?.avatar} 
            alt={message.contact?.name || "User"} 
            className="w-8 h-8"
            fallback={(message.contact?.name || message.senderId || "?").charAt(0).toUpperCase()}
          />
        </div>
      )}
      
      <div className={cn(
        "relative max-w-[75%] sm:max-w-[60%] transition-all duration-300",
        isSelected && "scale-95 opacity-80"
      )}>
        {message.agentName && (
          <div className={cn(
            "flex items-center gap-1.5 mb-1 px-2 opacity-50",
            isOwn ? "justify-end" : "justify-start"
          )}>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10">
              <UserIcon size={10} className="text-blue-400" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase">Agente: {message.agentName}</span>
          </div>
        )}

        <Motion preset="spring">
          <div className={cn(
            "relative p-3 rounded-2xl shadow-sm backdrop-blur-md border",
            message.isInternalNote
              ? "bg-amber-500/10 border-amber-500/20 text-amber-100 italic"
              : (isOwn 
                  ? "bg-blue-600/90 dark:bg-blue-500/20 text-white border-blue-500/20 rounded-tr-none" 
                  : "bg-white/80 dark:bg-white/[0.05] text-gray-900 dark:text-white border-white/10 rounded-tl-none"),
            "hover:shadow-lg hover:shadow-blue-500/5 transition-shadow"
          )}>
            {message.isInternalNote && (
              <div className="flex items-center gap-1.5 mb-1.5 px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 w-fit">
                <Lock size={10} className="text-amber-500" />
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Nota Interna</span>
              </div>
            )}
            {!isOwn && message.remoteJid?.endsWith('@g.us') && message.contact?.name && (
              <p className="text-[11px] font-bold text-blue-500 dark:text-blue-400 mb-1 truncate">
                {message.contact.name}
              </p>
            )}
            {renderContent()}
            
            <div className="flex items-center justify-end gap-1 mt-1 opacity-60 text-[10px]">
              <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {renderStatus()}
            </div>

            {/* Reactions */}
            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div className="absolute -bottom-3 right-2 flex -space-x-1">
                {Object.entries(message.reactions).map(([emoji, users]) => (
                  <div 
                    key={emoji}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-full px-1.5 py-0.5 text-xs shadow-sm animate-in zoom-in-50"
                    title={users.join(', ')}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Motion>

        {/* Actions Menu */}
        <div className={cn(
          "absolute top-0 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1",
          isOwn ? "right-full mr-2" : "left-full ml-2"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
              <Smile className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" className="flex gap-1 p-1">
              {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => onReact?.(emoji)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? "end" : "start"}>
              <DropdownMenuItem onClick={onReply}>
                <Reply className="h-4 w-4 mr-2" /> Reply
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopy}>
                <Copy className="h-4 w-4 mr-2" /> Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onForward}>
                <Forward className="h-4 w-4 mr-2" /> Forward
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPin}>
                <Pin className="h-4 w-4 mr-2" /> Pin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStar?.(true)}>
                <Star className="h-4 w-4 mr-2" /> Star
              </DropdownMenuItem>
              {onTTS && message.type === 'text' && (
                <DropdownMenuItem onClick={onTTS}>
                  <Volume2 className="h-4 w-4 mr-2" /> Listen (TTS)
                </DropdownMenuItem>
              )}
              {isOwn && (
                <>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
