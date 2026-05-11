import React, { useState } from 'react';
import { VideoPlayer } from '@pixonui/react';
import { Card, MetricCard } from '@pixonui/react';
import { 
  Play, Volume2, Settings, Tv, Sparkles, Keyboard, 
  Film, RefreshCw, Layers, Monitor, Sliders, PlaySquare, Link
} from 'lucide-react';

interface VideoSource {
  id: string;
  title: string;
  description: string;
  url: string;
  poster: string;
  accent: string;
}

const SAMPLE_VIDEOS: VideoSource[] = [
  {
    id: 'sintel',
    title: 'Sintel (Cinematic Epic)',
    description: 'Narrativa visual de alta definição com gradientes quentes de pôr-do-sol e paisagens montanhosas ideais para estressar o Cinema Glow.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000',
    accent: 'bg-orange-500'
  },
  {
    id: 'tears',
    title: 'Tears of Steel (Sci-Fi Neon)',
    description: 'Gráficos de ficção científica cyberpunk com tons profundos de azul, rosa e roxo holográfico, perfeitos para testar tons cibernéticos do glow.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1000',
    accent: 'bg-pink-500'
  },
  {
    id: 'bunny',
    title: 'Big Buck Bunny (Cartoon Nature)',
    description: 'Animação clássica de alta taxa de quadros e cores naturais vibrantes de florestas verdes e céu azul aberto.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000',
    accent: 'bg-emerald-500'
  }
];

export function VideoPlayerDemo() {
  const [activeVideo, setActiveVideo] = useState<VideoSource>(SAMPLE_VIDEOS[0] as VideoSource);
  const [ambientGlow, setAmbientGlow] = useState(true);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="h-4 w-4 animate-pulse" />
          Mídia de Próxima Geração
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent">
          Ultimate PixonUI Video Player
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-3xl text-sm leading-relaxed">
          Reprodutor multimídia completo de alto desempenho com **Cinema Ambient Glow** dinâmico acelerado por GPU (off-thread), 
          gestos integrados de duplo clique para busca lateral, indicador segmentado de buffer, atalhos de teclado 
          e suporte nativo para **In-App Draggable Floating Miniplayer**.
        </p>
      </div>

      {/* Main Grid Area: Player on Left, Side information on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column (Player & Source selection) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main VideoPlayer Component Instance */}
          <VideoPlayer
            key={activeVideo.id}
            src={activeVideo.url}
            poster={activeVideo.poster}
            title={activeVideo.title}
            accentColor={activeVideo.accent}
            enableAmbientGlow={ambientGlow}
            className="border border-zinc-200 dark:border-white/10 shadow-2xl bg-zinc-950/80 backdrop-blur-md"
          />

          {/* Source Selectors Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-white/60 flex items-center gap-2">
              <Film className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              Selecione a Fonte de Mídia
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_VIDEOS.map((video) => {
                const isActive = video.id === activeVideo.id;
                return (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideo(video)}
                    className={`p-4 rounded-2xl text-left border transition-all relative flex flex-col justify-between h-36 ${
                      isActive 
                        ? 'bg-zinc-100 dark:bg-white/[0.04] border-cyan-500/40 dark:border-cyan-500/40 shadow-lg shadow-cyan-500/5' 
                        : 'bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm dark:shadow-none'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center justify-between">
                        {video.title}
                        {isActive && <div className={`h-2 w-2 rounded-full ${video.accent} animate-ping`} />}
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                        {video.description}
                      </p>
                    </div>
                    
                    <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 mt-2">
                      <RefreshCw className="h-3 w-3" />
                      Alternar Fluxo
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Injetor de URL do Usuário */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-white/10 backdrop-blur-md space-y-3 shadow-sm dark:shadow-xl">
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Link className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  Injetar URL de Vídeo Personalizada (MP4 / WebM)
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Insira o link direto de qualquer fluxo de vídeo (.mp4, .webm, ou similar) para carregar no player com aceleração de GPU.
                  Nota: Links de páginas do YouTube dependem de iframes proprietários bloqueados por CORS e não rodam em players HTML5 customizados nativos.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                  id="custom-video-input"
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('custom-video-input') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      setActiveVideo({
                        id: 'custom_injected',
                        title: 'Vídeo Externo Injetado',
                        description: 'Vídeo externo carregado sob demanda de um link customizado.',
                        url: input.value.trim(),
                        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000',
                        accent: 'bg-cyan-400'
                      });
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Carregar Vídeo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Interactive options & Controls Info Sheet */}
        <div className="space-y-6">
          
          {/* Quick Config panel */}
          <Card className="p-5 border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/40 backdrop-blur-md space-y-4 shadow-sm dark:shadow-xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              Ajustes do Reprodutor
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/[0.04] cursor-pointer transition-all">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">Cinema Ambient Glow</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Projeção difusa de cores em tempo real via GPU</span>
                </div>
                <input
                  type="checkbox"
                  checked={ambientGlow}
                  onChange={(e) => setAmbientGlow(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-white/10 text-cyan-500 focus:ring-cyan-500 bg-zinc-50 dark:bg-zinc-900 h-4 w-4"
                />
              </label>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed space-y-1">
                <span className="font-bold text-zinc-900 dark:text-white text-[11px] block">💡 Dica de Engenharia:</span>
                O efeito de Ambient Glow utiliza espelhamento de elemento de vídeo de baixa latência e filtros de difusão que rodam inteiramente via aceleração na GPU. Isso mantém a CPU principal a 0% de sobrecarga!
              </div>
            </div>
          </Card>

          {/* Keyboard Shortcuts Cheat Sheet */}
          <Card className="p-5 border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/40 backdrop-blur-md space-y-4 shadow-sm dark:shadow-xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              Atalhos de Teclado Universais
            </h3>

            <div className="space-y-2.5">
              {[
                { keys: ['Espaço'], label: 'Play / Pause' },
                { keys: ['←', '→'], label: 'Retroceder / Avançar 5s' },
                { keys: ['↑', '↓'], label: 'Aumentar / Diminuir Volume' },
                { keys: ['M'], label: 'Mutar / Desmutar Áudio' },
                { keys: ['F'], label: 'Alternar Tela Cheia NATIVA' },
                { keys: ['T'], label: 'Alternar Modo Cinema (Teatro)' },
                { keys: ['I'], label: 'Floating Miniplayer (In-App)' }
              ].map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-white/5 last:border-none">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">{shortcut.label}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((k) => (
                      <kbd key={k} className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/10 text-[10px] font-bold text-zinc-700 dark:text-white shadow-sm">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Feature Showcase List */}
          <Card className="p-5 border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/40 backdrop-blur-md space-y-3.5 shadow-sm dark:shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-white/50">
              Pronto para SaaS / Entretenimento
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <PlaySquare className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">In-App Miniplayer</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Clique no ícone de mini-janela no player para transformá-lo em uma tela flutuante. Você pode arrastá-lo por toda a tela e continuar navegando.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 flex-shrink-0">
                  <Layers className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Gestos de Toque Duplo</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Dê dois cliques na parte esquerda ou direita do reprodutor para avançar/retroceder 10 segundos instantaneamente, com efeitos de mola fluidos.
                  </p>
                </div>
              </div>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}
