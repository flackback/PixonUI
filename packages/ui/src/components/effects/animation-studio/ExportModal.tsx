import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../../button/Button';
import { cn } from '../../../utils/cn';
import { useAnimationStudio } from './AnimationStudioContext';
import { ScrollArea } from '../../data-display/ScrollArea';

export function ExportModal() {
  const {
    isExportModalOpen,
    setIsExportModalOpen,
    exportTab,
    setExportTab,
    copied,
    setCopied,
    // We will expose these functions on the context or pass them down
    // Since we put them in the contextProps interface, we can read them directly
    generateWAAPICode,
    generateReactCode,
    generateCSSKeyframes,
    generateLottieJSON,
  } = useAnimationStudio() as any;

  if (!isExportModalOpen) return null;

  const getExportCode = () => {
    switch (exportTab) {
      case 'waapi':
        return generateWAAPICode();
      case 'react':
        return generateReactCode();
      case 'css':
        return generateCSSKeyframes();
      case 'lottie':
        return generateLottieJSON();
      default:
        return '';
    }
  };

  const handleCopy = () => {
    const code = getExportCode();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/55 dark:bg-black/75 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-white/10 rounded-[28px] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/20">
          <div>
            <h3 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
              🚀 Export Animation Code
            </h3>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-1">
              Choose the target export type to sync with your dev stack
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(false)}
            className="h-8 w-8 rounded-xl bg-white hover:bg-zinc-100 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 bg-zinc-50 dark:bg-zinc-950/10">
          {[
            { id: 'waapi', label: 'Standalone WAAPI', desc: 'Raw JavaScript' },
            { id: 'react', label: 'Pixon React', desc: '<Animate> wrapper' },
            { id: 'css', label: 'Vanilla CSS', desc: '@keyframes & rules' },
            { id: 'lottie', label: 'JSON Lottie', desc: 'Bodymovin player' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setExportTab(tab.id as any)}
              className={cn(
                "flex flex-col items-start px-4 py-2.5 rounded-xl border transition-all text-left min-w-[140px] cursor-pointer",
                exportTab === tab.id
                  ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20"
                  : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:bg-white/5 dark:border-white/5 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08]"
              )}
            >
              <span className="text-xs font-extrabold">{tab.label}</span>
              <span className={cn("text-[9px] font-bold mt-0.5", exportTab === tab.id ? "text-purple-200" : "text-zinc-500 dark:text-zinc-500")}>
                {tab.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Code Body */}
        <div className="flex-1 min-h-0 bg-zinc-950/95 dark:bg-black/45 border border-zinc-200 dark:border-white/5 rounded-2xl mx-6 my-3 relative flex flex-col">
          <div className="absolute right-3 top-3 z-10">
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 font-extrabold rounded-lg shadow-lg"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-300" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>

          <ScrollArea scrollbarSize="sm" orientation="both" className="flex-1 p-5 font-mono text-xs text-zinc-300 select-all leading-relaxed whitespace-pre text-left">
            {getExportCode()}
          </ScrollArea>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/20 flex items-center justify-between px-6">
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500">
            💡 High-fidelity baked animations ready for copy/paste
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="font-bold rounded-xl"
            onClick={() => setIsExportModalOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
