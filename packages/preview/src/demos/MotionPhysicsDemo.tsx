import React, { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  AdvancedSlider, 
  Badge,
  usePixonAnimate,
  cn
} from '@pixonui/react';
import { 
  Zap, 
  Play, 
  RotateCcw, 
  Activity, 
  Sliders, 
  Volume2, 
  Mic, 
  Music, 
  Move,
  Disc,
  Sparkles
} from 'lucide-react';

export function MotionPhysicsDemo() {
  // ── 1. Spring Physics Studio States ──────────────────────────────────
  const [stiffness, setStiffness] = useState(250);
  const [damping, setDamping] = useState(15);
  const [mass, setMass] = useState(1);
  const [activePreset, setActivePreset] = useState<'custom' | 'snappy' | 'elastic' | 'floater'>('elastic');

  const { ref: springCardRef, animate: animateCard, pulse, shake } = usePixonAnimate<HTMLDivElement>();

  // Apply spring presets
  const applyPreset = (preset: 'snappy' | 'elastic' | 'floater') => {
    setActivePreset(preset);
    if (preset === 'snappy') {
      setStiffness(350);
      setDamping(25);
      setMass(0.8);
    } else if (preset === 'elastic') {
      setStiffness(220);
      setDamping(12);
      setMass(1);
    } else if (preset === 'floater') {
      setStiffness(80);
      setDamping(8);
      setMass(1.5);
    }
  };

  const triggerCustomBounce = () => {
    animateCard(
      [
        { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
        { transform: 'translate3d(0, -60px, 0) scale(1.1) rotate(5deg)', offset: 0.3 },
        { transform: 'translate3d(0, 15px, 0) scale(0.9) rotate(-2deg)', offset: 0.75 },
        { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' }
      ],
      {
        duration: 900,
        spring: { stiffness, damping, mass }
      }
    );
  };

  // ── 2. Julian Garnier Elastic SVG Line Challenge States ───────────────
  const svgLineRef = useRef<SVGPathElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const animationFrameId = useRef<number | null>(null);

  // Math simulation for elastic string bounce
  const stringState = useRef({
    y: 100,
    targetY: 100,
    vy: 0,
    stiffness: 0.08,
    damping: 0.85
  });

  const handleMouseMoveOnString = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    stringState.current.targetY = mouseY;
    setIsHovered(true);
  };

  const handleMouseLeaveString = () => {
    stringState.current.targetY = 100; // Reset to center
    setIsHovered(false);
  };

  useEffect(() => {
    const updateStringPhysics = () => {
      const state = stringState.current;
      // Spring formula: force = stiffness * error
      const force = (state.targetY - state.y) * state.stiffness;
      state.vy += force;
      state.vy *= state.damping;
      state.y += state.vy;

      if (svgLineRef.current) {
        // Construct SVG path: M 0 100 Q 250 {y} 500 100
        svgLineRef.current.setAttribute('d', `M 0 100 Q 250 ${state.y} 500 100`);
      }

      animationFrameId.current = requestAnimationFrame(updateStringPhysics);
    };

    animationFrameId.current = requestAnimationFrame(updateStringPhysics);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // ── 3. Spectrogram / Sound Wave Visualizer Simulator ──────────────────
  const [audioMode, setAudioMode] = useState<'simulated' | 'mic'>('simulated');
  const [isPlaying, setIsPlaying] = useState(true);
  const [micActive, setMicActive] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(Array.from({ length: 32 }).map(() => 15));

  // Simulating sound frequency waves with periodic trigonometric offset math
  useEffect(() => {
    if (!isPlaying || audioMode === 'mic') return;

    const interval = setInterval(() => {
      setFrequencyData((prev) =>
        prev.map((val, idx) => {
          const time = Date.now() * 0.003;
          // Rich combination of sin waves for natural frequency look
          const noise = Math.sin(time + idx * 0.4) * 20 + Math.cos(time * 1.5 - idx * 0.2) * 15;
          const base = 40 + Math.sin(idx * 0.1) * 20;
          return Math.max(10, Math.min(95, base + noise));
        })
      );
    }, 85);

    return () => clearInterval(interval);
  }, [isPlaying, audioMode]);

  // Handle active audio recording spectrum if microphone is requested
  const startMicCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicActive(true);
      setAudioMode('mic');
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64; // Small spectrum array size
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const runSpectrumUpdate = () => {
        if (!audioCtx) return;
        analyser.getByteFrequencyData(dataArray);
        
        // Map 0-255 spectrum values to 5-100 height percentage values
        const mappedFreqs = Array.from(dataArray).slice(0, 32).map(val => (val / 255) * 85 + 10);
        setFrequencyData(mappedFreqs);
        
        if (stream.active) {
          requestAnimationFrame(runSpectrumUpdate);
        }
      };
      
      runSpectrumUpdate();
    } catch (e) {
      alert("Permissão de microfone negada. Iniciando fluxo simulado padrão.");
      setAudioMode('simulated');
    }
  };

  return (
    <div className="space-y-12 max-w-5xl pb-16">
      
      {/* HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <Badge variant="cyber">WAAPI Spring Engine v2</Badge>
          <Badge variant="shimmer">120 FPS GPU-Driven</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Spring &amp; Audio Physics Studio
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Laboratório interativo combinando física de molas clássica, desenho elástico de caminhos SVG e oscilogramas espectrais acelerados diretamente na placa de vídeo.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        {/* ── 1. SPRING PHYSICS STUDIO SANDBOX ── */}
        <Card className="relative overflow-hidden border border-zinc-200 dark:border-white/5 shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-purple-500" />
              <CardTitle>Mola Física (Spring Controller)</CardTitle>
            </div>
            <CardDescription>
              Ajuste as constantes elásticas e sinta o impacto na flexibilidade e rebote do componente em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Presets Row */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Presets Físicos:</span>
              <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 text-xs font-semibold gap-1">
                {(['snappy', 'elastic', 'floater'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg transition-all capitalize",
                      activePreset === preset 
                        ? "bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-md" 
                        : "text-zinc-400 hover:text-zinc-500"
                    )}
                  >
                    {preset === 'snappy' ? '💥 Snappy' : preset === 'elastic' ? '🦘 Elastic Bounce' : '☁️ Slow Floater'}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Sliders */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold font-mono">
                  <span className="text-zinc-400">Stiffness (Rigidez de Mola)</span>
                  <span className="text-purple-500">{stiffness} N/m</span>
                </div>
                <AdvancedSlider 
                  value={stiffness} 
                  onChange={(val) => { setStiffness(val); setActivePreset('custom'); }} 
                  min={40} 
                  max={500} 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold font-mono">
                  <span className="text-zinc-400">Damping (Fator Amortecimento)</span>
                  <span className="text-purple-500">{damping} N·s/m</span>
                </div>
                <AdvancedSlider 
                  value={damping} 
                  onChange={(val) => { setDamping(val); setActivePreset('custom'); }} 
                  min={2} 
                  max={45} 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold font-mono">
                  <span className="text-zinc-400">Mass (Inércia da Massa)</span>
                  <span className="text-purple-500">{mass} kg</span>
                </div>
                <AdvancedSlider 
                  value={mass * 10} 
                  onChange={(val) => { setMass(val / 10); setActivePreset('custom'); }} 
                  min={2} 
                  max={30} 
                  suffix=" kg"
                />
              </div>
            </div>

            {/* Animation Target View */}
            <div className="p-8 rounded-2xl border border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.015] flex flex-col items-center justify-center min-h-[160px] relative">
              <div 
                ref={springCardRef}
                className="p-4 px-6 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-purple-500/10 flex items-center gap-2 cursor-pointer select-none"
                onClick={triggerCustomBounce}
              >
                <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                <span>Pixon Physics Box</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 mt-4">Clique no box acima para disparar o impacto físico!</span>
            </div>

            {/* Trigger Operations */}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => pulse(1.2)}>
                Pulse Hook
              </Button>
              <Button variant="outline" size="sm" onClick={() => shake(12)}>
                Shake Hook
              </Button>
              <Button variant="primary" size="sm" onClick={triggerCustomBounce}>
                Impact Bounce
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* ── 2. JULIAN GARNIER ELASTIC STRING SVG ── */}
        <Card className="border border-zinc-200 dark:border-white/5 shadow-2xl flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Move className="h-5 w-5 text-purple-500" />
              <CardTitle>Corda Elástica SVG (Julian Garnier Style)</CardTitle>
            </div>
            <CardDescription>
              Passe e arraste o mouse sobre a linha abaixo para esticá-la e veja ela estalar de volta ao centro com mola física simulada por fórmulas de Euler.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between space-y-6">
            
            {/* Elastic string container */}
            <div className="flex-1 bg-zinc-100 dark:bg-black/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 flex items-center justify-center min-h-[220px]">
              <svg 
                className="w-full h-full cursor-grab active:cursor-grabbing overflow-visible"
                viewBox="0 0 500 200"
                onMouseMove={handleMouseMoveOnString}
                onMouseLeave={handleMouseLeaveString}
              >
                {/* Glow filter */}
                <defs>
                  <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Backplate Guideline */}
                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(168, 85, 247, 0.04)" strokeWidth={1} strokeDasharray="4 4" />

                {/* Bouncing String Path */}
                <path 
                  ref={svgLineRef}
                  d="M 0 100 Q 250 100 500 100" 
                  fill="none" 
                  stroke="url(#purple-blue-gradient)" 
                  strokeWidth={isHovered ? 4.5 : 2.5} 
                  strokeLinecap="round"
                  filter="url(#neon-glow)"
                  className="transition-all duration-300"
                />

                {/* Gradients */}
                <linearGradient id="purple-blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </svg>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-white/5 text-xs text-zinc-400 space-y-2 leading-relaxed">
              <p>
                <strong>Como funciona:</strong> Ao capturar as coordenadas de mouse, o vetor de controle de âncora `Q` da curva quadrática de Bezier se projeta à posição desejada. Ao soltar, a força física de restauração acelera o vetor produzindo uma oscilação elástica amortecida de alta precisão.
              </p>
            </div>

          </CardContent>
        </Card>

        {/* ── 3. INTERACTIVE NEON SOUND SPECTROGRAM (FULL WIDTH) ── */}
        <Card className="lg:col-span-2 relative overflow-hidden border border-zinc-200 dark:border-white/5 shadow-2xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
                <div>
                  <CardTitle>Laboratório de Espectro &amp; Onda de Áudio</CardTitle>
                  <CardDescription>Visualizador de amplitudes mecânicas sincronizado via microfone ou canais de áudio estéreo sintéticos.</CardDescription>
                </div>
              </div>

              {/* Mode Select Controls */}
              <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 text-xs font-semibold gap-1">
                <button
                  onClick={() => { setAudioMode('simulated'); setMicActive(false); }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                    audioMode === 'simulated' ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-zinc-400"
                  )}
                >
                  <Music className="h-3.5 w-3.5" />
                  <span>Sintetizador Simulador</span>
                </button>
                <button
                  onClick={startMicCapture}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                    audioMode === 'mic' ? "bg-emerald-500 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-500"
                  )}
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Microfone Real</span>
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Holographic Amplitude Wave Canvas */}
            <div className="h-[200px] w-full rounded-2xl bg-zinc-950 border border-white/5 p-4 flex items-end justify-between relative overflow-hidden shadow-inner">
              
              {/* Backgrid Scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              
              {/* Laser Line Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-500/20 via-cyan-500/60 to-purple-500/20 shadow-lg shadow-cyan-500/50" />

              {frequencyData.map((height, idx) => {
                // Alternating color spectrum logic: Emerald -> Cyan -> Purple
                let colClass = "from-emerald-500 via-teal-400 to-cyan-400";
                if (idx > 10 && idx <= 20) {
                  colClass = "from-cyan-500 via-sky-400 to-indigo-500";
                } else if (idx > 20) {
                  colClass = "from-purple-500 via-pink-400 to-rose-400";
                }

                return (
                  <div 
                    key={idx}
                    className="flex-1 mx-[2px] rounded-t-lg relative group flex flex-col justify-end h-full"
                  >
                    {/* Floating Glow particle on apex peaks */}
                    <div 
                      className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-80 left-1/2 -translate-x-1/2 shadow-lg shadow-white transition-all duration-100 ease-out"
                      style={{ bottom: `${height}%` }}
                    />

                    {/* Elastic vertical bar bar */}
                    <div 
                      className={cn(
                        "w-full rounded-t-full bg-gradient-to-t shadow-lg transition-all duration-100 ease-out",
                        colClass
                      )}
                      style={{ 
                        height: `${height}%`,
                        opacity: 0.85
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Interactive Player Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <Button 
                  variant={isPlaying ? 'outline' : 'primary'} 
                  onClick={() => setIsPlaying(!isPlaying)}
                  size="sm"
                  className="gap-1.5 h-9"
                  disabled={audioMode === 'mic'}
                >
                  {isPlaying ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span>Pausar Simulação</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Retomar Áudio</span>
                    </>
                  )}
                </Button>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  {audioMode === 'mic' ? '🔴 Capturando dados de microfone em tempo real' : '🎶 Simulador de frequência estéreo ativo'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-mono">
                  FFT: 64 bins
                </span>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

    </div>
  );
}
