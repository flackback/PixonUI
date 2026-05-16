import React from 'react';
import { Button, MagneticEffect, Surface, Stack, Text } from '@pixonui/react';

export default function MagneticDemo() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">Magnetic</h1>
          <p className="text-white/50 text-sm mt-1">Efeito magnético no pointer (spring WAAPI).</p>
        </div>

        <Surface className="p-10 bg-white/5 border border-white/10 rounded-3xl">
          <Stack gap={18} align="center">
            <Text className="text-white/60 text-sm">Passe o mouse sobre os alvos.</Text>

            <div className="flex gap-6 flex-wrap justify-center">
              <MagneticEffect strength={10}>
                <Button className="px-8">CTA</Button>
              </MagneticEffect>
              <MagneticEffect strength={16}>
                <Button variant="secondary" className="px-8">
                  Secondary
                </Button>
              </MagneticEffect>
              <MagneticEffect strength={22}>
                <div className="px-8 py-4 rounded-2xl bg-white/10 border border-white/15">
                  <Text className="font-bold">Card</Text>
                  <Text className="text-white/60 text-sm">Magnetic wrapper</Text>
                </div>
              </MagneticEffect>
            </div>
          </Stack>
        </Surface>
      </div>
    </div>
  );
}
