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
  PageTransition
} from '@pixonui/react';

export function MotionDemo() {
  const [key, setKey] = React.useState(0);

  const reload = () => setKey(prev => prev + 1);

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
