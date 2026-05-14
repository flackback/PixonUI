import React from 'react';
import { AnimeText, Surface, Stack } from '@pixonui/react';
import { RefreshCw } from 'lucide-react';

export function AnimeTextDemo() {
  const [effect, setEffect] = React.useState<any>('fade-up');
  const [key, setKey] = React.useState(0);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-slate-950 rounded-3xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-950/80 pointer-events-none" />
      
      <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
        <select 
          value={effect} 
          onChange={(e) => { setEffect(e.target.value); setKey(k => k + 1); }}
          className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-purple-500/50"
        >
          <option value="fade-up">Fade Up</option>
          <option value="bounce">Spring Bounce</option>
          <option value="rotate">Rotate X</option>
          <option value="slide-left">Slide Left</option>
        </select>
        
        <button 
          onClick={() => setKey(k => k + 1)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Replay
        </button>
      </div>

      <Surface className="p-16 max-w-2xl text-center bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-[32px] shadow-2xl relative z-10">
        <Stack gap={6} align="center">
          <AnimeText 
            key={`title-${key}`}
            text="Pixon Anime.js"
            effect={effect}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-300 to-violet-400 tracking-tight"
            staggerDelay={0.06}
          />
          <AnimeText 
            key={`sub-${key}`}
            text="Cinematic hardware-accelerated text reveals built directly on top of the PixonMotion engine."
            effect={effect}
            className="text-lg text-slate-400 max-w-md font-medium leading-relaxed"
            staggerDelay={0.015}
          />
        </Stack>
      </Surface>
    </div>
  );
}
