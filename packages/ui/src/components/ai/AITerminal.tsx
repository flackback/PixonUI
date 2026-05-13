import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { Play, RotateCcw, Copy, Check } from 'lucide-react';

export interface AITerminalLine {
  text: string;
  type: 'command' | 'success' | 'error' | 'warning' | 'info' | 'text';
  timestamp?: string;
}

export interface AITerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Title header name of the terminal window */
  title?: string;
  /** Log history output lines */
  lines: AITerminalLine[];
  /** Callback fired when re-running commands */
  onRefresh?: () => void;
}

/**
 * A stunning IDE console sandbox terminal emulating actual compiling logging output.
 * Complete with title bars, close dots, and blinking custom cursor prompts.
 */
export const AITerminal = React.forwardRef<HTMLDivElement, AITerminalProps>(
  ({ title = 'bash - npm run build', lines, onRefresh, className, ...props }, ref) => {
    const [copied, setCopied] = useState(false);
    const [blink, setBlink] = useState(true);

    // Blinking prompt cursor
    useEffect(() => {
      const interval = setInterval(() => {
        setBlink(b => !b);
      }, 550);
      return () => clearInterval(interval);
    }, []);

    const handleCopy = () => {
      const rawText = lines.map(l => l.text).join('\n');
      navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const getLineColor = (type: AITerminalLine['type']) => {
      switch (type) {
        case 'command': return 'text-cyan-400 font-bold';
        case 'success': return 'text-emerald-400 font-semibold';
        case 'error': return 'text-rose-400 font-bold';
        case 'warning': return 'text-amber-400';
        case 'info': return 'text-zinc-500';
        default: return 'text-zinc-300';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col rounded-2xl overflow-hidden border shadow-lg font-mono text-[11px] leading-relaxed bg-zinc-950 border-zinc-800 text-zinc-300 w-full",
          className
        )}
        {...props}
      >
        {/* Terminal Window Header Titlebar (Mac style dots) */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800/80 shrink-0 select-none">
          <div className="flex gap-1.5 items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            
            <span className="ml-3.5 text-zinc-500 font-bold tracking-tight text-[10px] uppercase font-sans">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded p-1 transition-colors"
                title="Restart Command"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded p-1 transition-colors"
              title="Copy Output Logs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Console logs area */}
        <div className="p-4 overflow-y-auto max-h-[260px] scrollbar-thin flex flex-col gap-1.5 scroll-smooth">
          {lines.map((line, idx) => (
            <div key={idx} className="flex items-start gap-2.5 group">
              {line.type === 'command' && (
                <span className="text-zinc-600 shrink-0 select-none font-bold">$</span>
              )}
              <span className={cn("break-all flex-1", getLineColor(line.type))}>
                {line.text}
              </span>
              {line.timestamp && (
                <span className="text-[9px] text-zinc-700 select-none shrink-0 group-hover:opacity-100 transition-opacity opacity-0 mt-0.5">
                  {line.timestamp}
                </span>
              )}
            </div>
          ))}

          {/* Prompt blinking cursor bar */}
          <div className="flex items-center gap-1.5 text-zinc-600 select-none">
            <span>$</span>
            <span 
              className={cn(
                "h-3.5 w-2 bg-cyan-400 transition-opacity duration-150",
                blink ? "opacity-100" : "opacity-0"
              )} 
            />
          </div>
        </div>
      </div>
    );
  }
);

AITerminal.displayName = 'AITerminal';
