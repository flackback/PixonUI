import React from 'react';
import { cn } from '../../utils/cn';
import type { InteractiveContent, InteractiveButton, InteractiveListSection } from './types';
import { ExternalLink, Phone, Reply, Copy } from 'lucide-react';

interface InteractiveMessageProps {
  data: InteractiveContent;
  isOwn: boolean;
  onAction?: (button: InteractiveButton) => void;
}

export function InteractiveMessage({ data, isOwn, onAction }: InteractiveMessageProps) {
  const renderHeader = () => {
    if (!data.header) return null;
    
    switch (data.header.type) {
      case 'text':
        return <h4 className="font-bold mb-1 text-sm">{data.header.text}</h4>;
      case 'image':
        return (
          <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
            <img src={data.header.attachment?.url} alt="Header" className="w-full h-auto object-cover" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2 max-w-sm">
      {renderHeader()}
      <p className="text-sm leading-relaxed">{data.body}</p>
      {data.footer && <p className="text-[10px] opacity-50 italic">{data.footer}</p>}
      
      {data.type === 'button' && data.buttons && (
        <div className="flex flex-col gap-1 mt-3">
          {data.buttons.map((btn: InteractiveButton) => (
            <button
              key={btn.id}
              onClick={() => onAction?.(btn)}
              className={cn(
                "flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] border",
                isOwn 
                  ? "bg-white/15 hover:bg-white/25 border-white/20 text-white" 
                  : "bg-white hover:bg-gray-50 border-gray-200/80 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/10 text-blue-600 dark:text-blue-400"
              )}
            >
              {btn.type === 'url' && <ExternalLink className="h-3.5 w-3.5" />}
              {btn.type === 'call' && <Phone className="h-3.5 w-3.5" />}
              {btn.type === 'reply' && <Reply className="h-3.5 w-3.5" />}
              {btn.text}
            </button>
          ))}
        </div>
      )}

      {data.type === 'list' && data.sections && (
        <div className="mt-3 space-y-3">
          {data.sections.map((section: InteractiveListSection, idx: number) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <p className="text-[10px] uppercase tracking-wider opacity-40 font-bold px-1">
                  {section.title}
                </p>
              )}
              <div className="flex flex-col gap-1">
                {section.rows.map((row: any) => (
                  <button
                    key={row.id}
                    onClick={() => onAction?.({ id: row.id, text: row.title, type: 'reply' })}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-xl transition-colors text-left border active:scale-[0.98]",
                      isOwn
                        ? "bg-white/5 hover:bg-white/10 border-white/5 text-white"
                        : "bg-white hover:bg-gray-50 border-gray-200/80 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/5 text-gray-900 dark:text-white"
                    )}
                  >
                    <span className="text-sm font-medium">{row.title}</span>
                    {row.description && (
                      <span className="text-xs opacity-50 line-clamp-1">{row.description}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.nativeFlow && (
        <div className="flex flex-col gap-1 mt-3">
          {data.nativeFlow.buttons.map((btn, idx) => {
            let params: any = {};
            try {
              params = typeof btn.buttonParamsJson === 'string' ? JSON.parse(btn.buttonParamsJson) : btn.buttonParamsJson;
            } catch (e) {
              // ignore invalid json
            }
            
            return (
              <button
                key={idx}
                onClick={() => onAction?.({ id: params.id || btn.name, text: params.display_text || btn.name, type: 'reply', params })}
                className={cn(
                  "flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] border",
                  isOwn 
                    ? "bg-white/15 hover:bg-white/25 border-white/20 text-white" 
                    : "bg-white hover:bg-gray-50 border-gray-200/80 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/10 text-blue-600 dark:text-blue-400"
                )}
              >
                {btn.name === 'cta_copy' && <Copy className="h-3.5 w-3.5" />}
                {btn.name === 'cta_url' && <ExternalLink className="h-3.5 w-3.5" />}
                {btn.name === 'cta_call' && <Phone className="h-3.5 w-3.5" />}
                {btn.name === 'single_select' && <Reply className="h-3.5 w-3.5" />}
                {params.display_text || params.title || btn.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
