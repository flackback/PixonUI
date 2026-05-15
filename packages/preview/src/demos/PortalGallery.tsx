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
      <div className="p-12 bg-zinc-950 rounded-[40px] border border-white/5 min-h-[700px] relative overflow-hidden group/container shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent)] pointer-events-none" />
        
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-12 relative z-10">
          <Sparkles className="w-4 h-4 text-purple-500" /> Omni-Motion Continuity
        </div>
        <h2 className="text-4xl font-black text-white italic tracking-tighter mb-12 relative z-10">PROJEÇÃO <span className="text-zinc-600">ESPACIAL</span></h2>

        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto relative z-10">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layoutId={`card-${item.id}`}
              onClick={() => setSelected(item.id)}
              className={`${item.color} h-60 rounded-[40px] cursor-pointer p-8 flex flex-col justify-end group overflow-hidden relative shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform`}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              <motion.div layoutId={`title-${item.id}`} className="text-white font-black text-2xl relative z-10 tracking-tight">{item.title}</motion.div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"><Maximize2 className="text-white w-6 h-6" /></div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selected && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-3xl bg-zinc-950/40">
              <motion.div
                layoutId={`card-${selected}`}
                className={`${items.find(i => i.id === selected)?.color} w-full h-full rounded-[60px] p-16 relative flex flex-col items-center justify-center text-center shadow-[0_0_100px_rgba(0,0,0,0.5)]`}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 pointer-events-none" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelected(null); }} 
                  className="absolute top-10 right-10 p-4 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all hover:scale-110 active:scale-95 z-20"
                >
                  <X className="w-8 h-8" />
                </button>
                <div className="space-y-8 max-w-2xl relative z-10">
                  <motion.h2 
                    layoutId={`title-${selected}`} 
                    className="text-8xl font-black text-white tracking-tighter italic leading-none"
                  >
                    {items.find(i => i.id === selected)?.title}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} 
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                    transition={{ delay: 0.3, duration: 0.8 }} 
                    className="text-white/80 text-xl leading-relaxed font-medium"
                  >
                    A continuidade espacial é mantida através do motor WAAPI nativo. 
                    Sem saltos, sem perca de quadros. Apenas física pura em 120 FPS.
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: 0.5, type: 'spring' }} 
                    className="pt-10"
                  >
                    <div className="flex gap-4 justify-center">
                      <div className="px-8 py-4 bg-white text-black font-black rounded-2xl flex items-center gap-3 uppercase tracking-tighter">
                        <Move className="w-5 h-5" /> Kinetic Continuity
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mt-16 text-center text-zinc-600 text-[10px] font-mono uppercase tracking-[0.4em] relative z-10">Clique para expandir o portal</div>
      </div>
    </LayoutGroup>
  );
};
