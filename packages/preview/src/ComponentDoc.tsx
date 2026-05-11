import React, { useState } from 'react';
import { Heading, Text, Surface, ScrollArea, Button } from '@pixonui/react';
import { Copy, Check, Code, FileCode, Eye, Play } from 'lucide-react';
import { Playground } from './Playground';

interface ComponentDocProps {
  title: string;
  description: string;
  code: string;
  componentSource?: string;
  children: React.ReactNode;
}

export function ComponentDoc({ title, description, code, componentSource, children }: ComponentDocProps) {
  const [mode, setMode] = useState<'preview' | 'playground'>('preview');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'usage' | 'source'>('usage');

  const handleCopy = async () => {
    const textToCopy = activeTab === 'usage' ? code : componentSource;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Title & Description Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Heading as="h2" className="text-3xl text-zinc-900 dark:text-white font-bold tracking-tight">{title}</Heading>
          <Text className="text-lg text-zinc-500 dark:text-white/60 leading-relaxed max-w-3xl">{description}</Text>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 self-start md:self-center p-1 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/5 backdrop-blur-md">
          <Button 
            variant={mode === 'preview' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setMode('preview')}
            className="text-xs h-9 rounded-xl font-semibold transition-all"
          >
            <Eye className="mr-2 h-3.5 w-3.5" />
            Interactive Demo
          </Button>
          <Button 
            variant={mode === 'playground' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setMode('playground')}
            className="text-xs h-9 rounded-xl font-semibold transition-all relative"
          >
            <Play className="mr-2 h-3.5 w-3.5 text-purple-500" />
            Live Playground
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
          </Button>
        </div>
      </div>

      <div className="border-t border-zinc-200/60 dark:border-white/5 w-full my-1" />

      {mode === 'preview' ? (
        /* Static Precompiled Demonstration View */
        <div className="space-y-8 animate-in fade-in duration-300">
          <Surface className="p-8 flex justify-center border-zinc-200 bg-white dark:border-white/10 dark:bg-black/20 relative overflow-hidden rounded-2xl shadow-sm">
            <div className="w-full max-w-full overflow-hidden flex items-center justify-center">
              {children}
            </div>
          </Surface>

          {/* Code Inspection & Source Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Button 
                   variant={activeTab === 'usage' ? 'secondary' : 'ghost'} 
                   size="sm"
                   onClick={() => setActiveTab('usage')}
                   className="text-xs h-8 rounded-lg"
                 >
                   <Code className="mr-2 h-3 w-3" />
                   Usage
                 </Button>
                 {componentSource && (
                   <Button 
                     variant={activeTab === 'source' ? 'secondary' : 'ghost'} 
                     size="sm"
                     onClick={() => setActiveTab('source')}
                     className="text-xs h-8 rounded-lg"
                   >
                     <FileCode className="mr-2 h-3 w-3" />
                     Source
                   </Button>
                 )}
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-xs rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5"
                onClick={handleCopy}
              >
                {copied ? <Check className="mr-1.5 h-3 w-3 text-emerald-500" /> : <Copy className="mr-1.5 h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy code'}
              </Button>
            </div>
            
            <Surface className="p-0 overflow-hidden bg-zinc-900 dark:bg-[#0D0D0D] border-zinc-800 dark:border-white/5 rounded-2xl shadow-xl">
              <ScrollArea className="p-4 w-full max-h-[500px]" orientation="both">
                <pre className="text-sm text-blue-200/90 font-mono leading-relaxed select-all">
                  <code>{activeTab === 'usage' ? code : componentSource}</code>
                </pre>
              </ScrollArea>
            </Surface>
          </div>
        </div>
      ) : (
        /* Dynamic Live-Code Sandbox Playground View */
        <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
          <Playground code={code} />
        </div>
      )}

    </div>
  );
}
