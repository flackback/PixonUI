import React from 'react';
import { Button, SparkBurst, Surface, Stack, Text } from '@pixonui/react';

export default function SparkBurstDemo() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">SparkBurst</h1>
          <p className="text-white/50 text-sm mt-1">Burst de partículas no clique (WAAPI direto).</p>
        </div>

        <Surface className="p-10 bg-white/5 border border-white/10 rounded-3xl">
          <Stack gap={18} align="center">
            <Text className="text-white/60 text-sm">Clique no botão para disparar.</Text>

            <SparkBurst sparks={16} radius={34} color="#22d3ee">
              <Button variant="default" className="px-8">
                Clique aqui
              </Button>
            </SparkBurst>

            <div className="flex gap-4 flex-wrap justify-center">
              <SparkBurst sparks={10} radius={24} color="#fb7185">
                <Button variant="secondary">Pink</Button>
              </SparkBurst>
              <SparkBurst sparks={18} radius={40} color="#a855f7" duration={800}>
                <Button variant="secondary">Purple</Button>
              </SparkBurst>
              <SparkBurst sparks={12} radius={28} color="#fbbf24" duration={550}>
                <Button variant="secondary">Gold</Button>
              </SparkBurst>
            </div>
          </Stack>
        </Surface>
      </div>
    </div>
  );
}

