import { 
  AnimationStudio, 
  type AnimationStudioClip, 
  Surface, 
  Text, 
  Button,
  CopyBlock
} from '@pixonui/react';
import { ArrowLeft, Sparkles, Image, Video, HelpCircle, Layers } from 'lucide-react';
import { useMemo, useState } from 'react';

function makeInitialClip(): AnimationStudioClip {
  return {
    durationMs: 4000,
    tracks: [],
  };
}

const MOTION_QUICK_START_CODE = `import {
  Animotion,
  AnimatedSection,
  AnimatedCard,
  AnimatedLogo,
} from '@pixonui/react';

// Elemento único
<Animotion tracks={tracks} durationMs={2400} autoplay animateOnView>
  <Logo />
</Animotion>

// Section exportada pelo Studio
<AnimatedSection
  elements={elements}
  durationMs={4000}
  autoplay
  animateOnView
  yoyo
/>

// Card e logo com presets simples
<AnimatedCard tracks={cardTracks} durationMs={1200} autoplay />
<AnimatedLogo tracks={logoTracks} durationMs={1800} autoplay yoyo />
`;

interface AnimationStudioPageProps {
  onBack: () => void;
}

export function AnimationStudioPage({ onBack }: AnimationStudioPageProps) {
  const [clip, setClip] = useState<AnimationStudioClip>(() => makeInitialClip());
  
  const totalKeyframes = useMemo(() => {
    return clip.tracks.reduce((acc, track) => acc + track.keyframes.length, 0);
  }, [clip.tracks]);

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white font-sans flex flex-col selection:bg-purple-600/30">
      {/* Premium Top Navigation Bar */}
      <header className="h-16 shrink-0 bg-zinc-950/80 backdrop-blur-md border-b border-white/[0.06] px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-9 px-3 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] hover:text-white transition-all text-zinc-400 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Galeria
          </Button>

          <span className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <Video className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight leading-none">Animation Studio Pro</span>
              <span className="text-[10px] text-zinc-500 font-semibold leading-none mt-1">Stand-alone Workspace</span>
            </div>
          </div>
        </div>

        {/* Stats & Quick Guidelines */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-bold text-zinc-400">
            <Layers className="h-3.5 w-3.5 text-purple-400" />
            <span>Tracks: {clip.tracks.length}</span>
            <span className="text-white/20">•</span>
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Keyframes: {totalKeyframes}</span>
          </div>

          <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
            Live Editor
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden max-w-8xl mx-auto w-full flex flex-col p-6 gap-6 animate-in fade-in duration-300">

        {/* The Full Featured Animation Studio Workspace */}
        <AnimationStudio 
          clip={clip} 
          onClipChange={setClip} 
          showStage={true}
          className="w-full min-h-0 flex-1"
        />

        <Surface className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <Text className="text-base font-bold text-white">Motion quick start</Text>
              <Text className="text-xs text-zinc-400">
                Use `Animotion` para um elemento, `AnimatedSection` para export da página e `animateOnView` para disparar ao entrar na tela.
              </Text>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
              docs
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-3">
              {[
                ['Animotion', 'Use para um bloco único ou uma árvore customizada.'],
                ['AnimatedSection', 'Use para a section exportada pelo Studio.'],
                ['AnimatedCard', 'Use para cards, callouts e blocos UI.'],
                ['AnimatedLogo', 'Use para marca, ícone e identity marks.'],
                ['animateOnView', 'Dispara quando entrar na viewport.'],
                ['yoyo', 'Vai e volta sem duplicar lógica no app.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3">
                  <div className="text-sm font-bold text-white">{title}</div>
                  <div className="text-xs leading-relaxed text-zinc-400">{text}</div>
                </div>
              ))}
            </div>

            <CopyBlock
              title="Uso básico"
              language="tsx"
              code={MOTION_QUICK_START_CODE}
              lineNumbers
              maxHeight="320px"
              variant="terminal"
              className="h-full border-white/10"
            />
          </div>
        </Surface>
      </main>
    </div>
  );
}
