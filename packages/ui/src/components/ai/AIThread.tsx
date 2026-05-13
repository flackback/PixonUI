import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { ArrowDown, MessageSquare } from 'lucide-react';

export interface AIThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of message components or content */
  children: React.ReactNode;
  /** Whether the AI is currently streaming/generating new tokens */
  isGenerating?: boolean;
  /** Custom empty state to display when there are no messages */
  emptyState?: React.ReactNode;
}

/**
 * A highly performant, automated scrolling container that hosts message feeds.
 * Includes intelligent scroll listeners, auto-scrolling anchors on token streaming,
 * and floating 'New Messages' badges that smoothly scroll back down on click.
 */
export const AIThread = React.forwardRef<HTMLDivElement, AIThreadProps>(
  ({ children, isGenerating = false, emptyState, className, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);

    // Binds external and internal ref
    const resolvedRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;

    // Detect if container is scrolled close to bottom
    const checkScrollPosition = () => {
      const el = resolvedRef.current;
      if (!el) return;

      const offset = el.scrollHeight - el.clientHeight - el.scrollTop;
      const isNearBottom = offset < 100;

      // Show scroll-to-bottom button ONLY if there are messages, we are NOT near bottom,
      // and optionally if AI is actively generating/streaming
      if (!isNearBottom && el.scrollHeight > el.clientHeight) {
        setShowScrollBottom(true);
      } else {
        setShowScrollBottom(false);
      }
    };

    // Smooth scroll spring down
    const scrollToBottom = () => {
      const el = resolvedRef.current;
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
      setShowScrollBottom(false);
    };

    // Auto scroll down during streaming ONLY if the user is already near the bottom
    useEffect(() => {
      const el = resolvedRef.current;
      if (!el || !isGenerating) return;

      const offset = el.scrollHeight - el.clientHeight - el.scrollTop;
      const isNearBottom = offset < 180; // slightly larger window for active streams

      if (isNearBottom) {
        // Run on next tick to allow new children to render
        const timer = setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        }, 10);
        return () => clearTimeout(timer);
      }
    }, [children, isGenerating, resolvedRef]);

    // Check scroll coordinates on scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      checkScrollPosition();
      props.onScroll?.(e);
    };

    const hasMessages = React.Children.count(children) > 0;

    return (
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        
        {/* Main scrollable body */}
        <div
          ref={resolvedRef}
          onScroll={handleScroll}
          className={cn(
            "w-full h-full overflow-y-auto scrollbar-thin flex flex-col gap-6 pr-1.5 scroll-smooth",
            className
          )}
          {...props}
        >
          {hasMessages ? (
            children
          ) : (
            emptyState || (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 dark:text-zinc-500 gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center border border-gray-200 dark:border-white/5 shadow-sm">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">No messages yet</span>
                  <span className="text-xs font-light max-w-[250px]">Start prompting or select a recommendation below!</span>
                </div>
              </div>
            )
          )}
        </div>

        {/* Stunning floating Scroll-To-Bottom overlay anchor (Spring slider) */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className={cn(
              "absolute bottom-4 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border shadow-lg text-xs font-bold transition-all duration-300",
              "border-cyan-200 bg-white/90 text-cyan-600 hover:bg-cyan-50 hover:scale-105 hover:-translate-y-0.5 active:scale-95 animate-in slide-in-from-bottom-2",
              "dark:border-cyan-500/30 dark:bg-zinc-950/95 dark:text-cyan-400 dark:hover:bg-cyan-950/20"
            )}
          >
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
            <span>New messages below</span>
          </button>
        )}

      </div>
    );
  }
);

AIThread.displayName = 'AIThread';
