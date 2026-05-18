import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { Label } from './Label';
import { ScrollArea } from '../data-display/ScrollArea';
import { useAnchoredPopover, type AnchoredPopoverAnimation } from '../../hooks/useAnchoredPopover';

export interface SelectOption {
  label: string;
  value: string;
  group?: string;
}

export interface SelectProps {
  label?: string;
  name?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'ghost' | 'glass' | 'cyber';
  size?: 'sm' | 'md' | 'lg';
  menuAnimation?: AnchoredPopoverAnimation;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    { 
      label, 
      name, 
      options, 
      value, 
      defaultValue, 
      onChange, 
      placeholder = 'Select an option', 
      error, 
      disabled, 
      className,
      variant = 'default',
      size = 'md',
      menuAnimation = 'scale'
    }, 
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const id = React.useId();
    const menuState = useAnchoredPopover(triggerRef, contentRef, { isOpen });

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const selectedOption = options.find((opt) => opt.value === currentValue);

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

    useEffect(() => {
      if (isOpen && isMounted) {
        menuState.updatePosition();
      }
    }, [isMounted, isOpen, menuState.updatePosition]);

    useEffect(() => {
      if (isOpen) {
        const index = options.findIndex(opt => opt.value === currentValue);
        setActiveIndex(index !== -1 ? index : 0);
      } else {
        setActiveIndex(-1);
      }
    }, [isOpen, currentValue, options]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node) &&
          contentRef.current &&
          !contentRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
      if (disabled) return;
      if (!isControlled) {
        setInternalValue(optionValue);
      }
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isOpen && activeIndex !== -1 && options[activeIndex]) {
          handleSelect(options[activeIndex]!.value);
        } else {
          setIsOpen(true);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setActiveIndex((prev) => (prev + 1) % options.length);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        if (isOpen) setActiveIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        if (isOpen) setActiveIndex(options.length - 1);
      }
    };

    useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);

    const menuAnimationClasses = {
      none: '',
      fade: 'transition-opacity duration-180 ease-out',
      scale: 'transition-[opacity,transform,filter] duration-220 ease-out',
      slide: 'transition-[opacity,transform,filter] duration-320 ease-[cubic-bezier(.2,.85,.2,1)]',
    } as const;

    const animatedMenuStyle: React.CSSProperties = {
      transformOrigin: menuState.transformOrigin,
      opacity: isVisible || menuAnimation === 'none' ? 1 : 0,
      transform: isVisible || menuAnimation === 'none'
        ? 'translate3d(0, 0, 0) scale(1)'
        : menuAnimation === 'slide'
          ? 'translate3d(0, -16px, 0) scale(0.9)'
          : menuAnimation === 'scale'
            ? 'translate3d(0, -8px, 0) scale(0.96)'
            : 'translate3d(0, 0, 0) scale(1)',
      filter: isVisible || menuAnimation === 'none' ? 'blur(0px)' : 'blur(6px)',
    };

    const sizeClasses = {
      sm: 'px-3.5 py-2 text-xs rounded-xl min-h-[2.25rem]',
      md: 'px-4 py-3 text-sm rounded-2xl min-h-[3rem]',
      lg: 'px-5 py-3.5 text-base rounded-3.5xl min-h-[3.5rem]'
    };

    const variantClasses = {
      default: cn(
        'bg-gray-50 dark:bg-white/[0.04]',
        'border border-gray-200 dark:border-white/[0.08]',
        'text-gray-900 dark:text-white',
        'hover:bg-gray-100 dark:hover:bg-white/[0.06]',
        isOpen && 'border-gray-300 dark:border-white/20 ring-2 ring-purple-400/20'
      ),
      ghost: cn(
        'bg-transparent hover:bg-gray-100 dark:hover:bg-white/[0.05]',
        'border border-transparent',
        'text-gray-900 dark:text-white',
        isOpen && 'bg-gray-100 dark:bg-white/[0.05]'
      ),
      glass: cn(
        'bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md',
        'border border-zinc-200/50 dark:border-white/5',
        'text-gray-900 dark:text-white',
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
      >
        {label && (
          <Label 
            htmlFor={id}
            className={cn(disabled && "opacity-50 cursor-not-allowed")}
          >
            {label}
          </Label>
        )}

        <div
          ref={triggerRef}
          id={id}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${id}-listbox`}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full appearance-none flex items-center justify-between gap-2 relative transition-all duration-200 cursor-pointer focus:outline-none',
            sizeClasses[size],
            variantClasses[variant],
            disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent hover:shadow-none',
            error && 'border-rose-400/25 focus:ring-rose-300/25'
          )}
        >
          <span className={cn("block truncate pr-6", !selectedOption && "text-gray-400 dark:text-white/20")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>

        {isMounted && (
          typeof document !== 'undefined' ? createPortal(
            <div
              ref={contentRef}
              role="presentation"
              style={{
                top: menuState.top,
                left: menuState.left,
                width: menuState.width,
                ...animatedMenuStyle,
              }}
              className={cn(
                'fixed z-[140] overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] p-1.5 shadow-xl will-change-transform',
                menuAnimationClasses[menuAnimation],
                !menuState.isPositioned && 'opacity-0',
                !isVisible && menuAnimation !== 'none' && 'opacity-0 translate-y-2 scale-95',
                isVisible && menuAnimation === 'fade' && 'opacity-100',
                isVisible && menuAnimation === 'scale' && 'opacity-100 translate-y-0 scale-100',
                isVisible && menuAnimation === 'slide' && 'opacity-100 translate-y-0 scale-100'
              )}
            >
              <ScrollArea
                orientation="vertical"
                scrollbarSize="sm"
                className="max-h-60 pr-1"
              >
                <ul
                  id={`${id}-listbox`}
                  role="listbox"
                  aria-activedescendant={activeIndex !== -1 ? `${id}-option-${activeIndex}` : undefined}
                  className="flex flex-col gap-0.5"
                >
                {options.map((option, index) => {
                  const showGroupHeader = option.group && (index === 0 || options[index - 1]?.group !== option.group);
                  const isSelected = currentValue === option.value;
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
                        onClick={() => handleSelect(option.value)}
                        onMouseEnter={() => setActiveIndex(index)}
                          className={cn(
                          'w-full rounded-xl px-3 py-2 text-left text-sm transition-all duration-150 cursor-pointer',
                          isSelected 
                            ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold' 
                            : 'text-zinc-700 dark:text-zinc-300',
                          isActive && !isSelected && 'bg-zinc-50 dark:bg-white/[0.04] text-zinc-900 dark:text-white'
                        )}
                        style={{
                          transitionDelay: isVisible ? `${Math.min(index, 8) * 28}ms` : '0ms',
                          opacity: isVisible || menuAnimation === 'none' ? 1 : 0,
                          transform: isVisible || menuAnimation === 'none' ? 'translate3d(0,0,0)' : 'translate3d(0,-6px,0)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex-1 truncate">{option.label}</span>
                          {isSelected && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-purple-600 dark:text-purple-400 shrink-0"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </li>
                    </React.Fragment>
                  );
                })}
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
        <input type="hidden" name={name} value={currentValue || ''} />
      </div>
    );
  }
);

Select.displayName = 'Select';
