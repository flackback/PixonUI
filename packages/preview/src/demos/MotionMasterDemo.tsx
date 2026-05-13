import React, { useState, useRef } from 'react';
import {
  PixonMotion,
  AnimatePresence,
  LayoutGroup,
  usePixonScroll,
  usePixonTransform,
  useDrag
} from '@pixonui/react';
import { Sparkles, X, CheckCircle } from 'lucide-react';

export function MotionMasterDemo() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [wiggleCount, setWiggleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax / Scroll Magic
  const { scrollYProgress } = usePixonScroll({ container: containerRef });
  const headerOpacity = usePixonTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const headerScale = usePixonTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  
  // Drag Physics
  const { isDragging, offset, dragProps } = useDrag(undefined, undefined, {
    inertia: true,
    bounce: 0.5,
    friction: 0.95
  });

  const { style: dragStyle, ...restDragProps } = dragProps;
  
  const MotionPath: any = PixonMotion;
  const MotionSVG: any = PixonMotion;

  const cards = [1, 2, 3, 4];

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[600px] bg-slate-950 text-white rounded-2xl overflow-y-auto overflow-x-hidden border border-slate-800"
    >
      {/* Scroll-Linked Header */}
      <PixonMotion
        className="sticky top-0 z-10 p-8 flex flex-col items-center justify-center border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl"
        style={{ opacity: headerOpacity as any, transform: `scale(${headerScale})` }}
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
          PixonMotion
        </h1>
        <p className="text-slate-400 mt-2">The Ultimate High-Performance Animation Engine</p>
      </PixonMotion>

      <div className="p-8 space-y-16">
        
        {/* Section 1: SVG Path Drawing & Staggering */}
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Staggering & SVG Magic
          </h2>
          <PixonMotion
            className="flex gap-4"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.15 }}
          >
            {[1, 2, 3].map((i) => (
              <PixonMotion
                key={i}
                className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center"
                variants={{
                  hidden: { opacity: 0, translateY: 20 },
                  visible: { opacity: 1, translateY: 0 }
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <MotionSVG className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <MotionPath
                    d="M20 6L9 17l-5-5"
                    variants={{
                      hidden: { pathLength: 0, opacity: 0 },
                      visible: { pathLength: 1, opacity: 1 }
                    }}
                    transition={{ duration: 1000, easing: 'ease-out' }}
                  />
                </MotionSVG>
              </PixonMotion>
            ))}
          </PixonMotion>
        </section>

        {/* Section 2: Physical Drag with Inertia */}
        <section>
          <h2 className="text-xl font-semibold mb-6 font-sans">Physics Drag (Inertia & Bounce)</h2>
          <div className="w-full h-40 bg-slate-900 rounded-2xl border border-slate-800 p-4 relative overflow-hidden">
            <PixonMotion
              className="absolute w-24 h-24 bg-gradient-to-tr from-blue-500 to-violet-500 rounded-3xl shadow-xl shadow-blue-500/20 flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
              style={{
                ...(dragStyle as any),
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isDragging ? 1.1 : 1})`
              }}
              {...restDragProps}
            >
              <span className="font-medium text-sm">Toss Me!</span>
            </PixonMotion>
          </div>
        </section>

        {/* Section 2.5: Premium Framer Motion Parity Features */}
        <section className="space-y-8">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Framer Motion Parity (Recursos Premium)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature A: Multi-Keyframe Array Property */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-4">
              <h3 className="text-sm font-semibold text-slate-400 text-center">1. Keyframes em Array (Pulse & Wiggle)</h3>
              <PixonMotion
                key={wiggleCount}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-medium text-sm shadow-lg shadow-red-500/20 cursor-pointer text-center"
                animate={wiggleCount > 0 ? {
                  scale: [1, 1.2, 0.9, 1.1, 1],
                  rotate: [0, -12, 12, -6, 6, 0]
                } : undefined}
                transition={{ duration: 500 }}
                onClick={() => setWiggleCount(c => c + 1)}
              >
                Disparar Wiggle!
              </PixonMotion>
            </div>

            {/* Feature B: Dynamic Custom Variants */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col gap-3 justify-center">
              <h3 className="text-sm font-semibold text-slate-400 text-center mb-1">2. Variantes com Custom Props</h3>
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((idx) => (
                  <PixonMotion
                    key={idx}
                    className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs font-mono flex justify-between"
                    custom={idx}
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: (i: number) => ({
                        opacity: 1,
                        scale: 1,
                        transition: { delay: i * 0.15, type: 'spring' }
                      })
                    }}
                    initial="hidden"
                    animate="visible"
                  >
                    <span>Item Dinâmico</span>
                    <span className="text-indigo-400">Delay: {idx * 150}ms</span>
                  </PixonMotion>
                ))}
              </div>
            </div>

            {/* Feature C: Advanced Viewport triggering */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
              <h3 className="text-sm font-semibold text-slate-400 text-center">3. Trigger de Viewport Avançado</h3>
              <PixonMotion
                className="w-full p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl text-center"
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div className="text-xs text-emerald-400 font-bold mb-1 font-mono uppercase tracking-wider">Dispara uma única vez</div>
                <div className="text-sm font-medium">Ativado com 80% na Tela!</div>
              </PixonMotion>
            </div>

          </div>
        </section>

        {/* Section 3: Shared Layout (FLIP) */}
        <section className="pb-32">
          <h2 className="text-xl font-semibold mb-6">Shared Layout (FLIP Morphing)</h2>
          <LayoutGroup>
            <div className="grid grid-cols-2 gap-6">
              {cards.map((id) => (
                <PixonMotion
                  key={id}
                  layoutId={`card-${id}`}
                  className="h-32 bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-700 transition-colors"
                  onClick={() => setSelectedId(id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                />
              ))}
            </div>

            <AnimatePresence>
              {selectedId && (
                <PixonMotion
                  key="overlay"
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedId(null)}
                >
                  <PixonMotion
                    layoutId={`card-${selectedId}`}
                    layout="position"
                    className="w-full max-w-md h-96 bg-slate-800 rounded-3xl shadow-2xl overflow-hidden relative cursor-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      className="absolute top-4 right-4 p-2 bg-slate-900 rounded-full hover:bg-slate-700"
                      onClick={() => setSelectedId(null)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="p-8">
                      <h3 className="text-2xl font-bold mb-4">Morphing Magic</h3>
                      <p className="text-slate-400">
                        This card seamlessly morphs from the grid into a full modal using WAAPI hardware-accelerated transforms. No expensive React re-renders during the flight.
                      </p>
                    </div>
                  </PixonMotion>
                </PixonMotion>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </section>

      </div>
    </div>
  );
}
