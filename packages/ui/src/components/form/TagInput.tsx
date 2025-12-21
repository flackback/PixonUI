import React, { useState, KeyboardEvent } from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';
import { Badge } from '../../primitives/Badge';
import { Label } from './Label';

export interface TagInputProps {
  label?: string;
  placeholder?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  error?: string;
  className?: string;
}

/**
 * An input component for managing a list of tags.
 */
export function TagInput({
  label,
  placeholder = 'Add tag...',
  tags,
  onChange,
  error,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <Label>{label}</Label>}
      
      <div className={cn(
        "flex flex-wrap gap-2 rounded-2xl bg-gray-50 dark:bg-white/[0.04] px-3 py-2 border border-gray-200 dark:border-white/[0.10] focus-within:ring-2 focus-within:ring-purple-400/30 transition-all duration-200",
        error && "border-rose-400/25"
      )}>
        {tags.map((tag) => (
          <Badge key={tag} variant="default" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-white/30 min-w-[120px]"
        />
      </div>

      {error && (
        <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 fade-in duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
