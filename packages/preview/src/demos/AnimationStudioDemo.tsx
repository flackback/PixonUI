import React, { useMemo, useState } from 'react';
import { AnimationStudio, type AnimationStudioClip, Surface, Text, Button } from '@pixonui/react';
import { Video, Sparkles, ExternalLink } from 'lucide-react';

function makeInitialClip(): AnimationStudioClip {
  return {
    durationMs: 2200,
    tracks: [
      {
        id: 'tr-x',
        label: 'Position X',
        channel: 'x',
        keyframes: [
          { id: 'x0', t: 0, v: -140, easing: 'spring-out' },
          { id: 'x1', t: 900, v: 90, easing: 'elite-in-out' },
          { id: 'x2', t: 2200, v: 0, easing: 'linear' },
        ],
      },
      {
        id: 'tr-y',
        label: 'Position Y',
        channel: 'y',
        keyframes: [
          { id: 'y0', t: 0, v: 0, easing: 'linear' },
          { id: 'y1', t: 1200, v: -40, easing: 'soft-bounce' },
          { id: 'y2', t: 2200, v: 0, easing: 'linear' },
        ],
      },
      {
        id: 'tr-rot',
        label: 'Rotate',
        channel: 'rotate',
        keyframes: [
          { id: 'r0', t: 0, v: -8, easing: 'spring-out' },
          { id: 'r1', t: 900, v: 4, easing: 'linear' },
          { id: 'r2', t: 2200, v: 0, easing: 'linear' },
        ],
      },
      {
        id: 'tr-op',
        label: 'Opacity',
        channel: 'opacity',
        keyframes: [
          { id: 'o0', t: 0, v: 0.2, easing: 'elite-in-out' },
          { id: 'o1', t: 400, v: 1, easing: 'linear' },
          { id: 'o2', t: 2200, v: 1, easing: 'linear' },
        ],
      },
      {
        id: 'tr-scale',
        label: 'Scale',
        channel: 'scale',
        keyframes: [
          { id: 's0', t: 0, v: 0.92, easing: 'spring-out' },
          { id: 's1', t: 1000, v: 1.05, easing: 'linear' },
          { id: 's2', t: 2200, v: 1, easing: 'linear' },
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
      {/* Premium Launcher Banner */}
      <Surface className="p-5 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-zinc-900/60 border border-purple-500/20 dark:border-purple-500/30 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-purple-950/10">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Video className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <Text className="text-sm font-extrabold text-white flex items-center gap-1.5 leading-tight">
              Experimente a Experiência Completa <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
            </Text>
            <Text className="text-xs text-zinc-400 font-semibold leading-tight mt-0.5">
              O Animation Studio brilha muito mais no modo Standalone em tela cheia com todos os recursos e guias integrados!
            </Text>
          </div>
        </div>
        <Button
          onClick={() => window.dispatchEvent(new CustomEvent('nav-studio'))}
          className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-4 py-2 rounded-2xl flex items-center gap-2 border border-purple-400/20 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all text-xs shrink-0 self-stretch sm:self-auto justify-center"
        >
          Abrir Editor Standalone
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </Surface>

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

