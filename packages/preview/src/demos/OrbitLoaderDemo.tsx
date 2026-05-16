import React from 'react';
import { OrbitLoader, Stack, Surface, Text } from '@pixonui/react';

export default function OrbitLoaderDemo() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">OrbitLoader</h1>
          <p className="text-white/50 text-sm mt-1">Loader WAAPI compositor-first (loop infinito).</p>
        </div>

        <Surface className="p-8 bg-white/5 border border-white/10 rounded-3xl">
          <Stack gap={20}>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <OrbitLoader size={32} duration={900} />
                <Text className="text-white/60 text-sm">32px</Text>
              </div>
              <div className="flex items-center gap-3">
                <OrbitLoader size={48} duration={1200} />
                <Text className="text-white/60 text-sm">48px</Text>
              </div>
              <div className="flex items-center gap-3">
                <OrbitLoader size={64} duration={1400} color="#22d3ee" />
                <Text className="text-white/60 text-sm">64px cyan</Text>
              </div>
              <div className="flex items-center gap-3">
                <OrbitLoader size={72} duration={1600} dots={10} color="#a855f7" />
                <Text className="text-white/60 text-sm">10 dots</Text>
              </div>
            </div>
          </Stack>
        </Surface>
      </div>
    </div>
  );
}

