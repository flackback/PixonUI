import React, { useState } from 'react';
import { ScrambleReveal, Surface, Stack, Switch, Text } from '@pixonui/react';

export default function ScrambleRevealDemo() {
  const [viewport, setViewport] = useState(true);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-black tracking-tight">ScrambleReveal</h1>
            <p className="text-white/50 text-sm mt-1">Text scramble + reveal motion (hook + WAAPI).</p>
          </div>
          <div className="flex items-center gap-3">
            <Text className="text-white/60 text-sm">Viewport</Text>
            <Switch checked={viewport} onCheckedChange={setViewport} />
          </div>
        </div>

        <Surface className="p-8 bg-white/5 border border-white/10 rounded-3xl">
          <Stack gap={18}>
            <ScrambleReveal viewport={viewport} text="PixonUI Motion Engine — compositor-first." className="text-xl font-black" />
            <ScrambleReveal viewport={viewport} text="Sem Anime.js, sem travar o main thread." className="text-white/70" />
            <ScrambleReveal viewport={viewport} text="Stagger, springs e WAAPI com cancelamento seguro." className="text-white/70" />
            <div className="h-[600px]" />
            <ScrambleReveal viewport={viewport} text="Scroll-trigger: apareceu, revelou." className="text-2xl font-black" />
          </Stack>
        </Surface>
      </div>
    </div>
  );
}

