import React, { useState, useRef, useEffect, useMemo, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { Label } from './Label';
import { Search, X, Check, ChevronDown } from 'lucide-react';
import { Badge } from '../../primitives/Badge';
import { ScrollArea } from '../data-display/ScrollArea';
import { useAnchoredPopover, type AnchoredPopoverAnimation } from '../../hooks/useAnchoredPopover';

export interface AdvancedSelectOption {
  label: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  avatar?: string;
  group?: string;
}

export interface AdvancedSelectProps {
  label?: string;
  name?: string;
  options: AdvancedSelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: any) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  /** Enable multiple item selections (renders selection as interactive chip tags) */
  multiple?: boolean;
  /** Include real-time query search input filter in dropdown */
  searchable?: boolean;
  /** Let the user clear current selection with one click */
  clearable?: boolean;
  variant?: 'default' | 'ghost' | 'glass' | 'cyber';
  size?: 'sm' | 'md' | 'lg';
  menuAnimation?: AnchoredPopoverAnimation;
}

/**
 * An extremely powerful and premium Dropdown Select.
 * Supports multi-select chips, real-time query filtering, option avatars/descriptions,
 * full keyboard trapping, and fluid animations.
 */
export const AdvancedSelect = React.forwardRef<HTMLDivElement, AdvancedSelectProps>(
  ({ 
    label, 
    name, 
    options, 
    value, 
    defaultValue, 
    onChange, 
    placeholder = 'Select options...', 
    error, 
    disabled, 
    className,
    multiple = false,
    searchable = true,
    clearable = true,
    variant = 'default',
    size = 'md',
    menuAnimation = 'scale'
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [internalValue, setInternalValue] = useState<string | string[]>(
      defaultValue !== undefined ? defaultValue : (multiple ? [] : '')
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);
    const id = React.useId();
    const menuState = useAnchoredPopover(triggerRef, contentRef, { isOpen });

    const isControlled = value !== undefined;
    const currentValues = useMemo<string[]>(() => {
      const val = isControlled ? value : internalValue;
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    }, [isControlled, value, internalValue]);

    // Filtered Options list
    const filteredOptions = useMemo(() => {
      if (!searchQuery) return options;
      const lower = searchQuery.toLowerCase();
      return options.filter(opt => 
        opt.label.toLowerCase().includes(lower) || 
        opt.description?.toLowerCase().includes(lower) ||
        opt.value.toLowerCase().includes(lower) ||
        opt.group?.toLowerCase().includes(lower)
      );
    }, [options, searchQuery]);

    // Active/Selected option tags or strings
    const selectedOptions = useMemo(() => {
      return options.filter(opt => currentValues.includes(opt.value));
    }, [options, currentValues]);

    useEffect(() => {
      if (isOpen) {
        setIsMounted(true);
        const frame = window.requestAnimationFrame(() => setIsVisible(true));
        return () => window.cancelAnimationFrame(frame);
      }

      setIsVisible(false);
      const timeout = window.setTimeout(() => setIsMounted(false), 180);
      return () => window.clearTimeout(timeout);
    }, [isOpen]);

    // Automatically focus search on open
    useEffect(() => {
      if (isOpen && searchable) {
        // Subtle delay to allow container animation to mount smoothly
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else {
        setSearchQuery('');
      }
    }, [isOpen, searchable]);

    // Handle clicking outside to close
    useEffect(() => {
      const clickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node) &&
          contentRef.current &&
          !contentRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', clickOutside);
      return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    // Reset list active index when filter changes
    useEffect(() => {
      setActiveIndex(0);
    }, [searchQuery]);

    const handleSelectOption = (optionValue: string) => {
      if (disabled) return;

      let nextValue: string | string[];

      if (multiple) {
        if (currentValues.includes(optionValue)) {
          // Remove if already selected
          nextValue = currentValues.filter(val => val !== optionValue);
        } else {
          // Add to selections
          nextValue = [...currentValues, optionValue];
        }
      } else {
        nextValue = optionValue;
        setIsOpen(false);
      }

      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    };

    const handleClearAll = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;

      const nextValue = multiple ? [] : '';
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    };

    const handleRemoveChip = (e: React.MouseEvent, chipValue: string) => {
      e.stopPropagation();
      if (disabled) return;

      const nextValue = currentValues.filter(v => v !== chipValue);
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    };

    // Keyboard Accessibility Mapping
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (isOpen) {
          if (filteredOptions[activeIndex]) {
            handleSelectOption(filteredOptions[activeIndex]!.value);
          }
        } else {
          setIsOpen(true);
        }
      } else if (e.key === ' ' && !searchQuery) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setActiveIndex(prev => (prev + 1) % Math.max(filteredOptions.length, 1));
          // Scroll list item into focus view
          const activeEl = listboxRef.current?.children[activeIndex + 1] as HTMLElement;
          if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setActiveIndex(prev => (prev - 1 + filteredOptions.length) % Math.max(filteredOptions.length, 1));
          const activeEl = listboxRef.current?.children[activeIndex - 1] as HTMLElement;
          if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
        }
      }
    };

    useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);

    const menuAnimationClasses = {
      none: '',
      fade: 'transition-opacity duration-180 ease-out',
      scale: 'transition-[opacity,transform] duration-220 ease-out',
      slide: 'transition-[opacity,transform] duration-260 ease-out',
    } as const;

    const sizeClasses = {
      sm: 'min-h-[2.25rem] px-3 py-1.5 rounded-xl text-xs gap-1.5',
      md: 'min-h-[3rem] px-4 py-2 text-sm rounded-2xl gap-2',
      lg: 'min-h-[3.5rem] px-5 py-3 text-base rounded-3.5xl gap-2.5'
    };

    const variantClasses = {
      default: cn(
        'bg-zinc-50 dark:bg-white/[0.04]',
        'border border-zinc-200 dark:border-white/[0.08]',
        'text-zinc-900 dark:text-white',
        'hover:bg-zinc-100 dark:hover:bg-white/[0.06]',
        isOpen && 'border-purple-500/50 dark:border-purple-500/50 ring-2 ring-purple-500/20'
      ),
      ghost: cn(
        'bg-transparent hover:bg-zinc-100 dark:hover:bg-white/[0.05]',
        'border border-transparent',
        'text-zinc-900 dark:text-white',
        isOpen && 'bg-zinc-100 dark:bg-white/[0.05]'
      ),
      glass: cn(
        'bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md',
        'border border-zinc-200/50 dark:border-white/5',
        'text-zinc-900 dark:text-white',
        'shadow-[0_4px_30px_rgba(0,0,0,0.02)]',
        'hover:bg-white/60 dark:hover:bg-zinc-900/40',
        isOpen && 'border-purple-500/30 dark:border-purple-500/20 ring-2 ring-purple-500/10'
      ),
      cyber: cn(
        'bg-zinc-950 border',
        'border-purple-500/30 dark:border-purple-500/20',
        'text-purple-500 dark:text-purple-400',
        'hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]',
        isOpen && 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.20)] ring-2 ring-purple-500/20'
      )
    };

    return (
      <div 
        ref={containerRef} 
        className={cn("flex flex-col gap-1.5 relative w-full", className)}
        onKeyDown={handleKeyDown}
      >
        {label && (
          <Label 
            htmlFor={id}
            className={cn(disabled && "opacity-50 cursor-not-allowed")}
          >
            {label}
          </Label>
        )}

        {/* Input Header Button box */}
        <div
          ref={triggerRef}
          id={id}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between relative transition-all duration-200 cursor-pointer focus:outline-none',
            sizeClasses[size],
            variantClasses[variant],
            disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent hover:shadow-none',
            error && 'border-rose-400/30 focus:ring-rose-400/20'
          )}
        >
          {/* Display Values tags or placeholder */}
          <div className="flex flex-wrap gap-1.5 items-center max-w-[90%] truncate">
            {selectedOptions.length === 0 ? (
              <span className="text-zinc-400 dark:text-zinc-500 text-sm">{placeholder}</span>
            ) : multiple ? (
              selectedOptions.map(opt => (
                <Badge
                  key={opt.value}
                  variant="default"
                  className={cn(
                    "pl-2 pr-1.5 py-0.5 rounded-lg border text-xs flex items-center gap-1.5",
                    "bg-purple-50 border-purple-100 text-purple-700",
                    "dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-300"
                  )}
                >
                  {opt.avatar && (
                    <img 
                      src={opt.avatar} 
                      alt={opt.label} 
                      className="h-3.5 w-3.5 rounded-full object-cover shrink-0" 
                    />
                  )}
                  <span>{opt.label}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveChip(e, opt.value)}
                    className="hover:bg-purple-200 dark:hover:bg-purple-400/20 rounded-md p-0.5 transition-colors"
                  >
                    <X className="h-2.5 w-2.5 shrink-0" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-sm font-medium flex items-center gap-2">
                {selectedOptions[0]?.icon}
                {selectedOptions[0]?.avatar && (
                  <img 
                    src={selectedOptions[0].avatar} 
                    alt={selectedOptions[0].label} 
                    className="h-5 w-5 rounded-full object-cover shrink-0" 
                  />
                )}
                {selectedOptions[0]?.label}
              </span>
            )}
          </div>

          {/* Interactive controls */}
          <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 shrink-0">
            {clearable && selectedOptions.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="hover:text-zinc-600 dark:hover:text-zinc-300 p-0.5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-250", isOpen && "rotate-180")} />
          </div>
        </div>

        {/* Floating Dropdown Listbox */}
        {isMounted && (
          typeof document !== 'undefined' ? createPortal(
            <div
              ref={contentRef}
              role="presentation"
              style={{
                top: menuState.top,
                left: menuState.left,
                width: menuState.width,
                transformOrigin: menuState.transformOrigin,
              }}
              className={cn(
                "fixed z-[140] overflow-hidden rounded-2xl will-change-transform",
                "border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-xl p-1.5",
                menuAnimationClasses[menuAnimation],
                !menuState.isPositioned && 'opacity-0',
                !isVisible && menuAnimation !== 'none' && 'opacity-0 translate-y-2 scale-95',
                isVisible && menuAnimation === 'fade' && 'opacity-100',
                isVisible && menuAnimation === 'scale' && 'opacity-100 translate-y-0 scale-100',
                isVisible && menuAnimation === 'slide' && 'opacity-100 translate-y-0 scale-100'
              )}
            >
              {/* Search Input Filter */}
              {searchable && (
                <div className="relative flex items-center border-b border-zinc-100 dark:border-white/5 pb-1.5 mb-1.5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "w-full bg-transparent pl-9 pr-4 py-2 text-sm outline-none text-zinc-800 dark:text-white placeholder-zinc-400"
                    )}
                  />
                </div>
              )}

              {/* Scrolling Options UL */}
              <ScrollArea orientation="vertical" scrollbarSize="sm" className="max-h-60 pr-1">
                <ul
                  ref={listboxRef}
                  id={`${id}-listbox`}
                  role="listbox"
                  className="flex flex-col gap-0.5"
                >
                  {filteredOptions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
                      Nenhum resultado encontrado
                    </div>
                  ) : (
                    filteredOptions.map((option, index) => {
                    const showGroupHeader = option.group && (index === 0 || filteredOptions[index - 1]?.group !== option.group);
                    const isSelected = currentValues.includes(option.value);
                    const isActive = activeIndex === index;

                    return (
                      <React.Fragment key={option.value}>
                        {showGroupHeader && (
                          <li className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-1 mb-0.5 select-none">
                            {option.group}
                          </li>
                        )}
                        <li
                          id={`${id}-option-${index}`}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelectOption(option.value)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={cn(
                            'w-full rounded-xl px-3 py-2 text-left transition-all duration-150 cursor-pointer flex items-center gap-3 animate-in fade-in slide-in-from-top-1',
                            isSelected 
                              ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold' 
                              : 'text-zinc-700 dark:text-zinc-300',
                            isActive && !isSelected && 'bg-zinc-50 dark:bg-white/[0.04] text-zinc-900 dark:text-white'
                          )}
                          style={{ animationDelay: `${Math.min(index, 8) * 18}ms` }}
                        >
                          {/* Avatar/Thumbnail */}
                          {option.avatar && (
                            <img 
                              src={option.avatar} 
                              alt={option.label} 
                              className="h-7 w-7 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-white/10" 
                            />
                          )}

                          {/* Icon */}
                          {option.icon && (
                            <div className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/[0.04]",
                              isSelected && "text-purple-500 bg-purple-100/50 dark:bg-purple-500/20"
                            )}>
                              {option.icon}
                            </div>
                          )}

                          {/* Content block */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <span className="text-sm truncate">{option.label}</span>
                            {option.description && (
                              <span className={cn(
                                "text-[10px] truncate leading-tight mt-0.5",
                                isSelected ? "text-purple-400/80" : "text-zinc-400 dark:text-zinc-500"
                              )}>
                                {option.description}
                              </span>
                            )}
                          </div>

                          {/* Check icon status indicator */}
                          {isSelected && (
                            <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          )}
                        </li>
                    </React.Fragment>
                  );
                })
              )}
                </ul>
              </ScrollArea>
            </div>,
            document.body
          ) : null
        )}

        {error && (
          <p className="text-xs text-rose-500 animate-in slide-in-from-top-0.5 fade-in duration-150">
            {error}
          </p>
        )}
        <input type="hidden" name={name} value={currentValues.join(',')} />
      </div>
    );
  }
);

AdvancedSelect.displayName = 'AdvancedSelect';
