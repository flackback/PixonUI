import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Surface } from '../../primitives/Surface';
import { Search } from 'lucide-react';

interface EmojiPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  onSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'] },
  { name: 'Hearts', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'] },
  { name: 'Gestures', emojis: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'] }
];

export function EmojiPicker({ onSelect, className, ...props }: EmojiPickerProps) {
  const [search, setSearch] = useState("");

  const filteredCategories = EMOJI_CATEGORIES.map(cat => ({
    ...cat,
    emojis: cat.emojis.filter(e => search === "" || e.includes(search)) // Simple search, usually emojis have names
  })).filter(cat => cat.emojis.length > 0);

  return (
    <Surface className={cn("w-72 h-96 flex flex-col overflow-hidden shadow-2xl", className)} {...props}>
      <div className="p-3 border-b border-gray-200 dark:border-white/10">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emoji..." 
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-gray-100 dark:bg-white/5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {filteredCategories.map(cat => (
          <div key={cat.name} className="mb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">{cat.name}</h4>
            <div className="grid grid-cols-8 gap-1">
              {cat.emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onSelect(emoji)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}
