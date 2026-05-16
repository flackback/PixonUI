import React from 'react';
import { Button, RippleTap, Surface, Stack, Text } from '@pixonui/react';

export default function RippleTapDemo() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">RippleTap</h1>
          <p className="text-white/50 text-sm mt-1">Ripple no clique (WAAPI direto, clip no container).</p>
        </div>

        <Surface className="p-10 bg-white/5 border border-white/10 rounded-3xl">
          <Stack gap={18} align="center">
            <Text className="text-white/60 text-sm">Clique nos botões.</Text>

            <div className="flex gap-4 flex-wrap justify-center">
              <RippleTap className="rounded-xl" color="#22d3ee">
                <Button className="px-8">Primary</Button>
              </RippleTap>
              <RippleTap className="rounded-xl" color="#a855f7" opacity={0.18} duration={750}>
                <Button variant="secondary" className="px-8">
                  Secondary
                </Button>
              </RippleTap>
              <RippleTap className="rounded-2xl" color="#fbbf24" opacity={0.2} duration={600}>
                <div className="px-8 py-4 rounded-2xl bg-white/10 border border-white/15 select-none">
                  <Text className="font-bold">Card</Text>
                  <Text className="text-white/60 text-sm">RippleTap wrapper</Text>
                </div>
              </RippleTap>
            </div>
          </Stack>
        </Surface>
      </div>
    </div>
  );
}

