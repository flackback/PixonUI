import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Image as ImageIcon, 
  AtSign, 
  X, 
  MapPin, 
  Gift, 
  List, 
  Layout,
  Bold,
  Italic,
  Strikethrough,
  Code,
  FileText,
  FileArchive,
  FileCode,
  Music,
  Video as VideoIcon
} from 'lucide-react';
import { Button } from '../button/Button';
import type { User, Message } from './types';
import { Surface } from '../../primitives/Surface';
import { Avatar } from '../data-display/Avatar';
import { VoiceRecorder } from './VoiceRecorder';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../overlay/DropdownMenu';

interface ChatInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'onChange'> {
  value?: string;
  onValueChange?: (value: string) => void;
  onSend?: (content: string, files?: File[]) => void;
  onChange?: (content: string) => void;
  onAttach?: (files: File[]) => void;
  onMic?: () => void;
  onVoiceEnd?: (blob: Blob, duration: number) => void;
  onEmoji?: () => void;
  onGif?: () => void;
  onLocation?: () => void;
  onContact?: () => void;
  onPoll?: () => void;
  onPix?: () => void;
  onCarousel?: () => void;
  onButtons?: () => void;
  onList?: () => void;
  onCancelReply?: () => void;
  placeholder?: string;
  users?: User[];
  replyingTo?: Message;
  isRecording?: boolean;
  maxLength?: number;
  disabled?: boolean;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  locale?: 'en' | 'pt';
  translations?: Record<string, string>;
}

export const ChatInput = React.memo(function ChatInput({ 
  value,
  onValueChange,
  onSend, 
  onChange,
  onAttach, 
  onMic,
  onVoiceEnd,
  onEmoji,
  onGif,
  onLocation,
  onContact,
  onPoll,
  onPix,
  onCarousel,
  onButtons,
  onList,
  onCancelReply,
  placeholder, 
  users = [],
  replyingTo,
  isRecording,
  maxLength,
  disabled,
  files: externalFiles,
  onFilesChange,
  locale = 'en',
  translations,
  className, 
  ...props 
}: ChatInputProps) {
  const [internalContent, setInternalContent] = useState("");
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const activePlaceholder = placeholder || translations?.typeMessage || (locale === 'pt' ? "Digite uma mensagem..." : "Type a message...");
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const content = value !== undefined ? value : internalContent;
  const setContent = (val: string) => {
    if (value === undefined) {
      setInternalContent(val);
    }
    onValueChange?.(val);
  };

  // Sync external/internal files state
  const selectedFiles = externalFiles !== undefined ? externalFiles : internalFiles;
  const setSelectedFiles = (filesVal: File[]) => {
    if (externalFiles === undefined) {
      setInternalFiles(filesVal);
    }
    onFilesChange?.(filesVal);
  };

  const filteredUsers = useMemo(() => {
    if (mentionSearch === null) return [];
    return users.filter(u => 
      u.name.toLowerCase().includes(mentionSearch.toLowerCase())
    ).slice(0, 5);
  }, [users, mentionSearch]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    const value = e.target.value;
    if (maxLength && value.length > maxLength) return;
    
    setContent(value);
    onChange?.(value);
    
    // Mention logic
    const lastChar = value[e.target.selectionStart - 1];
    const textBeforeCursor = value.slice(0, e.target.selectionStart);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionSearch(mentionMatch[1] || "");
      setMentionIndex(0);
    } else {
      setMentionSearch(null);
    }

    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  };

  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.slice(start, end);
    const textBefore = content.slice(0, start);
    const textAfter = content.slice(end);

    const newContent = textBefore + prefix + selectedText + suffix + textAfter;
    setContent(newContent);
    
    // Reset height after content change
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
      }
    }, 0);

  };

  const insertText = (textToInsert: string) => {
    if (!textareaRef.current) {
      setContent(content + textToInsert);
      onValueChange?.(content + textToInsert);
      onChange?.(content + textToInsert);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const textBefore = content.slice(0, start);
    const textAfter = content.slice(end);

    const newContent = textBefore + textToInsert + textAfter;
    setContent(newContent);
    onValueChange?.(newContent);
    onChange?.(newContent);
    
    const newCursorPos = start + textToInsert.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
      }
    }, 0);
  };

  const insertMention = (user: User) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const textBefore = content.slice(0, start).replace(/@\w*$/, `@${user.name} `);
    const textAfter = content.slice(start);
    setContent(textBefore + textAfter);
    setMentionSearch(null);
    textareaRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (mentionSearch !== null && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % filteredUsers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredUsers[mentionIndex]!);
      } else if (e.key === 'Escape') {
        setMentionSearch(null);
      }
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (disabled) return;
    const hasContent = content.trim().length > 0;
    const hasFiles = selectedFiles.length > 0;
    if (!hasContent && !hasFiles && !isRecording) return;

    onSend?.(content, selectedFiles);
    setContent("");
    setSelectedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Pasting file attachments (WhatsApp style)
  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    const clipboardFiles = e.clipboardData?.files;
    if (clipboardFiles && clipboardFiles.length > 0) {
      e.preventDefault();
      const filesArray = Array.from(clipboardFiles);
      setSelectedFiles([...selectedFiles, ...filesArray]);
      onAttach?.(filesArray);
    }
  };

  // Drag and Drop Local Handlers
  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles([...selectedFiles, ...filesArray]);
      onAttach?.(filesArray);
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...filesArray]);
      onAttach?.(filesArray);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, idx) => idx !== index));
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    const name = file.name.toLowerCase();
    if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-emerald-500" />;
    if (type.startsWith('video/')) return <VideoIcon className="h-5 w-5 text-rose-500" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5 text-amber-500" />;
    if (name.endsWith('.zip') || name.endsWith('.tar') || name.endsWith('.rar') || name.endsWith('.7z')) {
      return <FileArchive className="h-5 w-5 text-yellow-500" />;
    }
    if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.html') || name.endsWith('.css') || name.endsWith('.json')) {
      return <FileCode className="h-5 w-5 text-cyan-500" />;
    }
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "p-4 bg-white dark:bg-zinc-950/20 backdrop-blur relative border border-transparent transition-all duration-300 rounded-3xl",
        isDragOver && "border-2 border-dashed border-blue-500/50 bg-blue-500/[0.02] shadow-[0_0_20px_rgba(59,130,246,0.15)]",
        className
      )} 
      {...props}
    >
      {/* Hidden native input for file upload triggers */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        multiple 
        className="hidden" 
      />

      {mentionSearch !== null && filteredUsers.length > 0 && (
        <div className="absolute bottom-full left-4 mb-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 z-30">
          {filteredUsers.map((user, i) => (
            <button
              key={user.id}
              onClick={() => insertMention(user)}
              className={cn(
                "w-full flex items-center gap-3 p-3 text-left transition-colors",
                i === mentionIndex ? "bg-blue-500/10 dark:bg-white/10" : "hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              <Avatar src={user.avatar} alt={user.name} className="w-8 h-8" />
              <div>
                <p className="text-sm font-bold dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-white/40">@{user.name.toLowerCase().replace(/\s/g, '')}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ─── FILE UPLOAD QUEUE PREVIEW BAR (WhatsApp Style) ─── */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 flex flex-col gap-2 bg-gray-500/[0.04] dark:bg-white/[0.02] rounded-2xl p-3 border border-gray-200/50 dark:border-white/5 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
              {translations?.attachedFiles || (locale === 'pt' ? "Arquivos anexados" : "Attached files")} ({selectedFiles.length})
            </span>
            <button 
              onClick={() => setSelectedFiles([])}
              className="text-[10px] font-bold text-red-500 hover:underline transition-all"
            >
              {translations?.clearAll || (locale === 'pt' ? "Limpar tudo" : "Clear all")}
            </button>
          </div>
          
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {selectedFiles.map((file, idx) => {
              const isImage = file.type.startsWith('image/');
              return (
                <div 
                  key={idx} 
                  className="relative flex-shrink-0 w-44 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-white/5 flex items-center gap-2.5 shadow-sm group hover:border-blue-500/30 transition-all"
                >
                  {isImage ? (
                    <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center border border-gray-200/30 dark:border-white/5">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="preview" 
                        className="h-full w-full object-cover"
                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 shrink-0 flex items-center justify-center border border-blue-500/10">
                      {getFileIcon(file)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs font-bold truncate text-gray-950 dark:text-white" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {formatSize(file.size)}
                    </p>
                  </div>

                  <button 
                    onClick={() => removeFile(idx)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-black/60 hover:bg-red-500/90 text-white rounded-full flex items-center justify-center backdrop-blur-sm shadow transition-colors active:scale-90"
                    title="Remover"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {replyingTo && (
        <div className="mb-3 flex items-center justify-between p-3 rounded-2xl bg-blue-500/5 border-l-4 border-blue-500 animate-in slide-in-from-bottom-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-blue-500">{translations?.replyingTo || (locale === 'pt' ? "Respondendo a" : "Replying to")}</p>
            <p className="text-sm text-gray-600 dark:text-white/60 truncate">{replyingTo.content}</p>
          </div>
          <button 
            onClick={onCancelReply}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 min-h-[48px]">
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger 
                disabled={disabled}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 dark:text-white/50 transition-colors disabled:opacity-50"
              >
                <Paperclip className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top">
                <DropdownMenuItem onClick={handleTriggerFileInput}>
                  <ImageIcon className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" /> {translations?.imageVideo || (locale === 'pt' ? "Imagem & Vídeo" : "Image & Video")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTriggerFileInput}>
                  <Paperclip className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" /> {translations?.document || (locale === 'pt' ? "Documento" : "Document")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLocation}>
                  <MapPin className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" /> {translations?.location || (locale === 'pt' ? "Localização" : "Location")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onContact}>
                  <AtSign className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" /> {translations?.contact || (locale === 'pt' ? "Contato" : "Contact")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPoll}>
                  <AtSign className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" /> {translations?.poll || (locale === 'pt' ? "Enquete" : "Poll")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPix}>
                  <AtSign className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" /> {translations?.pix || (locale === 'pt' ? "PIX" : "PIX")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCarousel}>
                  <Layout className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" /> {translations?.carousel || (locale === 'pt' ? "Carrossel" : "Carousel")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onButtons}>
                  <Layout className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" /> {translations?.buttons || (locale === 'pt' ? "Botões" : "Buttons")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onList}>
                  <List className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" /> {translations?.listMenu || (locale === 'pt' ? "Menu de Lista" : "List Menu")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onGif}>
                  <Gift className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" /> {translations?.gif || (locale === 'pt' ? "GIF" : "GIF")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex-1 relative">
            {isRecording ? (
              <VoiceRecorder 
                onSend={(blob, duration) => onVoiceEnd?.(blob, duration)}
                onCancel={() => onCancelReply?.()}
              />
            ) : (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={activePlaceholder}
                disabled={disabled}
                rows={1}
                className="w-full p-3 min-h-[48px] max-h-[300px] rounded-2xl bg-transparent border border-transparent text-sm resize-none transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 font-medium"
              />
            )}
          </div>

          <div className="flex items-center">
            {content.trim() || selectedFiles.length > 0 || isRecording ? (
              <button 
                onClick={handleSend}
                disabled={disabled}
                className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                <Send className="h-5 w-5" />
              </button>
            ) : (
              <button 
                onClick={onMic}
                disabled={disabled}
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 dark:text-white/50 transition-colors disabled:opacity-50"
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {!isRecording && (
          <div className="flex items-center gap-1 text-gray-400 dark:text-white/30">
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={disabled}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-blue-500 transition-colors disabled:opacity-50"
                title="Emoji"
              >
                <Smile className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-64 p-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 z-50">
                <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {[
                    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🫣', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🫠', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '😵‍💫', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥', '✨', '🌟', '🚀', '🎉', '💡', '💬', '👀', '💯'
                  ].map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => {
                        insertText(emoji);
                        onEmoji?.();
                      }}
                      className="h-7 w-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-base transition-transform active:scale-75"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="w-px h-3 bg-gray-200 dark:bg-white/10 mx-1" />
            <button 
              onClick={() => insertFormatting('*')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-blue-500 transition-colors"
              title="Bold"
            >
              <Bold className="h-4 w-4 animate-out" />
            </button>
            <button 
              onClick={() => insertFormatting('_')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-blue-500 transition-colors"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button 
              onClick={() => insertFormatting('~')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-blue-500 transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </button>
            <button 
              onClick={() => insertFormatting('`', '`')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-blue-500 transition-colors"
              title="Monospace"
            >
              <Code className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';
