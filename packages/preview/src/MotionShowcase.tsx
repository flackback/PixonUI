import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  motion,
  useDrag,
  useSpring
} from '@pixonui/react';
import {
  ArrowLeft, Sparkles, Zap, Rocket,
  RefreshCw, Move, GripVertical, Atom
} from 'lucide-react';
import { AnimeLogoDemo } from './demos/AnimeLogoDemo';
import { FanCards } from './FanCards';
import {
  cardVariants, gridTextVariants, footerTextVariants,
  gridCardVariants, parallaxCardVariants
} from './MotionShowcaseVariants';

function lerp(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + (outMax - outMin) * t;
}

const HERO_FADE_INITIAL = { opacity: 0 };
const HERO_FADE_TARGET = { opacity: 1 };
const HERO_HINT_INITIAL = { opacity: 0 };
const HERO_HINT_TARGET = { opacity: 0.3 };
const SCROLL_BOUNCE = { y: [0, 10, 0] };
const SCROLL_BOUNCE_TRANS = { duration: 2, iterations: Infinity } as any;
const FOOTER_LIGHT = { x: [-1000, 1000] };
const FOOTER_LIGHT_TRANS = { duration: 10, easing: 'linear', iterations: Infinity } as any;
const VIEWPORT = { once: true, root: '#motion-showcase-container', amount: 0.05 };
const ENTRANCE = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: VIEWPORT };

const TX_08 = { duration: 0.8, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' };
const TX_12 = { duration: 1.2, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' };
const TX_18 = { duration: 1.8, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' };
const PARALLAX_TEXT_TRANS = { duration: 0.8, delay: 0.15, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' };
const SPRING_WRAPPER_TRANS = { duration: 0.8, delay: 0.15, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' };
const HERO_HINT_TRANS = { delay: 3 };
const PARALLAX_CARD_TRANS = [0, 1, 2].map(i => ({ duration: 0.9, delay: i * 0.12, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }));
const GRID_TRANSITIONS = [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ duration: 1.2, delay: i * 0.08, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }));
const ENTRANCE_DELAYS_8 = [0.1, 0.2, 0.3].map(d => ({ duration: 0.8, delay: d, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }));

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

const GRID_HOVER = { rotate: 360, scale: 1.3, rotateY: 180 };
const GRID_HOVER_TRANS = { type: 'spring' as const, stiffness: 200, damping: 15 };
const BTN_HOVER = { scale: 1.05 };
const BTN_TAP = { scale: 0.95 };
const HOVER_TAP_TRANS = { type: 'spring' as const, stiffness: 400, damping: 17 };
const HOVER_CARD_WH = { scale: 1.05, y: -4, backgroundColor: '#fff', borderColor: '#18181b' };
const HOVER_CARD_WT = { scale: 0.92 };

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
    <div className="fixed top-0 left-0 right-0 h-1 z-[100]">
      <div ref={barRef} className="h-full bg-zinc-900 origin-left will-change-transform" />
    </div>
  );
});
ScrollProgress.displayName = 'ScrollProgress';

const ParallaxShowcase = React.memo(({ scrollRef }: { scrollRef: { current: number } }) => {
  const bgRef = useRef<HTMLDivElement>(null);
  const layer0Ref = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let rafId: number;
    const tick = () => {
      const p = scrollRef.current;
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${lerp(p, 0, 1, 120, -120)}px)`;
        bgRef.current.style.opacity = String(lerp(p, 0, 1, 0.03, 0.08));
      }
      [layer0Ref, layer1Ref, layer2Ref].forEach((ref, i) => {
        if (ref.current) {
          ref.current.style.transform = `translateY(${lerp(p, 0, 1, 120 - i * 50, -120 + i * 50)}px)`;
        }
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [scrollRef]);

  const layers = [
    { title: 'Camada de Fundo', desc: 'Move-se lentamente para simular distância.', depth: '0.2x', ref: layer0Ref },
    { title: 'Camada Intermediária', desc: 'Velocidade média para elementos de contexto.', depth: '0.5x', ref: layer1Ref },
    { title: 'Camada de Frente', desc: 'Acompanha o scroll quase 1:1 para foco.', depth: '0.9x', ref: layer2Ref },
  ];

  return (
    <section className="relative py-40 overflow-hidden">
      <div ref={bgRef} className="absolute inset-0 flex items-center justify-center pointer-events-none select-none will-change-transform">
        <span className="text-[20vw] font-black text-zinc-900 leading-none">PARALLAX</span>
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.h2 initial={ENTRANCE.initial} whileInView={ENTRANCE.whileInView} viewport={VIEWPORT} transition={TX_08}
          className="text-6xl md:text-7xl font-bold tracking-tight leading-[0.85] mb-6">
          Profundidade em <br /><span className="text-zinc-400">Movimento</span>
        </motion.h2>
        <motion.p initial={ENTRANCE.initial} whileInView={ENTRANCE.whileInView} viewport={VIEWPORT} transition={PARALLAX_TEXT_TRANS}
          className="text-xl text-zinc-500 font-light leading-relaxed max-w-lg mb-16">
          Camadas independentes que se movem em velocidades diferentes, criando uma ilusão de profundidade 3D natural.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {layers.map((item, i) => (
            <motion.div key={item.title} ref={item.ref}
              initial={parallaxCardVariants.initial} whileInView={parallaxCardVariants.whileInView} viewport={VIEWPORT}
              transition={PARALLAX_CARD_TRANS[i]}
              className="bg-white border border-zinc-200 rounded-[40px] p-8 shadow-sm will-change-transform"
            >
              <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-zinc-400 font-mono text-sm font-bold">{item.depth}</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
ParallaxShowcase.displayName = 'ParallaxShowcase';

const SpringPhysicsDemo = React.memo(() => {
  const [stiffness, setStiffness] = useState(280);
  const [damping, setDamping] = useState(18);
  const [mass, setMass] = useState(1);
  const [trigger, setTrigger] = useState(0);
  const sv = useSpring(trigger, { stiffness, damping, mass });

  return (
    <section className="py-40">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={ENTRANCE.initial} whileInView={ENTRANCE.whileInView} viewport={VIEWPORT} transition={TX_08}>
          <h2 className="text-6xl md:text-7xl font-bold tracking-tight leading-[0.85] mb-6">Física de <br /><span className="text-zinc-400">Molas</span></h2>
          <p className="text-xl text-zinc-500 font-light leading-relaxed max-w-lg mb-16">Ajuste rigidez, amortecimento e massa para ver a física real de molas em ação.</p>
        </motion.div>
        <motion.div initial={ENTRANCE.initial} whileInView={ENTRANCE.whileInView} viewport={VIEWPORT} transition={SPRING_WRAPPER_TRANS}
          className="bg-white border border-zinc-200 rounded-[40px] p-10 shadow-sm space-y-10">
          <div className="relative h-32 bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-zinc-200 absolute" />
              <div className="w-full h-16 flex items-center will-change-transform" style={{ paddingLeft: `${sv * 240}px` }}>
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl shadow-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ boxShadow: `0 ${4 + sv * 16}px ${20 + sv * 20}px rgba(0,0,0,${0.1 + sv * 0.15})` }}>
                  <Atom className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setTrigger(t => (t === 0 ? 1 : 0))}
              className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2">
              <Zap className="w-4 h-4" />{trigger === 0 ? 'Lançar Mola' : 'Resetar'}</button>
            <button onClick={() => { setStiffness(280); setDamping(18); setMass(1); }}
              className="px-4 py-4 bg-zinc-100 text-zinc-500 rounded-2xl hover:bg-zinc-200 transition-all" title="Resetar parâmetros">
              <RefreshCw className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Rigidez', v: stiffness, min: 10, max: 500, set: setStiffness, low: 'Suave', high: 'Rígida', fmt: (v: number) => String(v) },
              { label: 'Amortecimento', v: damping, min: 1, max: 80, set: setDamping, low: 'Oscilante', high: 'Crítico', fmt: (v: number) => String(v) },
              { label: 'Massa', v: mass, min: 0.1, max: 5, step: 0.1, set: setMass, low: 'Leve', high: 'Pesada', fmt: (v: number) => v.toFixed(1) },
            ].map(s => (
              <div key={s.label}>
                <label className="flex justify-between text-sm font-medium text-zinc-600 mb-2">
                  <span>{s.label}</span><span className="font-mono text-zinc-900">{s.fmt(s.v)}</span></label>
                <input type="range" min={s.min} max={s.max} step={s.step ?? 1} value={s.v} onChange={e => s.set(+e.target.value)} className="w-full accent-zinc-900" />
                <div className="flex justify-between text-xs text-zinc-400 mt-1"><span>{s.low}</span><span>{s.high}</span></div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="text-xs text-zinc-400 font-mono">
              Valor atual: <span className="text-zinc-900 font-bold">{sv.toFixed(4)}</span>
              &nbsp;| Posição: <span className="text-zinc-900 font-bold">{(sv * 240).toFixed(1)}px</span>
              &nbsp;| Config: <span className="text-zinc-900 font-bold">{`spring({ stiffness: ${stiffness}, damping: ${damping}, mass: ${mass.toFixed(1)} })`}</span>
            </div>
          </div>
        </motion.div>
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
      className="bg-white border border-zinc-200 rounded-[40px] p-8 shadow-sm">
      <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6"><Move className="w-5 h-5 text-zinc-500" /></div>
      <h3 className="text-xl font-bold mb-4">Arraste com Inércia</h3>
      <p className="text-sm text-zinc-500 mb-6">Física de inércia e bounce ao soltar.</p>
      <div className="relative h-48 bg-zinc-50 rounded-3xl border border-zinc-100 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
        <div className="absolute w-16 h-16 bg-zinc-900 rounded-2xl shadow-lg flex items-center justify-center text-white cursor-grab active:cursor-grabbing z-10 select-none"
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isDragging ? 1.12 : 1})`,
            boxShadow: isDragging ? '0 20px 40px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
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
        <h2 className="text-6xl md:text-7xl font-bold tracking-tight leading-[0.85] mb-6">Gestos & <br /><span className="text-zinc-400">Interação</span></h2>
        <p className="text-xl text-zinc-500 font-light leading-relaxed max-w-lg">Arraste, toque e sinta a resposta física de cada elemento.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <DragCard />
        <motion.div initial={ENTRANCE.initial} whileInView={ENTRANCE.whileInView} viewport={VIEWPORT} transition={ENTRANCE_DELAYS_8[1]}
          className="bg-white border border-zinc-200 rounded-[40px] p-8 shadow-sm">
          <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6"><Zap className="w-5 h-5 text-zinc-500" /></div>
          <h3 className="text-xl font-bold mb-4">Hover & Tap</h3>
          <p className="text-sm text-zinc-500 mb-6">Elementos que reagem ao cursor e ao clique.</p>
          <div className="grid grid-cols-2 gap-3">
            {['Elevar', 'Pressionar', 'Girar', 'Escalar'].map(label => (
              <motion.div key={label}
                className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center text-sm font-medium text-zinc-600 cursor-pointer select-none"
                whileHover={HOVER_CARD_WH} whileTap={HOVER_CARD_WT} transition={HOVER_TAP_TRANS}>{label}</motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={ENTRANCE.initial} whileInView={ENTRANCE.whileInView} viewport={VIEWPORT} transition={ENTRANCE_DELAYS_8[2]}
          className="bg-white border border-zinc-200 rounded-[40px] p-8 shadow-sm">
          <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6"><Sparkles className="w-5 h-5 text-zinc-500" /></div>
          <h3 className="text-xl font-bold mb-4">Multi-Keyframe</h3>
          <p className="text-sm text-zinc-500 mb-6">Animações encadeadas com bounce elástico.</p>
          <div className="flex items-center justify-center h-48 bg-zinc-50 rounded-3xl border border-zinc-100 relative overflow-hidden">
            {[0, 1, 2].map(i => <KeyframeBox key={i} i={i} />)}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
));
GestureShowcase.displayName = 'GestureShowcase';

export const MotionShowcase = React.memo(({ onBack }: { onBack: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      scrollRef.current = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div id="motion-showcase-container" ref={containerRef} className="h-screen overflow-y-auto overflow-x-hidden bg-[#F6F4F2] text-zinc-900 selection:bg-purple-200 scroll-smooth">
      <div className="relative min-h-full">
        <ScrollProgress scrollRef={scrollRef} />

        <div className="absolute inset-0 pointer-events-none z-0"
          style={{ backgroundImage: 'radial-gradient(circle, #000000 1.5px, transparent 1.5px)', backgroundSize: '60px 60px', opacity: 0.1 }} />

        <nav className="fixed top-0 left-0 w-full p-8 z-50 flex justify-between items-center bg-gradient-to-b from-[#F6F4F2]/80 to-transparent backdrop-blur-sm">
          <motion.button whileHover={BTN_HOVER} whileTap={BTN_TAP} onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-black transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar</span>
          </motion.button>
        </nav>

        <section className="relative min-h-screen flex flex-col items-center justify-center z-10">
          <motion.div initial={HERO_FADE_INITIAL} animate={HERO_FADE_TARGET} className="w-full max-w-5xl px-6 flex items-center justify-center">
            <div className="w-full h-full scale-90 md:scale-125 flex items-center justify-center"><AnimeLogoDemo /></div>
          </motion.div>
          <motion.div initial={HERO_HINT_INITIAL} animate={HERO_HINT_TARGET} transition={HERO_HINT_TRANS}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-[0.3em] font-medium">Explore o Movimento</span>
            <motion.div animate={SCROLL_BOUNCE} transition={SCROLL_BOUNCE_TRANS} className="w-px h-12 bg-zinc-900" />
          </motion.div>
        </section>

        <section className="py-40 px-6 max-w-6xl mx-auto space-y-96 relative z-10">
          <div className="grid md:grid-cols-2 gap-32 items-center">
            <motion.div initial={cardVariants.initial} whileInView={cardVariants.whileInView}
              viewport={{ ...VIEWPORT, margin: '0px' }} transition={TX_12} className="space-y-10">
              <h2 className="text-7xl font-bold tracking-tight leading-[0.85]">Interações que <br /><span className="text-zinc-400">Respiram</span></h2>
              <p className="text-2xl text-zinc-500 font-light leading-relaxed max-w-md">Não apenas transições de estado, mas simulação física completa. Inércia, atrito e elasticidade integrados nativamente.</p>
            </motion.div>
            <FanCards scrollRef={scrollRef} />
          </div>

          <ParallaxShowcase scrollRef={scrollRef} />

          <div className="relative">
            <motion.div initial={gridTextVariants.initial} whileInView={gridTextVariants.whileInView} viewport={VIEWPORT} transition={TX_18}>
              <h2 className="text-[20vw] font-black uppercase text-center leading-none text-zinc-900/5 select-none pointer-events-none absolute -top-60 left-0 w-full tracking-tighter mix-blend-multiply">DYNAMIC</h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-32 relative z-10">
              {[...Array(8)].map((_, i) => (
                <motion.div key={i} initial={gridCardVariants.initial} whileInView={gridCardVariants.whileInView}
                  viewport={VIEWPORT} transition={GRID_TRANSITIONS[i]}
                  className="aspect-square bg-white border border-zinc-200 rounded-[50px] shadow-sm flex items-center justify-center group hover:border-zinc-900 transition-all duration-700 overflow-hidden relative hover:shadow-2xl hover:-translate-y-6">
                  <div className="absolute inset-0 bg-zinc-900 opacity-0 group-hover:opacity-[0.04] transition-opacity" />
                  <motion.div whileHover={GRID_HOVER} transition={GRID_HOVER_TRANS}>
                    <Rocket className="w-14 h-14 text-zinc-200 group-hover:text-zinc-900 transition-colors duration-500" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          <SpringPhysicsDemo />

          <div className="py-20 flex flex-col items-center text-center">
            <motion.div initial={footerTextVariants.initial} whileInView={footerTextVariants.whileInView}
              viewport={VIEWPORT} transition={TX_18} className="max-w-5xl space-y-16">
              <h2 className="text-8xl font-bold tracking-tighter leading-[0.85]">O Próximo Passo do <br /><span className="text-zinc-400 font-light">Front-end</span></h2>
              <p className="text-3xl text-zinc-400 font-extralight leading-relaxed max-w-4xl mx-auto">Transformamos código em experiência. Movimento não é opcional, é a alma de interfaces modernas e memoráveis.</p>
            </motion.div>
          </div>

          <GestureShowcase />
        </section>

        <footer className="py-40 text-center bg-zinc-900 text-white rounded-t-[100px] relative z-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <motion.div animate={FOOTER_LIGHT} transition={FOOTER_LIGHT_TRANS}
              className="h-full w-[200%] bg-gradient-to-r from-transparent via-white to-transparent opacity-20 skew-x-12" />
          </div>
          <h2 className="text-5xl md:text-8xl font-bold mb-16 tracking-tighter relative z-10">Pronto para criar?</h2>
          <button onClick={onBack}
            className="rounded-full px-16 py-8 text-xl font-black bg-white text-zinc-900 hover:bg-zinc-100 transition-all hover:scale-110 active:scale-95 shadow-[0_20px_80px_rgba(255,255,255,0.2)] relative z-10">
            COMEÇAR AGORA</button>
          <div className="mt-32 text-zinc-500 text-sm tracking-widest uppercase">PixonUI Motion Showcase — High Fidelity Engine</div>
        </footer>
      </div>
    </div>
  );
});

MotionShowcase.displayName = 'MotionShowcase';
