import React from 'react';
import { 
  HeroText, 
  LetterPullup, 
  Background, 
  Button, 
  Surface, 
  Text, 
  Heading, 
  Badge,
  TextGradient,
  ShinyText
} from '@pixonui/react';
import { 
  ArrowRight, 
  Play, 
  Search, 
  Mail, 
  CheckCircle2, 
  Github, 
  Twitter, 
  Zap, 
  Shield, 
  Cpu 
} from 'lucide-react';

export function HeroDemo() {
  const [key, setKey] = React.useState(0);
  const reload = () => setKey(prev => prev + 1);

  return (
    <div className="space-y-24 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <Heading as="h2" className="text-3xl font-bold">Hero Templates</Heading>
          <Text variant="muted" className="mt-1">10+ modern layouts for high-impact landing pages.</Text>
        </div>
        <Button onClick={reload} variant="outline" size="sm" className="gap-2">
          <Play className="w-3 h-3" /> Replay Animations
        </Button>
      </div>

      {/* 1. SaaS Split Hero */}
      <div key={`hero-saas-${key}`} className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px] p-8 md:p-16 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 overflow-hidden">
        <Background variant="beams" noise patternColor="rgba(59, 130, 246, 0.1)" />
        <div className="relative z-10 space-y-8">
          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-1">
            New: Version 2.0 is here
          </Badge>
          <Heading as="h1" className="text-5xl md:text-6xl leading-tight">
            Scale your SaaS <TextGradient from="from-blue-600 dark:from-blue-400" to="to-indigo-600 dark:to-indigo-500">faster</TextGradient> than ever.
          </Heading>
          <Text variant="lead">
            The only UI kit you need to build production-ready dashboards in minutes, not weeks. Zero heavy dependencies.
          </Text>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="rounded-xl px-8 gap-2">
              Start Building <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8">
              View Demo
            </Button>
          </div>
        </div>
        <div className="relative z-10 lg:translate-x-12">
          <Surface className="aspect-video bg-white/50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 shadow-2xl rotate-[-2deg] overflow-hidden p-0">
            <div className="h-8 border-b border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/5 flex items-center px-4 gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-4 w-1/3 bg-zinc-200 dark:bg-white/10 rounded" />
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-white/10" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5" />
                <div className="h-24 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5" />
                <div className="h-24 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5" />
              </div>
              <div className="h-32 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5" />
            </div>
          </Surface>
        </div>
      </div>

      {/* 2. Waitlist Hero */}
      <div key={`hero-waitlist-${key}`} className="relative flex flex-col items-center justify-center text-center min-h-[500px] p-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-white/5 overflow-hidden">
        <Background variant="mesh" animate className="opacity-30" />
        <div className="relative z-10 max-w-2xl space-y-8">
          <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30">Coming Soon</Badge>
          <Heading as="h1" className="text-4xl md:text-7xl font-extrabold tracking-tighter">
            Something big is <span className="italic text-purple-600 dark:text-purple-400">coming</span>.
          </Heading>
          <Text variant="muted" size="lg" className="max-w-lg mx-auto">
            Join 5,000+ developers waiting for the most advanced UI library ever created.
          </Text>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full">
            <input 
              className="flex-1 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" 
              placeholder="Enter your email" 
            />
            <Button className="rounded-2xl px-8 bg-purple-600 hover:bg-purple-700">Join Waitlist</Button>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-white/40">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> No spam, ever. Early access guaranteed.
          </div>
        </div>
      </div>

      {/* 3. Product Mockup Hero */}
      <div key={`hero-mockup-${key}`} className="relative pt-24 pb-0 px-8 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 overflow-hidden text-center">
        <Background variant="dots" mask="fade" patternColor="rgba(0,0,0,0.05)" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-8 mb-16">
          <HeroText 
            title="Design your next"
            highlight="Masterpiece"
            subtitle="The ultimate toolkit for creative developers. Build stunning interfaces with zero effort."
          />
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="rounded-full px-10">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="rounded-full px-10">Live Preview</Button>
          </div>
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[120%] h-96 bg-blue-500/20 blur-[120px] -z-10" />
          <Surface className="rounded-t-3xl border-b-0 bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
            <div className="h-12 border-b border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 flex items-center px-6 justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-white/10" />
              </div>
              <div className="h-6 w-64 bg-zinc-200 dark:bg-white/5 rounded-full" />
              <div className="w-12" />
            </div>
            <div className="aspect-[16/9] bg-gradient-to-br from-zinc-50 dark:from-white/[0.02] to-transparent p-8">
              <div className="grid grid-cols-12 gap-6 h-full">
                <div className="col-span-3 space-y-4">
                  <div className="h-8 w-full bg-zinc-200 dark:bg-white/5 rounded" />
                  <div className="h-32 w-full bg-zinc-200 dark:bg-white/5 rounded" />
                  <div className="h-32 w-full bg-zinc-200 dark:bg-white/5 rounded" />
                </div>
                <div className="col-span-9 bg-zinc-200 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5" />
              </div>
            </div>
          </Surface>
        </div>
      </div>

      {/* 4. Command/Search Hero */}
      <div key={`hero-search-${key}`} className="relative min-h-[500px] flex flex-col items-center justify-center p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 overflow-hidden">
        <Background variant="grid" size={60} patternColor="rgba(0,0,0,0.03)" />
        <div className="relative z-10 w-full max-w-2xl space-y-10 text-center">
          <div className="space-y-4">
            <Heading as="h1" className="text-4xl md:text-6xl font-bold">Search anything.</Heading>
            <Text variant="muted" size="lg">The fastest way to find components, documentation, and examples.</Text>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-2xl px-6 py-5 shadow-2xl">
              <Search className="w-6 h-6 text-zinc-400 dark:text-white/40 mr-4" />
              <input 
                className="flex-1 bg-transparent text-xl text-zinc-900 dark:text-white focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-white/20" 
                placeholder="Search components..." 
              />
              <div className="flex items-center gap-1 ml-4">
                <kbd className="px-2 py-1 bg-zinc-100 dark:bg-white/10 rounded text-xs text-zinc-500 dark:text-white/60 font-mono">⌘</kbd>
                <kbd className="px-2 py-1 bg-zinc-100 dark:bg-white/10 rounded text-xs text-zinc-500 dark:text-white/60 font-mono">K</kbd>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {['Buttons', 'Cards', 'Modals', 'Charts', 'Forms'].map(tag => (
              <button key={tag} className="px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-600 dark:text-white/60 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Feature-Led Hero */}
      <div key={`hero-features-${key}`} className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[600px] p-8 md:p-16 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-white/5 overflow-hidden">
        <Background variant="mesh" className="opacity-20" />
        <div className="relative z-10 space-y-8">
          <Heading as="h1" className="text-5xl md:text-6xl">Built for <span className="text-emerald-600 dark:text-green-400">Performance</span>.</Heading>
          <Text variant="lead">PixonUI is optimized for speed, accessibility, and developer experience. No bloat, just pure code.</Text>
          <div className="space-y-4">
            {[
              { icon: <Zap className="text-amber-500 dark:text-yellow-400" />, title: 'Lightning Fast', desc: 'Optimized for 120fps interactions.' },
              { icon: <Shield className="text-blue-600 dark:text-blue-400" />, title: 'Secure by Default', desc: 'Strict TypeScript and ARIA compliance.' },
              { icon: <Cpu className="text-purple-600 dark:text-purple-400" />, title: 'Lightweight', desc: 'Zero heavy external dependencies.' }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">{feature.title}</h4>
                  <p className="text-sm text-zinc-500 dark:text-white/40">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-4">
          <Surface className="aspect-square flex flex-col items-center justify-center p-8 text-center space-y-4 bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10">
            <div className="text-4xl font-bold text-zinc-900 dark:text-white">120</div>
            <Text variant="muted" size="sm">FPS Interactions</Text>
          </Surface>
          <Surface className="aspect-square flex flex-col items-center justify-center p-8 text-center space-y-4 mt-8 bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10">
            <div className="text-4xl font-bold text-zinc-900 dark:text-white">0</div>
            <Text variant="muted" size="sm">Dependencies</Text>
          </Surface>
          <Surface className="aspect-square flex flex-col items-center justify-center p-8 text-center space-y-4 bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10">
            <div className="text-4xl font-bold text-zinc-900 dark:text-white">12kb</div>
            <Text variant="muted" size="sm">Bundle Size</Text>
          </Surface>
          <Surface className="aspect-square flex flex-col items-center justify-center p-8 text-center space-y-4 mt-8 bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10">
            <div className="text-4xl font-bold text-zinc-900 dark:text-white">∞</div>
            <Text variant="muted" size="sm">Possibilities</Text>
          </Surface>
        </div>
      </div>

      {/* 6. Social Proof Hero */}
      <div key={`hero-social-${key}`} className="relative flex flex-col items-center justify-center text-center min-h-[600px] p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 overflow-hidden">
        <Background variant="dots" patternColor="rgba(0,0,0,0.05)" />
        <div className="relative z-10 max-w-3xl space-y-10">
          <div className="flex items-center justify-center -space-x-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
              </div>
            ))}
            <div className="w-12 h-12 rounded-full border-4 border-white dark:border-zinc-950 bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
              +2k
            </div>
          </div>
          <Heading as="h1" className="text-5xl md:text-7xl font-bold">Loved by developers <br/> <span className="text-blue-600 dark:text-blue-500">worldwide</span>.</Heading>
          <Text variant="lead" className="max-w-xl mx-auto">
            Join thousands of developers building the next generation of web applications with PixonUI.
          </Text>
          <div className="pt-12 border-t border-zinc-200 dark:border-white/5 w-full">
            <Text variant="subtle" className="uppercase tracking-widest text-xs mb-8">Trusted by teams at</Text>
            <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale">
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">GITHUB</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">VERCEL</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">STRIPE</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">AIRBNB</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">DISCORD</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Developer/Code Hero */}
      <div key={`hero-code-${key}`} className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px] p-8 md:p-16 rounded-3xl bg-zinc-50 dark:bg-[#050505] border border-zinc-200 dark:border-white/5 overflow-hidden">
        <Background variant="grid" size={30} patternColor="rgba(0,0,0,0.02)" />
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            npm install @pixonui/react
          </div>
          <Heading as="h1" className="text-5xl md:text-6xl">Code-first <br/> components.</Heading>
          <Text variant="lead">Built for developers who love clean code and powerful abstractions. Fully typed and customizable.</Text>
          <div className="flex gap-4">
            <Button size="lg" className="rounded-xl px-8 bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-white/90">Read Docs</Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5">
              <Github className="w-4 h-4 mr-2" /> GitHub
            </Button>
          </div>
        </div>
        <div className="relative z-10">
          <Surface className="bg-white dark:bg-[#0D0D0D] border-zinc-200 dark:border-white/10 p-0 overflow-hidden shadow-2xl">
            <div className="h-10 border-b border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 flex items-center px-4 justify-between">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                <div className="w-3 h-3 rounded-full bg-green-500/20" />
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-white/20 font-mono uppercase tracking-widest">Button.tsx</div>
              <div className="w-12" />
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed">
              <div className="text-purple-600 dark:text-purple-400">import <span className="text-zinc-900 dark:text-white">React</span> from <span className="text-emerald-600 dark:text-green-400">'react'</span>;</div>
              <div className="text-purple-600 dark:text-purple-400">import <span className="text-zinc-900 dark:text-white">{`{ cn }`}</span> from <span className="text-emerald-600 dark:text-green-400">'../../utils/cn'</span>;</div>
              <div className="mt-4 text-purple-600 dark:text-purple-400">export const <span className="text-blue-600 dark:text-blue-400">Button</span> = ({`{ children, className }`}) ={`>`} (</div>
              <div className="pl-4 text-zinc-900 dark:text-white">
                {`<button`}
                <div className="pl-4 text-purple-600 dark:text-purple-400">
                  className={<span className="text-emerald-600 dark:text-green-400">{`cn(`}</span>}
                  <div className="pl-4 text-emerald-600 dark:text-green-400">
                    'px-4 py-2 rounded-xl',<br/>
                    'bg-blue-600 text-white',<br/>
                    className
                  </div>
                  <span className="text-emerald-600 dark:text-green-400">{`)`}</span>
                </div>
                {`>`}
                <div className="pl-4 text-zinc-900 dark:text-white">{`{children}`}</div>
                {`</button>`}
              </div>
              <div className="text-zinc-900 dark:text-white">);</div>
            </div>
          </Surface>
        </div>
      </div>

      {/* 8. Announcement Hero */}
      <div key={`hero-announcement-${key}`} className="relative flex flex-col items-center justify-center text-center min-h-[500px] p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 overflow-hidden">
        <Background variant="beams" noise patternColor="rgba(234, 179, 8, 0.1)" />
        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3 h-3 fill-current" /> Major Update
          </div>
          <Heading as="h1" className="text-5xl md:text-8xl font-black tracking-tighter uppercase">
            PixonUI <span className="text-yellow-600 dark:text-yellow-500">v3.0</span>
          </Heading>
          <Text variant="lead" className="max-w-xl mx-auto">
            The biggest update in our history. New components, better performance, and a completely redesigned experience.
          </Text>
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
            {[
              { val: '12', label: 'Days' },
              { val: '08', label: 'Hours' },
              { val: '45', label: 'Mins' },
              { val: '12', label: 'Secs' }
            ].map(item => (
              <div key={item.label} className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">{item.val}</div>
                <div className="text-[10px] text-zinc-500 dark:text-white/40 uppercase">{item.label}</div>
              </div>
            ))}
          </div>
          <Button size="lg" className="rounded-full px-12 bg-yellow-500 text-black hover:bg-yellow-400 font-bold">
            Notify Me
          </Button>
        </div>
      </div>

      {/* 9. Mobile Showcase Hero */}
      <div key={`hero-mobile-${key}`} className="relative pt-24 pb-0 px-8 rounded-3xl bg-white dark:bg-black border border-zinc-200 dark:border-white/5 overflow-hidden text-center">
        <Background variant="mesh" className="opacity-30" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-8 mb-16">
          <Heading as="h1" className="text-5xl md:text-7xl font-bold">Your app, <br/> <ShinyText shimmerColor="rgba(0,0,0,0.2) dark:rgba(255,255,255,0.8)">everywhere</ShinyText>.</Heading>
          <Text variant="lead">Fully responsive components that look beautiful on any device. From mobile to desktop.</Text>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="rounded-full px-8">Download App</Button>
            <Button size="lg" variant="outline" className="rounded-full px-8">Learn More</Button>
          </div>
        </div>
        <div className="flex items-end justify-center gap-8 max-w-4xl mx-auto">
          <div className="w-64 h-[450px] rounded-[3rem] border-8 border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 shadow-2xl overflow-hidden translate-y-12 rotate-[-5deg]">
            <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-900 mx-auto rounded-b-2xl" />
            <div className="p-6 space-y-6">
              <div className="h-32 w-full bg-zinc-200 dark:bg-white/5 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 w-2/3 bg-zinc-300 dark:bg-white/10 rounded" />
                <div className="h-4 w-full bg-zinc-200 dark:bg-white/5 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-zinc-200 dark:bg-white/5 rounded-xl" />
                <div className="h-20 bg-zinc-200 dark:bg-white/5 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="w-64 h-[500px] rounded-[3rem] border-8 border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 shadow-2xl overflow-hidden z-10">
            <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-900 mx-auto rounded-b-2xl" />
            <div className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-full bg-blue-500/20" />
                <div className="h-4 w-24 bg-zinc-300 dark:bg-white/10 rounded" />
              </div>
              <div className="h-48 w-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-zinc-200 dark:border-white/5" />
              <div className="h-12 w-full bg-blue-600 rounded-xl" />
            </div>
          </div>
          <div className="w-64 h-[450px] rounded-[3rem] border-8 border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 shadow-2xl overflow-hidden translate-y-12 rotate-[5deg]">
            <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-900 mx-auto rounded-b-2xl" />
            <div className="p-6 space-y-6">
              <div className="h-8 w-full bg-zinc-300 dark:bg-white/10 rounded-xl" />
              <div className="h-8 w-full bg-zinc-200 dark:bg-white/5 rounded-xl" />
              <div className="h-8 w-full bg-zinc-200 dark:bg-white/5 rounded-xl" />
              <div className="h-32 w-full bg-zinc-200 dark:bg-white/5 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 10. Glassmorphic Card Hero */}
      <div key={`hero-glass-${key}`} className="relative min-h-[700px] flex items-center justify-center p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 overflow-hidden">
        <Background variant="grid" size={50} patternColor="rgba(0,0,0,0.05)" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full" />
        
        <Surface className="relative z-10 max-w-4xl w-full p-12 md:p-20 bg-white/40 dark:bg-white/[0.01] backdrop-blur-3xl border-zinc-200 dark:border-white/10 shadow-2xl text-center space-y-10">
          <div className="space-y-6">
            <Heading as="h1" className="text-5xl md:text-7xl font-bold tracking-tight">
              The <span className="text-blue-600 dark:text-blue-400">Glassmorphic</span> <br/> Revolution.
            </Heading>
            <Text variant="lead" className="max-w-2xl mx-auto">
              Beautifully crafted components with a focus on depth, transparency, and modern aesthetics.
            </Text>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Button size="lg" className="rounded-2xl px-10 h-14 text-lg">Get Started</Button>
            <Button size="lg" variant="outline" className="rounded-2xl px-10 h-14 text-lg">View Components</Button>
          </div>
          <div className="pt-10 flex items-center justify-center gap-8 text-zinc-400 dark:text-white/30">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Fully Typed</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> ARIA Ready</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Open Source</div>
          </div>
        </Surface>
      </div>
    </div>
  );
}
