import React, { useRef, useState } from 'react';
import { 
  Surface, 
  Heading, 
  Text, 
  Grid, 
  Stack, 
  Badge, 
  Button, 
  Confetti, 
  ConfettiRef, 
  RetroGrid, 
  Dock, 
  DockItem, 
  AnimatedList, 
  CopyBlock, 
  Gallery, 
  TestimonialCard,
  TestimonialGrid,
  SpotlightEffectCard,
} from '@pixonui/react';
import { 
  Sparkles, 
  Home, 
  Search, 
  MessageSquare, 
  Settings, 
  User, 
  Activity, 
  Terminal, 
  Heart,
  ChevronRight,
  Eye
} from 'lucide-react';

export function CreativeComponentsDemo() {
  const confettiRef = useRef<ConfettiRef>(null);
  const [listItems, setListItems] = useState([
    { id: 1, text: '🎉 Novo lead qualificado adicionado no funil', time: 'Justo agora', type: 'success' },
    { id: 2, text: '⚙️ Deploy automático de produção concluído', time: '2 min atrás', type: 'info' },
    { id: 3, text: '⚠️ Alerta de CPU elevado no servidor CDN-WEST', time: '12 min atrás', type: 'warning' },
  ]);

  const handleFireConfetti = () => {
    confettiRef.current?.fire({
      count: 80,
      spread: 60,
      gravity: 0.9
    });
  };

  const handleAddListItem = () => {
    const alerts = [
      '⚡ Nova conexão websocket estabelecida',
      '📈 Meta diária de faturamento atingida!',
      '📝 Perfil do cliente atualizado por Alex',
      '🔒 Sessão do usuário expirada no terminal'
    ];
    const types = ['success', 'info', 'warning', 'danger'];
    const randomIndex = Math.floor(Math.random() * alerts.length);
    const randomType = types[Math.floor(Math.random() * types.length)] || 'info';
    
    setListItems([
      { id: Date.now(), text: alerts[randomIndex] || 'Alerta', time: 'Justo agora', type: randomType },
      ...listItems
    ]);
  };

  const dockItems = [
    { label: 'Início', icon: <Home className="h-5 w-5" />, onClick: () => alert('Home clicado!') },
    { label: 'Busca', icon: <Search className="h-5 w-5" />, onClick: () => {} },
    { label: 'Mensagens', icon: <MessageSquare className="h-5 w-5" />, onClick: () => {} },
    { label: 'Análises', icon: <Activity className="h-5 w-5" />, onClick: () => {} },
    { label: 'Configurações', icon: <Settings className="h-5 w-5" />, onClick: () => {} },
  ];

  const galleryImages = [
    { src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600', alt: 'Abstract Gradient 1', title: 'Cosmic Shift' },
    { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600', alt: 'Abstract Gradient 2', title: 'Silk Waves' },
    { src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600', alt: 'Abstract Gradient 3', title: 'Carbon Lines' },
    { src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600', alt: 'Tech Terminal Neon', title: 'Grid Interface' }
  ];

  const testimonials = [
    {
      name: "Arthur Pendragon",
      role: "Lead Designer @ Camelot",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      content: "As animações de Spotlight e o Dock flutuante deram uma vida absurda para o nosso site promocional. O nível de detalhes e a performance são incríveis.",
      rating: 5
    },
    {
      name: "Diana Prince",
      role: "CTO @ Themyscira",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      content: "Estávamos céticos com animações de lista sob demanda, mas o AnimatedList superou todas as expectativas de frames. Nenhum lag sequer.",
      rating: 5
    }
  ];

  return (
    <Stack gap={10} className="w-full">
      <Confetti ref={confettiRef} />

      {/* Grid: Spotlight Effect & Interactive Confetti */}
      <Grid cols={1} gap={6} className="md:grid-cols-2">
        {/* Spotlight Effect Card */}
        <SpotlightEffectCard className="p-8 border border-white/5 bg-zinc-950/20 flex flex-col justify-between gap-6" glowBorder>
          <div className="space-y-2">
            <Badge variant="neutral" className="bg-purple-500/10 text-purple-400 border-purple-500/15 font-bold">
              Spotlight Card
            </Badge>
            <Heading as="h3" className="text-xl font-bold mt-2">Seguimento de Cursor Interativo</Heading>
            <Text className="text-sm text-zinc-400">
              Mova o cursor por cima deste card. Uma luz em gradiente radial seguirá exatamente sua posição em tempo real.
            </Text>
          </div>
          <div>
            <Button variant="glass" className="w-full text-xs text-purple-400 border-purple-500/10 hover:bg-purple-500/10">
              Inspecionar Efeito
            </Button>
          </div>
        </SpotlightEffectCard>

        {/* Confetti Celebration Button */}
        <Surface className="p-8 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/30 rounded-2xl flex flex-col justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="neutral" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/15 font-bold">
              Confetti Effect
            </Badge>
            <Heading as="h3" className="text-xl font-bold mt-2">Efeito de Celebração de Alta Performance</Heading>
            <Text className="text-sm text-zinc-400">
              Dispare explosões de confetes no canvas de forma controlada através de chamadas imperativas via ref.
            </Text>
          </div>
          <div>
            <Button 
              onClick={handleFireConfetti}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> Celebrar Vitória!
            </Button>
          </div>
        </Surface>
      </Grid>

      {/* Retro Grid Perspective Animation */}
      <section className="space-y-4">
        <div>
          <Heading as="h3" className="text-lg font-bold">Retro Grid perspective overlay</Heading>
          <Text className="text-xs text-zinc-400 mt-1">
            Grade nostálgica em perspectiva 3D com linhas infinitamente animadas para fundos de heróis e chamadas à ação.
          </Text>
        </div>
        <div className="relative rounded-2xl border border-gray-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/40 h-64 overflow-hidden flex items-center justify-center p-8">
          <RetroGrid className="opacity-30 dark:opacity-60" />
          <div className="relative z-10 text-center space-y-3">
            <Heading as="h4" className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              CYBERPUNK GRAPHICS
            </Heading>
            <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Animação nativa via CSS Grid de 60fps
            </Text>
          </div>
        </div>
      </section>

      {/* Staggered Animated List & Copy Block */}
      <Grid cols={1} gap={6} className="md:grid-cols-2">
        {/* AnimatedList */}
        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/30 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Heading as="h3" className="text-lg font-bold">Staggered Animated List</Heading>
              <Button size="sm" onClick={handleAddListItem} className="h-8 text-xs bg-purple-500/10 text-purple-400 border-purple-500/10 rounded-lg">
                Adicionar Evento
              </Button>
            </div>
            <Text className="text-xs text-zinc-400">
              Animações escalonadas de entrada controladas por transições de opacidade e deslocamento.
            </Text>
          </div>

          <AnimatedList stagger={60} duration={300} animation="fade-up" className="space-y-2.5 my-4">
            {listItems.map(item => (
              <div 
                key={item.id}
                className="p-3 border border-gray-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.01] rounded-xl flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                  {item.text}
                </div>
                <span className="text-[10px] text-zinc-400 whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </AnimatedList>
        </Surface>

        {/* Copy Block */}
        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/30 rounded-2xl space-y-4">
          <div>
            <Heading as="h3" className="text-lg font-bold">Copy Block component</Heading>
            <Text className="text-xs text-zinc-400 mt-1">
              Painel de visualização de código-fonte formatado com botão de cópia de clique único integrado.
            </Text>
          </div>

          <CopyBlock 
            code={`npm install @pixonui/react\n\nimport { Dock, Confetti } from '@pixonui/react';`}
            language="bash"
            lineNumbers={false}
          />

          <CopyBlock 
            code={`export function App() {\n  return (\n    <Confetti ref={confettiRef} />\n  );\n}`}
            language="typescript"
            lineNumbers
          />
        </Surface>
      </Grid>

      {/* Floating Glass Dock */}
      <section className="space-y-4">
        <div>
          <Heading as="h3" className="text-lg font-bold">Floating Glass Dock</Heading>
          <Text className="text-xs text-zinc-400 mt-1">
            Menu de ancoragem flutuante premium inspirado no macOS que expande e ressalta os ícones de acordo com a proximidade do cursor.
          </Text>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/20 py-10 flex items-center justify-center">
          <Dock variant="glass">
            {dockItems.map((item, idx) => (
              <DockItem key={idx} label={item.label} onClick={item.onClick}>
                {item.icon}
              </DockItem>
            ))}
          </Dock>
        </div>
      </section>

      {/* Lightbox Media Gallery */}
      <section className="space-y-4">
        <div>
          <Heading as="h3" className="text-lg font-bold">Interactive Media Gallery & Lightbox</Heading>
          <Text className="text-xs text-zinc-400 mt-1">
            Visualização de portfólio de imagens em grade com lightbox modal deslizável integrado para inspeção de alta qualidade.
          </Text>
        </div>
        <Gallery images={galleryImages} columns={4} gap={4} />
      </section>

      {/* Testimonial Masonry Grid */}
      <section className="space-y-4">
        <div>
          <Heading as="h3" className="text-lg font-bold">Masonry Testimonial Grid</Heading>
          <Text className="text-xs text-zinc-400 mt-1">
            Feed social de avaliações de clientes estruturado em alinhamento alinhado de alvenaria para máximo aproveitamento visual.
          </Text>
        </div>
        <TestimonialGrid testimonials={testimonials} columns={2} variant="glass" />
      </section>

    </Stack>
  );
}
