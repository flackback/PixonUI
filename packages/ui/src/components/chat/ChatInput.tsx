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
  Code
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
  onSend?: (content: string) => void;
  onChange?: (content: string) => void;
  onAttach?: () => void;
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
}

export function ChatInput({ 
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
  placeholder = "Type a message...", 
  users = [],
  replyingTo,
  isRecording,
  maxLength,
  disabled,
  className, 
  ...props 
}: ChatInputProps) {
  const [internalContent, setInternalContent] = useState("");
  const content = value !== undefined ? value : internalContent;
  const setContent = (val: string) => {
    if (onValueChange) onValueChange(val);
    else setInternalContent(val);
  };

  const [isUploading, setIsUploading] = useState(false);
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    textareaRef.current.focus();
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
    if (disabled || (!content.trim() && !isRecording)) return;
    onSend?.(content);
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className={cn("p-4 bg-white/80 dark:bg-black/40 backdrop-blur relative", className)} {...props}>
      {mentionSearch !== null && filteredUsers.length > 0 && (
        <div className="absolute bottom-full left-4 mb-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
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

      {replyingTo && (
        <div className="mb-3 flex items-center justify-between p-3 rounded-2xl bg-blue-500/5 border-l-4 border-blue-500 animate-in slide-in-from-bottom-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-blue-500">Replying to</p>
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

      <div className="flex items-end gap-2">
        <div className="flex items-center gap-1 mb-1">
          <DropdownMenu>
            <DropdownMenuTrigger 
              disabled={disabled}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 dark:text-white/50 transition-colors disabled:opacity-50"
            >
              <Paperclip className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top">
              <DropdownMenuItem onClick={onAttach}>
                <ImageIcon className="h-4 w-4 mr-2" /> Image & Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAttach}>
                <Paperclip className="h-4 w-4 mr-2" /> Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLocation}>
                <MapPin className="h-4 w-4 mr-2" /> Location
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onContact}>
                <AtSign className="h-4 w-4 mr-2" /> Contact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPoll}>
                <AtSign className="h-4 w-4 mr-2" /> Poll
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPix}>
                <AtSign className="h-4 w-4 mr-2" /> PIX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCarousel}>
                <Layout className="h-4 w-4 mr-2" /> Carousel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onButtons}>
                <Layout className="h-4 w-4 mr-2" /> Buttons
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onList}>
                <List className="h-4 w-4 mr-2" /> List Menu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onGif}>
                <Gift className="h-4 w-4 mr-2" /> GIF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button 
            onClick={onEmoji}
            disabled={disabled}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 dark:text-white/50 transition-colors disabled:opacity-50"
          >
            <Smile className="h-5 w-5" />
          </button>
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
              placeholder={placeholder}
              disabled={disabled}
              rows={2}
              className="w-full p-2.5 min-h-[56px] max-h-[300px] rounded-2xl bg-gray-100 dark:bg-white/[0.03] border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/[0.06] text-sm resize-none transition-all outline-none dark:text-white placeholder:text-gray-400 font-medium"
            />
          )}
        </div>

        <div className="flex flex-col items-center gap-1 mb-1">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => insertFormatting('*')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 hover:text-blue-500 transition-colors"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button 
              onClick={() => insertFormatting('_')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 hover:text-blue-500 transition-colors"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
          </div>
          
          {content.trim() || isRecording ? (
            <button 
              onClick={handleSend}
              disabled={disabled}
              className="p-2.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all active:scale-90"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button 
              onClick={onMic}
              disabled={disabled}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 dark:text-white/50 transition-colors disabled:opacity-50"
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
