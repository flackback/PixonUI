import React from 'react';
import { cn } from '../../utils/cn';
import type { Message } from './types';
import { Check, CheckCheck, MoreHorizontal, Reply, Trash2, Copy, Smile, Forward, Pin, Star, Edit2, MapPin, User as UserIcon, FileText, Volume2, Lock, QrCode, Users, Play } from 'lucide-react';
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
  onFileClick?: (file: any) => void;
  onTTS?: () => void;
  onTranscribe?: (message: Message) => void;
  hasAi?: boolean;
  isSelected?: boolean;
}

const areReactionsEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    const arrA = a[key];
    const arrB = b[key];
    if (!arrB) return false;
    if (arrA.length !== arrB.length) return false;
    for (let i = 0; i < arrA.length; i++) {
      if (arrA[i] !== arrB[i]) return false;
    }
  }
  return true;
};

export const MessageBubble = React.memo(
  function MessageBubble({ 
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
    onFileClick,
    isSelected
  }: MessageBubbleProps) {
    
    // Right Click Context Menu State
    const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number } | null>(null);

    const renderStatus = () => {
      if (!isOwn || !showStatus) return null;
      return <ReadReceipt status={message.status || 'sent'} className="ml-1" />;
    };

    // Rich Text Markdown Style Text Formatting Parser (WhatsApp Style)
    const renderFormattedText = (text: string) => {
      if (!text) return "";
      
      const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_|~~[^~]+~~|~[^~]+~|`[^`]+`)/g;
      const parts = text.split(regex);
      
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <strong key={index} className="font-bold">{part.slice(1, -1)}</strong>;
        }
        if (part.startsWith('__') && part.endsWith('__')) {
          return <em key={index} className="italic">{part.slice(2, -2)}</em>;
        }
        if (part.startsWith('_') && part.endsWith('_')) {
          return <em key={index} className="italic">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('~~') && part.endsWith('~~')) {
          return <span key={index} className="line-through opacity-70">{part.slice(2, -2)}</span>;
        }
        if (part.startsWith('~') && part.endsWith('~')) {
          return <span key={index} className="line-through opacity-70">{part.slice(1, -1)}</span>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code 
              key={index} 
              className={cn(
                "px-1.5 py-0.5 rounded font-mono text-xs",
                isOwn 
                  ? "bg-black/20 text-white font-semibold" 
                  : "bg-black/10 dark:bg-black/30 text-rose-600 dark:text-rose-400"
              )}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });
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
                    <div className="bg-black/10 dark:bg-black/40 p-3 rounded-xl text-xs italic opacity-90 leading-relaxed border-l-2 border-blue-500/50">
                      {message.transcription}
                    </div>
                  ) : hasAi && (
                    <button 
                      onClick={() => onTranscribe?.(message)}
                      className="text-[10px] flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all w-fit font-bold uppercase tracking-wider"
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
              <div className="flex items-center gap-2 text-inherit">
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
              <div className="flex-1 min-w-0 text-inherit">
                <p className="text-sm font-bold truncate">{message.contact?.name}</p>
                <p className="text-xs opacity-60 truncate">{message.contact?.phone}</p>
              </div>
            </div>
          );
        case 'file': {
          const fileAttachment = message.attachments?.[0];
          const fileName = fileAttachment?.name || "Documento.pdf";
          const fileUrl = fileAttachment?.url || "";
          const fileSize = fileAttachment?.size || "340 KB";
          
          let fileType: any = 'pdf';
          const nameLower = fileName.toLowerCase();
          if (nameLower.endsWith('.doc') || nameLower.endsWith('.docx')) fileType = 'docx';
          else if (nameLower.endsWith('.xls') || nameLower.endsWith('.xlsx') || nameLower.endsWith('.csv')) fileType = 'xlsx';
          else if (nameLower.endsWith('.mp3') || nameLower.endsWith('.wav') || nameLower.endsWith('.ogg')) fileType = 'audio';
          else if (nameLower.endsWith('.mp4') || nameLower.endsWith('.webm')) fileType = 'video';
          else if (nameLower.endsWith('.png') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg')) fileType = 'image';

          return (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onFileClick?.({
                  name: fileName,
                  url: fileUrl,
                  type: fileType,
                  size: fileSize
                });
              }}
              className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/10 border border-white/5 hover:bg-black/10 dark:hover:bg-white/20 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-[10px] opacity-60 uppercase">{fileSize}</p>
              </div>
            </div>
          );
        }
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
        case 'image': {
          const imgAttachment = message.attachments?.[0];
          return (
            <div className="space-y-2">
              <div 
                className="relative rounded-2xl overflow-hidden border border-white/5 group/image cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileClick?.({
                    name: imgAttachment?.name || "imagem.png",
                    url: imgAttachment?.url || "",
                    type: 'image',
                    size: imgAttachment?.size
                  });
                }}
              >
                <Image 
                  src={imgAttachment?.url || ""} 
                  alt={message.content || "Image"}
                  className="max-h-[300px] w-auto object-contain bg-black/20 transition-transform duration-300 group-hover/image:scale-105"
                />
              </div>
              {message.content && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words px-1">
                  {renderFormattedText(message.content)}
                </p>
              )}
            </div>
          );
        }
        case 'video': {
          const vidAttachment = message.attachments?.[0];
          return (
            <div className="space-y-2">
              <div 
                className="relative rounded-2xl overflow-hidden border border-white/5 bg-black/20 aspect-video flex items-center justify-center group/video cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileClick?.({
                    name: vidAttachment?.name || "video.mp4",
                    url: vidAttachment?.url || "",
                    type: 'video',
                    size: vidAttachment?.size
                  });
                }}
              >
                <video 
                  src={vidAttachment?.url} 
                  className="max-h-[300px] w-full"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover/video:opacity-100 transition-opacity">
                  <Play className="h-10 w-10 text-white fill-white shadow-xl" />
                </div>
              </div>
              {message.content && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words px-1">
                  {renderFormattedText(message.content)}
                </p>
              )}
            </div>
          );
        }
        case 'qrcode':
          return (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onFileClick?.({
                  name: "Código de Pagamento PIX - PixonUI Supremo",
                  url: "",
                  type: 'qrcode',
                  metadata: {
                    qrcodeValue: message.content || "00020126580014BR.GOV.BCB.PIX..."
                  }
                });
              }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:from-blue-500/15 hover:to-indigo-500/15 transition-all cursor-pointer shadow-lg shadow-blue-500/5 max-w-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md">
                <QrCode className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">QR Code de Pagamento</h4>
                <p className="text-xs text-blue-500 font-semibold">Visualizar e Copiar PIX</p>
              </div>
            </div>
          );
        case 'group':
          return (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onFileClick?.({
                  name: message.content || "🚀 PixonUI Supremo Core Team",
                  url: "",
                  type: 'group',
                  metadata: {
                    groupName: message.content || "🚀 PixonUI Supremo Core Team",
                    groupDescription: "Grupo de colaboração corporativa sincronizada para feedback em tempo real."
                  }
                });
              }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:from-indigo-500/15 hover:to-purple-500/15 transition-all cursor-pointer shadow-lg shadow-indigo-500/5 max-w-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{message.content || "Grupo do WhatsApp"}</h4>
                <p className="text-xs text-indigo-500 font-semibold">Painel e Participantes</p>
              </div>
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
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {renderFormattedText(message.content)}
              </p>
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

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY });
    };

    return (
      <div 
        onClick={() => onSelect?.()}
        onContextMenu={handleContextMenu}
        className={cn(
          "flex w-full mb-4 group/bubble relative cursor-pointer select-none",
          isOwn ? "justify-end" : "justify-start",
          className
        )}
      >
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
                ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-100 italic"
                : (isOwn 
                    ? "bg-blue-600/90 dark:bg-blue-500/20 text-white border-blue-500/20 rounded-tr-none" 
                    : "bg-zinc-100/90 dark:bg-white/[0.05] text-gray-900 dark:text-white border-zinc-200/80 dark:border-white/10 rounded-tl-none"),
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

              {/* Reactions list */}
              {message.reactions && Object.keys(message.reactions).length > 0 && (
                <div className="absolute -bottom-3 right-2 flex -space-x-1 z-10">
                  {Object.entries(message.reactions).map(([emoji, users]) => (
                    <div 
                      key={emoji}
                      className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-full px-1.5 py-0.5 text-xs shadow-sm animate-in zoom-in-50"
                      title={users.join(', ')}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Motion>

          {/* Hover Actions Menu (Desktop/Web fallback) */}
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
                  <DropdownMenuItem 
                    key={emoji}
                    onClick={() => onReact?.(emoji)}
                    className="w-auto p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-transform hover:scale-125 focus:bg-transparent"
                  >
                    {emoji}
                  </DropdownMenuItem>
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

        {/* ─── FLOATING RIGHT-CLICK CONTEXT MENU (WhatsApp/Telegram Style) ─── */}
        {contextMenu && (
          <>
            {/* Fullscreen transparent backdrop overlay to dismiss the menu on any click */}
            <div 
              className="fixed inset-0 z-50 bg-transparent cursor-default"
              onClick={(e) => { e.stopPropagation(); setContextMenu(null); }}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu(null); }}
            />
            
            <div 
              style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
              className="fixed z-[100] w-52 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-2 animate-in zoom-in-95 duration-100 flex flex-col"
              onClick={(e) => { e.stopPropagation(); setContextMenu(null); }}
            >
              {/* Reactions shortcut menu */}
              <div className="flex justify-between p-1.5 border-b border-gray-100 dark:border-neutral-800/80 mb-1 gap-1">
                {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => onReact?.(emoji)}
                    className="hover:scale-125 hover:bg-gray-100 dark:hover:bg-white/10 p-1 rounded-lg transition-all text-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Context list actions */}
              <button 
                onClick={onReply} 
                className="w-full flex items-center px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all text-left"
              >
                <Reply className="h-4 w-4 mr-2" /> Responder
              </button>
              <button 
                onClick={onCopy} 
                className="w-full flex items-center px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all text-left"
              >
                <Copy className="h-4 w-4 mr-2" /> Copiar Texto
              </button>
              <button 
                onClick={onForward} 
                className="w-full flex items-center px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all text-left"
              >
                <Forward className="h-4 w-4 mr-2" /> Encaminhar
              </button>
              <button 
                onClick={onPin} 
                className="w-full flex items-center px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all text-left"
              >
                <Pin className="h-4 w-4 mr-2" /> Fixar Mensagem
              </button>
              
              {isOwn && (
                <>
                  <div className="h-px bg-gray-100 dark:bg-neutral-800/80 my-1" />
                  <button 
                    onClick={onEdit} 
                    className="w-full flex items-center px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-500/10 rounded-xl transition-all text-left"
                  >
                    <Edit2 className="h-4 w-4 mr-2" /> Editar Mensagem
                  </button>
                  <button 
                    onClick={onDelete} 
                    className="w-full flex items-center px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-left"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir Mensagem
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.isSelected === next.isSelected &&
      prev.isOwn === next.isOwn &&
      prev.message.id === next.message.id &&
      prev.message.content === next.message.content &&
      prev.message.status === next.message.status &&
      areReactionsEqual(prev.message.reactions, next.message.reactions)
    );
  }
);
