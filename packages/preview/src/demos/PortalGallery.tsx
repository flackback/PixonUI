import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from '@pixonui/react';
import { Maximize2, X, Move, Sparkles } from 'lucide-react';

const items = [
  { id: 1, color: 'bg-blue-500', title: 'Deep Ocean' },
  { id: 2, color: 'bg-purple-500', title: 'Cosmic Dust' },
  { id: 3, color: 'bg-emerald-500', title: 'Forest Spirit' },
  { id: 4, color: 'bg-rose-500', title: 'Sunset Glow' },
];

export const PortalGallery = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <LayoutGroup>
      <div className="p-12 bg-zinc-950 rounded-[40px] border border-white/5 min-h-[600px] relative overflow-hidden">
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em] mb-8">
          <Sparkles className="w-3 h-3" /> Omni-Motion Continuity
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layoutId={`card-${item.id}`}
              onClick={() => setSelected(item.id)}
              className={`${item.color} h-40 rounded-3xl cursor-pointer p-6 flex flex-col justify-end group overflow-hidden relative`}
            >
              <motion.div layoutId={`title-${item.id}`} className="text-white font-bold text-lg relative z-10">{item.title}</motion.div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 className="text-white w-5 h-5" /></div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selected && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-8 backdrop-blur-xl bg-black/40">
              <motion.div
                layoutId={`card-${selected}`}
                className={`${items.find(i => i.id === selected)?.color} w-full h-full rounded-[40px] p-12 relative flex flex-col items-center justify-center text-center shadow-2xl`}
              >
                <button onClick={(e) => { e.stopPropagation(); setSelected(null); }} className="absolute top-8 right-8 p-3 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"><X className="w-6 h-6" /></button>
                <div className="space-y-6 max-w-lg">
                  <motion.h2 layoutId={`title-${selected}`} className="text-6xl font-black text-white tracking-tighter">{items.find(i => i.id === selected)?.title}</motion.h2>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/80 text-lg leading-relaxed">
                    Esta transição utiliza a técnica FLIP (First, Last, Invert, Play) orquestrada nativamente pelo motor PixonUI. 
                    A continuidade espacial é mantida projetando o layoutId entre a grade e o portal expandido.
                  </motion.p>
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: 'spring' }} className="pt-8">
                    <div className="flex gap-4 justify-center"><div className="px-6 py-3 bg-white text-black font-bold rounded-2xl flex items-center gap-2"><Move className="w-4 h-4" /> Physics Driven</div></div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center text-zinc-600 text-xs font-mono uppercase tracking-widest">Clique nos cards para ver a continuidade perceptual em ação</div>
      </div>
    </LayoutGroup>
  );
};
