import React from 'react';
import { cn } from '../../utils/cn';
import type { InteractiveCard, InteractiveButton } from './types';
import { ExternalLink, Phone, Reply, ChevronLeft, ChevronRight, Copy } from 'lucide-react';

interface CarouselMessageProps {
  cards: InteractiveCard[];
  isOwn: boolean;
  onAction?: (button: InteractiveButton) => void;
}

export function CarouselMessage({ cards, isOwn, onAction }: CarouselMessageProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group/carousel max-w-[300px] sm:max-w-[400px]">
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
      >
        {cards.map((card, idx) => (
          <div 
            key={idx}
            className="flex-shrink-0 w-[240px] snap-start rounded-2xl bg-white/5 dark:bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col"
          >
            {card.header?.attachment && (
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={card.header.attachment.url} 
                  alt="Card" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-3 flex-1 flex flex-col">
              <p className="text-sm leading-relaxed mb-1">{card.body}</p>
              {card.footer && <p className="text-[10px] opacity-50 italic mb-3">{card.footer}</p>}
              
              <div className="mt-auto flex flex-col gap-1">
                {card.buttons?.map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => onAction?.(btn)}
                    className={cn(
                      "flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium transition-all",
                      "bg-white/10 hover:bg-white/20 border border-white/10",
                      isOwn ? "text-white" : "text-blue-500 dark:text-blue-400"
                    )}
                  >
                    {btn.type === 'url' && <ExternalLink className="h-3 w-3" />}
                    {btn.type === 'call' && <Phone className="h-3 w-3" />}
                    {btn.type === 'reply' && <Reply className="h-3 w-3" />}
                    {btn.text}
                  </button>
                ))}
                {card.nativeFlow?.buttons.map((btn, idx) => {
                  let params: any = {};
                  try {
                    params = typeof btn.buttonParamsJson === 'string' ? JSON.parse(btn.buttonParamsJson) : btn.buttonParamsJson;
                  } catch (e) {}
                  return (
                    <button
                      key={idx}
                      onClick={() => onAction?.({ id: params.id || btn.name, text: params.display_text || btn.name, type: 'reply', params })}
                      className={cn(
                        "flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium transition-all",
                        "bg-white/10 hover:bg-white/20 border border-white/10",
                        isOwn ? "text-white" : "text-blue-500 dark:text-blue-400"
                      )}
                    >
                      {btn.name === 'cta_copy' && <Copy className="h-3 w-3" />}
                      {btn.name === 'cta_url' && <ExternalLink className="h-3 w-3" />}
                      {btn.name === 'cta_call' && <Phone className="h-3 w-3" />}
                      {params.display_text || btn.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length > 1 && (
        <>
          <button 
            onClick={() => scroll('left')}
            className="absolute left-[-12px] top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-[-12px] top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
