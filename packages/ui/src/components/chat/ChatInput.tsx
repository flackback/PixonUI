import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Send, Paperclip, Smile, Mic, Image as ImageIcon, AtSign } from 'lucide-react';
import { Button } from '../button/Button';
import { User } from './types';
import { Surface } from '../../primitives/Surface';
import { Avatar } from '../data-display/Avatar';

interface ChatInputProps extends React.HTMLAttributes<HTMLDivElement> {
  onSend?: (content: string) => void;
  onAttach?: () => void;
  placeholder?: string;
  users?: User[];
}

export function ChatInput({ 
  onSend, 
  onAttach, 
  placeholder = "Type a message...", 
  users = [],
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
    const value = e.target.value;
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
    if (!content.trim()) return;
    onSend?.(content);
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleAttachClick = () => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      onAttach?.();
    }, 1000);
  };

  return (
    <div className={cn("relative p-4 border-t border-white/10 bg-white/[0.02]", className)} {...props}>
      {/* Mentions Popover */}
      {mentionSearch !== null && filteredUsers.length > 0 && (
        <Surface className="absolute bottom-full left-4 mb-2 w-64 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="p-2 border-b border-white/10 bg-white/[0.02]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2">
              Mention User
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filteredUsers.map((user: User, idx: number) => (
              <button
                key={user.id}
                onClick={() => insertMention(user)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-2xl transition-colors text-left",
                  idx === mentionIndex ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                )}
              >
                <Avatar src={user.avatar} alt={user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{user.name}</div>
                  <div className="text-xs text-white/40 truncate">@{user.name.toLowerCase().replace(/\s/g, '')}</div>
                </div>
                {idx === mentionIndex && (
                  <div className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-white/60">Enter</div>
                )}
              </button>
            ))}
          </div>
        </Surface>
      )}

      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <div className="flex gap-1 mb-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl text-white/40 hover:text-white" onClick={handleAttachClick} disabled={isUploading}>
            <Paperclip className={cn("w-5 h-5", isUploading && "animate-pulse text-blue-500")} />
          </Button>
        </div>
        
        <div className="flex-1 relative group">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isUploading ? "Uploading..." : placeholder}
            rows={1}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 resize-none transition-all min-h-[44px]"
          />
          <div className="absolute right-3 bottom-2.5 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
            <button className="text-white/20 hover:text-white/60 transition-colors">
              <Smile className="w-4 h-4" />
            </button>
            <button className="text-white/20 hover:text-white/60 transition-colors">
              <AtSign className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-1">
          {content.trim() ? (
            <Button 
              onClick={handleSend}
              className="h-9 w-9 rounded-2xl bg-white text-black hover:bg-white/90 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl text-white/40 hover:text-white">
              <Mic className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
