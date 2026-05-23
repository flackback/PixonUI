import React, { useState, useCallback, useRef, useEffect, useId } from 'react';
import { cn } from '../../utils/cn';
import { Check, Copy } from 'lucide-react';
import { ScrollArea } from './ScrollArea';

export interface CopyBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onCopy'> {
  /** Code content to display and copy */
  code: string;
  /** Language label (e.g. 'typescript', 'bash') */
  language?: string;
  /** Title above the code block */
  title?: string;
  /** Show line numbers @default false */
  lineNumbers?: boolean;
  /** Max height before scrolling (CSS value) */
  maxHeight?: string;
  /** Visual variant */
  variant?: 'default' | 'glass' | 'terminal';
  /** Highlight specific lines (1-indexed) */
  highlightLines?: number[];
  /** Callback on copy */
  onCopy?: (code: string) => void;
}

const variantStyles = {
  default: {
    container: 'bg-zinc-950 border-zinc-800/50',
    header: 'bg-zinc-900/80 border-zinc-800/50',
    text: 'text-zinc-300',
    lineNum: 'text-zinc-600',
  },
  glass: {
    container: 'bg-zinc-900/60 backdrop-blur-xl border-white/[0.08]',
    header: 'bg-white/[0.03] border-white/[0.06]',
    text: 'text-zinc-300',
    lineNum: 'text-zinc-600',
  },
  terminal: {
    container: 'bg-[#0d1117] border-[#30363d]',
    header: 'bg-[#161b22] border-[#30363d]',
    text: 'text-[#e6edf3]',
    lineNum: 'text-[#484f58]',
  },
};

/**
 * Code display block with integrated copy button, line numbers,
 * and line highlighting. Ideal for documentation and tutorials.
 *
 * @example
 * ```tsx
 * <CopyBlock
 *   code={`npm install @pixonui/react`}
 *   language="bash"
 *   variant="terminal"
 * />
 * ```
 */
export function CopyBlock({
  code,
  language,
  title,
  lineNumbers = false,
  maxHeight,
  variant = 'default',
  highlightLines = [],
  onCopy,
  className,
  ...props
}: CopyBlockProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const vs = variantStyles[variant];

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.(code);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [code, onCopy]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const lines = code.split('\n');

  return (
    <div
      className={cn(
        'relative rounded-2xl border overflow-hidden font-mono text-sm',
        vs.container,
        className
      )}
      {...props}
    >
      {/* Header bar */}
      {(title || language) && (
        <div className={cn(
          'flex items-center justify-between px-4 py-2 border-b',
          vs.header,
        )}>
          <div className="flex items-center gap-2">
            {variant === 'terminal' && (
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
            )}
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {title || language}
            </span>
          </div>
          <CopyButton copied={copied} onClick={handleCopy} />
        </div>
      )}

      {/* Code area */}
      <ScrollArea
        scrollbarSize="sm"
        orientation="both"
        className="relative"
        style={{ maxHeight }}
      >
        {/* Copy button (floating, when no header) */}
        {!title && !language && (
          <div className="absolute top-2 right-2 z-10">
            <CopyButton copied={copied} onClick={handleCopy} />
          </div>
        )}

        <pre className="p-4 m-0 overflow-visible">
          <code className={cn(vs.text, 'text-[13px] leading-6')}>
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const isHighlighted = highlightLines.includes(lineNum);

              return (
                <div
                  key={i}
                  className={cn(
                    'flex',
                    isHighlighted && 'bg-purple-500/10 -mx-4 px-4 border-l-2 border-purple-500',
                  )}
                >
                  {lineNumbers && (
                    <span className={cn(
                      'select-none inline-block w-8 shrink-0 text-right mr-4 tabular-nums',
                      vs.lineNum,
                    )}>
                      {lineNum}
                    </span>
                  )}
                  <span className="flex-1">{line || '\n'}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </ScrollArea>
    </div>
  );
}

function CopyButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all duration-200',
        copied
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
          : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400 hover:text-white border border-white/[0.08]',
      )}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy
        </>
      )}
    </button>
  );
}

CopyBlock.displayName = 'CopyBlock';
