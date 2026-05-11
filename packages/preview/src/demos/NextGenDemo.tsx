import React, { useState } from 'react';
import { 
  Tilt, 
  InteractiveMeshGradient, 
  WaveformVisualizer, 
  ScrollSpy, 
  KanbanCard, 
  Button, 
  GlowButton, 
  Badge 
} from '@pixonui/react';
import { 
  Sparkles, 
  Eye, 
  Layers, 
  Activity, 
  Compass, 
  Clock, 
  User, 
  CheckCircle, 
  Flame, 
  AlertTriangle,
  Zap,
  Play,
  Pause
} from 'lucide-react';

export const NextGenDemo = () => {
  // Waveform state
  const [isPlaying1, setIsPlaying1] = useState(false);
  const [isPlaying2, setIsPlaying2] = useState(false);

  // Kanban tasks mock data with prediction details
  const mockTasks = [
    {
      id: 'task-1',
      columnId: 'development',
      title: 'Integração de Gateway Web3',
      description: 'Implementar a lógica de pagamento com smart contracts e verificação de assinaturas digitais.',
      priority: 'urgent' as const,
      tags: ['Web3', 'Blockchain', 'Solidity'],
      progress: 85,
      dueDate: 'Amanhã',
      timeSpent: 28800,
      comments: 12,
      attachments: 4,
      assignee: {
        id: 'user-1',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      },
      prediction: {
        risk: 'high' as const,
        message: 'Atraso provável devido a auditoria de auditor independente pendente.'
      }
    },
    {
      id: 'task-2',
      columnId: 'design',
      title: 'Redesign da Landing Page',
      description: 'Criar novas variações em glassmorphic, gradientes fluidos e suporte total a telas OLED de 120Hz.',
      priority: 'high' as const,
      tags: ['Design System', 'Aesthetic', 'Figma'],
      progress: 40,
      dueDate: 'Em 3 dias',
      timeSpent: 14400,
      comments: 6,
      attachments: 2,
      assignee: {
        id: 'user-2',
        name: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      },
      prediction: {
        risk: 'medium' as const,
        message: 'Risco moderado. Dependência de aprovação final do Product Manager.'
      }
    },
    {
      id: 'task-3',
      columnId: 'qa',
      title: 'Otimização de Renderização 120fps',
      description: 'Garantir que todos os micro-efeitos e gradientes rodem com estabilidade elite sem gargalos de CPU.',
      priority: 'medium' as const,
      tags: ['Performance', 'GPU', 'WAAPI'],
      progress: 95,
      dueDate: 'Hoje',
      timeSpent: 43200,
      comments: 3,
      attachments: 1,
      assignee: {
        id: 'user-3',
        name: 'Anderson Lima',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      },
      prediction: {
        risk: 'low' as const,
        message: 'No caminho correto. Todos os testes de estresse de GPU foram aprovados com sucesso.'
      }
    }
  ];

  // ScrollSpy items config
  const scrollSpyItems = [
    { id: 'sec-mesh', label: '1. Gradiente Fluido' },
    { id: 'sec-tilt', label: '2. Efeito de Perspectiva 3D' },
    { id: 'sec-waveform', label: '3. Amplitudes de Áudio' },
    { id: 'sec-kanban', label: '4. IA Preditiva no Kanban' },
  ];

  return (
    <div className="relative w-full flex flex-col lg:flex-row gap-8 items-start justify-between">
      {/* Central content showcase area */}
      <div className="flex-1 w-full flex flex-col gap-12 max-w-4xl">
        
        {/* Section 1: Mesh Gradient */}
        <section id="sec-mesh" className="relative p-8 rounded-3xl overflow-hidden border border-white/5 bg-slate-950/40 backdrop-blur-xl group">
          <div className="absolute top-4 right-4 z-20">
            <Badge variant="info" className="gap-1 bg-blue-500/10 border-blue-500/20 text-blue-400">
              <Sparkles className="h-3 w-3 animate-pulse" /> Gradiente WAAPI
            </Badge>
          </div>

          <div className="relative z-10 max-w-lg mb-8">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="text-blue-400 h-5 w-5" /> Interactive Mesh Gradient
            </h3>
            <p className="text-sm text-slate-400">
              Gradientes fluidos dinâmicos baseados no Web Animations API (WAAPI). Renderiza 6 cores vetoriais que se fundem em tempo real a 120fps de forma ultra-leve.
            </p>
          </div>

          {/* Gorgeous gradient container */}
          <div className="relative w-full h-[280px] rounded-2xl overflow-hidden border border-white/10 shadow-inner flex items-center justify-center">
            <InteractiveMeshGradient 
              colors={['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981']}
              speed={1.5}
            />
            
            {/* Overlay Glassmorphic Panel inside gradient to show premium usage */}
            <div className="relative z-10 p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 max-w-md text-center shadow-2xl">
              <span className="text-[10px] tracking-widest font-black uppercase text-blue-400">PixonUI Next-Gen</span>
              <h4 className="text-lg font-bold text-white mt-1 mb-2">Painel de Controle Fluido</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Coloque gradientes dinâmicos atrás de modais, landing pages ou dashboards para criar uma experiência sensorial inesquecível.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="glass" size="sm">Configurar</Button>
                <GlowButton>Ativar IA</GlowButton>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Tilt Card */}
        <section id="sec-tilt" className="relative p-8 rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <div className="absolute top-4 right-4">
            <Badge variant="warning" className="gap-1 bg-amber-500/10 border-amber-500/20 text-amber-400">
              <Eye className="h-3 w-3" /> Efeito 3D Giroscópio
            </Badge>
          </div>

          <div className="max-w-lg mb-8">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Compass className="text-amber-400 h-5 w-5" /> Interactive Tilt Container
            </h3>
            <p className="text-sm text-slate-400">
              Aplica física de perspectiva 3D realista a qualquer elemento filho com base no movimento do mouse. Oferece controle de amortecimento e profundidade do reflexo.
            </p>
          </div>

          {/* Side by side showcases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tilt Item 1: Glass Card */}
            <Tilt maxTilt={15} perspective={1000} scale={1.02} className="h-[240px]">
              <div className="h-full w-full rounded-2xl p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-md flex flex-col justify-between shadow-lg relative overflow-hidden group">
                <div className="absolute top-[-50px] right-[-50px] w-32 h-32 rounded-full bg-cyan-500/20 blur-3xl group-hover:bg-cyan-500/30 transition-all duration-500" />
                
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/10">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">3D-Perspective</span>
                </div>

                <div className="space-y-1.5 mt-auto">
                  <h4 className="text-base font-bold text-white leading-tight">Card Holográfico</h4>
                  <p className="text-xs text-slate-400">
                    Passe o mouse por cima para sentir o balanço realista e a reflexão da luz integrada.
                  </p>
                </div>
              </div>
            </Tilt>

            {/* Tilt Item 2: Gradient Card */}
            <Tilt maxTilt={12} scale={1.03} className="h-[240px]">
              <div className="h-full w-full rounded-2xl p-6 bg-gradient-to-tr from-purple-900/30 via-indigo-950/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-md flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-[-50px] right-[-50px] w-32 h-32 rounded-full bg-purple-500/35 blur-3xl group-hover:bg-purple-500/50 transition-all duration-500" />
                
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/10">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Premium Physical</span>
                </div>

                <div className="space-y-1.5 mt-auto">
                  <h4 className="text-base font-bold text-purple-300 leading-tight">Efeito Profundidade</h4>
                  <p className="text-xs text-slate-400">
                    Otimizado matematicamente para evitar retrabalhos na CPU, garantindo animações em 120hz perfeitas.
                  </p>
                </div>
              </div>
            </Tilt>
          </div>
        </section>

        {/* Section 3: Audio Waveform */}
        <section id="sec-waveform" className="relative p-8 rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <div className="absolute top-4 right-4">
            <Badge variant="success" className="gap-1 bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
              <Activity className="h-3 w-3" /> Waveform Amplitude
            </Badge>
          </div>

          <div className="max-w-lg mb-8">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="text-emerald-400 h-5 w-5" /> Voice Waveform Audio
            </h3>
            <p className="text-sm text-slate-400">
              Visualização de áudio em tempo real com amplitude escalável e controle de reprodução integrado. Estilo WhatsApp Premium com interatividade e micro-animações.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Waveform 1 */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1.5 font-medium"><User className="h-3.5 w-3.5" /> Mensagem de Voz de Sarah</span>
                <span className="font-mono text-[10px]">{isPlaying1 ? 'REPRODUZINDO' : 'PAUSADO'}</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsPlaying1(!isPlaying1)}
                  className="p-3 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex-shrink-0"
                >
                  {isPlaying1 ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 fill-cyan-400" />
                  )}
                </button>
                <WaveformVisualizer 
                  isActive={isPlaying1}
                  barCount={48}
                  color="#06b6d4"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Waveform 2 */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1.5 font-medium"><User className="h-3.5 w-3.5" /> Audio de Feedback do Cliente</span>
                <span className="font-mono text-[10px]">{isPlaying2 ? 'REPRODUZINDO' : 'PAUSADO'}</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsPlaying2(!isPlaying2)}
                  className="p-3 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.15)] flex-shrink-0"
                >
                  {isPlaying2 ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 fill-purple-400" />
                  )}
                </button>
                <WaveformVisualizer 
                  isActive={isPlaying2}
                  barCount={64}
                  color="#8b5cf6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Kanban predictive AI overlays */}
        <section id="sec-kanban" className="relative p-8 rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <div className="absolute top-4 right-4">
            <Badge variant="danger" className="gap-1 bg-red-500/10 border-red-500/20 text-red-400">
              <Flame className="h-3 w-3" /> IA Preditiva Integrada
            </Badge>
          </div>

          <div className="max-w-lg mb-8">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="text-red-400 h-5 w-5" /> Kanban Predictive Analytics Overlays
            </h3>
            <p className="text-sm text-slate-400">
              Sobreposição de badges e painéis de risco inteligentes em tempo real calculados por IA. Ajuda a prever gargalos de entrega, atrasos e bloqueios de workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {mockTasks.map((task) => (
              <div key={task.id} className="relative h-full">
                <KanbanCard 
                  task={task} 
                  showTimer={true}
                  selectable={true}
                />
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Floating Side ScrollSpy Navigation Area */}
      <div className="w-full lg:w-[240px] flex-shrink-0 sticky top-6">
        <ScrollSpy items={scrollSpyItems} />
        
        {/* Extra Info glass panel */}
        <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 flex flex-col gap-2.5">
          <span className="font-semibold text-white flex items-center gap-1 text-[11px] uppercase tracking-wider text-cyan-400">
            <Zap className="h-3.5 w-3.5" /> Performance Status
          </span>
          <p className="leading-relaxed">
            Todos os componentes foram submetidos a testes de estresse estritos. O ScrollSpy utiliza IntersectionObserver nativo de alta eficiência para evitar lag no DOM.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-300 font-semibold font-mono">120 FPS ESTÁVEL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
