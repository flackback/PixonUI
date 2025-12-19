import React, { useState } from 'react';
import { Heading, Text, Surface, ScrollArea, Button } from '@pixonui/react';
import { Copy, Check, Code, FileCode } from 'lucide-react';

interface ComponentDocProps {
  title: string;
  description: string;
  code: string;
  componentSource?: string;
  children: React.ReactNode;
}

export function ComponentDoc({ title, description, code, componentSource, children }: ComponentDocProps) {
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
      <div className="space-y-2">
        <Heading as="h2" className="text-3xl text-zinc-900 dark:text-white">{title}</Heading>
        <Text className="text-lg text-zinc-500 dark:text-white/60">{description}</Text>
      </div>
      
      <Surface className="p-8 flex justify-center border-zinc-200 bg-white dark:border-white/10 dark:bg-black/20">
        <div className="w-full max-w-full overflow-hidden">
          {children}
        </div>
      </Surface>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Button 
               variant={activeTab === 'usage' ? 'secondary' : 'ghost'} 
               size="sm"
               onClick={() => setActiveTab('usage')}
               className="text-xs h-8"
             >
               <Code className="mr-2 h-3 w-3" />
               Usage
             </Button>
             {componentSource && (
               <Button 
                 variant={activeTab === 'source' ? 'secondary' : 'ghost'} 
                 size="sm"
                 onClick={() => setActiveTab('source')}
                 className="text-xs h-8"
               >
                 <FileCode className="mr-2 h-3 w-3" />
                 Source
               </Button>
             )}
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={handleCopy}
          >
            {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
            {copied ? 'Copied!' : 'Copy code'}
          </Button>
        </div>
        <Surface className="p-0 overflow-hidden bg-zinc-900 dark:bg-[#0D0D0D] border-zinc-800 dark:border-white/5">
          <ScrollArea className="p-4 w-full max-h-[500px]" orientation="both">
            <pre className="text-sm text-blue-200/90 font-mono leading-relaxed">
              <code>{activeTab === 'usage' ? code : componentSource}</code>
            </pre>
          </ScrollArea>
        </Surface>
      </div>
    </div>
  );
}
