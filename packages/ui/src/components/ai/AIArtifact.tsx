import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Code, Terminal, Eye, FileCode, CheckCircle2, Copy, Check, RefreshCw } from 'lucide-react';
import { AIFileTree, FileNode } from './AIFileTree';
import { AITerminal, AITerminalLine } from './AITerminal';

export interface AIArtifactProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The unique identifier or title of the active artifact block */
  title: string;
  /** File tree structure */
  files: FileNode[];
  /** Default selected file ID */
  defaultFileId?: string;
}

/**
 * A stunning, split-pane Claude-style sandbox workspace panel.
 * Combines collapsible FileTrees, tabbed terminal compilation logs, and responsive previews.
 */
export const AIArtifact = React.forwardRef<HTMLDivElement, AIArtifactProps>(
  ({ title = "Vite App Compilation Sandbox", files, defaultFileId, className, ...props }, ref) => {
    
    const [selectedTab, setSelectedTab] = useState<'code' | 'terminal' | 'preview'>('code');
    const [selectedFileId, setSelectedFileId] = useState(defaultFileId || 'file-index');
    const [isCompiling, setIsCompiling] = useState(false);
    const [copied, setCopied] = useState(false);

    // Simulated Code databases based on file selection
    const codeContentDatabase: Record<string, string> = {
      'file-index': `import React from 'react';\nimport { BentoGrid } from '@pixonui/react';\n\nexport default function App() {\n  return (\n    <div className="p-8 max-w-5xl mx-auto">\n      <h1 className="text-xl font-bold mb-4">SaaS Dashboard Layout</h1>\n      <BentoGrid cols={3} gap={4}>\n        {/* Neon Scale elements cards */}\n        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow" />\n      </BentoGrid>\n    </div>\n  );\n}`,
      'file-css': `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  @apply bg-black text-white selection:bg-purple-500/30;\n  font-family: 'Outfit', sans-serif;\n}`,
      'file-package': `{\n  "name": "pixonui-ai-artifact-sandbox",\n  "version": "1.0.0",\n  "private": true,\n  "dependencies": {\n    "react": "^19.0.0",\n    "@pixonui/react": "latest"\n  }\n}`
    };

    const mockTerminalLines: AITerminalLine[] = [
      { text: 'npm run build', type: 'command', timestamp: '12:04:10' },
      { text: 'vite v6.2.1 building for production...', type: 'info', timestamp: '12:04:11' },
      { text: '✓ 14 modules compiled successfully in 142ms', type: 'success', timestamp: '12:04:11' },
      { text: 'Checking TS system declaration schemas... (TSC -B)', type: 'info', timestamp: '12:04:11' },
      { text: '✓ tsconfig.json types validated with 0 errors.', type: 'success', timestamp: '12:04:12' },
      { text: 'dist/assets/index-J69FCE8R.js    3.24 kB │ gzip: 1.15 kB', type: 'text' },
      { text: 'dist/assets/index-CHV89F2R.css   1.04 kB │ gzip: 0.38 kB', type: 'text' },
      { text: '✓ bundle compiled in 430ms. Ready for preview deploy.', type: 'success', timestamp: '12:04:12' }
    ];

    const activeCode = codeContentDatabase[selectedFileId] || codeContentDatabase['file-index']!;

    const handleCopy = () => {
      navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    };

    const handleCompile = () => {
      setIsCompiling(true);
      setTimeout(() => setIsCompiling(false), 1200);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col md:flex-row h-[500px] w-full rounded-3xl border shadow-lg overflow-hidden backdrop-blur-md",
          "border-gray-200 bg-white/80 dark:border-white/5 dark:bg-zinc-950/40",
          className
        )}
        {...props}
      >
        {/* Left Side: Workspace File Tree Explorer */}
        <div className="w-full md:w-[220px] bg-gray-50/50 dark:bg-zinc-950/20 border-r border-gray-200 dark:border-white/5 p-4 flex flex-col shrink-0 min-h-[140px] md:min-h-0">
          <div className="flex items-center gap-1.5 pb-3 border-b border-gray-100 dark:border-white/5 mb-3 select-none text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
            <FileCode className="h-3.5 w-3.5" />
            <span>Workspace Files</span>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
            <AIFileTree 
              data={files} 
              selectedId={selectedFileId} 
              onFileClick={(file) => setSelectedFileId(file.id)} 
            />
          </div>
        </div>

        {/* Right Side: Tabbed Editor Sandbox Frame */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-black/15">
          {/* Editor Header Navigation Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 py-2.5 bg-gray-50/30 dark:bg-zinc-950/10 border-b border-gray-200 dark:border-white/5 gap-2 shrink-0 select-none">
            
            {/* Left title and status indicator */}
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="text-xs font-bold truncate text-gray-800 dark:text-zinc-200">
                {title}
              </span>
              <span className="flex items-center gap-1 text-[9px] uppercase font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded-full shrink-0">
                <CheckCircle2 className="h-2.5 w-2.5" /> deploy ready
              </span>
            </div>

            {/* Right tab triggers and execution actions */}
            <div className="flex items-center gap-1">
              
              {/* Tab trigger anchors */}
              <div className="flex bg-gray-100 dark:bg-zinc-900 rounded-xl p-0.5 mr-1.5 shrink-0">
                {(['code', 'terminal', 'preview'] as const).map((tab) => {
                  const Icon = tab === 'code' ? Code : (tab === 'terminal' ? Terminal : Eye);
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSelectedTab(tab)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg transition-all",
                        selectedTab === tab 
                          ? "bg-white text-gray-800 dark:bg-zinc-950 dark:text-zinc-200 shadow" 
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{tab}</span>
                    </button>
                  );
                })}
              </div>

              {/* Execution trigger actions */}
              <button
                type="button"
                onClick={handleCompile}
                disabled={isCompiling}
                className="flex h-7 px-2.5 items-center justify-center rounded-xl text-[10px] font-bold uppercase bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 disabled:opacity-50 transition-colors shrink-0 gap-1"
              >
                <RefreshCw className={cn("h-3 w-3", isCompiling && "animate-spin")} />
                <span>Build</span>
              </button>
            </div>
          </div>

          {/* Main Workspace Frame container body */}
          <div className="flex-1 min-h-0 relative">
            
            {/* A. Code Tab Editor Panel */}
            {selectedTab === 'code' && (
              <div className="h-full flex flex-col font-mono text-xs overflow-hidden bg-zinc-950 text-zinc-300">
                {/* File Sub-header title with quick copies */}
                <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-bold text-zinc-500 shrink-0 select-none">
                  <span>ACTIVE FILE: {selectedFileId}.tsx</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                {/* Simulated Editor Code Block body */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin flex">
                  {/* Line numbers stack */}
                  <div className="text-zinc-700 text-right pr-4 select-none shrink-0 font-bold border-r border-zinc-900 mr-4 flex flex-col">
                    {activeCode.split('\n').map((_, i) => (
                      <span key={i} className="leading-relaxed h-[18px]">{i + 1}</span>
                    ))}
                  </div>
                  
                  {/* Fenced syntax lines */}
                  <pre className="flex-1 overflow-x-auto select-text font-mono leading-relaxed text-[11px]">
                    <code>
                      {activeCode.split('\n').map((line, i) => (
                        <div key={i} className="h-[18px] hover:bg-white/[0.02] px-1 transition-colors">{line || ' '}</div>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>
            )}

            {/* B. Terminal Compilation Output Logs Tab */}
            {selectedTab === 'terminal' && (
              <div className="h-full p-4 bg-zinc-950">
                <AITerminal 
                  title="zsh - tsc build artifact compiler"
                  lines={isCompiling ? [{ text: 'compiling modules...', type: 'info' }] : mockTerminalLines} 
                  onRefresh={handleCompile}
                  className="h-full border-none shadow-none"
                />
              </div>
            )}

            {/* C. Web Preview Tab mock Responsive IFrame Frame */}
            {selectedTab === 'preview' && (
              <div className="h-full p-4 flex flex-col bg-gray-50 dark:bg-black/20 overflow-hidden">
                <div className="flex-1 border border-gray-200 dark:border-white/5 rounded-2xl bg-white dark:bg-zinc-950 flex flex-col shadow-inner overflow-hidden relative">
                  
                  {/* Grid overlay background to represent mock layout spacing */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                  {/* Mock browser header frame */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-zinc-950/20 text-[10px] text-gray-400 dark:text-zinc-500 font-bold shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>http://localhost:5173/dashboard</span>
                  </div>

                  {/* Mock Rendered Bento UI Component representation */}
                  <div className="flex-1 overflow-y-auto p-6 relative flex flex-col justify-center max-w-lg mx-auto w-full gap-4">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-cyan-500 animate-pulse" />
                      <span>SaaS Analytics Bento Dashboard</span>
                    </h2>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 p-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-zinc-900/50 shadow flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Revenue Stream</span>
                        <span className="text-lg font-black text-gray-800 dark:text-zinc-100">$42,910.00</span>
                        <div className="h-10 w-full rounded-lg bg-cyan-500/10 dark:bg-cyan-500/5 border border-cyan-500/10 flex items-end p-1.5">
                          {/* Mock bar chart lines */}
                          <div className="flex gap-1 items-end w-full h-full">
                            {[4, 6, 3, 7, 9, 5, 8, 4, 7, 10, 6, 8].map((h, i) => (
                              <div key={i} className="flex-1 bg-cyan-500 rounded-t" style={{ height: `${h * 10}%` }} />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-1 p-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-zinc-900/50 shadow flex flex-col justify-between">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">CTR</span>
                        <div className="text-lg font-black text-emerald-500">+12.4%</div>
                        <span className="text-[9px] text-gray-400">vs last month</span>
                      </div>

                      <div className="col-span-3 p-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-zinc-900/50 shadow flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-800 dark:text-zinc-200">TypeScript Type Check</span>
                            <span className="text-[9px] text-gray-400">All compilation checks successful.</span>
                          </div>
                        </div>
                        <span className="text-[9px] uppercase font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/20 px-2 py-0.5 rounded-full">Passed</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }
);

AIArtifact.displayName = 'AIArtifact';
