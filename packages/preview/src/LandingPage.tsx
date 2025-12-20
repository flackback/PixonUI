import React, { useState, useEffect } from 'react';
import { 
  HeroText, 
  Background, 
  GlowButton, 
  Reveal, 
  Surface, 
  Heading, 
  Text, 
  Container, 
  Stack, 
  Grid,
  Badge,
  TextGradient,
  ShinyText,
  LetterPullup,
  Button,
  PageLoader,
  PageTransition,
  TextMotion,
  Magnetic,
  Parallax,
  NumberTicker,
} from '@pixonui/react';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Github, 
  Accessibility, 
  Palette,
  Rocket,
} from 'lucide-react';

interface LandingPageProps {
  onEnterGallery: () => void;
  onEnterSaaS: () => void;
}

export function LandingPage({ onEnterGallery, onEnterSaaS }: LandingPageProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader variant="glass" text="INITIALIZING PIXONUI..." />;
  }

  return (
    <PageTransition preset="blur" duration={800}>
      <div className="relative min-h-screen w-full bg-[#030303] text-white overflow-x-hidden">
        {/* Background Effects */}
        <Background variant="mesh" animate className="opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
          <Container className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20" />
              <span className="text-xl font-bold tracking-tight">PixonUI</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
              <a href="#components" className="text-sm text-white/60 hover:text-white transition-colors">Components</a>
              <a href="#performance" className="text-sm text-white/60 hover:text-white transition-colors">Performance</a>
            </div>
            <div className="flex items-center gap-4">
              <Magnetic>
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                  <Github className="h-4 w-4 mr-2" /> GitHub
                </Button>
              </Magnetic>
              <Magnetic strength={0.2}>
                <GlowButton onClick={onEnterGallery} className="px-4 py-2 text-sm">
                  Explore Components
                </GlowButton>
              </Magnetic>
            </div>
          </Container>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
          </div>
          
          <Container>
            <Stack gap={8} align="center" className="text-center max-w-4xl mx-auto">
              <Reveal>
                <Badge variant="neutral" className="bg-white/5 border-white/10 text-cyan-400 px-4 py-1 rounded-full">
                  <Sparkles className="h-3 w-3 mr-2 inline" />
                  Version 0.1.0 is now live
                </Badge>
              </Reveal>

              <div className="space-y-4">
                <LetterPullup 
                  text="The Next Generation of"
                  className="text-4xl md:text-6xl font-bold tracking-tight text-white/70"
                />
                <HeroText 
                  title=""
                  highlight="Glassmorphic UI"
                  className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter"
                />
              </div>

              <Reveal delay={0.4}>
                <TextMotion 
                  type="word"
                  text="A high-performance, accessible, and beautifully crafted component library for React. Built with zero heavy dependencies and a focus on modern aesthetics."
                  className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed justify-center"
                  stagger={50}
                />
              </Reveal>

              <Reveal delay={0.8}>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Magnetic strength={0.3}>
                    <GlowButton className="px-10 h-16 text-xl" onClick={onEnterGallery}>
                      Explore Components <ArrowRight className="ml-2 h-6 w-6" />
                    </GlowButton>
                  </Magnetic>
                  <Magnetic strength={0.2}>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="px-10 h-16 text-xl border-white/10 bg-white/5 hover:bg-white/10"
                      onClick={onEnterSaaS}
                    >
                      <Rocket className="mr-2 h-6 w-6 text-cyan-500" />
                      View SaaS Demo
                    </Button>
                  </Magnetic>
                </div>
              </Reveal>
            </Stack>
          </Container>
        </section>

        {/* Stats Section */}
        <section id="performance" className="py-12 border-y border-white/5 bg-white/[0.02]">
          <Container>
            <Grid cols={2} md={4} gap={8} className="text-center">
              <Stack gap={1}>
                <div className="text-3xl md:text-4xl font-bold text-cyan-400">
                  <NumberTicker value={60} />
                  <span className="text-xl ml-1">FPS</span>
                </div>
                <Text className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Performance</Text>
              </Stack>
              <Stack gap={1}>
                <div className="text-3xl md:text-4xl font-bold text-purple-400">
                  <NumberTicker value={50} />
                  <span className="text-xl ml-1">+</span>
                </div>
                <Text className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Components</Text>
              </Stack>
              <Stack gap={1}>
                <div className="text-3xl md:text-4xl font-bold text-blue-400">
                  <NumberTicker value={0} />
                </div>
                <Text className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Dependencies</Text>
              </Stack>
              <Stack gap={1}>
                <div className="text-3xl md:text-4xl font-bold text-emerald-400">
                  <NumberTicker value={100} />
                  <span className="text-xl ml-1">%</span>
                </div>
                <Text className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Accessible</Text>
              </Stack>
            </Grid>
          </Container>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 relative">
          <Container>
            <div className="mb-20 text-center">
              <Reveal>
                <Heading as="h2" className="text-4xl md:text-5xl font-bold mb-6">
                  Built for <TextGradient from="from-cyan-400" to="to-blue-600">Modern Engineers</TextGradient>
                </Heading>
                <Text className="text-lg text-white/40 max-w-2xl mx-auto">Everything you need to build world-class interfaces in record time.</Text>
              </Reveal>
            </div>

            <Grid cols={1} gap={8} className="md:grid-cols-3">
              <Reveal delay={0.1}>
                <Surface className="p-10 h-full group hover:border-cyan-500/30 transition-all duration-500 hover:bg-white/[0.05]">
                  <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <Zap className="h-7 w-7 text-cyan-400" />
                  </div>
                  <Heading as="h3" className="text-2xl font-bold mb-4">Ultra Performance</Heading>
                  <Text className="text-white/50 leading-relaxed text-lg">
                    Optimized for 60fps interactions. Scoped lazy loading, virtualized lists, and zero-runtime CSS overhead.
                  </Text>
                </Surface>
              </Reveal>

              <Reveal delay={0.2}>
                <Surface className="p-10 h-full group hover:border-purple-500/30 transition-all duration-500 hover:bg-white/[0.05]">
                  <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                    <Accessibility className="h-7 w-7 text-purple-400" />
                  </div>
                  <Heading as="h3" className="text-2xl font-bold mb-4">Pragmatic A11y</Heading>
                  <Text className="text-white/50 leading-relaxed text-lg">
                    Full keyboard navigation and ARIA support out of the box. We don&apos;t compromise on accessibility.
                  </Text>
                </Surface>
              </Reveal>

              <Reveal delay={0.3}>
                <Surface className="p-10 h-full group hover:border-blue-500/30 transition-all duration-500 hover:bg-white/[0.05]">
                  <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <Palette className="h-7 w-7 text-blue-400" />
                  </div>
                  <Heading as="h3" className="text-2xl font-bold mb-4">Glassmorphism 2.0</Heading>
                  <Text className="text-white/50 leading-relaxed text-lg">
                    A refined dark aesthetic with subtle blurs, borders, and mouse-following glow effects.
                  </Text>
                </Surface>
              </Reveal>
            </Grid>
          </Container>
        </section>

        {/* Component Showcase Preview */}
        <section id="components" className="py-32 bg-white/[0.01] border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full -mr-64 -mt-64" />
          <Container>
            <Grid cols={1} gap={16} className="lg:grid-cols-2 items-center">
              <Stack gap={8}>
                <Reveal>
                  <Badge variant="neutral" className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400 px-4 py-1">
                    Interactive Components
                  </Badge>
                  <Heading as="h2" className="text-5xl md:text-6xl font-bold mt-6 leading-tight">
                    Complex logic, <br />
                    <ShinyText className="text-cyan-400">Simple API.</ShinyText>
                  </Heading>
                  <Text className="text-xl text-white/50 mt-8 leading-relaxed">
                    From advanced Kanban boards with multi-select to AI-ready prompt inputs. 
                    PixonUI handles the complexity so you can focus on your product.
                  </Text>
                  <div className="flex items-center gap-10 mt-12">
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white">50+</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Components</span>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white">0</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Heavy Deps</span>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white">100%</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">TypeScript</span>
                    </div>
                  </div>
                </Reveal>
              </Stack>

              <Reveal delay={0.4} className="relative">
                <Parallax speed={0.05}>
                  <div className="absolute -inset-8 bg-cyan-500/20 blur-[100px] rounded-full opacity-20 animate-pulse" />
                  <Surface className="relative aspect-video rounded-[2.5rem] overflow-hidden border-white/10 bg-black/40 backdrop-blur-3xl p-1.5 shadow-2xl group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="h-full w-full rounded-[2.3rem] bg-[#0a0a0a] p-8 flex flex-col gap-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="flex gap-2">
                          <div className="h-3.5 w-3.5 rounded-full bg-red-500/40" />
                          <div className="h-3.5 w-3.5 rounded-full bg-amber-500/40" />
                          <div className="h-3.5 w-3.5 rounded-full bg-green-500/40" />
                        </div>
                        <div className="h-6 w-40 rounded-full bg-white/5" />
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <Stack gap={5} align="center" className="w-full max-w-sm">
                          <div className="h-14 w-full rounded-2xl bg-white/5 animate-pulse" />
                          <div className="h-14 w-full rounded-2xl bg-white/5 animate-pulse delay-150" />
                          <div className="h-14 w-full rounded-2xl bg-white/5 animate-pulse delay-300" />
                        </Stack>
                      </div>
                    </div>
                  </Surface>
                </Parallax>
              </Reveal>
            </Grid>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-48 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/10 blur-[150px] rounded-full" />
          <Container className="relative z-10 text-center">
            <Reveal>
              <Heading as="h2" className="text-5xl md:text-8xl font-black mb-12 tracking-tighter">
                Ready to build the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">future of the web?</span>
              </Heading>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Magnetic strength={0.4}>
                  <GlowButton className="px-16 h-20 text-2xl" onClick={onEnterGallery}>
                    Start Building Now
                  </GlowButton>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <Button variant="ghost" size="lg" className="px-10 h-20 text-xl text-white/60 hover:text-white">
                    View on GitHub
                  </Button>
                </Magnetic>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-white/5 bg-black/60 backdrop-blur-xl">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600" />
                  <span className="text-2xl font-bold tracking-tight">PixonUI</span>
                </div>
                <Text className="text-white/40 max-w-sm text-lg leading-relaxed">
                  The most advanced glassmorphic component library for React. 
                  Built for speed, accessibility, and beauty.
                </Text>
              </div>
              <Stack gap={4}>
                <Text className="font-bold text-white uppercase tracking-widest text-xs">Resources</Text>
                <a href="#" className="text-white/40 hover:text-white transition-colors">Documentation</a>
                <a href="#" className="text-white/40 hover:text-white transition-colors">Components</a>
                <a href="#" className="text-white/40 hover:text-white transition-colors">Templates</a>
              </Stack>
              <Stack gap={4}>
                <Text className="font-bold text-white uppercase tracking-widest text-xs">Community</Text>
                <a href="#" className="text-white/40 hover:text-white transition-colors">GitHub</a>
                <a href="#" className="text-white/40 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-white/40 hover:text-white transition-colors">Discord</a>
              </Stack>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
              <Text className="text-sm text-white/20">
                © 2025 PixonUI. Built with passion for the community.
              </Text>
              <div className="flex gap-8">
                <a href="#" className="text-xs text-white/20 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-xs text-white/20 hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </Container>
        </footer>
      </div>
    </PageTransition>
  );
}
