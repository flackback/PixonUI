import React, { useState, useRef } from 'react';
import {
  PixonMotion,
  AnimatePresence,
  LayoutGroup,
  useScroll,
  useTransform,
  useDrag,
  PixonSSRAnimate,
  BorderBeam,
  BackgroundGlow
} from '@pixonui/react';
import { Sparkles, X, CheckCircle, Zap, Move, LayoutGrid, MonitorDot, Code2, RefreshCw } from 'lucide-react';

export function MotionMasterDemo() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [wiggleCount, setWiggleCount] = useState(0);
  const [demoKey, setDemoKey] = useState(0); // For quick reset of animations
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax / Scroll Magic
  const { scrollYProgress } = useScroll({ container: containerRef });
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.2]);
  const headerScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  
  // Drag Physics Configuration
  const { isDragging, offset, dragProps } = useDrag(undefined, undefined, {
    inertia: true,
    bounce: 0.6,
    friction: 0.94
  });

  const { style: dragStyle, ...restDragProps } = dragProps;
  
  const MotionPath: any = PixonMotion;
  const MotionSVG: any = PixonMotion;

  const dashboardCards = [
    { id: 1, title: "SaaS Analytics", value: "$48,259", trend: "+12.4%", desc: "Métricas de faturamento recorrente (MRR) consolidadas em tempo real por IA." },
    { id: 2, title: "Active Users", value: "14,892", trend: "+8.3%", desc: "Sessões ativas simultâneas com baixa latência e replicação geográfica." },
    { id: 3, title: "Server Load", value: "24.1%", trend: "-2.1%", desc: "Distribuição de carga redundante em clusters serverless globais." },
    { id: 4, title: "Cloud Storage", value: "1.2 TB", trend: "Normal", desc: "Volume de arquivos persistidos de forma segura com criptografia ponta a ponta." }
  ];

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[650px] bg-slate-950 text-white rounded-3xl overflow-y-auto overflow-x-hidden border border-slate-800/80 shadow-2xl selection:bg-indigo-500/30 scroll-smooth"
    >
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Floating Glowing Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      {/* Scroll-Linked Header */}
      <PixonMotion
        className="sticky top-0 z-20 p-8 flex flex-col items-center justify-center border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl"
        style={{ opacity: headerOpacity as any, scale: headerScale as any }}
      >
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-3">
          <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          Ultra High Performance
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-violet-300">
          PixonMotion
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-medium">The Off-Thread Animation & Rendering Engine</p>
        
        {/* Reset Trigger */}
        <button 
          onClick={() => setDemoKey(k => k + 1)}
          className="absolute right-8 top-8 p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Reiniciar animações"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reiniciar
        </button>
      </PixonMotion>

      <div className="p-8 space-y-16 relative z-10 max-w-6xl mx-auto" key={demoKey}>
        
        {/* Section 1: SVG Path Drawing & Staggering */}
        <section className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm relative overflow-hidden group">
          <BorderBeam duration={12} colorFrom="#6366f1" colorTo="#8b5cf6" />
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Staggering & SVG Motion Drawing
          </h2>
          <PixonMotion
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 150 }}
          >
            {[1, 2, 3].map((i) => (
              <PixonMotion
                key={i}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col items-center justify-center gap-4 group/card relative shadow-lg"
                variants={{
                  hidden: { opacity: 0, translateY: 30, scale: 0.95 },
                  visible: { opacity: 1, translateY: 0, scale: 1 }
                }}
                whileHover={{ scale: 1.03, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none" />
                
                {/* SVG Path Animator */}
                <div className="w-20 h-20 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center relative">
                  <MotionSVG className="w-10 h-10 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <MotionPath
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      variants={{
                        hidden: { pathLength: 0, opacity: 0 },
                        visible: { pathLength: 1, opacity: 1 }
                      }}
                      transition={{ duration: 1200, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' }}
                    />
                  </MotionSVG>
                </div>
                
                <div className="text-center">
                  <div className="font-bold text-sm text-slate-200">Hardware Drawing</div>
                  <div className="text-xs text-indigo-400 mt-1 font-mono">100% GPU Accelerated</div>
                </div>
              </PixonMotion>
            ))}
          </PixonMotion>
        </section>

        {/* Section 2: Physical Drag with Inertia */}
        <section className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <Move className="w-5 h-5 text-indigo-400" />
            Physical Drag (Inertia, Bounce & Damping)
          </h2>
          <div className="w-full h-56 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] flex items-center justify-center">
            
            <div className="absolute text-center select-none pointer-events-none">
              <span className="text-xs font-mono text-slate-600 uppercase tracking-widest">Inertial sandbox — drag anywhere</span>
            </div>

            <PixonMotion
              className="absolute w-28 h-28 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl shadow-indigo-500/20 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing z-10 text-white font-bold select-none border border-white/10"
              style={{
                ...(dragStyle as any),
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isDragging ? 1.08 : 1})`,
                boxShadow: isDragging ? '0 25px 50px -12px rgba(99, 102, 241, 0.4)' : '0 20px 25px -5px rgba(99, 102, 241, 0.15)'
              }}
              {...restDragProps}
            >
              <Zap className="w-6 h-6 mb-1 text-white animate-pulse" />
              <span className="text-xs tracking-wider uppercase">Toss Me!</span>
            </PixonMotion>
          </div>
        </section>

        {/* Section 2.5: Premium Framer Motion Parity Features */}
        <section className="space-y-8 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <MonitorDot className="w-5 h-5 text-violet-400" />
            Framer Motion Parity (Recursos Avançados)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature A: Multi-Keyframe Array Property */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-4 relative overflow-hidden shadow-lg group/wiggle">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">1. Multiple Keyframe Arrays</h3>
              <PixonMotion
                key={wiggleCount}
                className="px-6 py-3.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 cursor-pointer text-center select-none border border-white/5 active:scale-95"
                animate={wiggleCount > 0 ? {
                  scale: [1, 1.25, 0.85, 1.15, 0.95, 1.05, 1],
                  rotate: [0, -14, 14, -8, 8, -4, 0]
                } : undefined}
                transition={{ duration: 650 }}
                onClick={() => setWiggleCount(c => c + 1)}
              >
                Disparar Elastic Wiggle!
              </PixonMotion>
              <span className="text-[10px] text-slate-500 font-mono">Compila para WAAPI de alta fidelidade</span>
            </div>

            {/* Feature B: Dynamic Custom Variants */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-3 justify-center shadow-lg">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest text-center mb-1">2. Custom Function Variants</h3>
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((idx) => (
                  <PixonMotion
                    key={idx}
                    className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono flex justify-between items-center hover:border-slate-700 transition-colors"
                    custom={idx}
                    variants={{
                      hidden: { opacity: 0, scale: 0.9, translateY: 10 },
                      visible: (i: number) => ({
                        opacity: 1,
                        scale: 1,
                        translateY: 0,
                        transition: { delay: i * 180, type: 'spring', stiffness: 300 }
                      })
                    }}
                    initial="hidden"
                    animate="visible"
                  >
                    <span className="text-slate-300">Stagger #{idx + 1}</span>
                    <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded text-[10px]">{idx * 180}ms offset</span>
                  </PixonMotion>
                ))}
              </div>
            </div>

            {/* Feature C: Advanced Viewport triggering */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3 shadow-lg">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest text-center">3. Viewport Intersection</h3>
              <PixonMotion
                className="w-full p-5 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 rounded-2xl text-center relative overflow-hidden group/vp"
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.92 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ type: 'spring', stiffness: 220 }}
              >
                <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover/vp:opacity-100 transition-opacity pointer-events-none" />
                <div className="text-[9px] text-emerald-400 font-bold font-mono uppercase tracking-widest mb-1.5">Triggers once at 80% screen</div>
                <div className="text-sm font-bold text-slate-100">Deteção Inteligente</div>
                <div className="text-[10px] text-slate-400 mt-1">Interseção limpa sem scroll-lag</div>
              </PixonMotion>
            </div>

          </div>
        </section>

        {/* Section 3: Shared Layout (FLIP) */}
        <section className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <LayoutGrid className="w-5 h-5 text-purple-400" />
            Shared Layout Morphing (No Scale-distortion FLIP)
          </h2>
          <LayoutGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardCards.map((card) => (
                <PixonMotion
                  key={card.id}
                  layoutId={`card-${card.id}`}
                  className="p-6 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-900/80 transition-all shadow-lg flex flex-col justify-between group relative h-40"
                  onClick={() => setSelectedId(card.id)}
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">{card.title}</span>
                    <h3 className="text-2xl font-bold text-white mt-1.5">{card.value}</h3>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-4">
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">{card.trend}</span>
                    <span className="text-indigo-400 font-medium group-hover:underline">Visualizar</span>
                  </div>
                </PixonMotion>
              ))}
            </div>

            <AnimatePresence>
              {selectedId && (
                <PixonMotion
                  key="overlay"
                  className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex items-center justify-center p-8 cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedId(null)}
                >
                  <PixonMotion
                    layoutId={`card-${selectedId}`}
                    layout="position"
                    className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative cursor-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <BackgroundGlow color="rgba(99, 102, 241, 0.15)" colorSecondary="rgba(139, 92, 246, 0.1)" />
                    <button 
                      className="absolute top-5 right-5 p-2 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-full transition-all"
                      onClick={() => setSelectedId(null)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="p-8 relative z-10 space-y-4">
                      <div>
                        <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-widest">
                          {dashboardCards.find(c => c.id === selectedId)?.title}
                        </span>
                        <h3 className="text-3xl font-extrabold text-white mt-2">
                          {dashboardCards.find(c => c.id === selectedId)?.value}
                        </h3>
                      </div>
                      
                      <div className="h-px bg-slate-800" />
                      
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {dashboardCards.find(c => c.id === selectedId)?.desc}
                      </p>
                      
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed font-mono">
                        <span className="text-emerald-400 font-bold">✓ layout="position"</span> ativo.<br />
                        Note que as fontes, elementos internos e botões mantêm proporções perfeitas durante a transição, sem esticamento ou distorções.
                      </div>
                    </div>
                  </PixonMotion>
                </PixonMotion>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </section>

        {/* Section 4: Pure Server-Side Animation (RSC Compatible) */}
        <section className="pb-16 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm relative">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <Code2 className="w-5 h-5 text-emerald-400" />
            Server-Side Animation (RSC / Zero Client JS)
          </h2>
          <div className="space-y-6">
            <p className="text-sm text-slate-400 leading-relaxed">
              O componente abaixo é renderizado usando o novíssimo <strong className="text-white">PixonSSRAnimate</strong>. Ele gera estilos e animações CSS inline puros mapeados no lado do servidor, tornando-o 100% elegível para rodar dentro de <strong className="text-white">React Server Components (RSC)</strong> sem a diretiva <code className="text-indigo-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono text-xs">"use client"</code>.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <PixonSSRAnimate
                  key={item}
                  className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group/ssr"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 700, delay: item * 150 }}
                >
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                  <div className="text-sm font-mono font-bold text-emerald-400 uppercase tracking-widest mb-1">Server Component</div>
                  <div className="text-xl font-extrabold text-white mt-1">Card #{item}</div>
                  <div className="text-xs text-slate-500 mt-2 font-mono">Delay: {item * 150}ms</div>
                </PixonSSRAnimate>
              ))}
            </div>
            
            <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
              <div className="absolute top-3 right-4 text-xs font-mono text-slate-600 uppercase select-none">RSC Code Block</div>
              <pre className="p-5 text-xs text-slate-300 font-mono overflow-x-auto">
                <code>
{`// NO "use client" NEEDED! Rendered completely on Next.js Server!
import { PixonSSRAnimate } from '@pixonui/react';

export default function MyServerPage() {
  return (
    <PixonSSRAnimate
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 700, delay: 150 }}
    >
      <div className="p-6 bg-slate-900 rounded-3xl">
         <h1>Fastest render ever!</h1>
      </div>
    </PixonSSRAnimate>
  );
}`}
                </code>
              </pre>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
