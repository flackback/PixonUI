import { useEffect, useRef } from 'react';
import { ArrowRight, Cpu, Rocket, Sparkles, Zap } from 'lucide-react';
import {
  AnimeGridStagger,
  Badge,
  Button,
  CopyBlock,
  Container,
  DotGrid,
  GlowButton,
  Grid,
  Heading,
  motion,
  PixonSSRAnimate,
  ScrollScene,
  Stack,
  Surface,
  Text,
  ThemeToggle,
  parallax,
  useMotionValueValue,
  useTimelineScope,
  useScroll,
  useTransform,
  useTheme,
  createTimelineComposer,
} from '@pixonui/react';

interface LandingPageProps {
  onEnterGallery: () => void;
  onEnterSaaS: () => void;
}

const METRICS = [
  { value: '120fps', label: 'Compositor First' },
  { value: '0 jank', label: 'Frame Stability' },
  { value: 'SSR', label: 'Hydration Safe' },
  { value: 'WAAPI', label: 'Native Pipeline' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Motion sem re-render',
    text: 'Animação em CSS/WAAPI com execução fora da thread principal para manter fluidez mesmo em páginas densas.',
  },
  {
    icon: Cpu,
    title: 'SSR-first por padrão',
    text: 'Landing renderiza com presets SSR e segue segura para hidratação, incluindo fallback de timeline em browsers sem suporte.',
  },
  {
    icon: Sparkles,
    title: 'API curta e previsível',
    text: 'Transições declarativas com presets e stagger sem event-bus manual, reduzindo código e chance de regressão.',
  },
];

const ANIME_GRID_CODE = `import { AnimeGridStagger, Surface } from '@pixonui/react';

export function AnimeGridSection() {
  return (
    <Surface className="rounded-3xl border border-white/10 bg-[#04112d]/75 p-8 md:p-12">
      <AnimeGridStagger
        rows={23}
        dotColor="#7b8ba5"
        cursorColor="#22d3ee"
        className="max-w-full scale-[0.72] md:scale-[0.9]"
      />
    </Surface>
  );
}`;

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
    <Surface className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-cyan-50/70 p-8 dark:border-cyan-400/20 dark:bg-[#04112d]/80">
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.28),transparent_60%)]"
        style={{ opacity: glowOpacity }}
      />
      <div className="relative z-10 mb-6 flex items-center justify-between">
        <Heading as="h3" className="text-xl font-semibold">Scroll Parallax (fallback JS)</Heading>
        <span className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
          {Math.round(progressValue * 100)}%
        </span>
      </div>

      <div className="relative z-10 h-2 w-full overflow-hidden rounded-full bg-slate-300/60 dark:bg-white/10">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-500" style={{ width: progressWidth }} />
      </div>

      <div className="relative z-10 mt-8 h-28 rounded-2xl border border-slate-300/60 bg-white/40 dark:border-white/10 dark:bg-black/20">
        <motion.div
          className="absolute left-4 top-8 h-12 w-12 rounded-full bg-cyan-300/70 blur-[1px]"
          style={{ transform: orbTransform }}
        />
      </div>
    </Surface>
  );
}

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
    <Surface ref={ref} data-testid="timeline-scope-showcase" className="rounded-3xl border border-slate-300/50 bg-white/80 p-8 dark:border-white/10 dark:bg-[#061333]/70">
      <Heading as="h3" className="scope-title mb-4 text-2xl font-semibold">
        Timeline scope + composer
      </Heading>
      <Text className="mb-5 text-zinc-600 dark:text-white/70">
        Demo de escopo local por ref e presets de domínio sem boilerplate.
      </Text>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="scope-pill rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-300">hero()</div>
        <div className="scope-pill rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-300">cards()</div>
        <div className="scope-pill rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-300">navbar()</div>
      </div>
    </Surface>
  );
}

function ContainerInteractionCard() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragBoundsRef = useRef<HTMLDivElement>(null);

  return (
    <Surface data-testid="container-interaction-card" className="rounded-3xl border border-slate-300/50 bg-white/80 p-8 dark:border-white/10 dark:bg-[#061333]/70">
      <Heading as="h3" className="mb-3 text-xl font-semibold">
        Container scroll + drag constraints
      </Heading>
      <Text className="mb-5 text-sm text-zinc-600 dark:text-white/65">
        Parallax usando `source=&quot;container&quot;` e drag com constraints por `RefObject`, sem loop de re-render.
      </Text>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          data-testid="container-scroll-root"
          className="h-28 overflow-x-auto rounded-2xl border border-slate-300/60 bg-white/50 dark:border-white/10 dark:bg-black/30"
        >
          <div className="h-full w-[1200px] bg-[linear-gradient(90deg,rgba(34,211,238,0.16),rgba(59,130,246,0.06),rgba(34,211,238,0.16))]" />
        </div>
        <motion.div
          data-testid="container-parallax-orb"
          className="pointer-events-none absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-cyan-300/80 blur-[1px]"
          parallax={{ source: 'container', container: scrollContainerRef, axis: 'x', from: 0, to: 220 }}
        />
      </div>

      <div
        ref={dragBoundsRef}
        data-testid="drag-bounds-root"
        className="relative mt-6 h-24 overflow-hidden rounded-2xl border border-slate-300/60 bg-white/50 dark:border-white/10 dark:bg-black/30"
      >
        <motion.div
          data-testid="drag-handle"
          drag="x"
          dragElastic={0}
          dragMomentum={false}
          dragConstraints={dragBoundsRef}
          className="absolute left-3 top-1/2 h-9 w-24 -translate-y-1/2 cursor-grab rounded-xl border border-cyan-400/40 bg-cyan-500/20"
        />
      </div>
    </Surface>
  );
}

export function LandingPage({ onEnterGallery, onEnterSaaS }: LandingPageProps) {
  const { theme } = useTheme();
  const isDark = theme !== 'light';

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-100 text-zinc-900 dark:bg-[#020617] dark:text-white">
      {/* @ts-ignore */}
      <style precedence="default" href="landing-ssr-v1">{`
        .ssr-aurora {
          background:
            radial-gradient(40% 40% at 20% 20%, rgba(34, 211, 238, 0.16), transparent 60%),
            radial-gradient(45% 45% at 80% 15%, rgba(99, 102, 241, 0.14), transparent 62%),
            radial-gradient(55% 55% at 50% 100%, rgba(14, 165, 233, 0.14), transparent 65%);
          animation: ssr-aurora-pulse 13s ease-in-out infinite alternate;
        }

        @keyframes ssr-aurora-pulse {
          from { filter: saturate(1) brightness(0.95); }
          to { filter: saturate(1.15) brightness(1.08); }
        }

        @keyframes ssr-soft-glow {
          from { box-shadow: 0 0 0 rgba(34, 211, 238, 0.0); }
          to { box-shadow: 0 0 28px rgba(34, 211, 238, 0.2); }
        }

        .ssr-soft-glow {
          animation: ssr-soft-glow 4.6s ease-in-out infinite alternate;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <DotGrid
          variant="dots"
          interactive
          pauseWhenOutOfView
          spacing={24}
          dotSize={1.2}
          maxDist={140}
          magneticStrength={20}
          smoothing={0.08}
          color={isDark ? '#7f8ea9' : '#94a3b8'}
          opacity={isDark ? 0.42 : 0.5}
          className="absolute inset-0"
        />
      </div>
      <div className={`pointer-events-none absolute inset-0 ssr-aurora ${isDark ? 'opacity-100' : 'opacity-40'}`} />

      <header className="relative z-10 border-b border-slate-300/40 bg-white/45 backdrop-blur-xl dark:border-white/10 dark:bg-black/10">
        <Container className="flex h-16 items-center justify-between">
          <PixonSSRAnimate preset="fadeInLeft" transition={{ duration: 420 }} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30" />
            <span className="text-lg font-semibold tracking-tight">PixonUI Motion</span>
          </PixonSSRAnimate>
          <PixonSSRAnimate preset="fadeInRight" transition={{ duration: 420, delay: 220 }} className="flex items-center gap-3">
            <ThemeToggle className="border border-slate-300/60 bg-white/70 dark:border-white/10 dark:bg-white/5" />
            <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white" onClick={onEnterSaaS}>
              SaaS
            </Button>
            <GlowButton className="h-9 px-4 text-sm" onClick={onEnterGallery}>
              Abrir galeria
            </GlowButton>
          </PixonSSRAnimate>
        </Container>
      </header>

      <main className="relative z-10">
        <section className="py-20 md:py-28">
          <Container>
            <ScrollScene
              as="div"
              timeline="view"
              axis="block"
              range={{ start: 'entry 0%', end: 'cover 80%' }}
              from={{ y: 0, scale: 1, opacity: 1 }}
              to={{ y: -72, scale: 0.97, opacity: 1 }}
              fallback="static"
            >
              <Stack gap={8} align="center" className="mx-auto max-w-4xl text-center">
              <PixonSSRAnimate preset="scaleInBounce" transition={{ duration: 700 }}>
                <Badge variant="neutral" className="border-cyan-400/30 bg-cyan-500/10 px-4 py-1 text-cyan-300">
                  <Sparkles className="mr-2 inline h-3.5 w-3.5" />
                  Landing SSR pronta para produção
                </Badge>
              </PixonSSRAnimate>

              <PixonSSRAnimate preset="blurInUp" transition={{ duration: 880, delay: 300 }}>
                <Heading as="h1" className="text-4xl font-black tracking-tight md:text-6xl">
                  Motion Engine do Pixon
                  <span className={isDark ? 'block bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent' : 'block text-zinc-700'}>
                    simples de escrever, fluido para executar
                  </span>
                </Heading>
              </PixonSSRAnimate>

              <PixonSSRAnimate preset="fadeInUp" transition={{ duration: 820, delay: 520 }}>
                <Text className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-white/70 md:text-lg">
                  Esta página usa animações SSR com presets nativos, stagger declarativo e scroll-driven timeline com fallback.
                  Sem loop imperativo por frame e sem dependência de biblioteca externa.
                </Text>
              </PixonSSRAnimate>

              <PixonSSRAnimate preset="fadeInUp" transition={{ duration: 860, delay: 760 }} className="flex flex-col items-center gap-4 sm:flex-row">
                <GlowButton className="h-12 px-8" onClick={onEnterGallery}>
                  Explorar componentes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </GlowButton>
                <Button variant="outline" size="lg" className="h-12 border-white/20 bg-white/5 px-8" onClick={onEnterSaaS}>
                  <Rocket className="mr-2 h-4 w-4 text-cyan-300" />
                  Ver SaaS demo
                </Button>
              </PixonSSRAnimate>
              </Stack>
            </ScrollScene>
          </Container>
        </section>

        <section className="border-y border-slate-300/40 bg-white/50 py-10 dark:border-white/10 dark:bg-white/[0.02]">
          <Container>
            <Grid className="grid-cols-2 gap-5 md:grid-cols-4">
              {METRICS.map((item, index) => (
                <motion.div
                  key={item.label}
                  data-testid={`metric-card-${index}`}
                  revealOnScroll={{ delay: index * 80, amount: 0.35, distance: 32, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                >
                  <PixonSSRAnimate
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -6, opacity: 1 }}
                    transition={{ duration: 4400, delay: 700 + index * 260, easing: 'ease-in-out', iterations: 'infinite', direction: 'alternate' }}
                    as="div"
                  >
                    <Surface className="ssr-soft-glow border-slate-300/50 bg-white/80 p-5 text-center dark:border-white/10 dark:bg-[#060f28]/70">
                      <div className="text-2xl font-bold text-cyan-300 md:text-3xl">{item.value}</div>
                      <Text className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500 dark:text-white/45">{item.label}</Text>
                    </Surface>
                  </PixonSSRAnimate>
                </motion.div>
              ))}
            </Grid>
          </Container>
        </section>

        <section className="py-16 md:py-24">
          <Container>
            <PixonSSRAnimate preset="fadeInUp" transition={{ duration: 680 }}>
              <Heading as="h2" className="mb-10 text-center text-3xl font-bold md:text-4xl">
                Base SSR + WAAPI preparada para escalar
              </Heading>
            </PixonSSRAnimate>

            <Grid className="gap-6 md:grid-cols-3">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    data-testid={`feature-card-${index}`}
                    revealOnScroll={{ delay: index * 100, amount: 0.28, distance: 36, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 130, damping: 18 }}
                  >
                    <PixonSSRAnimate
                      initial={{ y: 0, opacity: 1 }}
                      animate={{ y: -10, opacity: 1 }}
                      transition={{ duration: 5600, delay: 1100 + index * 320, easing: 'ease-in-out', iterations: 'infinite', direction: 'alternate' }}
                      as="div"
                    >
                      <Surface className="ssr-soft-glow h-full border-slate-300/50 bg-white/80 p-7 dark:border-white/10 dark:bg-[#061333]/70">
                        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                          <Icon className="h-5 w-5" />
                        </div>
                      <Heading as="h3" className="mb-3 text-xl font-semibold">
                        {feature.title}
                      </Heading>
                      <Text className="text-sm leading-relaxed text-zinc-600 dark:text-white/65">{feature.text}</Text>
                    </Surface>
                  </PixonSSRAnimate>
                  </motion.div>
                );
              })}
            </Grid>
          </Container>
        </section>

        <section className="pb-20 md:pb-28">
          <Container>
            <Grid className="gap-6 md:grid-cols-2">
              <motion.div
                data-testid="scroll-scene-card"
                revealOnScroll={{ amount: 0.25, distance: 48, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              >
                <ScrollScene
                  as="div"
                  className="rounded-3xl border border-slate-300/50 bg-white/80 p-10 dark:border-white/10 dark:bg-[#061841]/70"
                  timeline="view"
                  axis="block"
                  range={{ start: 'entry 10%', end: 'cover 50%' }}
                  from={{ y: 120, opacity: 1, scale: 0.92, blur: 0 }}
                  to={{ y: 0, opacity: 1, scale: 1, blur: 0 }}
                  fallback="animate"
                >
                  <PixonSSRAnimate preset="fadeInUp" transition={{ duration: 900, delay: 320 }}>
                    <Heading as="h3" className="mb-3 text-2xl font-semibold">
                      ScrollScene em ação
                    </Heading>
                    <Text className="text-zinc-600 dark:text-white/70">
                      Este card usa timeline de scroll nativa quando disponível. Em fallback, anima por tempo na entrada.
                    </Text>
                  </PixonSSRAnimate>
                </ScrollScene>
              </motion.div>

              <motion.div
                data-testid="parallax-card"
                revealOnScroll={{ delay: 80, amount: 0.25, distance: 48, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              >
                <ScrollParallaxCard />
              </motion.div>
            </Grid>

            <div className="mt-6">
              <TimelineScopeComposerDemo />
            </div>
            <div className="mt-6">
              <ContainerInteractionCard />
            </div>
            <div data-testid="scope-outside-pill" className="scope-pill pointer-events-none absolute -left-[9999px] top-auto opacity-5">
              outside scope
            </div>
          </Container>
        </section>

        <section className="pb-24 md:pb-32">
          <Container>
            <PixonSSRAnimate preset="fadeInUp" transition={{ duration: 760, delay: 180 }}>
              <Heading as="h2" className="mb-10 text-center text-3xl font-bold md:text-4xl">
                Anime.js Style Grid (100% Pixon)
              </Heading>
            </PixonSSRAnimate>

            <Grid className="items-start gap-6 lg:grid-cols-2">
              <PixonSSRAnimate preset="blurInScale" trigger="view" transition={{ duration: 820, delay: 320 }}>
                <Surface className="flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#04112d]/75 p-8 md:p-12">
                  <AnimeGridStagger
                    rows={23}
                    dotColor="#7b8ba5"
                    cursorColor="#22d3ee"
                    className="max-w-full scale-[0.72] md:scale-[0.9]"
                  />
                </Surface>
              </PixonSSRAnimate>

              <PixonSSRAnimate preset="fadeInRight" trigger="view" transition={{ duration: 820, delay: 460 }}>
                <CopyBlock
                  title="Código da animação"
                  language="tsx"
                  code={ANIME_GRID_CODE}
                  lineNumbers
                  maxHeight="520px"
                  variant="terminal"
                  className="h-full border-white/10"
                />
              </PixonSSRAnimate>
            </Grid>
          </Container>
        </section>
      </main>
    </div>
  );
}
