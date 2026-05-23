import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Cpu, Rocket, Sparkles, Zap, Terminal as TermIcon, Calendar, ArrowRightLeft, Layers, Play } from 'lucide-react';
import {
  Badge,
  Button,
  GlowButton,
  Heading,
  PixonSSRAnimate,
  ScrollScene,
  Stack,
  Surface,
  Text,
  ThemeToggle,
  useTimelineScope,
  createTimelineComposer,
  useScroll,
  useTransform,
  useMotionValueValue,
  motion,
  parallax,
} from '@pixonui/react';

interface LandingPageProps {
  onEnterGallery: () => void;
  onEnterSaaS: () => void;
}

// Global Noise Overlay for premium film-grain analog texture
export function NoiseOverlay() {
  return (
    <svg className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.045]">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.7 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

// ─── MICRO-UI 1: Diagnostic Shuffler ──────────────────────────────────────────
function DiagnosticShuffler() {
  const [items, setItems] = useState([
    { id: 1, title: 'Latência de Mount', val: '0.18 ms', label: 'PixonUI (MUI: 2.10ms)', color: 'border-purple-500/30' },
    { id: 2, title: 'Consumo de RAM', val: '15.2 MB', label: 'Estável em Interação', color: 'border-cyan-500/30' },
    { id: 3, title: 'Taxa de Quadros', val: '120 FPS', label: 'Composição Off-Thread', color: 'border-emerald-500/30' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        const last = next.pop()!;
        next.unshift(last);
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full h-56 select-none">
      {items.map((item, idx) => {
        // Compute style based on index (0: front, 1: middle, 2: back)
        const scale = 1 - idx * 0.08;
        const yOffset = idx * -16;
        const opacity = 1 - idx * 0.28;
        const zIndex = 30 - idx;

        return (
          <div
            key={item.id}
            className={`absolute w-full max-w-sm rounded-[1.5rem] border bg-[#090911]/90 backdrop-blur-xl p-5 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${item.color}`}
            style={{
              transform: `translate3d(0, ${yOffset}px, 0) scale(${scale})`,
              opacity,
              zIndex,
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-fira font-bold uppercase tracking-widest text-[#7B61FF]">{item.title}</span>
              <span className="h-2 w-2 rounded-full bg-[#00FF66] animate-pulse" />
            </div>
            <div className="text-3xl font-sora font-extrabold text-[#F0EFF4]">{item.val}</div>
            <div className="text-xs text-[#F0EFF4]/50 mt-1 font-medium">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MICRO-UI 2: Telemetry Typewriter ─────────────────────────────────────────
const TERMINAL_LOGS = [
  '>> initializing pixon-physics-engine... OK',
  '>> off-thread pipeline established',
  '>> hardware-acceleration loaded on GPU thread',
  '>> standard DOM tree matched seamlessly with SSR',
  '>> benchmark: 1000 items mounted in 0.18ms',
  '>> system health status: excellent (0 jank)'
];

function TelemetryTypewriter() {
  const [logs, setLogs] = useState<string[]>(['>> boot command received...']);
  const [activeLog, setActiveLog] = useState('');
  const logIndexRef = useRef(0);
  const charIndexRef = useRef(0);

  useEffect(() => {
    let timer: any;

    const typeChar = () => {
      const targetStr = TERMINAL_LOGS[logIndexRef.current]!;
      if (charIndexRef.current < targetStr.length) {
        setActiveLog((prev) => prev + targetStr[charIndexRef.current]);
        charIndexRef.current += 1;
        timer = setTimeout(typeChar, 35);
      } else {
        // Finish typing this log, add to stack
        setLogs((prev) => [...prev.slice(-4), targetStr]);
        setActiveLog('');
        charIndexRef.current = 0;
        logIndexRef.current = (logIndexRef.current + 1) % TERMINAL_LOGS.length;
        timer = setTimeout(typeChar, 1800);
      }
    };

    timer = setTimeout(typeChar, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full rounded-[1.5rem] border border-white/10 bg-[#020205] p-5 shadow-2xl font-fira text-xs text-[#F0EFF4]/90 flex flex-col h-56 select-none">
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
        <div className="flex items-center gap-1.5">
          <TermIcon size={14} className="text-[#7B61FF]" />
          <span className="font-bold tracking-tight text-[10px] uppercase text-[#F0EFF4]/60">Pixon Telemetry Log</span>
        </div>
        <span className="flex items-center gap-1 bg-[#00FF66]/10 border border-[#00FF66]/20 px-2 py-0.5 rounded text-[8px] font-bold text-[#00FF66] tracking-wider uppercase animate-pulse">
          Live
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden flex flex-col justify-end">
        {logs.map((log, i) => (
          <div key={i} className="opacity-50 line-clamp-1">{log}</div>
        ))}
        <div className="text-[#00FF66] flex items-center gap-1 line-clamp-1">
          <span>{activeLog}</span>
          <span className="inline-block w-1.5 h-3.5 bg-[#00FF66] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── MICRO-UI 3: Cursor Protocol Scheduler ──────────────────────────────────
function CursorProtocolScheduler() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 85, y: 80 });
  const [cursorScale, setCursorScale] = useState(1);
  const [saveTriggered, setSaveTriggered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loop = async () => {
      while (isMounted) {
        // Reset state
        setSaveTriggered(false);
        setSelectedDay(null);
        setCursorScale(1);
        setCursorPos({ x: 85, y: 80 }); // Start bottom right

        await new Promise((r) => setTimeout(r, 800));
        if (!isMounted) break;

        // Move to Wednesday (index 3, which is in the exact horizontal center)
        setCursorPos({ x: 50, y: 40 });
        await new Promise((r) => setTimeout(r, 1400));
        if (!isMounted) break;

        // Simulate click on Wednesday
        setCursorScale(0.85);
        await new Promise((r) => setTimeout(r, 150));
        if (!isMounted) break;
        setSelectedDay(3);
        setCursorScale(1);

        await new Promise((r) => setTimeout(r, 600));
        if (!isMounted) break;

        // Move cursor to Save Button (also centered horizontally, near bottom)
        setCursorPos({ x: 50, y: 82 });
        await new Promise((r) => setTimeout(r, 1400));
        if (!isMounted) break;

        // Click Save Button
        setCursorScale(0.85);
        await new Promise((r) => setTimeout(r, 150));
        if (!isMounted) break;
        setSaveTriggered(true);
        setCursorScale(1);

        await new Promise((r) => setTimeout(r, 1800));
      }
    };

    loop();
    return () => {
      isMounted = false;
    };
  }, []);

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="relative w-full rounded-[1.5rem] border border-white/10 bg-[#090911]/90 backdrop-blur-xl p-5 shadow-2xl flex flex-col justify-between h-56 select-none overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2">
        <Calendar size={14} className="text-[#7B61FF]" />
        <span className="font-bold text-[10px] uppercase text-[#F0EFF4]/60">Cursor Protocol Scheduler</span>
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 gap-2 my-2">
        {days.map((day, idx) => {
          const isSelected = selectedDay === idx;
          return (
            <div
              key={idx}
              className={`h-9 rounded-xl flex items-center justify-center font-sora font-extrabold text-xs transition-all duration-300 ${
                isSelected 
                  ? 'bg-[#00FF66] text-[#05050A] shadow-[0_0_15px_rgba(0,255,102,0.4)] scale-105' 
                  : 'bg-white/[0.03] border border-white/5 text-[#F0EFF4]/65 hover:bg-white/[0.06]'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <button 
        type="button"
        className={`w-full py-2.5 rounded-xl font-sora font-extrabold text-xs tracking-wider transition-all duration-300 ${
          saveTriggered 
            ? 'bg-[#7B61FF] text-[#F0EFF4] shadow-[0_0_15px_rgba(123,97,255,0.4)]' 
            : 'bg-white/[0.03] border border-white/5 text-[#F0EFF4]/80'
        }`}
      >
        {saveTriggered ? 'PROTOCOL SAVED' : 'SAVE PROTOCOL'}
      </button>

      {/* Vector Pointer Cursor */}
      <svg
        className="absolute pointer-events-none transition-all duration-[1200ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] z-50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
        style={{
          left: `${cursorPos.x}%`,
          top: `${cursorPos.y}%`,
          transform: `scale(${cursorScale}) translate(-50%, -50%)`,
        }}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M4 4L11.5 20.5L14 14L20.5 11.5L4 4Z"
          fill="#00FF66"
          stroke="#05050A"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ─── E2E VERIFICATION COMPONENT 1: Scroll Parallax Card ─────────────────────
function ScrollParallaxCard() {
  const { scrollYProgress } = useScroll();
  const parallaxPreset = parallax({ axis: 'y', from: 0, to: -120 });
  const parallaxY = useTransform(scrollYProgress, [0, 1], parallaxPreset.range);
  const orbX = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.6], [0.15, 0.95]);
  const orbTransform = useTransform([orbX, parallaxY], ([x, y]) => `translate3d(${x}px, ${y}px, 0)`);
  const progressValue = useMotionValueValue(scrollYProgress);

  return (
    <Surface data-testid="parallax-card" className="relative overflow-hidden rounded-[2rem] border border-[#00FF66]/30 bg-[#05050A]/60 p-8 shadow-2xl backdrop-blur-xl">
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,102,0.15),transparent_60%)]"
        style={{ opacity: glowOpacity }}
      />
      <div className="relative z-10 mb-6 flex items-center justify-between">
        <Heading as="h3" className="text-xl font-sora font-bold text-white">Scroll Parallax</Heading>
        <span className="text-xs font-fira font-bold uppercase tracking-[0.2em] text-[#00FF66]">
          {Math.round(progressValue * 100)}%
        </span>
      </div>

      <div className="relative z-10 h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-[#7B61FF] to-[#00FF66]" style={{ width: progressWidth }} />
      </div>

      <div className="relative z-10 mt-8 h-28 rounded-2xl border border-white/15 bg-black/40">
        <motion.div
          className="absolute left-4 top-8 h-12 w-12 rounded-full bg-[#00FF66]/50 blur-[2px]"
          style={{ transform: orbTransform }}
        />
      </div>
    </Surface>
  );
}

// ─── E2E VERIFICATION COMPONENT 2: Timeline Scope Composer ──────────────────
function TimelineScopeComposerDemo() {
  const { ref, createTimeline } = useTimelineScope<HTMLDivElement>();

  useEffect(() => {
    const composer = createTimelineComposer({ easing: 'elite-out' });
    const hero = composer.hero({ duration: 560 });
    const cards = composer.cards({ duration: 520, stagger: 90 });
    const run = createTimeline()
      .set('.scope-title', { opacity: 0, transform: 'translate3d(0, 22px, 0)' }, 0)
      .set('.scope-pill', { opacity: 0, transform: 'translate3d(0, 18px, 0)' }, 0)
      .to('.scope-title', hero.keyframes, { ...hero.options, at: 0 })
      .to('.scope-pill', cards.keyframes, { ...cards.options, at: '+=120' })
      .play();
    return () => run.cancel();
  }, [createTimeline]);

  return (
    <Surface ref={ref} data-testid="timeline-scope-showcase" className="rounded-[2rem] border border-white/10 bg-[#05050A]/60 p-8 shadow-2xl backdrop-blur-xl">
      <Heading as="h3" className="scope-title mb-4 text-2xl font-sora font-bold text-white">
        Timeline Scope + Composer
      </Heading>
      <Text className="mb-5 text-sm text-[#F0EFF4]/70 font-medium leading-relaxed">
        Demonstração de escopo local por ref e presets de domínio sem boilerplate.
      </Text>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="scope-pill rounded-xl border border-[#7B61FF]/30 bg-[#7B61FF]/10 px-4 py-3 text-sm font-fira font-bold text-[#7B61FF] text-center">hero()</div>
        <div className="scope-pill rounded-xl border border-[#00FF66]/30 bg-[#00FF66]/10 px-4 py-3 text-sm font-fira font-bold text-[#00FF66] text-center">cards()</div>
        <div className="scope-pill rounded-xl border border-[#7B61FF]/30 bg-[#7B61FF]/10 px-4 py-3 text-sm font-fira font-bold text-[#7B61FF] text-center">navbar()</div>
      </div>
    </Surface>
  );
}

// ─── E2E VERIFICATION COMPONENT 3: Container Interaction ───────────────────
function ContainerInteractionCard() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragBoundsRef = useRef<HTMLDivElement>(null);

  return (
    <Surface data-testid="container-interaction-card" className="rounded-[2rem] border border-white/10 bg-[#05050A]/60 p-8 shadow-2xl backdrop-blur-xl">
      <Heading as="h3" className="mb-3 text-xl font-sora font-bold text-white">
        Container Scroll & Drag constraints
      </Heading>
      <Text className="mb-5 text-sm text-[#F0EFF4]/65 font-medium leading-relaxed">
        Parallax usando `source="container"` e drag com constraints por `RefObject`, sem loop de re-render.
      </Text>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          data-testid="container-scroll-root"
          style={{ maxWidth: '400px' }}
          className="h-28 overflow-x-auto rounded-2xl border border-white/15 bg-black/45"
        >
          <div 
            style={{ width: '1200px', minWidth: '1200px' }}
            className="h-full w-[1200px] bg-[linear-gradient(90deg,rgba(123,97,255,0.12),rgba(0,255,102,0.04),rgba(123,97,255,0.12))]" 
          />
        </div>
        <motion.div
          data-testid="container-parallax-orb"
          className="pointer-events-none absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#00FF66]/70 blur-[1px]"
          parallax={{ source: 'container', container: scrollContainerRef, axis: 'x', from: 0, to: 220 }}
        />
      </div>

      <div
        ref={dragBoundsRef}
        data-testid="drag-bounds-root"
        className="relative mt-6 h-24 overflow-hidden rounded-2xl border border-white/15 bg-black/45"
      >
        <motion.div
          data-testid="drag-handle"
          drag="x"
          dragElastic={0}
          dragMomentum={false}
          dragConstraints={dragBoundsRef}
          className="absolute left-3 top-1/2 h-9 w-24 -translate-y-1/2 cursor-grab rounded-xl border border-[#00FF66]/40 bg-[#00FF66]/10"
        />
      </div>
    </Surface>
  );
}

function HeroMotionPanel() {
  return (
    <Surface className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#05050A]/60 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-fira font-bold uppercase tracking-widest text-[#7B61FF] block mb-1">// RUNTIME PANEL</span>
          <Heading as="h3" className="text-xl sm:text-2xl font-sora font-extrabold tracking-tight text-white">
            Movimento que parece interface, não mockup.
          </Heading>
          <Text className="mt-1 max-w-md text-xs sm:text-sm text-[#F0EFF4]/62 font-medium leading-relaxed">
            A abertura deixa claro o que o motor faz: composição, telemetria e resposta visual sem depender de render loops pesados.
          </Text>
        </div>
        <div className="hidden sm:flex flex-wrap justify-end gap-2 max-w-[220px]">
          {['SSR-safe', 'WAAPI', '0 jank', 'Theme-aware'].map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-fira font-bold uppercase tracking-wider text-[#F0EFF4]/70"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <DiagnosticShuffler />
        </div>
        <TelemetryTypewriter />
        <CursorProtocolScheduler />
      </div>
    </Surface>
  );
}

const METRICS = [
  { value: '120fps', label: 'Compositor First' },
  { value: '0 jank', label: 'Frame Stability' },
  { value: 'SSR', label: 'Hydration Safe' },
  { value: 'WAAPI', label: 'Native Pipeline' },
];

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────────────
export function LandingPage({ onEnterGallery, onEnterSaaS }: LandingPageProps) {
  const [scrollActive, setScrollActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollActive(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#05050A] text-[#F0EFF4] font-sans selection:bg-[#7B61FF]/40 overflow-x-hidden antialiased">
      {/* Noise Overlay */}
      <NoiseOverlay />

      {/* Glowing Neon Refraction Halos */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {/* Plasma Purple halo */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(123,97,255,0.18),transparent_70%)] blur-[80px] animate-[pulse_10s_infinite_alternate]" />
        {/* Acid Green halo */}
        <div className="absolute top-[20%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-[radial-gradient(circle,rgba(0,255,102,0.10),transparent_70%)] blur-[90px] animate-[pulse_12s_infinite_alternate_delay-2000]" />
        {/* Secondary neon halo */}
        <div className="absolute bottom-[10%] left-[5%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(123,97,255,0.06),transparent_70%)] blur-[100px] animate-[pulse_15s_infinite_alternate]" />
      </div>

      {/* ─── A. NAVBAR: "A Ilha Flutuante" ────────────────────────────────────── */}
      <nav 
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl rounded-full border transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          scrollActive 
            ? 'border-white/10 bg-[#05050A]/75 shadow-[0_15px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl px-6 py-3.5' 
            : 'border-transparent bg-transparent px-8 py-5'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#7B61FF] to-[#00FF66] shadow-[0_0_15px_rgba(123,97,255,0.4)]" />
            <span className="font-sora font-extrabold text-sm tracking-tight uppercase">PixonUI</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={onEnterSaaS}
              className="text-xs font-sora font-bold text-[#F0EFF4]/70 hover:text-white transition-colors"
            >
              SAAS DEMO
            </button>
            <ThemeToggle className="border border-white/10 bg-white/5" />
            <GlowButton 
              onClick={onEnterGallery}
              aria-label="Explore Components"
              className="h-9 px-5 rounded-full font-sora font-bold text-xs tracking-wider border-transparent bg-gradient-to-r from-[#7B61FF] to-[#00FF66] text-[#05050A]"
            >
              Explore Components
            </GlowButton>
          </div>
        </div>
      </nav>

      {/* ─── B. HERO SECTION: "A Cena de Abertura" ─────────────────────────────── */}
      <header className="relative z-10 px-6 sm:px-12 md:px-20 pt-28 sm:pt-32 pb-16 sm:pb-20">
        {/* Subtle grid mesh background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />
        
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:min-h-[calc(100dvh-14rem)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-2xl space-y-6">
            <PixonSSRAnimate preset="scaleInBounce" transition={{ duration: 700 }}>
              <Badge variant="neutral" className="border-[#7B61FF]/30 bg-[#7B61FF]/10 px-4 py-1 text-[#7B61FF] font-fira font-bold uppercase tracking-widest text-[9px] shadow-[0_0_15px_rgba(123,97,255,0.15)]">
                <Sparkles className="mr-2 inline h-3 w-3" />
                Physics & WAAPI engine v2.0
              </Badge>
            </PixonSSRAnimate>

            <PixonSSRAnimate preset="blurInUp" transition={{ duration: 880, delay: 200 }}>
              <Heading as="h1" className="text-4xl sm:text-6xl md:text-7xl font-sora font-extrabold tracking-tighter leading-[0.9] text-white">
                Sinta a interface.
                <span className="block font-instrument italic text-[#7B61FF] capitalize font-light mt-2 tracking-normal drop-shadow-[0_0_15px_rgba(123,97,255,0.1)]">
                  Fluidez física de alta fidelidade.
                </span>
              </Heading>
            </PixonSSRAnimate>

            <PixonSSRAnimate preset="fadeInUp" transition={{ duration: 820, delay: 400 }}>
              <Text className="max-w-xl text-sm sm:text-base leading-relaxed text-[#F0EFF4]/70 font-medium">
                Interfaces digitais refinadas como instrumentos científicos. Construído do zero para rodar a 120fps nativos no motor WAAPI sem re-renders imperativos, loops de jank ou overhead de pacotes.
              </Text>
            </PixonSSRAnimate>

            <PixonSSRAnimate preset="fadeInUp" transition={{ duration: 860, delay: 580 }} className="flex flex-col items-start gap-4 sm:flex-row pt-4">
              <GlowButton 
                aria-label="Abrir galeria"
                className="h-12 px-8 rounded-full font-sora font-extrabold text-xs tracking-wider active:scale-[0.98] transition-all bg-gradient-to-r from-[#7B61FF] to-[#00FF66] text-[#05050A]" 
                onClick={onEnterGallery}
              >
                Explore Components
                <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
              </GlowButton>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 border-white/10 bg-white/5 px-8 rounded-full font-sora font-extrabold text-xs tracking-wider text-white hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all" 
                onClick={onEnterSaaS}
                aria-label="View SaaS Demo"
              >
                <Rocket className="mr-2 h-4 w-4 text-[#00FF66]" />
                View SaaS Demo
              </Button>
            </PixonSSRAnimate>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {METRICS.map((item) => (
                <Surface key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 shadow-none">
                  <div className="text-sm sm:text-base font-sora font-extrabold text-white">{item.value}</div>
                  <Text className="mt-1 text-[10px] font-fira font-bold uppercase tracking-[0.16em] text-[#F0EFF4]/45">
                    {item.label}
                  </Text>
                </Surface>
              ))}
            </div>
          </div>

          <div className="relative lg:pt-8">
            <HeroMotionPanel />
          </div>
        </div>
      </header>

      {/* ─── C. FEATURES: "Artefatos Funcionais Interativos" ──────────────────── */}
      <section className="py-24 sm:py-32 relative z-10 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <span className="text-[10px] font-fira font-bold uppercase tracking-widest text-[#00FF66] block mb-2">// ARTEFATOS INTERATIVOS</span>
          <Heading as="h2" className="text-3xl sm:text-4xl font-sora font-extrabold tracking-tight">
            Engenharia visual aplicada.
          </Heading>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1: Diagnostic Shuffler */}
          <div data-testid="feature-card-0" className="flex flex-col rounded-[2.5rem] border border-white/5 bg-[#05050A]/40 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-[#7B61FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
            <div className="flex-1 flex flex-col justify-between">
              <DiagnosticShuffler />
              <div className="mt-8 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-[#7B61FF]/10 text-[#7B61FF]">
                    <ArrowRightLeft size={16} />
                  </span>
                  <Heading as="h3" className="text-lg font-sora font-bold">Desempenho Sub-milissegundo</Heading>
                </div>
                <Text className="text-xs leading-relaxed text-[#F0EFF4]/60 font-medium">
                  Ciclo de vida do React altamente otimizado com cache preventivo para eliminar injeções dinâmicas e gargalos em tempo de execução.
                </Text>
              </div>
            </div>
          </div>

          {/* Card 2: Telemetry Typewriter */}
          <div data-testid="feature-card-1" className="flex flex-col rounded-[2.5rem] border border-white/5 bg-[#05050A]/40 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-[#00FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
            <div className="flex-1 flex flex-col justify-between">
              <TelemetryTypewriter />
              <div className="mt-8 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-[#00FF66]/10 text-[#00FF66]">
                    <Zap size={16} />
                  </span>
                  <Heading as="h3" className="text-lg font-sora font-bold">Aceleração de Hardware Nativa</Heading>
                </div>
                <Text className="text-xs leading-relaxed text-[#F0EFF4]/60 font-medium">
                  Animações rodadas diretamente fora da main thread através da Web Animations API, poupando a CPU de layouts desnecessários.
                </Text>
              </div>
            </div>
          </div>

          {/* Card 3: Cursor Protocol Scheduler */}
          <div data-testid="feature-card-2" className="flex flex-col rounded-[2.5rem] border border-white/5 bg-[#05050A]/40 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-[#7B61FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
            <div className="flex-1 flex flex-col justify-between">
              <CursorProtocolScheduler />
              <div className="mt-8 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-[#7B61FF]/10 text-[#7B61FF]">
                    <Layers size={16} />
                  </span>
                  <Heading as="h3" className="text-lg font-sora font-bold">Glassmorphism Orgânico</Heading>
                </div>
                <Text className="text-xs leading-relaxed text-[#F0EFF4]/60 font-medium">
                  Estética luxuosa e orgânica combinada com layouts responsivos e suporte consistente a temas de alto impacto visual.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── E2E VERIFICATION COMPONENT 4: Metrics Dashboard ──────────────────── */}
      <section className="py-16 border-y border-white/5 bg-[#020205]/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 gap-5 md:grid-cols-4">
          {METRICS.map((item, index) => (
            <div
              key={item.label}
              data-testid={`metric-card-${index}`}
            >
              <Surface className="border-white/10 bg-[#05050A]/60 p-5 text-center shadow-2xl rounded-2xl">
                <div className="text-2xl font-sora font-extrabold text-[#00FF66] md:text-3xl">{item.value}</div>
                <Text className="mt-1 text-[10px] font-fira font-bold uppercase tracking-[0.16em] text-[#F0EFF4]/45">{item.label}</Text>
              </Surface>
            </div>
          ))}
        </div>
      </section>

      {/* ─── E2E VERIFICATION COMPONENT 5: TELEMETRY LAB ─────────────────────── */}
      <section className="py-24 relative z-10 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <span className="text-[10px] font-fira font-bold uppercase tracking-widest text-[#7B61FF] block mb-2">// TELEMETRY LABORATORY</span>
          <Heading as="h2" className="text-3xl sm:text-4xl font-sora font-extrabold tracking-tight">
            Diagnóstico de Física & Composição.
          </Heading>
        </div>

        <GridCustom className="gap-8 lg:grid-cols-2">
          {/* Timeline showcase */}
          <TimelineScopeComposerDemo />

          {/* Parallax display */}
          <ScrollParallaxCard />
        </GridCustom>

        {/* Scroll Scene & Constraints */}
        <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] mt-8">
          <div data-testid="scroll-scene-card">
            <ScrollScene
              as="div"
              className="rounded-[2.5rem] border border-white/10 bg-[#05050A]/60 p-8 shadow-2xl backdrop-blur-xl h-full flex flex-col justify-center"
              timeline="view"
              axis="block"
              range={{ start: 'entry 10%', end: 'cover 50%' }}
              from={{ y: 120, opacity: 1, scale: 0.92, blur: 0 }}
              to={{ y: 0, opacity: 1, scale: 1, blur: 0 }}
              fallback="animate"
            >
              <Heading as="h3" className="mb-4 text-2xl font-sora font-bold text-white">
                ScrollScene em ação
              </Heading>
              <Text className="text-[#F0EFF4]/70 font-medium text-sm leading-relaxed">
                Este card usa timeline de scroll nativa quando disponível. Em caso de fallback nos navegadores sem suporte, anima automaticamente com base no tempo de entrada no viewport.
              </Text>
            </ScrollScene>
          </div>

          <ContainerInteractionCard />
        </div>
      </section>

      {/* Hidden E2E scope outside helper */}
      <div data-testid="scope-outside-pill" className="scope-pill pointer-events-none absolute -left-[9999px] top-auto opacity-5">
        outside scope
      </div>

      {/* ─── D. PHILOSOPHY: "O Manifesto" ────────────────────────────────────── */}
      <section className="py-32 bg-[#020205] relative z-10 px-6 sm:px-12 border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,97,255,0.04),transparent_60%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto space-y-12">
          <span className="text-[10px] font-fira font-bold uppercase tracking-widest text-[#7B61FF] block text-center">// O MANIFESTO</span>
          
          <div className="space-y-8 text-center sm:text-left">
            <p className="text-2xl sm:text-4xl md:text-5xl font-sora font-bold leading-tight text-[#F0EFF4]/45">
              A maioria das bibliotecas foca em: <span className="text-[#F0EFF4]/30 line-through">injeções pesadas de CSS em tempo de execução e re-renders imperativos contínuos.</span>
            </p>
            
            <p className="text-3xl sm:text-5xl md:text-6xl font-sora font-extrabold leading-tight text-[#F0EFF4]">
              Nós nos dedicamos à: <span className="font-instrument italic text-[#00FF66] font-light tracking-normal drop-shadow-[0_0_15px_rgba(0,255,102,0.15)]">fluidez física pura off-thread e aceleração direta no motor de renderização da GPU.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ─── E. PROTOCOL: "Sticky Stacking" (Empilhamento Fluido) ─────────────── */}
      <section className="relative z-10">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center bg-[#05050A] border-b border-white/5 overflow-hidden">
          <div className="absolute top-10 left-10 z-20">
            <span className="text-[10px] font-fira font-bold uppercase tracking-widest text-[#7B61FF] block mb-1">PROTOCOLO DE SEGURANÇA</span>
            <div className="text-2xl font-sora font-extrabold text-white">01. GEOMETRIA RADIAL</div>
          </div>
          <div className="absolute right-10 bottom-10 z-20 max-w-sm text-right hidden sm:block">
            <Text className="text-xs text-[#F0EFF4]/50 leading-relaxed font-medium">
              Geometria analítica e simetria molecular, representadas por múltiplos círculos SVG com rotação assíncrona para manter os eixos de sincronização estáveis.
            </Text>
          </div>

          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* SVG Geometry */}
            <svg className="w-full h-full text-[#7B61FF] opacity-35 animate-[spin_25s_linear_infinite]" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
              <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="10 12" />
              <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
            </svg>
            <div className="absolute h-4 w-4 bg-[#7B61FF] rounded-full animate-ping" />
          </div>
        </div>

        <div className="sticky top-0 h-screen w-full flex items-center justify-center bg-[#030308] border-b border-white/5 overflow-hidden">
          <div className="absolute top-10 left-10 z-20">
            <span className="text-[10px] font-fira font-bold uppercase tracking-widest text-[#00FF66] block mb-1">PROTOCOLO DE FLUIDEZ</span>
            <div className="text-2xl font-sora font-extrabold text-white">02. LASER TELEMETRY</div>
          </div>
          <div className="absolute right-10 bottom-10 z-20 max-w-sm text-right hidden sm:block">
            <Text className="text-xs text-[#F0EFF4]/50 leading-relaxed font-medium">
              Vetorização em grade molecular simulada em tempo real com sweeps de laser táticos.
            </Text>
          </div>

          {/* Grid with vertical laser sweeps */}
          <div className="relative w-full max-w-xl h-64 border border-white/5 rounded-[2rem] bg-white/[0.01] overflow-hidden flex flex-col justify-between p-6">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,102,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            
            {/* Swiping laser bar */}
            <div className="absolute left-0 right-0 h-0.5 bg-[#00FF66] shadow-[0_0_10px_#00FF66] animate-[bounce_4s_ease-in-out_infinite]" />
            
            <div className="flex justify-between items-center z-10">
              <span className="text-[10px] font-fira text-[#00FF66]">GRID MATRIX SCANNER</span>
              <span className="text-[10px] font-fira text-white/40">ACTIVE</span>
            </div>
            <div className="flex-1 flex items-end justify-between font-fira text-[9px] text-[#00FF66]/40 z-10 pt-8">
              <span>X: 194.2</span>
              <span>Y: 884.1</span>
              <span>Z: 0.18</span>
              <span>STABILITY: 100%</span>
            </div>
          </div>
        </div>

        <div className="sticky top-0 h-screen w-full flex items-center justify-center bg-[#000002] overflow-hidden">
          <div className="absolute top-10 left-10 z-20">
            <span className="text-[10px] font-fira font-bold uppercase tracking-widest text-[#7B61FF] block mb-1">PROTOCOLO DE COMPOSIÇÃO</span>
            <div className="text-2xl font-sora font-extrabold text-white">03. SINE OSCILLATOR</div>
          </div>
          <div className="absolute right-10 bottom-10 z-20 max-w-sm text-right hidden sm:block">
            <Text className="text-xs text-[#F0EFF4]/50 leading-relaxed font-medium">
              Uma representação harmônica baseada em curvas elásticas de spring com interpolação contínua e renderização de timelines.
            </Text>
          </div>

          {/* Interactive Glowing Sine Wave */}
          <div className="w-full max-w-2xl px-6 relative flex items-center justify-center">
            <svg className="w-full h-32 text-[#7B61FF]" viewBox="0 0 600 100" fill="none">
              <path
                d="M 0 50 Q 75 0, 150 50 T 300 50 T 450 50 T 600 50"
                stroke="currentColor"
                strokeWidth="3"
                className="shadow-[0_0_20px_#7B61FF] animate-[pulse_2s_infinite]"
                style={{
                  strokeDasharray: 600,
                  strokeDashoffset: 0,
                }}
              />
              <path
                d="M 0 50 Q 75 100, 150 50 T 300 50 T 450 50 T 600 50"
                stroke="#00FF66"
                strokeWidth="1"
                opacity="0.5"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 bg-[#020205] border-t border-white/5 py-12 px-6 sm:px-12 md:px-20 text-center sm:text-left">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-[#7B61FF] to-[#00FF66]" />
            <span className="font-sora font-bold text-xs uppercase tracking-wider text-white">PIXONUI DESIGN</span>
          </div>
          <p className="text-[10px] font-fira text-[#F0EFF4]/40">
            © 2026 PIXONUI. COMPOSITOR DE INTERFACE CIENTÍFICA. TODOS OS DIREITOS RESERVADOS.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Lightweight custom layout wrapper to avoid external dependencies
function GridCustom({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`grid ${className}`} {...props}>
      {children}
    </div>
  );
}

export default LandingPage;
