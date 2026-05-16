import React from 'react';
import { CometLoader, Stack, Surface, Text } from '@pixonui/react';

export default function CometLoaderDemo() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">CometLoader</h1>
          <p className="text-white/50 text-sm mt-1">Loader “comet” (rotação visível + ring).</p>
        </div>

        <Surface className="p-8 bg-white/5 border border-white/10 rounded-3xl">
          <Stack gap={22}>
            <div className="flex items-center gap-10 flex-wrap">
              <div className="flex items-center gap-3">
                <CometLoader size={36} />
                <Text className="text-white/60 text-sm">36px</Text>
              </div>
              <div className="flex items-center gap-3">
                <CometLoader size={48} duration={900} />
                <Text className="text-white/60 text-sm">48px fast</Text>
              </div>
              <div className="flex items-center gap-3">
                <CometLoader size={64} duration={1250} color="#22d3ee" />
                <Text className="text-white/60 text-sm">64px cyan</Text>
              </div>
              <div className="flex items-center gap-3">
                <CometLoader size={72} duration={1400} color="#a855f7" thickness={4} />
                <Text className="text-white/60 text-sm">thick</Text>
              </div>
            </div>
          </Stack>
        </Surface>
      </div>
    </div>
  );
}

