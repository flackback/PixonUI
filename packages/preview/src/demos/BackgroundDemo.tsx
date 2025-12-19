import React from 'react';
import { Background, Surface, Heading, Text, TextGradient, ShinyText } from '@pixonui/react';

export function BackgroundDemo() {
  return (
    <div className="space-y-12">
      <div>
        <Heading as="h2" className="text-2xl font-bold text-white mb-2">Background Patterns</Heading>
        <Text className="text-white/60">
          Decorative background patterns for sections, cards, or entire pages.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dot Pattern */}
        <div className="space-y-4">
          <Heading as="h3" className="text-lg font-medium text-white/80">Dot Pattern</Heading>
          <div className="relative h-64 rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 flex items-center justify-center">
            <Background variant="dots" size={20} patternColor="rgba(255,255,255,0.1)" />
            <Surface className="p-6">
              <Text>Subtle Dots</Text>
            </Surface>
          </div>
        </div>

        {/* Grid Pattern */}
        <div className="space-y-4">
          <Heading as="h3" className="text-lg font-medium text-white/80">Grid Pattern</Heading>
          <div className="relative h-64 rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 flex items-center justify-center">
            <Background variant="grid" size={32} patternColor="rgba(255,255,255,0.05)" />
            <Surface className="p-6">
              <Text>Technical Grid</Text>
            </Surface>
          </div>
        </div>

        {/* Faded Mask */}
        <div className="space-y-4">
          <Heading as="h3" className="text-lg font-medium text-white/80">Faded Mask</Heading>
          <div className="relative h-64 rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 flex items-center justify-center">
            <Background variant="grid" size={24} mask="fade" patternColor="rgba(59, 130, 246, 0.2)" />
            <Surface className="p-6">
              <Text>Radial Fade Effect</Text>
            </Surface>
          </div>
        </div>

        {/* Mesh Gradient */}
        <div className="space-y-4">
          <Heading as="h3" className="text-lg font-medium text-white/80">Mesh Gradient</Heading>
          <div className="relative h-64 rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 flex items-center justify-center">
            <Background variant="mesh" animate />
            <Surface className="p-6">
              <Text>Animated Mesh</Text>
            </Surface>
          </div>
        </div>

        {/* Interactive Follow */}
        <div className="space-y-4">
          <Heading as="h3" className="text-lg font-medium text-white/80">Interactive Follow</Heading>
          <div className="relative h-64 rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 flex items-center justify-center">
            <Background variant="gradient" patternColor="rgba(59, 130, 246, 0.15)" followMouse />
            <Surface className="p-6">
              <Text>Moves with Cursor</Text>
            </Surface>
          </div>
        </div>
      </div>

      {/* Full Section Example */}
      <div className="space-y-4">
        <Heading as="h3" className="text-lg font-medium text-white/80">Full Section Example (Fixed Visibility)</Heading>
        <section className="relative py-24 px-8 rounded-3xl border border-white/10 overflow-hidden text-center">
          <Background 
            variant="dots" 
            size={16} 
            mask="fade" 
            patternColor="rgba(255,255,255,0.08)" 
            bgColor="bg-zinc-950"
          />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <Heading as="h1" className="text-5xl font-extrabold tracking-tight">
              Build faster with <TextGradient from="from-blue-400" to="to-purple-500" animate>PixonUI</TextGradient>
            </Heading>
            <Text className="text-xl text-white/60">
              A modern UI library built for speed, accessibility, and <ShinyText shimmerColor="rgba(255,255,255,0.5)">beautiful dark mode</ShinyText> designs.
            </Text>
            <div className="flex items-center justify-center gap-4">
              <Surface className="px-6 py-3 cursor-pointer hover:bg-white/5 transition-colors">
                Get Started
              </Surface>
              <Surface className="px-6 py-3 cursor-pointer hover:bg-white/5 transition-colors border-blue-500/30 bg-blue-500/5">
                Documentation
              </Surface>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
