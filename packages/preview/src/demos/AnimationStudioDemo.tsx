import React, { useMemo, useState } from 'react';
import { AnimationStudio, type AnimationStudioClip, Surface, Text } from '@pixonui/react';

function makeInitialClip(): AnimationStudioClip {
  return {
    durationMs: 2200,
    tracks: [
      {
        id: 'tr-x',
        label: 'Position X',
        channel: 'x',
        keyframes: [
          { id: 'x0', t: 0, v: -140 },
          { id: 'x1', t: 900, v: 90 },
          { id: 'x2', t: 2200, v: 0 },
        ],
      },
      {
        id: 'tr-y',
        label: 'Position Y',
        channel: 'y',
        keyframes: [
          { id: 'y0', t: 0, v: 0 },
          { id: 'y1', t: 1200, v: -40 },
          { id: 'y2', t: 2200, v: 0 },
        ],
      },
      {
        id: 'tr-rot',
        label: 'Rotate',
        channel: 'rotate',
        keyframes: [
          { id: 'r0', t: 0, v: -8 },
          { id: 'r1', t: 900, v: 4 },
          { id: 'r2', t: 2200, v: 0 },
        ],
      },
      {
        id: 'tr-op',
        label: 'Opacity',
        channel: 'opacity',
        keyframes: [
          { id: 'o0', t: 0, v: 0.2 },
          { id: 'o1', t: 400, v: 1 },
          { id: 'o2', t: 2200, v: 1 },
        ],
      },
      {
        id: 'tr-scale',
        label: 'Scale',
        channel: 'scale',
        keyframes: [
          { id: 's0', t: 0, v: 0.92 },
          { id: 's1', t: 1000, v: 1.05 },
          { id: 's2', t: 2200, v: 1 },
        ],
      },
    ],
  };
}

export function AnimationStudioDemo() {
  const [clip, setClip] = useState<AnimationStudioClip>(() => makeInitialClip());

  const json = useMemo(() => JSON.stringify(clip, null, 2), [clip]);

  return (
    <div className="w-full flex flex-col gap-6">
      <AnimationStudio clip={clip} onClipChange={setClip} />

      <Surface className="p-4 bg-white/70 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10">
        <Text className="text-sm font-semibold mb-2 text-zinc-900 dark:text-white">Clip JSON</Text>
        <pre className="text-[11px] leading-relaxed overflow-auto max-h-[240px] rounded-xl bg-white/80 dark:bg-black/40 border border-zinc-200/70 dark:border-white/10 p-3 text-zinc-800 dark:text-zinc-200">
          {json}
        </pre>
      </Surface>
    </div>
  );
}

