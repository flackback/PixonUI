import React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import * as PixonUI from '@pixonui/react';
import * as LucideIcons from 'lucide-react';

interface PlaygroundProps {
  code: string;
}

export function Playground({ code }: PlaygroundProps) {
  // Strip import statements so they don't break react-live's compilation
  const cleanCode = code
    .replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '')
    .trim();

  // Create an extensive scope containing all components and icons
  const scope = {
    ...PixonUI,
    ...LucideIcons,
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useRef: React.useRef,
    useMemo: React.useMemo,
  };

  return (
    <LiveProvider code={cleanCode} scope={scope} noInline={false}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-2xl overflow-hidden border border-zinc-200 bg-white dark:border-white/10 dark:bg-black/20">
        
        {/* Code Editor Column */}
        <div className="flex flex-col border-r border-zinc-200 dark:border-white/10 bg-zinc-950">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between text-xs text-zinc-400 font-mono tracking-wider">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              PLAYGROUND_EDITOR.TSX
            </span>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
              Live
            </span>
          </div>
          <div className="p-4 font-mono text-sm overflow-auto max-h-[450px] min-h-[300px]">
            {/* LiveEditor has raw styles override to make text look beautiful */}
            <LiveEditor 
              className="font-mono text-zinc-100 focus:outline-none" 
              style={{
                fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
              }}
            />
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="flex flex-col bg-zinc-50/50 dark:bg-[#080808]/40 min-h-[300px] relative">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-bold tracking-wider">
            <span>LIVE INTERACTIVE OUTPUT</span>
          </div>
          
          <div className="flex-1 p-8 flex items-center justify-center relative overflow-auto">
            {/* The live rendered sandbox component */}
            <LivePreview className="w-full max-w-full flex items-center justify-center" />
            
            {/* LiveError overlay that is displayed with glow styles on error */}
            <LiveError className="absolute inset-x-4 bottom-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-500 font-mono overflow-auto max-h-[150px] shadow-[0_4px_30px_rgba(239,68,68,0.1)] backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in duration-300" />
          </div>
        </div>

      </div>
    </LiveProvider>
  );
}
