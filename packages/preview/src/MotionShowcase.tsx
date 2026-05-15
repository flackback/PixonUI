import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  motion,
  useDrag,
  useSpring,
  useMotionValue,
  useTransform,
  DotGrid
} from '@pixonui/react';
import {
  ArrowLeft, Sparkles, Zap, Rocket,
  RefreshCw, Move, GripVertical, Atom,
  Layers, MousePointer2, Wind
} from 'lucide-react';
import { AnimeLogoDemo } from './demos/AnimeLogoDemo';
import { FanCards } from './FanCards';
import { lerp, clamp } from './utils';
import {
  cardVariants, gridTextVariants, footerTextVariants,
  gridCardVariants, parallaxCardVariants
} from './MotionShowcaseVariants';

// --- Constants (Supreme 3.2 Edition) ---
const VIEWPORT = { once: true, root: '#motion-showcase-container', amount: 0.05 };
const ENTRANCE = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: VIEWPORT };

const TX_08 = { duration: 0.8, easing: [0.16, 1, 0.3, 1] };
const TX_12 = { duration: 1.2, easing: [0.16, 1, 0.3, 1] };
const TX_18 = { duration: 1.8, easing: [0.16, 1, 0.3, 1] };

const HERO_HINT_INITIAL = { opacity: 0 };
const HERO_HINT_TARGET = { opacity: 0.3 };
const HERO_HINT_TRANS = { delay: 3 };
const SCROLL_BOUNCE = { y: [0, 10, 0] };
const SCROLL_BOUNCE_TRANS = { duration: 2, iterations: Infinity } as any;
const FOOTER_LIGHT = { x: [-1000, 1000] };
const FOOTER_LIGHT_TRANS = { duration: 10, easing: 'linear', iterations: Infinity } as any;

const KEYFRAME_ANIMS = [
  { y: [0, -40, 0], rotate: [0, -20, 0], scale: [1, 1.2, 1] },
  { y: [0, -60, 0], rotate: [0, 0, 0], scale: [1, 1.1, 1] },
  { y: [0, -80, 0], rotate: [0, 20, 0], scale: [1, 1.0, 1] },
];
const KEYFRAME_TRANS = [
  { duration: 1.5, delay: 0, easing: 'ease-in-out', iterations: Infinity } as any,
  { duration: 1.8, delay: 0.2, easing: 'ease-in-out', iterations: Infinity } as any,
  { duration: 2.1, delay: 0.4, easing: 'ease-in-out', iterations: Infinity } as any,
];

const ENTRANCE_DELAYS_8 = [0.1, 0.2, 0.3].map(d => ({ duration: 0.8, delay: d, easing: [0.16, 1, 0.3, 1] }));

const HOVER_CARD_WH = { scale: 1.05, y: -4, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(139,92,246,0.5)' };
const HOVER_CARD_WT = { scale: 0.95 };
const HOVER_TAP_TRANS = { type: 'spring' as const, stiffness: 400, damping: 20 };

// --- Next-Gen Showcase Components (Supreme 3.2) ---
import { ScrollParallaxMaster, AnimeKineticText, PhysicsShowcase } from './demos/NextGenSupremeDemos';

const ScrollProgress = React.memo(({ scrollRef }: { scrollRef: { current: number } }) => {
  const barRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    let rafId: number;
    const tick = () => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${scrollRef.current})`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [scrollRef]);
  return (
    <div className="fixed top-0 left-0 right-0 h-1.5 z-[100]">
      <div ref={barRef} className="h-full bg-gradient-to-r from-purple-600 to-pink-500 origin-left will-change-transform shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
    </div>
  );
});
ScrollProgress.displayName = 'ScrollProgress';

const SpringPhysicsDemo = React.memo(() => {
  const [stiffness, setStiffness] = useState(280);
  const [damping, setDamping] = useState(18);
  const [trigger, setTrigger] = useState(0);
  const sv = useSpring(trigger, { stiffness, damping });

  return (
    <section className="py-40">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={ENTRANCE.initial} whileInView={ENTRANCE.whileInView} viewport={VIEWPORT} transition={TX_08}>
          <h2 className="text-6xl md:text-7xl font-bold tracking-tight leading-[0.85] mb-6 text-white">Física de <br /><span className="text-zinc-500 italic font-black">Molas</span></h2>
          <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-lg mb-16">Hardware-accelerated springs for high-fidelity interactive systems.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          <div className="md:col-span-8 bg-zinc-900/50 border border-white/5 rounded-[40px] p-10 shadow-2xl backdrop-blur-xl space-y-10">
            <div className="relative h-32 bg-black rounded-3xl overflow-hidden border border-white/5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-white/5 absolute" />
                <div className="w-full h-16 flex items-center will-change-transform" style={{ paddingLeft: `${sv * 240}px` }}>
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center text-black">
                    <Atom className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setTrigger(t => (t === 0 ? 1 : 0))}
                className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold text-sm hover:bg-purple-500 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-tighter shadow-lg shadow-purple-500/20">
                <Zap className="w-4 h-4" />{trigger === 0 ? 'Launch Pulse' : 'Reset Momentum'}</button>
            </div>
          </div>
          <div className="md:col-span-4"><PhysicsShowcase /></div>
        </div>
      </div>
    </section>
  );
});
SpringPhysicsDemo.displayName = 'SpringPhysicsDemo';

const KeyframeBox = React.memo(({ i }: { i: number }) => (
  <motion.div className="absolute w-12 h-12 bg-zinc-900 rounded-xl shadow-lg will-change-transform"
    style={{ left: `${30 + i * 35}%` }} animate={KEYFRAME_ANIMS[i]} transition={KEYFRAME_TRANS[i]} />
));
KeyframeBox.displayName = 'KeyframeBox';

const DragCard = React.memo(() => {
  const { isDragging, offset, dragProps } = useDrag(undefined, undefined, { inertia: true, bounce: 0.5, friction: 0.92 });
  const { style: dragStyle, ...restDragProps } = dragProps;
  return (
    <motion.div initial={ENTRANCE.initial} whileInView={ENTRANCE.whileInView} viewport={VIEWPORT} transition={ENTRANCE_DELAYS_8[0]}
      className="bg-zinc-900/50 border border-white/5 rounded-[40px] p-8 shadow-2xl backdrop-blur-xl group">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5"><Move className="w-5 h-5 text-purple-400" /></div>
      <h3 className="text-xl font-bold mb-4 text-white">Arraste com Inércia</h3>
      <p className="text-sm text-zinc-500 mb-6 font-medium">Física de inércia e bounce ao soltar.</p>
      <div className="relative h-48 bg-black rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-100" />
        <div className="absolute w-16 h-16 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center text-black cursor-grab active:cursor-grabbing z-10 select-none"
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isDragging ? 1.12 : 1})`,
            boxShadow: isDragging ? '0 20px 80px rgba(139,92,246,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
            willChange: 'transform', transition: isDragging ? 'none' : 'box-shadow 0.3s', ...dragStyle }}
          {...restDragProps}><GripVertical className="w-6 h-6" /></div>
      </div>
    </motion.div>
  );
});
DragCard.displayName = 'DragCard';

const GestureShowcase = React.memo(() => (
  <section className="py-40">
    <div className="max-w-5xl mx-auto px-6">
      <motion.div initial={ENTRANCE.initial} whileInView={ENTRANCE.whileInView} viewport={VIEWPORT} transition={TX_08} className="mb-16">
        <h2 className="text-6xl md:text-7xl font-bold tracking-tight leading-[0.85] mb-6 text-white">Gestos & <br /><span className="text-zinc-400 italic">Interação</span></h2>
        <p className="text-xl text-zinc-500 font-light leading-relaxed max-w-lg">Arraste, toque e sinta a resposta física de cada elemento.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <DragCard />
        <motion.div initial={ENTRANCE.initial} whileInView={ENTRANCE.whileInView} viewport={VIEWPORT} transition={ENTRANCE_DELAYS_8[1]}
          className="bg-zinc-900/50 border border-white/5 rounded-[40px] p-8 shadow-2xl backdrop-blur-xl group">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5"><Zap className="w-5 h-5 text-purple-400" /></div>
          <h3 className="text-xl font-bold mb-4 text-white">Hover & Tap</h3>
          <p className="text-sm text-zinc-500 mb-6 font-medium">Elementos que reagem ao cursor e ao clique.</p>
          <div className="grid grid-cols-2 gap-3">
            {['Elevar', 'Pressionar', 'Girar', 'Escalar'].map(label => (
              <motion.div key={label}
                className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center text-sm font-bold text-zinc-400 cursor-pointer select-none hover:text-white hover:border-purple-500/50 transition-colors"
                whileHover={HOVER_CARD_WH} whileTap={HOVER_CARD_WT} transition={HOVER_TAP_TRANS}>{label}</motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={ENTRANCE.initial} whileInView={ENTRANCE.whileInView} viewport={VIEWPORT} transition={ENTRANCE_DELAYS_8[2]}
          className="bg-zinc-900/50 border border-white/5 rounded-[40px] p-8 shadow-2xl backdrop-blur-xl group">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5"><Sparkles className="w-5 h-5 text-purple-400" /></div>
          <h3 className="text-xl font-bold mb-4 text-white">Multi-Keyframe</h3>
          <p className="text-sm text-zinc-500 mb-6 font-medium">Animações encadeadas com bounce elástico.</p>
          <div className="relative h-48 bg-black rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:15px_15px]" />
            {[0, 1, 2].map(i => <KeyframeBox key={i} i={i} />)}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
));
GestureShowcase.displayName = 'GestureShowcase';

const LayoutFlipDemo = React.memo(() => {
  const [items, setItems] = useState([1, 2, 3, 4, 5, 6]);
  const shuffle = () => setItems(prev => [...prev].sort(() => Math.random() - 0.5));

  return (
    <section className="py-40">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={ENTRANCE.initial} whileInView={ENTRANCE.whileInView} viewport={VIEWPORT} transition={TX_08} className="mb-16">
          <h2 className="text-6xl md:text-7xl font-bold tracking-tight leading-[0.85] mb-6 text-white">Supreme <br /><span className="text-zinc-400 italic">Layout (FLIP)</span></h2>
          <p className="text-xl text-zinc-500 font-light leading-relaxed max-w-lg mb-8">Transições de layout fluidas em 120 FPS usando a técnica FLIP.</p>
          <button onClick={shuffle} className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition-colors active:scale-95">Embaralhar Grade</button>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {items.map(item => (
            <motion.div key={item} layoutId={`flip-${item}`} layout
              className="h-40 bg-zinc-900 border border-white/5 rounded-[30px] flex items-center justify-center text-4xl font-black text-zinc-800 shadow-xl"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
LayoutFlipDemo.displayName = 'LayoutFlipDemo';

export const MotionShowcase = React.memo(({ onBack }: { onBack: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const [showLogo, setShowLogo] = useState(true);
  const tiltRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 20 });
  
  const spotlightX = useTransform(smoothX, [0, 1], ['-10%', '110%']);
  const spotlightY = useTransform(smoothY, [0, 1], ['-10%', '110%']);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      scrollRef.current = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
    };
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX / innerWidth);
      mouseY.set(e.clientY / innerHeight);
      
      if (tiltRef.current) {
        const tx = (e.clientX / innerWidth - 0.5) * 10;
        const ty = (e.clientY / innerHeight - 0.5) * 10;
        tiltRef.current.style.transform = `rotateY(${tx}deg) rotateX(${-ty}deg)`;
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div id="motion-showcase-container" ref={containerRef} className="h-screen overflow-y-auto overflow-x-hidden bg-zinc-950 text-white selection:bg-purple-500/30 scroll-smooth perspective-1000 relative">
      <div className="relative min-h-full">
        <ScrollProgress scrollRef={scrollRef} />
        <DotGrid color="#ffffff" opacity={0.12} spacing={50} interactive={true} maxDist={250} magneticStrength={25} />
        
        <motion.div 
          className="fixed inset-0 pointer-events-none z-[1]"
          style={{
            background: useTransform([spotlightX, spotlightY], ([x, y]) => 
              `radial-gradient(800px circle at ${x} ${y}, rgba(139, 92, 246, 0.1), transparent 80%)`
            ),
          }}
        />

        <nav className="fixed top-0 left-0 w-full p-8 z-50 flex justify-between items-center bg-gradient-to-b from-zinc-950/80 to-transparent backdrop-blur-md">
          <button onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar</span>
          </button>
        </nav>

        <section className="relative min-h-screen flex flex-col items-center justify-center z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl aspect-square bg-purple-500/10 blur-[180px] rounded-full animate-pulse" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }} 
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
            transition={{ duration: 1.4, easing: [0.16, 1, 0.3, 1] }} 
            className="w-full max-w-5xl px-6 flex items-center justify-center z-10"
          >
            <div ref={tiltRef} className="w-full h-full scale-100 md:scale-125 flex items-center justify-center relative transition-transform duration-300 ease-out preserve-3d">
               <div className="absolute inset-0 bg-zinc-900/40 rounded-[60px] border border-white/5 backdrop-blur-3xl shadow-[0_0_100px_rgba(139,92,246,0.1)]" />
               <div className="relative z-10 py-20">
                 {showLogo && <AnimeLogoDemo />}
               </div>
            </div>
          </motion.div>
          <motion.div initial={HERO_HINT_INITIAL} animate={HERO_HINT_TARGET} transition={HERO_HINT_TRANS}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
            <span className="text-xs uppercase tracking-[0.3em] font-medium text-zinc-500">Desça para Explorar</span>
            <motion.div animate={SCROLL_BOUNCE} transition={SCROLL_BOUNCE_TRANS} className="w-px h-12 bg-purple-500/30" />
          </motion.div>
        </section>

        <section className="py-40 px-6 max-w-7xl mx-auto space-y-96 relative z-10">
          <div className="grid md:grid-cols-2 gap-32 items-center">
            <motion.div initial={cardVariants.initial} whileInView={cardVariants.whileInView}
              viewport={{ ...VIEWPORT, margin: '0px' }} transition={TX_12} className="space-y-10">
              <div className="flex items-center gap-2 text-purple-500 font-mono text-xs uppercase tracking-[0.3em] font-bold">
                <Sparkles className="w-4 h-4" /> Omni-Motion
              </div>
              <h2 className="text-8xl font-black tracking-tighter leading-[0.8] uppercase italic text-white">
                OMNI <br /><span className="text-zinc-600">MOTION</span>
              </h2>
              <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-md">
                Simulação física completa integrada ao kernel de animação. 
                <span className="text-white"> Inércia, atrito e elasticidade </span> sem travar a Main Thread.
              </p>
            </motion.div>
            <div className="relative group flex justify-center">
               <div className="absolute -inset-40 bg-purple-500/5 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <FanCards scrollRef={scrollRef} />
            </div>
          </div>

          <ScrollParallaxMaster />

          <div className="relative">
            <motion.div initial={gridTextVariants.initial} whileInView={gridTextVariants.whileInView} viewport={VIEWPORT} transition={TX_18}>
              <h2 className="text-[20vw] font-black uppercase text-center leading-none text-purple-500/10 select-none pointer-events-none absolute -top-60 left-0 w-full tracking-tighter">SUPREME</h2>
            </motion.div>
            <AnimeKineticText />
          </div>

          <SpringPhysicsDemo />

          <div className="py-40 flex flex-col items-center text-center">
            <motion.div initial={footerTextVariants.initial} whileInView={footerTextVariants.whileInView}
              viewport={VIEWPORT} transition={TX_18} className="max-w-5xl space-y-12">
              <h2 className="text-8xl font-black tracking-tighter leading-[0.8] uppercase italic text-white">The Surgical <br /><span className="text-purple-500">Pulse</span></h2>
              <p className="text-2xl text-zinc-500 font-medium leading-relaxed max-w-4xl mx-auto">
                Pure WAAPI performance meets surgical precision. <br/>
                The ultimate benchmark for modern web interfaces.
              </p>
            </motion.div>
          </div>

          <LayoutFlipDemo />
          <GestureShowcase />
        </section>

        <footer className="py-40 text-center bg-black text-white rounded-t-[100px] relative z-20 border-t border-white/5">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <motion.div animate={FOOTER_LIGHT} transition={FOOTER_LIGHT_TRANS}
              className="h-full w-[200%] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent skew-x-12" />
          </div>
          <h2 className="text-6xl md:text-9xl font-black mb-16 tracking-tighter relative z-10 uppercase italic">Reinvente</h2>
          <button onClick={onBack}
            className="rounded-full px-16 py-8 text-xl font-black bg-white text-black hover:bg-zinc-200 transition-all hover:scale-110 active:scale-95 shadow-[0_0_80px_rgba(139,92,246,0.3)] relative z-10 uppercase tracking-tighter">
            Explorar Agora
          </button>
          <div className="mt-32 text-zinc-600 text-[10px] font-mono tracking-[0.5em] uppercase">PixonUI — Supreme Motion Engine</div>
        </footer>
      </div>
    </div>
  );
});
MotionShowcase.displayName = 'MotionShowcase';
