import React from 'react';
import { 
  Motion, 
  MotionGroup, 
  TextMotion, 
  Parallax, 
  Surface, 
  Button,
  Reveal,
  Magnetic,
  NumberTicker,
  Heading,
  PageLoader,
  PageTransition,
  usePixonAnimate,
  calculateStagger,
  timeline
} from '@pixonui/react';

export function MotionDemo() {
  const [key, setKey] = React.useState(0);

  // ── States for our brand-new demos ───────────────────────────────────
  const [expanded, setExpanded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('Home');
  const [gridKey, setGridKey] = React.useState(0);

  const { ref: springRef, pulse, shake, animate } = usePixonAnimate<HTMLDivElement>();

  // Refs for the Ultimate Timeline Demo
  const timelineTitleRef = React.useRef<HTMLHeadingElement>(null);
  const timelineBadgeRef = React.useRef<HTMLSpanElement>(null);
  const item1Ref = React.useRef<HTMLDivElement>(null);
  const item2Ref = React.useRef<HTMLDivElement>(null);
  const item3Ref = React.useRef<HTMLDivElement>(null);

  const triggerSequence = () => {
    // Instantly reset states to starting values so they can be re-run
    timeline()
      .add(timelineTitleRef, { opacity: 0, y: -25 })
      .add(timelineBadgeRef, { opacity: 0, scale: 0 })
      .add([item1Ref, item2Ref, item3Ref], { opacity: 0, y: 30 })
      .play()
      .finished.then(() => {
        // Run the beautiful reveal sequence
        timeline()
          .add(timelineTitleRef, { opacity: 1, y: 0 }, { duration: 500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' })
          .add(timelineBadgeRef, { opacity: 1, scale: 1 }, { offset: '<+=150', spring: { stiffness: 260, damping: 14 } })
          .add([item1Ref, item2Ref, item3Ref], { opacity: 1, y: 0 }, { offset: '>-150', stagger: 80, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' })
          .play();
      });
  };

  React.useEffect(() => {
    // Run initial sequence after a tiny delay to allow mount rendering
    const timer = setTimeout(() => {
      triggerSequence();
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const triggerCustomSpring = () => {
    animate(
      [
        { transform: 'translate3d(0px, 0, 0) rotate(0deg)' },
        { transform: 'translate3d(120px, -40px, 0) rotate(45deg)' }
      ],
      {
        spring: { stiffness: 220, damping: 12 },
      }
    );
  };

  const reload = () => {
    setKey(prev => prev + 1);
    setGridKey(prev => prev + 1);
    setTimeout(() => {
      triggerSequence();
    }, 150);
  };

  return (
    <PageTransition key={key} preset="fade" duration={500}>
      <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Motion System</h2>
          <p className="text-white/60">
            Physics-based animations powered by CSS variables and IntersectionObserver.
            Zero heavy dependencies.
          </p>
        </div>
        <Button onClick={reload}>Replay Animations</Button>
      </div>

      {/* Brand-New Native-First WAAPI Motion Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-white/5 pb-12">
        
        {/* 1. Off-Thread GPU Spring Hook (usePixonAnimate) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-purple-400 font-bold">Off-Thread GPU Springs</h3>
            <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-mono">usePixonAnimate</span>
          </div>
          <Surface className="p-8 flex flex-col justify-between min-h-[320px] bg-glass">
            <div className="flex flex-col items-center justify-center flex-1 py-8">
              <div 
                ref={springRef}
                className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl shadow-purple-500/25 flex items-center justify-center text-2xl cursor-pointer"
              >
                🔮
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline" onClick={() => pulse(1.25)}>Pulse</Button>
              <Button size="sm" variant="outline" onClick={() => shake(14)}>Shake</Button>
              <Button size="sm" variant="primary" onClick={triggerCustomSpring}>Custom Path</Button>
            </div>
          </Surface>
        </div>

        {/* 2. Euclidean Grid Staggers (calculateStagger) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-cyan-400 font-bold">Euclidean Radial Grid Stagger</h3>
            <Button size="sm" variant="ghost" onClick={() => setGridKey(prev => prev + 1)}>Replay Stagger</Button>
          </div>
          <Surface className="p-8 flex items-center justify-center min-h-[320px] bg-glass">
            <div key={gridKey} className="grid grid-cols-4 gap-3">
              {Array.from({ length: 16 }).map((_, i) => {
                const cols = 4;
                const delay = calculateStagger(i, 16, {
                  delay: 60,
                  from: 'center',
                  grid: [cols, 4]
                });
                return (
                  <Motion
                    key={i}
                    from={{ opacity: 0, scale: 0.1, y: 15 }}
                    to={{ opacity: 1, scale: 1, y: 0 }}
                    delay={delay}
                    easing="spring"
                    spring={{ stiffness: 280, damping: 14 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 hover:border-cyan-500/30 flex items-center justify-center text-xs text-cyan-300 font-bold transition-all duration-300 hover:scale-105 hover:bg-cyan-500/5 cursor-pointer">
                      {i + 1}
                    </div>
                  </Motion>
                );
              })}
            </div>
          </Surface>
        </div>

        {/* 3. Hardware-Accelerated FLIP Layout transitions (layout) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-amber-400 font-bold">Hardware-Accelerated FLIP Layout</h3>
            <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-mono">layout</span>
          </div>
          <Surface className="p-8 flex items-center justify-center min-h-[320px] bg-glass">
            <Motion
              layout
              onClick={() => setExpanded(!expanded)}
              className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl cursor-pointer w-full max-w-[360px] overflow-hidden select-none"
              easing="spring"
              spring={{ stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-md">Click to {expanded ? 'Collapse' : 'Expand'}</span>
                <span className="text-amber-300 text-lg">{expanded ? '▲' : '▼'}</span>
              </div>
              {expanded && (
                <Motion
                  from={{ opacity: 0, y: 10 }}
                  to={{ opacity: 1, y: 0 }}
                  delay={100}
                  className="mt-4 text-sm text-white/60 leading-relaxed"
                >
                  This entire container, layout boundaries, and children elements morph and scale smoothly using the <strong>GPU-powered FLIP Projection Engine</strong> in PixonUI. Zero main thread reflow lag!
                </Motion>
              )}
            </Motion>
          </Surface>
        </div>

        {/* 4. Shared Layout Transitions (layoutId) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-emerald-400 font-bold">Elastic Shared Layout Transitions</h3>
            <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">layoutId</span>
          </div>
          <Surface className="p-8 flex flex-col items-center justify-center min-h-[320px] bg-glass">
            <div className="flex flex-wrap gap-2 p-2 bg-black/40 border border-white/5 rounded-2xl w-full max-w-[320px]">
              {['Home', 'Inbox', 'SaaS', 'Config'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative flex-1 flex items-center justify-center py-2 text-xs font-semibold text-white transition-colors focus:outline-none"
                  >
                    {isActive && (
                      <Motion
                        layoutId="demo-active-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl -z-10 shadow-lg shadow-emerald-500/20"
                        easing="spring"
                        spring={{ stiffness: 350, damping: 24 }}
                      >
                        <div className="absolute inset-0 rounded-xl" />
                      </Motion>
                    )}
                    {tab}
                  </button>
                );
              })}
            </div>
            <p className="mt-8 text-xs text-white/40 text-center max-w-[280px] leading-relaxed">
              Click different tabs above. The glossy green highlighter background will slide and morph seamlessly between separate elements!
            </p>
          </Surface>
        </div>

        {/* 5. Ultimate Timeline Orchestration */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-purple-400 font-bold">PixonUI Ultimate Timeline Orchestrator</h3>
            <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold">timeline()</span>
          </div>
          <Surface className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[320px] bg-glass">
            <div className="flex flex-col flex-1 space-y-6 w-full max-w-[400px]">
              <div className="flex items-center justify-between w-full">
                <h4 ref={timelineTitleRef} className="text-xl font-bold text-white tracking-tight opacity-0">
                  SaaS Revenue Report
                </h4>
                <span ref={timelineBadgeRef} className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold opacity-0">
                  Live +24.8%
                </span>
              </div>
              
              <div className="space-y-3 w-full">
                <div ref={item1Ref} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between opacity-0 hover:border-purple-500/20 transition-colors">
                  <span className="text-sm text-white/70">Monthly Recurring Revenue</span>
                  <span className="text-sm font-bold text-white">$42,850</span>
                </div>
                <div ref={item2Ref} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between opacity-0 hover:border-purple-500/20 transition-colors">
                  <span className="text-sm text-white/70">Customer Acquisition Cost</span>
                  <span className="text-sm font-bold text-white">$120</span>
                </div>
                <div ref={item3Ref} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between opacity-0 hover:border-purple-500/20 transition-colors">
                  <span className="text-sm text-white/70">Active Paid Subscriptions</span>
                  <span className="text-sm font-bold text-white">842</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-4 max-w-[280px]">
              <p className="text-xs text-white/50 text-center leading-relaxed">
                Experience the magic of native multi-target spring & layout sequencing compiled entirely off-thread into WAAPI layers.
              </p>
              <Button size="lg" variant="primary" className="shadow-lg shadow-purple-500/20" onClick={triggerSequence}>
                ⚡ Replay Timeline Sequence
              </Button>
            </div>
          </Surface>
        </div>

      </div>

      {/* Mask Reveal */}
      <div key={`reveal-${key}`} className="space-y-4">
        <h3 className="text-lg font-medium text-white/80">Mask Reveal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Reveal direction="up" duration={0.8}>
              <Heading as="h2" className="text-4xl font-bold">Reveal from Bottom</Heading>
            </Reveal>
            <Reveal direction="right" delay={0.3} boxColor="bg-blue-600">
              <p className="text-white/60 text-lg">
                This component uses a sliding mask to reveal content with a colored block accent.
              </p>
            </Reveal>
          </div>
          <div className="flex items-center justify-center p-8 border border-white/10 rounded-2xl bg-white/[0.02]">
            <Reveal direction="left" delay={0.5} boxColor="bg-purple-600">
              <div className="w-32 h-32 bg-purple-500 rounded-xl shadow-2xl shadow-purple-500/20" />
            </Reveal>
          </div>
        </div>
      </div>

      {/* Interactive Magnetic */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white/80">Interactive Magnetic</h3>
        <div className="p-12 border border-white/10 rounded-2xl bg-white/[0.02] flex flex-wrap items-center justify-center gap-12">
          <Magnetic strength={0.3}>
            <Button size="lg" className="rounded-full px-8">Magnetic Button</Button>
          </Magnetic>
          
          <Magnetic strength={0.5}>
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
              <span className="text-2xl">🎯</span>
            </div>
          </Magnetic>

          <Magnetic strength={0.2}>
            <Surface className="p-4 px-6 cursor-default">
              <span className="text-white font-medium">Soft Pull</span>
            </Surface>
          </Magnetic>
        </div>
      </div>

      {/* Data Animation */}
      <div key={`ticker-${key}`} className="space-y-4">
        <h3 className="text-lg font-medium text-white/80">Data Animation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Surface className="p-8 text-center">
            <div className="text-4xl font-bold text-blue-500 mb-2">
              <NumberTicker value={12500} />
            </div>
            <p className="text-sm text-white/40 uppercase tracking-wider">Total Users</p>
          </Surface>
          
          <Surface className="p-8 text-center">
            <div className="text-4xl font-bold text-white mb-2">
              $<NumberTicker value={98.45} decimalPlaces={2} />
            </div>
            <p className="text-sm text-white/40 uppercase tracking-wider">Avg. Revenue</p>
          </Surface>

          <Surface className="p-8 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">
              <NumberTicker value={99.9} decimalPlaces={1} />%
            </div>
            <p className="text-sm text-white/40 uppercase tracking-wider">Uptime</p>
          </Surface>
        </div>
      </div>

      {/* Loading States */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white/80">Loading States</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Surface className="p-8 flex flex-col items-center justify-center min-h-[200px]">
            <PageLoader variant="spinner" fullscreen={false} text="Loading assets..." />
          </Surface>
          <Surface className="p-8 flex flex-col items-center justify-center min-h-[200px]">
            <PageLoader variant="dots" fullscreen={false} text="Syncing data" />
          </Surface>
        </div>
      </div>

      {/* Text Reveal */}
      <div key={`text-${key}`} className="space-y-4">
        <h3 className="text-lg font-medium text-white/80">Text Reveal</h3>
        <div className="p-8 border border-white/10 rounded-2xl bg-white/[0.02]">
          <TextMotion 
            text="Building the future of UI, one pixel at a time." 
            type="word" 
            className="text-3xl font-bold text-white"
          />
          <TextMotion 
            text="Smooth character-by-character reveal animation." 
            type="char" 
            delay={1000}
            stagger={20}
            className="mt-4 text-lg text-white/60"
          />
        </div>
      </div>

      {/* Motion Group (Stagger Container) */}
      <div key={`group-${key}`} className="space-y-4">
        <h3 className="text-lg font-medium text-white/80">Motion Group (Auto Stagger)</h3>
        <MotionGroup stagger={100} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Motion 
              key={i} 
              preset="slide-right" 
              className="h-full"
            >
              <Surface className="p-6 h-32 flex items-center justify-center hover:bg-white/[0.05] transition-colors cursor-pointer">
                <span className="text-2xl font-bold text-white/20">Group {i}</span>
              </Surface>
            </Motion>
          ))}
        </MotionGroup>
      </div>

      {/* Parallax Effect */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white/80">Parallax Scroll</h3>
        <div className="h-[400px] overflow-hidden relative rounded-2xl border border-white/10">
          <Parallax speed={0.2} className="absolute inset-0 -top-20">
            <div className="w-full h-[140%] bg-gradient-to-b from-purple-900/50 to-blue-900/50 opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-purple-500/20 blur-3xl" />
            </div>
          </Parallax>
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Parallax speed={-0.1}>
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">Parallax Depth</h2>
            </Parallax>
          </div>
        </div>
      </div>

      {/* Different Presets */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white/80">Animation Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Motion preset="slide-right" delay={200}>
            <Surface className="p-6">
              <h4 className="font-medium text-white mb-2">Slide Right</h4>
              <p className="text-sm text-white/60">
                Smooth lateral entrance perfect for sidebars or lists.
              </p>
            </Surface>
          </Motion>

          <Motion preset="blur" delay={400}>
            <Surface className="p-6">
              <h4 className="font-medium text-white mb-2">Blur Fade</h4>
              <p className="text-sm text-white/60">
                Elegant blur transition for modal content or images.
              </p>
            </Surface>
          </Motion>

          <Motion preset="3d-flip" delay={600}>
            <Surface className="p-6">
              <h4 className="font-medium text-white mb-2">3D Flip</h4>
              <p className="text-sm text-white/60">
                Perspective rotation for cards and interactive elements.
              </p>
            </Surface>
          </Motion>

          <Motion preset="fade" delay={800}>
            <Surface className="p-6">
              <h4 className="font-medium text-white mb-2">Simple Fade</h4>
              <p className="text-sm text-white/60">
                Classic fade up, subtle and non-intrusive.
              </p>
            </Surface>
          </Motion>
        </div>
      </div>

      {/* Scroll Trigger Demo */}
      <div className="space-y-4 pt-12">
        <h3 className="text-lg font-medium text-white/80">Scroll Trigger</h3>
        <p className="text-white/60 mb-8">Scroll down to see elements animate as they enter the viewport.</p>
        
        <div className="space-y-24 pb-24">
          {[1, 2, 3].map((i) => (
            <Motion 
              key={i} 
              preset="spring" 
              viewport={true}
              className="flex items-center justify-center"
            >
              <Surface className="w-full max-w-md p-12 text-center border-blue-500/20 bg-blue-500/5">
                <span className="text-4xl font-bold text-blue-500">Section {i}</span>
                <p className="mt-4 text-white/60">
                  I animate when I enter the viewport.
                </p>
              </Surface>
            </Motion>
          ))}
        </div>
      </div>
    </div>
  </PageTransition>
);
}
