import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Send, Paperclip, Smile, Mic, Image as ImageIcon, AtSign, X, MapPin, Gift } from 'lucide-react';
import { Button } from '../button/Button';
import type { User, Message } from './types';
import { Surface } from '../../primitives/Surface';
import { Avatar } from '../data-display/Avatar';

interface ChatInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  onSend?: (content: string) => void;
  onAttach?: () => void;
  onMic?: () => void;
  onEmoji?: () => void;
  onGif?: () => void;
  onLocation?: () => void;
  onCancelReply?: () => void;
  placeholder?: string;
  users?: User[];
  replyingTo?: Message;
  isRecording?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

export function ChatInput({ 
  onSend, 
  onAttach, 
  onMic,
  onEmoji,
  onGif,
  onLocation,
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
  const [content, setContent] = useState("");
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
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
    if (disabled || !content.trim()) return;
    onSend?.(content);
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className={cn("p-4 bg-white/80 dark:bg-black/40 backdrop-blur border-t border-gray-200 dark:border-white/10", className)} {...props}>
      {replyingTo && (
        <div className="mb-3 flex items-center justify-between p-2 rounded-xl bg-blue-500/5 border-l-4 border-blue-500 animate-in slide-in-from-bottom-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-blue-500">Replying to</p>
            <p className="text-sm text-gray-600 dark:text-white/60 truncate">{replyingTo.content}</p>
          </div>
          <button 
            onClick={onCancelReply}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex items-center gap-1 mb-1">
          <button 
            onClick={onAttach}
            disabled={disabled}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 dark:text-white/50 transition-colors disabled:opacity-50"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button 
            onClick={onEmoji}
            disabled={disabled}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 dark:text-white/50 transition-colors disabled:opacity-50"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Recording..." : placeholder}
            disabled={disabled || isRecording}
            rows={1}
            className={cn(
              "w-full resize-none rounded-2xl bg-gray-100 dark:bg-white/[0.03] border-none px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-400 dark:text-white",
              isRecording && "animate-pulse text-red-500"
            )}
          />
          
          {mentionSearch !== null && filteredUsers.length > 0 && (
            <Surface className="absolute bottom-full left-0 mb-2 w-64 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-2">
              <div className="p-1">
                {filteredUsers.map((user, i) => (
                  <button
                    key={user.id}
                    onClick={() => insertMention(user)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-xl text-left transition-colors",
                      i === mentionIndex ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                    )}
                  >
                    <Avatar src={user.avatar} alt={user.name} fallback={user.name[0]} size="sm" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                ))}
              </div>
            </Surface>
          )}
        </div>

        <div className="flex items-center gap-1 mb-1">
          {!content.trim() && !isRecording && (
            <>
              <button 
                onClick={onGif}
                disabled={disabled}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 dark:text-white/50 transition-colors disabled:opacity-50"
              >
                <Gift className="h-5 w-5" />
              </button>
              <button 
                onClick={onLocation}
                disabled={disabled}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 dark:text-white/50 transition-colors disabled:opacity-50"
              >
                <MapPin className="h-5 w-5" />
              </button>
            </>
          )}
          
          {isRecording ? (
            <Button 
              size="icon" 
              variant="ghost"
              onClick={onMic}
              className="rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 animate-pulse"
            >
              <Mic className="h-5 w-5" />
            </Button>
          ) : content.trim() ? (
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={disabled}
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
            >
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <button 
              onClick={onMic}
              disabled={disabled}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-500 dark:text-white/50 transition-colors disabled:opacity-50"
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      {maxLength && (
        <div className="mt-1 text-[10px] text-right text-gray-400">
          {content.length} / {maxLength}
        </div>
      )}
    </div>
  );
}
