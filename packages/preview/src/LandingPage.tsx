import React, { useState, useEffect } from 'react';
import { 
  HeroText, 
  Background, 
  GlowButton, 
  Reveal, 
  Surface, 
  Heading, 
  Text, 
  Container, 
  Stack, 
  Grid,
  Badge,
  TextGradient,
  ShinyText,
  LetterPullup,
  Button,
  PageLoader,
  PageTransition,
  TextMotion,
  Magnetic,
  Parallax,
  NumberTicker,
  motion,
  usePixonAnimate,
  CopyBlock,
} from '@pixonui/react';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Github, 
  Accessibility, 
  Palette,
  Rocket,
  Activity,
  Play,
  RotateCw,
  Flame,
  Anchor,
  TrendingDown,
  Layers,
  Orbit,
  Type,
  RefreshCw,
  Target,
  Disc,
} from 'lucide-react';

interface LandingPageProps {
  onEnterGallery: () => void;
  onEnterSaaS: () => void;
}

function RippleBox({ index, activeState, onClick }: { index: number; activeState: { index: number; ts: number } | null; onClick: (i: number) => void }) {
  const { ref, animate, pulse } = usePixonAnimate<HTMLDivElement>();

  useEffect(() => {
    if (!activeState) return;
    
    // Calculate Manhattan distance in 3x3 grid
    const rowA = Math.floor(activeState.index / 3);
    const colA = activeState.index % 3;
    const rowB = Math.floor(index / 3);
    const colB = index % 3;
    const distance = Math.abs(rowA - rowB) + Math.abs(colA - colB);

    if (distance === 0) {
      pulse(1.35);
    } else {
      const stepDelay = distance * 80;
      const anim = animate(
        { scale: 1.2, translateY: -12, rotate: (index % 2 === 0 ? 1 : -1) * 8 },
        { spring: { stiffness: 400, damping: 10 }, delay: stepDelay }
      );
      if (anim) {
        anim.finished.then(() => {
          animate(
            { scale: 1, translateY: 0, rotate: 0 },
            { spring: { stiffness: 200, damping: 12 } }
          );
        });
      }
    }
  }, [activeState]);

  return (
    <div 
      ref={ref}
      onClick={() => onClick(index)}
      className={`h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br ${index === activeState?.index ? 'from-pink-500 to-purple-600 border-white/40 shadow-pink-500/20 shadow-xl' : 'from-white/5 to-white/[0.01] hover:bg-white/10 border-white/10 hover:border-white/20'} border shadow-lg flex items-center justify-center cursor-pointer select-none transition-colors duration-300`}
    >
      <span className="text-xs font-mono text-white/40 tracking-widest">{index + 1}</span>
    </div>
  );
}

function MagneticOrb({ id, targetCoord }: { id: number; targetCoord: { x: number; y: number; ts: number } | null }) {
  const { ref, animate } = usePixonAnimate<HTMLDivElement>();

  useEffect(() => {
    if (!targetCoord) return;
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const parent = ref.current.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();

    // Centro atual do orb relativo ao container pai
    const currentX = (rect.left - parentRect.left) + rect.width / 2;
    const currentY = (rect.top - parentRect.top) + rect.height / 2;

    // Vetor do orb para a coordenada do clique
    const deltaX = targetCoord.x - currentX;
    const deltaY = targetCoord.y - currentY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance === 0) return;

    // Força gravitacional: atração elástica de 60% da distância rumo ao alvo
    const moveX = deltaX * 0.6;
    const moveY = deltaY * 0.6;

    // Atraso baseado na distância para criar um efeito de onda gravitacional
    const delay = Math.min(distance * 0.3, 200);

    const anim = animate(
      { translateX: moveX, translateY: moveY, scale: 1.35, rotate: 45 },
      { spring: { stiffness: 300, damping: 10 }, delay }
    );
    if (anim) {
      anim.finished.then(() => {
        animate(
          { translateX: 0, translateY: 0, scale: 1, rotate: 0 },
          { spring: { stiffness: 180, damping: 12 } }
        );
      });
    }
  }, [targetCoord]);

  const colors = [
    'from-cyan-500 to-blue-600 shadow-cyan-500/20 text-cyan-200',
    'from-pink-500 to-purple-600 shadow-pink-500/20 text-pink-200',
    'from-amber-500 to-orange-600 shadow-amber-500/20 text-amber-200',
    'from-emerald-500 to-teal-600 shadow-emerald-500/20 text-emerald-200',
    'from-violet-500 to-indigo-600 shadow-violet-500/20 text-violet-200',
  ];

  const positions = [
    { left: '15%', top: '25%' },
    { left: '35%', top: '55%' },
    { left: '50%', top: '20%' },
    { left: '70%', top: '65%' },
    { left: '85%', top: '35%' },
  ];

  return (
    <div 
      ref={ref}
      className={`absolute h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-tr ${colors[id % colors.length]} shadow-xl flex items-center justify-center border border-white/30 font-bold select-none cursor-pointer transition-shadow hover:shadow-2xl`}
      style={positions[id % positions.length]}
    >
      <Orbit className="h-6 w-6 animate-spin" style={{ animationDuration: `${4 + id}s` }} />
    </div>
  );
}

function PhysicsLabSection() {
  const { 
    ref: demoBoxRef, 
    animate: animateDemoBox, 
    pulse: pulseDemoBox, 
    shake: shakeDemoBox,
    jelly: jellyDemoBox,
    swing: swingDemoBox,
    drop: dropDemoBox
  } = usePixonAnimate<HTMLDivElement>();
  
  const [activePhysicsMode, setActivePhysicsMode] = useState<'idle' | 'spring' | 'pulse' | 'shake' | 'jelly' | 'swing' | 'drop' | 'cosmic' | 'orbit' | 'sonic' | 'stroke' | 'letters' | 'vortex' | 'glitch'>('idle');
  const [rippleState, setRippleState] = useState<{ index: number; ts: number } | null>(null);
  const [magneticTarget, setMagneticTarget] = useState<{ x: number; y: number; ts: number } | null>(null);
  const [selectedAnimCode, setSelectedAnimCode] = useState<string>(`// Clique em qualquer botão ao lado para inspecionar
// o código do motor físico em tempo real!

const anim = animateDemoBox(
  { scale: 1.35, rotate: 25 }, 
  { spring: { stiffness: 300, damping: 15 } }
);`);

  const handleTriggerSpring = async () => {
    setActivePhysicsMode('spring');
    setSelectedAnimCode(`// Standard Spring Encadeado
let anim = animateDemoBox(
  { scale: 1.35, rotate: 25 },
  { spring: { stiffness: 300, damping: 15 } }
);
if (anim) await anim.finished;

anim = animateDemoBox(
  { scale: 1, rotate: 0 },
  { spring: { stiffness: 180, damping: 8 } }
);`);
    // Phase 1: Pull/Stretch
    let anim = animateDemoBox(
      { scale: 1.35, rotate: 25 },
      { spring: { stiffness: 300, damping: 15 } }
    );
    if (anim) await anim.finished;
    
    // Phase 2: Snap back to rest with bouncy decay
    anim = animateDemoBox(
      { scale: 1, rotate: 0 },
      { spring: { stiffness: 180, damping: 8 } }
    );
    if (anim) await anim.finished;
    
    setActivePhysicsMode('idle');
  };

  const handleTriggerPulse = async () => {
    setActivePhysicsMode('pulse');
    setSelectedAnimCode(`// Physical Pulse (Impulso Harmônico)
const anim = pulseDemoBox(1.4);
if (anim) await anim.finished;`);
    const anim = pulseDemoBox(1.4);
    if (anim) await anim.finished;
    setActivePhysicsMode('idle');
  };

  const handleTriggerShake = async () => {
    setActivePhysicsMode('shake');
    setSelectedAnimCode(`// Physical Shake (Vibração Elástica)
const anim = shakeDemoBox(24);
if (anim) await anim.finished;`);
    const anim = shakeDemoBox(24);
    if (anim) await anim.finished;
    setActivePhysicsMode('idle');
  };

  const handleTriggerJelly = async () => {
    setActivePhysicsMode('jelly');
    setSelectedAnimCode(`// Physical Jelly (Squish & Stretch)
const anim = jellyDemoBox();
if (anim) await anim.finished;`);
    const anim = jellyDemoBox();
    if (anim) await anim.finished;
    setActivePhysicsMode('idle');
  };

  const handleTriggerSwing = async () => {
    setActivePhysicsMode('swing');
    setSelectedAnimCode(`// Physical Swing (Pêndulo com Decaimento)
// Requer: transformOrigin: 'top center'
const anim = swingDemoBox(35);
if (anim) await anim.finished;`);
    const anim = swingDemoBox(35);
    if (anim) await anim.finished;
    setActivePhysicsMode('idle');
  };

  const handleTriggerDrop = async () => {
    setActivePhysicsMode('drop');
    setSelectedAnimCode(`// Physical Drop (Queda e Impacto Amortecido)
const anim = dropDemoBox(60);
if (anim) await anim.finished;`);
    const anim = dropDemoBox(60);
    if (anim) await anim.finished;
    setActivePhysicsMode('idle');
  };

  const handleTriggerCosmic = async () => {
    setActivePhysicsMode('cosmic');
    setSelectedAnimCode(`// Physical Cosmic Combo (Matriz Complexa)
let anim = animateDemoBox(
  { scale: 1.4, rotate: 45, translateX: 60, translateY: -60 },
  { spring: { stiffness: 240, damping: 12 } }
);
if (anim) await anim.finished;

anim = animateDemoBox(
  { scale: 0.7, rotate: -35, translateX: -60, translateY: 60 },
  { spring: { stiffness: 280, damping: 10 } }
);
if (anim) await anim.finished;

anim = animateDemoBox(
  { scale: 1.25, rotate: 180, translateX: 45, translateY: -30 },
  { spring: { stiffness: 200, damping: 9 } }
);`);
    
    // Phase 1: Launch upward and rotate
    let anim = animateDemoBox(
      { scale: 1.4, rotate: 45, translateX: 60, translateY: -60 },
      { spring: { stiffness: 240, damping: 12 } }
    );
    if (anim) await anim.finished;

    // Phase 2: Slam down and squish to the left
    anim = animateDemoBox(
      { scale: 0.7, rotate: -35, translateX: -60, translateY: 60 },
      { spring: { stiffness: 280, damping: 10 } }
    );
    if (anim) await anim.finished;

    // Phase 3: Dynamic high rebound and full spin
    anim = animateDemoBox(
      { scale: 1.25, rotate: 180, translateX: 45, translateY: -30 },
      { spring: { stiffness: 200, damping: 9 } }
    );
    if (anim) await anim.finished;

    // Phase 4: Elastic snapping back to home coordinates
    anim = animateDemoBox(
      { scale: 1, rotate: 0, translateX: 0, translateY: 0 },
      { spring: { stiffness: 160, damping: 11 } }
    );
    if (anim) await anim.finished;

    setActivePhysicsMode('idle');
  };

  const handleTriggerOrbit = async () => {
    setActivePhysicsMode('orbit');
    setSelectedAnimCode(`// Physical Orbit (4 Quadrantes em Órbita)
let anim = animateDemoBox(
  { scale: 1.2, rotate: 90, translateX: 80, translateY: -80 },
  { spring: { stiffness: 220, damping: 12 } }
);
if (anim) await anim.finished;

anim = animateDemoBox(
  { scale: 1.0, rotate: 180, translateX: 80, translateY: 80 },
  { spring: { stiffness: 200, damping: 12 } }
);
if (anim) await anim.finished;

anim = animateDemoBox(
  { scale: 1.2, rotate: 270, translateX: -80, translateY: 80 },
  { spring: { stiffness: 220, damping: 12 } }
);`);
    
    // Orbit Quad 1: Top-Right
    let anim = animateDemoBox(
      { scale: 1.2, rotate: 90, translateX: 80, translateY: -80 },
      { spring: { stiffness: 220, damping: 12 } }
    );
    if (anim) await anim.finished;

    // Orbit Quad 2: Bottom-Right
    anim = animateDemoBox(
      { scale: 1.0, rotate: 180, translateX: 80, translateY: 80 },
      { spring: { stiffness: 200, damping: 12 } }
    );
    if (anim) await anim.finished;

    // Orbit Quad 3: Bottom-Left
    anim = animateDemoBox(
      { scale: 1.2, rotate: 270, translateX: -80, translateY: 80 },
      { spring: { stiffness: 220, damping: 12 } }
    );
    if (anim) await anim.finished;

    // Orbit Quad 4: Return Home
    anim = animateDemoBox(
      { scale: 1.0, rotate: 360, translateX: 0, translateY: 0 },
      { spring: { stiffness: 180, damping: 10 } }
    );
    if (anim) await anim.finished;

    setActivePhysicsMode('idle');
  };

  const handleTriggerSonic = async () => {
    setActivePhysicsMode('sonic');
    setSelectedAnimCode(`// Physical Sonic Blast (Compressão e Explosão)
let anim = animateDemoBox(
  { scale: 0.5, rotate: -15, translateY: -20 },
  { spring: { stiffness: 400, damping: 25 } }
);
if (anim) await anim.finished;

anim = shakeDemoBox(12);
if (anim) await anim.finished;

anim = animateDemoBox(
  { scale: 1.6, rotate: 15, translateY: 80 },
  { spring: { stiffness: 500, damping: 12 } }
);`);
    
    // Phase 1: Compress / Charge energy (squish and pull back)
    let anim = animateDemoBox(
      { scale: 0.5, rotate: -15, translateY: -20 },
      { spring: { stiffness: 400, damping: 25 } }
    );
    if (anim) await anim.finished;

    // Shake slightly while compressed to simulate charging
    anim = shakeDemoBox(12);
    if (anim) await anim.finished;

    // Phase 2: Sonic Blast (expand huge and slam down)
    anim = animateDemoBox(
      { scale: 1.6, rotate: 15, translateY: 80, translateX: 0 },
      { spring: { stiffness: 500, damping: 12 } }
    );
    if (anim) await anim.finished;

    // Phase 3: Bounce back to home
    anim = animateDemoBox(
      { scale: 1, rotate: 0, translateY: 0, translateX: 0 },
      { spring: { stiffness: 180, damping: 10 } }
    );
    if (anim) await anim.finished;

    setActivePhysicsMode('idle');
  };

  const handleTriggerStroke = async () => {
    setActivePhysicsMode('stroke');
    setSelectedAnimCode(`// SVG Stroke Pulse (Contorno Cibernético)
// Anima a espessura e escala elástica
let anim = animateDemoBox(
  { scale: 1.25, rotate: 10 },
  { spring: { stiffness: 350, damping: 10 } }
);
if (anim) await anim.finished;

anim = animateDemoBox(
  { scale: 1, rotate: 0 },
  { spring: { stiffness: 200, damping: 12 } }
);`);
    let anim = animateDemoBox(
      { scale: 1.25, rotate: 10 },
      { spring: { stiffness: 350, damping: 10 } }
    );
    if (anim) await anim.finished;

    anim = animateDemoBox(
      { scale: 1, rotate: 0 },
      { spring: { stiffness: 200, damping: 12 } }
    );
    if (anim) await anim.finished;
    setActivePhysicsMode('idle');
  };

  const handleTriggerLetters = async () => {
    setActivePhysicsMode('letters');
    setSelectedAnimCode(`// Text Character Wave (Letras Dançantes)
// Animação em cascata com mola física
let anim = animateDemoBox(
  { translateY: -35, rotate: -15, scale: 1.3 },
  { spring: { stiffness: 400, damping: 12 } }
);
if (anim) await anim.finished;

anim = animateDemoBox(
  { translateY: 0, rotate: 0, scale: 1 },
  { spring: { stiffness: 180, damping: 8 } }
);`);
    let anim = animateDemoBox(
      { translateY: -35, rotate: -15, scale: 1.3 },
      { spring: { stiffness: 400, damping: 12 } }
    );
    if (anim) await anim.finished;

    anim = animateDemoBox(
      { translateY: 0, rotate: 0, scale: 1 },
      { spring: { stiffness: 180, damping: 8 } }
    );
    if (anim) await anim.finished;
    setActivePhysicsMode('idle');
  };

  const handleTriggerVortex = async () => {
    setActivePhysicsMode('vortex');
    setSelectedAnimCode(`// Black Hole Vortex (Distorção Espaço-Tempo)
// Alta rigidez gravitacional e amortecimento
let anim = animateDemoBox(
  { scale: 0.2, rotate: -360 },
  { spring: { stiffness: 600, damping: 30 } }
);
if (anim) await anim.finished;

// Rebound explosivo
anim = animateDemoBox(
  { scale: 1.5, rotate: 720 },
  { spring: { stiffness: 300, damping: 10 } }
);
if (anim) await anim.finished;

anim = animateDemoBox(
  { scale: 1, rotate: 0 },
  { spring: { stiffness: 180, damping: 12 } }
);`);
    let anim = animateDemoBox(
      { scale: 0.2, rotate: -360 },
      { spring: { stiffness: 600, damping: 30 } }
    );
    if (anim) await anim.finished;

    anim = animateDemoBox(
      { scale: 1.5, rotate: 720 },
      { spring: { stiffness: 300, damping: 10 } }
    );
    if (anim) await anim.finished;

    anim = animateDemoBox(
      { scale: 1, rotate: 0 },
      { spring: { stiffness: 180, damping: 12 } }
    );
    if (anim) await anim.finished;
    setActivePhysicsMode('idle');
  };

  const handleTriggerGlitch = async () => {
    setActivePhysicsMode('glitch');
    setSelectedAnimCode(`// Cybernetic Glitch (Deslocamento Quântico)
// Saltos randômicos instantâneos com alta tensão de mola
let anim = animateDemoBox(
  { translateX: -90, translateY: 60, scale: 1.3, rotate: -25 },
  { spring: { stiffness: 800, damping: 10 } }
);
if (anim) await anim.finished;

anim = animateDemoBox(
  { translateX: 80, translateY: -70, scale: 0.6, rotate: 45 },
  { spring: { stiffness: 900, damping: 8 } }
);
if (anim) await anim.finished;

anim = animateDemoBox(
  { translateX: 0, translateY: 0, scale: 1, rotate: 0 },
  { spring: { stiffness: 400, damping: 12 } }
);`);
    let anim = animateDemoBox(
      { translateX: -90, translateY: 60, scale: 1.3, rotate: -25 },
      { spring: { stiffness: 800, damping: 10 } }
    );
    if (anim) await anim.finished;

    anim = animateDemoBox(
      { translateX: 80, translateY: -70, scale: 0.6, rotate: 45 },
      { spring: { stiffness: 900, damping: 8 } }
    );
    if (anim) await anim.finished;

    anim = animateDemoBox(
      { translateX: 0, translateY: 0, scale: 1, rotate: 0 },
      { spring: { stiffness: 400, damping: 12 } }
    );
    if (anim) await anim.finished;
    setActivePhysicsMode('idle');
  };

  return (
    <section id="physics-lab" className="py-24 relative border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.01]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      <Container>
        <Grid cols={1} gap={16} className="lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="neutral" className="bg-purple-500/10 border-purple-500/20 text-purple-300 px-3 py-1">
              <Activity className="h-3 w-3 mr-2 inline" /> Physical Springs Laboratory
            </Badge>
            <Heading as="h2" className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Sinta a Física do <br />
              <TextGradient from="from-purple-400" to="to-pink-600">PixonAnimate</TextGradient>
            </Heading>
            <Text className="text-lg text-white/50 leading-relaxed">
              Diferente de bibliotecas de animação comuns que interpolam de forma linear, o PixonAnimate integra equações diferenciais harmônicas amortecidas em tempo real.
            </Text>
            <Text className="text-base text-white/40 leading-relaxed">
              Clique nos controles ao lado para testar a mola tradicional e nossos novos algoritmos matemáticos de <strong>amortecimento de impacto (Pulse & Shake)</strong>. Eles respondem perfeitamente a interrupções sem saltos bruscos!
            </Text>

            {/* Live Interactive Code Block */}
            <div className="pt-4">
              <CopyBlock 
                code={selectedAnimCode} 
                language="typescript" 
                title="PixonAnimate Real-time Engine Code"
                variant="glass" 
                className="w-full border-purple-500/20 bg-purple-950/10"
              />
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center gap-8 bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-md">
            {/* Simulated Physics Viewport */}
            <div className="relative w-full h-80 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center overflow-hidden">
              <Background variant="grid" size={20} patternColor="rgba(255,255,255,0.08)" mask="fade" />
              
              {/* Glowing Track Point */}
              <div className="absolute h-1 w-full bg-white/5" />
              <div className="absolute w-1 h-full bg-white/5" />
                    {/* The Animating Physical Sandbox Node */}
              <div 
                ref={demoBoxRef}
                className={`relative h-28 w-28 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 shadow-lg flex items-center justify-center cursor-pointer select-none border border-white/20`}
                style={{ transformOrigin: activePhysicsMode === 'swing' ? 'top center' : 'center center' }}
              >
                {activePhysicsMode === 'stroke' ? (
                  <svg className="w-16 h-16 text-white animate-[dash_3s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" strokeDasharray="60" strokeDashoffset="0" />
                  </svg>
                ) : activePhysicsMode === 'letters' ? (
                  <div className="flex gap-1 font-black text-white text-xl tracking-widest">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>P</span>
                    <span className="animate-bounce" style={{ animationDelay: '100ms' }}>I</span>
                    <span className="animate-bounce" style={{ animationDelay: '200ms' }}>X</span>
                  </div>
                ) : activePhysicsMode === 'vortex' ? (
                  <Disc className="h-12 w-12 text-white animate-spin animate-pulse" />
                ) : activePhysicsMode === 'glitch' ? (
                  <Target className="h-12 w-12 text-cyan-200" />
                ) : (
                  <Flame className={`h-10 w-10 text-white transition-transform duration-300 ${activePhysicsMode !== 'idle' ? 'scale-110 rotate-6 text-pink-200' : ''}`} />
                )}
                
                {/* Mode Status Badge */}
                <div className="absolute -bottom-3 px-2 py-0.5 rounded-full bg-black/80 border border-white/10 text-[9px] font-mono tracking-widest text-purple-300 uppercase">
                  {activePhysicsMode}
                </div>
              </div>
            </div>
 
            {/* Physics Engine Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
              <Button 
                variant="outline" 
                className="border-white/10 hover:border-purple-500/40 bg-white/5 hover:bg-purple-500/10 text-xs py-5"
                onClick={handleTriggerSpring}
                disabled={activePhysicsMode !== 'idle'}
              >
                <RotateCw className="h-4 w-4 mr-2 text-purple-400" />
                Standard Spring
              </Button>
              <Button 
                variant="outline" 
                className="border-white/10 hover:border-pink-500/40 bg-white/5 hover:bg-pink-500/10 text-xs py-5"
                onClick={handleTriggerPulse}
                disabled={activePhysicsMode !== 'idle'}
              >
                <Play className="h-4 w-4 mr-2 text-pink-400" />
                Physical Pulse
              </Button>
              <Button 
                variant="outline" 
                className="border-white/10 hover:border-cyan-500/40 bg-white/5 hover:bg-cyan-500/10 text-xs py-5"
                onClick={handleTriggerShake}
                disabled={activePhysicsMode !== 'idle'}
              >
                <Activity className="h-4 w-4 mr-2 text-cyan-400" />
                Physical Shake
              </Button>
              <Button 
                variant="outline" 
                className="border-white/10 hover:border-violet-500/40 bg-white/5 hover:bg-violet-500/10 text-xs py-5"
                onClick={handleTriggerJelly}
                disabled={activePhysicsMode !== 'idle'}
              >
                <Layers className="h-4 w-4 mr-2 text-violet-400" />
                Physical Jelly
              </Button>
              <Button 
                variant="outline" 
                className="border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-emerald-500/10 text-xs py-5"
                onClick={handleTriggerSwing}
                disabled={activePhysicsMode !== 'idle'}
              >
                <Anchor className="h-4 w-4 mr-2 text-emerald-400" />
                Physical Swing
              </Button>
              <Button 
                variant="outline" 
                className="border-white/10 hover:border-orange-500/40 bg-white/5 hover:bg-orange-500/10 text-xs py-5"
                onClick={handleTriggerDrop}
                disabled={activePhysicsMode !== 'idle'}
              >
                <TrendingDown className="h-4 w-4 mr-2 text-orange-400" />
                Physical Drop
              </Button>
              <Button 
                variant="outline" 
                className="col-span-2 sm:col-span-3 border-purple-500/20 hover:border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 text-xs py-5 text-purple-300 font-bold"
                onClick={handleTriggerCosmic}
                disabled={activePhysicsMode !== 'idle'}
              >
                <Sparkles className="h-4 w-4 mr-2 text-purple-300 animate-pulse" />
                Physical Cosmic Combo (Complex Matrix)
              </Button>
              <Button 
                variant="outline" 
                className="col-span-1 border-emerald-500/20 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-xs py-5 text-emerald-300 font-bold"
                onClick={handleTriggerOrbit}
                disabled={activePhysicsMode !== 'idle'}
              >
                <Orbit className="h-4 w-4 mr-2 text-emerald-300 animate-spin" style={{ animationDuration: '6s' }} />
                Physical Orbit
              </Button>
              <Button 
                variant="outline" 
                className="col-span-2 border-orange-500/20 hover:border-orange-500 bg-orange-500/5 hover:bg-orange-500/10 text-xs py-5 text-orange-300 font-bold"
                onClick={handleTriggerSonic}
                disabled={activePhysicsMode !== 'idle'}
              >
                <Zap className="h-4 w-4 mr-2 text-orange-300" />
                Physical Sonic Blast
              </Button>
              <Button 
                variant="outline" 
                className="col-span-1 border-cyan-500/20 hover:border-cyan-500 bg-cyan-500/5 hover:bg-cyan-500/10 text-xs py-5 text-cyan-300 font-bold"
                onClick={handleTriggerStroke}
                disabled={activePhysicsMode !== 'idle'}
              >
                <RefreshCw className="h-4 w-4 mr-2 text-cyan-300" />
                SVG Stroke Pulse
              </Button>
              <Button 
                variant="outline" 
                className="col-span-1 border-pink-500/20 hover:border-pink-500 bg-pink-500/5 hover:bg-pink-500/10 text-xs py-5 text-pink-300 font-bold"
                onClick={handleTriggerLetters}
                disabled={activePhysicsMode !== 'idle'}
              >
                <Type className="h-4 w-4 mr-2 text-pink-300" />
                Dancing Text Letters
              </Button>
              <Button 
                variant="outline" 
                className="col-span-1 border-amber-500/20 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-xs py-5 text-amber-300 font-bold"
                onClick={handleTriggerVortex}
                disabled={activePhysicsMode !== 'idle'}
              >
                <Disc className="h-4 w-4 mr-2 text-amber-300" />
                Black Hole Vortex
              </Button>
              <Button 
                variant="outline" 
                className="col-span-3 border-teal-500/20 hover:border-teal-500 bg-teal-500/5 hover:bg-teal-500/10 text-xs py-5 text-teal-300 font-bold"
                onClick={handleTriggerGlitch}
                disabled={activePhysicsMode !== 'idle'}
              >
                <Target className="h-4 w-4 mr-2 text-teal-300 animate-pulse" />
                Cybernetic Glitch (Quantum Teleport)
              </Button>
            </div>

            {/* Staggered Propagation Demo (Quantum Ripple Grid) */}
            <div className="w-full mt-12 pt-12 border-t border-white/10 flex flex-col items-center">
              <Badge variant="neutral" className="bg-pink-500/10 border-pink-500/20 text-pink-300 px-3 py-1 mb-4">
                <Sparkles className="h-3 w-3 mr-2 inline" /> Reação em Cascata (Bug-Free Staggering)
              </Badge>
              <Heading as="h3" className="text-2xl font-bold text-center mb-2">
                Quantum Ripple Grid
              </Heading>
              <Text className="text-white/50 text-sm text-center max-w-md mb-8 leading-relaxed">
                Clique em qualquer bloco abaixo para acionar um pulso central. Graças à coreografia imperativa off-thread do PixonAnimate, os blocos vizinhos reagem com atraso elástico exato sem causar nenhum gargalo de renderização no React!
              </Text>

              <div className="grid grid-cols-3 gap-4 md:gap-6 p-6 bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-sm">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                  <RippleBox 
                    key={idx} 
                    index={idx} 
                    activeState={rippleState} 
                    onClick={(i) => {
                      setRippleState({ index: i, ts: Date.now() });
                      setSelectedAnimCode(`// Quantum Ripple Grid (Reação em Cascata)
// Alvo central pulsa; vizinhos calculam a distância de Manhattan
// e agendam a animação com delay exato nativo do WAAPI off-thread!

const distance = Math.abs(rowA - rowB) + Math.abs(colA - colB);

if (distance === 0) {
  pulse(1.35); // Pulso imediato no elemento clicado
} else {
  animate(
    { scale: 1.2, translateY: -12, rotate: 8 },
    { spring: { stiffness: 400, damping: 10 }, delay: distance * 80 }
  ); // Propagação escalonada nativa sem re-renders ou setTimeout!
}`);
                    }} 
                  />
                ))}
              </div>
            </div>

            {/* Gravitational Singularity Demo (Magnetic Orbs) */}
            <div className="w-full mt-12 pt-12 border-t border-white/10 flex flex-col items-center">
              <Badge variant="neutral" className="bg-amber-500/10 border-amber-500/20 text-amber-300 px-3 py-1 mb-4">
                <Target className="h-3 w-3 mr-2 inline" /> Gravitational Singularity Sandbox
              </Badge>
              <Heading as="h3" className="text-2xl font-bold text-center mb-2">
                Magnetic Orbs Field
              </Heading>
              <Text className="text-white/50 text-sm text-center max-w-md mb-8 leading-relaxed">
                Clique em qualquer lugar dentro da câmara de vácuo abaixo. Todos os orbes flutuantes calcularão a trajetória exata para as coordenadas do seu clique e serão atraídos gravitacionalmente com molas harmônicas!
              </Text>

              <div 
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  setMagneticTarget({ x, y, ts: Date.now() });
                  setSelectedAnimCode(`// Magnetic Orbs Field (Singularidade Gravitacional)
// Cálculo vetorial autônomo de trajetória elástica
const deltaX = targetCoord.x - currentOrbX;
const deltaY = targetCoord.y - currentOrbY;
const distance = Math.hypot(deltaX, deltaY);

// Atração elástica: move 60% da distância rumo ao alvo
const moveX = deltaX * 0.6;
const moveY = deltaY * 0.6;
const delay = Math.min(distance * 0.3, 200);

// Agendamento nativo limpo no motor WAAPI sem setTimeout
animate(
  { translateX: moveX, translateY: moveY, scale: 1.35, rotate: 45 },
  { spring: { stiffness: 300, damping: 10 }, delay }
);`);
                }}
                className="relative w-full h-80 bg-black/50 border border-white/10 rounded-3xl overflow-hidden cursor-crosshair shadow-inner flex items-center justify-center group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-teal-500/5 pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity" />
                <Background variant="grid" size={30} patternColor="rgba(255,255,255,0.06)" />
                
                {/* Crosshair indicator at click position */}
                {magneticTarget && (
                  <div 
                    className="absolute h-6 w-6 rounded-full border border-amber-400/80 animate-ping pointer-events-none"
                    style={{ left: magneticTarget.x - 12, top: magneticTarget.y - 12 }}
                  />
                )}

                {[0, 1, 2, 3, 4].map((idx) => (
                  <MagneticOrb key={idx} id={idx} targetCoord={magneticTarget} />
                ))}

                <span className="absolute bottom-4 text-[10px] text-white/20 uppercase tracking-[0.2em] pointer-events-none font-bold">
                  [ Click Anywhere in Container ]
                </span>
              </div>
            </div>
          </div>
        </Grid>
      </Container>
    </section>
  );
}

export function LandingPage({ onEnterGallery, onEnterSaaS }: LandingPageProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader variant="glass" text="INITIALIZING PIXONUI..." />;
  }

  return (
    <PageTransition preset="blur" duration={800}>
      <div className="relative min-h-screen w-full bg-[#030303] text-white overflow-x-hidden">
        {/* Background Effects */}
        <Background variant="mesh" animate className="opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
          <Container className="flex h-16 items-center justify-between">
            <motion.div 
              className="flex items-center gap-2.5 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20" />
              <span className="text-xl font-bold tracking-tight">PixonUI</span>
            </motion.div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
              <a href="#physics-lab" className="text-sm text-white/60 hover:text-white transition-colors">Physics Lab</a>
              <a href="#performance" className="text-sm text-white/60 hover:text-white transition-colors">Performance</a>
            </div>
            <div className="flex items-center gap-4">
              <Magnetic>
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                  <Github className="h-4 w-4 mr-2" /> GitHub
                </Button>
              </Magnetic>
              <Magnetic strength={0.2}>
                <GlowButton onClick={onEnterGallery} className="px-4 py-2 text-sm">
                  Explore Components
                </GlowButton>
              </Magnetic>
            </div>
          </Container>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
          </div>
          
          <Container>
            <Stack gap={8} align="center" className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                whileHover={{ y: -4 }}
              >
                <Badge variant="neutral" className="bg-white/5 border-white/10 text-cyan-400 px-4 py-1 rounded-full cursor-default select-none shadow-glow">
                  <Sparkles className="h-3 w-3 mr-2 inline animate-pulse" />
                  Version 0.1.0 is now live
                </Badge>
              </motion.div>

              <div className="space-y-4">
                <LetterPullup 
                  text="The Next Generation of"
                  className="text-4xl md:text-6xl font-bold tracking-tight text-white/70"
                />
                <HeroText 
                  title=""
                  highlight="Glassmorphic UI"
                  className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter"
                />
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.2 }}
              >
                <TextMotion 
                  type="word"
                  text="A high-performance, accessible, and beautifully crafted component library for React. Built with zero heavy dependencies and a focus on modern aesthetics."
                  className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed justify-center"
                  stagger={30}
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 16, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-6"
              >
                <Magnetic strength={0.3}>
                  <GlowButton className="px-10 h-16 text-xl" onClick={onEnterGallery}>
                    Explore Components <ArrowRight className="ml-2 h-6 w-6" />
                  </GlowButton>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-10 h-16 text-xl border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={onEnterSaaS}
                  >
                    <Rocket className="mr-2 h-6 w-6 text-cyan-500" />
                    View SaaS Demo
                  </Button>
                </Magnetic>
              </motion.div>
            </Stack>
          </Container>
        </section>

        {/* Stats Section */}
        <section id="performance" className="py-12 border-y border-white/5 bg-white/[0.02]">
          <Container>
            <Grid className="grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <Stack gap={1}>
                <div className="text-3xl md:text-4xl font-bold text-cyan-400">
                  <NumberTicker value={120} />
                  <span className="text-xl ml-1">FPS</span>
                </div>
                <Text className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Performance</Text>
              </Stack>
              <Stack gap={1}>
                <div className="text-3xl md:text-4xl font-bold text-purple-400">
                  <NumberTicker value={65} />
                  <span className="text-xl ml-1">+</span>
                </div>
                <Text className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Components</Text>
              </Stack>
              <Stack gap={1}>
                <div className="text-3xl md:text-4xl font-bold text-blue-400">
                  <NumberTicker value={0} />
                </div>
                <Text className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Dependencies</Text>
              </Stack>
              <Stack gap={1}>
                <div className="text-3xl md:text-4xl font-bold text-emerald-400">
                  <NumberTicker value={100} />
                  <span className="text-xl ml-1">%</span>
                </div>
                <Text className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Accessible</Text>
              </Stack>
            </Grid>
          </Container>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 relative">
          <Container>
            <div className="mb-20 text-center">
              <Reveal>
                <Heading as="h2" className="text-4xl md:text-5xl font-bold mb-6">
                  Built for <TextGradient from="from-cyan-400" to="to-blue-600">Modern Engineers</TextGradient>
                </Heading>
                <Text className="text-lg text-white/40 max-w-2xl mx-auto">Everything you need to build world-class interfaces in record time.</Text>
              </Reveal>
            </div>

            <Grid cols={1} gap={8} className="md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ type: 'spring', stiffness: 100, damping: 14 }}
                className="h-full cursor-pointer hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300"
              >
                <Surface className="p-10 h-full group hover:border-cyan-500/30 transition-all duration-500 hover:bg-white/[0.05] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-2xl rounded-full" />
                  <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <Zap className="h-7 w-7 text-cyan-400" />
                  </div>
                  <Heading as="h3" className="text-2xl font-bold mb-4">Ultra Performance</Heading>
                  <Text className="text-white/50 leading-relaxed text-lg">
                    Optimized for 120fps compositor interactions. Physics-based springs compile into off-thread WAAPI keyframes, freeing the main thread completely.
                  </Text>
                </Surface>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ type: 'spring', stiffness: 100, damping: 14, delay: 0.15 }}
                className="h-full cursor-pointer hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300"
              >
                <Surface className="p-10 h-full group hover:border-purple-500/30 transition-all duration-500 hover:bg-white/[0.05] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full" />
                  <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                    <Accessibility className="h-7 w-7 text-purple-400" />
                  </div>
                  <Heading as="h3" className="text-2xl font-bold mb-4">Pragmatic A11y</Heading>
                  <Text className="text-white/50 leading-relaxed text-lg">
                    Full keyboard navigation, focus trap primitives, and WAI-ARIA compliance baked directly into our markup. No compromise on accessibility.
                  </Text>
                </Surface>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ type: 'spring', stiffness: 100, damping: 14, delay: 0.3 }}
                className="h-full cursor-pointer hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300"
              >
                <Surface className="p-10 h-full group hover:border-blue-500/30 transition-all duration-500 hover:bg-white/[0.05] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full" />
                  <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <Palette className="h-7 w-7 text-blue-400" />
                  </div>
                  <Heading as="h3" className="text-2xl font-bold mb-4">Glassmorphism 2.0</Heading>
                  <Text className="text-white/50 leading-relaxed text-lg">
                    Vibrant, dark, high-end aesthetics featuring mouse-following glows, frosted borders, and interactive backdrop blur filtering.
                  </Text>
                </Surface>
              </motion.div>
            </Grid>
          </Container>
        </section>

        {/* 🧪 INTERACTIVE PHYSICS LAB SECTION */}
        <PhysicsLabSection />

        {/* Component Showcase Preview */}
        <section id="components" className="py-32 bg-white/[0.01] border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full -mr-64 -mt-64" />
          <Container>
            <Grid cols={1} gap={16} className="lg:grid-cols-2 items-center">
              <Stack gap={8}>
                <Reveal>
                  <Badge variant="neutral" className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400 px-4 py-1">
                    Interactive Components
                  </Badge>
                  <Heading as="h2" className="text-5xl md:text-6xl font-bold mt-6 leading-tight">
                    Complex logic, <br />
                    <ShinyText className="text-cyan-400">Simple API.</ShinyText>
                  </Heading>
                  <Text className="text-xl text-white/50 mt-8 leading-relaxed">
                    From advanced Kanban boards with multi-select to AI-ready prompt inputs. 
                    PixonUI handles the complexity so you can focus on your product.
                  </Text>
                  <div className="flex items-center gap-10 mt-12">
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white">65+</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Components</span>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white">0</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Heavy Deps</span>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white">100%</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">TypeScript</span>
                    </div>
                  </div>
                </Reveal>
              </Stack>

              <Reveal delay={0.4} className="relative">
                <Parallax speed={0.05}>
                  <div className="absolute -inset-8 bg-cyan-500/20 blur-[100px] rounded-full opacity-20 animate-pulse" />
                  <Surface className="relative aspect-video rounded-[2.5rem] overflow-hidden border-white/10 bg-black/40 backdrop-blur-3xl p-1.5 shadow-2xl group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="h-full w-full rounded-[2.3rem] bg-[#0a0a0a] p-8 flex flex-col gap-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="flex gap-2">
                          <div className="h-3.5 w-3.5 rounded-full bg-red-500/40" />
                          <div className="h-3.5 w-3.5 rounded-full bg-amber-500/40" />
                          <div className="h-3.5 w-3.5 rounded-full bg-green-500/40" />
                        </div>
                        <div className="h-6 w-40 rounded-full bg-white/5" />
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <Stack gap={5} align="center" className="w-full max-w-sm">
                          <div className="h-14 w-full rounded-2xl bg-white/5 animate-pulse" />
                          <div className="h-14 w-full rounded-2xl bg-white/5 animate-pulse delay-150" />
                          <div className="h-14 w-full rounded-2xl bg-white/5 animate-pulse delay-300" />
                        </Stack>
                      </div>
                    </div>
                  </Surface>
                </Parallax>
              </Reveal>
            </Grid>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-48 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/10 blur-[150px] rounded-full" />
          <Container className="relative z-10 text-center">
            <Reveal>
              <Heading as="h2" className="text-5xl md:text-8xl font-black mb-12 tracking-tighter">
                Ready to build the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">future of the web?</span>
              </Heading>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Magnetic strength={0.4}>
                  <GlowButton className="px-16 h-20 text-2xl" onClick={onEnterGallery}>
                    Start Building Now
                  </GlowButton>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <Button variant="ghost" size="lg" className="px-10 h-20 text-xl text-white/60 hover:text-white">
                    View on GitHub
                  </Button>
                </Magnetic>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-white/5 bg-black/60 backdrop-blur-xl">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600" />
                  <span className="text-2xl font-bold tracking-tight">PixonUI</span>
                </div>
                <Text className="text-white/40 max-w-sm text-lg leading-relaxed">
                  The most advanced glassmorphic component library for React. 
                  Built for speed, accessibility, and beauty.
                </Text>
              </div>
              <Stack gap={4}>
                <Text className="font-bold text-white uppercase tracking-widest text-xs">Resources</Text>
                <a href="#" className="text-white/40 hover:text-white transition-colors">Documentation</a>
                <a href="#" className="text-white/40 hover:text-white transition-colors">Components</a>
                <a href="#" className="text-white/40 hover:text-white transition-colors">Templates</a>
              </Stack>
              <Stack gap={4}>
                <Text className="font-bold text-white uppercase tracking-widest text-xs">Community</Text>
                <a href="#" className="text-white/40 hover:text-white transition-colors">GitHub</a>
                <a href="#" className="text-white/40 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-white/40 hover:text-white transition-colors">Discord</a>
              </Stack>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
              <Text className="text-sm text-white/20">
                © 2025 PixonUI. Built with passion for the community.
              </Text>
              <div className="flex gap-8">
                <a href="#" className="text-xs text-white/20 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-xs text-white/20 hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </Container>
        </footer>
      </div>
    </PageTransition>
  );
}
