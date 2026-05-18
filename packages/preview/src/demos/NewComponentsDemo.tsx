import React, { useState } from 'react';
import { 
  UserPreview, 
  Timeline, 
  TimelineItem, 
  FileDropzone, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription,
  ShinyText,
  TextInput,
  AdvancedSlider,
  BentoGrid,
  BentoCard,
  PricingGrid,
  PricingCard,
  Switch,
  cn,
  AdvancedSelect,
  Badge,
  WordReveal,
  Typewriter,
  BorderBeam,
  BackgroundGlow,
  Motion,
  MotionGroup,
  Select,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut
} from '@pixonui/react';
import { 
  Check, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Search, 
  Mail, 
  FileUp, 
  TrendingUp, 
  Shield, 
  Zap, 
  Layers, 
  Database,
  Users,
  ChevronDown,
  User,
  Plus,
  Play,
  Heart,
  Star,
  Rocket,
  Code2,
  Wand2,
  Settings,
  LogOut,
  Command
} from 'lucide-react';

export function NewComponentsDemo() {
  const [inputText, setInputText] = useState('');
  const [clearableText, setClearableText] = useState('PixonUI 2026');
  
  // New Select size and variant states
  const [sizeVal, setSizeVal] = useState<'sm' | 'md' | 'lg'>('md');
  const [variantVal, setVariantVal] = useState<'default' | 'ghost' | 'glass' | 'cyber'>('default');
  const [groupedSelection, setGroupedSelection] = useState('react');
  const [animatedSelectValue, setAnimatedSelectValue] = useState('react');

  // Dropdown Checkbox states
  const [showGrid, setShowGrid] = useState(true);
  const [showActivity, setShowActivity] = useState(false);
  const [showStatus, setShowStatus] = useState(true);

  // Dropdown Radio state
  const [themeSelection, setThemeSelection] = useState('system');

  // Advanced Slider States
  const [sliderVal, setSliderVal] = useState(45);
  const [customSliderVal, setCustomSliderVal] = useState(70);

  // Pricing Billing Switch State
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const billingPeriod = isAnnualBilling ? 'annual' : 'monthly';

  // Advanced Select States
  const [singleFramework, setSingleFramework] = useState('react');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['sarah', 'alex']);

  // Dismissible Badges State
  const [activeTags, setActiveTags] = useState(['Marketing', 'Design', 'SEO', 'Sales']);

  // Animation Trigger State
  const [revealKey, setRevealKey] = useState(0);

  const groupedFrameworkOptions = [
    { label: 'React', value: 'react', group: 'Frontend Frameworks' },
    { label: 'Vue.js', value: 'vue', group: 'Frontend Frameworks' },
    { label: 'Angular', value: 'angular', group: 'Frontend Frameworks' },
    { label: 'Svelte', value: 'svelte', group: 'Frontend Frameworks' },
    { label: 'Express.js', value: 'express', group: 'Backend Technologies' },
    { label: 'FastAPI', value: 'fastapi', group: 'Backend Technologies' },
    { label: 'NestJS', value: 'nestjs', group: 'Backend Technologies' },
    { label: 'Ruby on Rails', value: 'rails', group: 'Backend Technologies' },
  ];

  const frameworkOptions = [
    { label: 'React', value: 'react', description: 'Biblioteca componentizada para alta performance' },
    { label: 'Vue.js', value: 'vue', description: 'Framework progressivo altamente intuitivo' },
    { label: 'Angular', value: 'angular', description: 'Plataforma completa para grandes empresas' },
    { label: 'Svelte', value: 'svelte', description: 'Compilador ágil com zero runtime overhead' },
  ];

  const animatedFrameworkOptions = [
    { label: 'React', value: 'react', group: 'Frontend' },
    { label: 'Vue.js', value: 'vue', group: 'Frontend' },
    { label: 'Angular', value: 'angular', group: 'Frontend' },
    { label: 'Svelte', value: 'svelte', group: 'Frontend' },
    { label: 'Next.js', value: 'next', group: 'Meta Frameworks' },
    { label: 'Remix', value: 'remix', group: 'Meta Frameworks' },
  ];

  const memberOptions = [
    { label: 'Sarah Wilson', value: 'sarah', description: 'Designer de UI/UX Sênior', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { label: 'Alex Chen', value: 'alex', description: 'Engenheiro de Software Principal', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { label: 'Emma Watson', value: 'emma', description: 'Diretora de Tecnologia (CTO)', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    { label: 'David Miller', value: 'david', description: 'Gestor de Comunidade & SEO', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  ];

  const handleRemoveTag = (tagToRemove: string) => {
    setActiveTags(activeTags.filter(tag => tag !== tagToRemove));
  };

  const handleResetTags = () => {
    setActiveTags(['Marketing', 'Design', 'SEO', 'Sales']);
  };

  return (
    <div className="space-y-12 max-w-5xl pb-16">
      {/* 1. ADVANCED HISTOGRAM SLIDER DEMO */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <CardTitle>Slider Avançado de Densidade</CardTitle>
          </div>
          <CardDescription>
            Controles deslizantes premium com histogramas de barras de distribuição dinâmica de dados e tooltips que flutuam acompanhando o nº em tempo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4 p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Estilo Densidade de Preços
                </span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  Faixa Selecionada: {sliderVal}%
                </span>
              </div>
              <AdvancedSlider
                value={sliderVal}
                onChange={setSliderVal}
                min={0}
                max={100}
                suffix="%"
                bars={[10, 20, 30, 45, 60, 55, 40, 65, 80, 95, 85, 70, 50, 40, 25, 30, 45, 60, 75, 90, 100, 80, 45, 20]}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-2">
                As barras verticais representam faixas de dados ou contagem de itens em cada coordenada, acendendo gradativamente com gradientes de cores modernas.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Calculadora de Limite de Tráfego
                </span>
                <span className="text-sm font-bold text-indigo-500">
                  {customSliderVal} GB / mo
                </span>
              </div>
              <AdvancedSlider
                value={customSliderVal}
                onChange={setCustomSliderVal}
                min={10}
                max={200}
                step={5}
                suffix=" GB"
                bars={[80, 75, 70, 60, 50, 45, 40, 35, 30, 25, 20, 18, 15, 12, 10, 8, 5, 4, 3, 2, 1]}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-2">
                Suporta intervalos customizados por etapas (`step`), rótulos avançados, prefixos/sufixos de unidades, e drag-and-drop robusto em mobile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. ADVANCED SELECTS & PREMIUM BADGES */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            <CardTitle>Selects & Badges Avançados (Elite Elements)</CardTitle>
          </div>
          <CardDescription>
            Dropdowns inteligentes com filtros de busca rápidos, fotos/subtítulos integrados, e chips de Badges interativos dismissible ou com dots de status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Advanced Select Column */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Dropdown Select Avançado
              </h3>

              <AdvancedSelect
                label="Seleção Única com Descrição"
                options={frameworkOptions}
                value={singleFramework}
                onChange={setSingleFramework}
                searchable={true}
                placeholder="Escolha um framework"
                menuAnimation="slide"
              />

              <AdvancedSelect
                label="Multi-Seleção com Avatares (Tags de Time)"
                options={memberOptions}
                value={selectedMembers}
                onChange={setSelectedMembers}
                multiple={true}
                searchable={true}
                clearable={true}
                placeholder="Atribuir equipe..."
                menuAnimation="slide"
              />
            </div>

            {/* Premium Badges Column */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Badges de Alta Fidelidade
              </h3>

              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">Estilos & Variantes Premium:</span>
                <div className="flex flex-wrap gap-2.5">
                  <Badge variant="default">Padrão</Badge>
                  <Badge variant="glass">Glassmorphic</Badge>
                  <Badge variant="gradient">Vibrant Gradient</Badge>
                  <Badge variant="cyber">Cyber Glow</Badge>
                  <Badge variant="shimmer">Metallic Shimmer</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block">Dots de Status Pulsantes (Live indicators):</span>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="glass" dot={true}>Live Server</Badge>
                  <Badge variant="glass" dot={true} dotColor="bg-emerald-500">Operational</Badge>
                  <Badge variant="glass" dot={true} dotColor="bg-rose-500">Critical Error</Badge>
                  <Badge variant="glass" dot={true} dotColor="bg-amber-500">Pending Sync</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex justify-between items-center">
                  <span>Chips de Filtros Limpáveis (Dismissible):</span>
                  {activeTags.length < 4 && (
                    <button 
                      onClick={handleResetTags}
                      className="text-[10px] text-purple-500 hover:underline font-bold"
                    >
                      Resetar Chips
                    </button>
                  )}
                </span>
                <div className="flex flex-wrap gap-2 min-h-[32px]">
                  {activeTags.length === 0 ? (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">Nenhum filtro ativo.</span>
                  ) : (
                    activeTags.map(tag => (
                      <Badge
                        key={tag}
                        variant="glass"
                        dismissible={true}
                        onDismiss={() => handleRemoveTag(tag)}
                        className="bg-purple-50/50 dark:bg-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/10"
                      >
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2.1. DROPDOWNS & SELECTS VARIATIONS SHOWCASE */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle>Novos Estilos de Dropdowns & Selects (Multi-Variants)</CardTitle>
          </div>
          <CardDescription>
            Experimente em tempo real as novas opções de personalização para dropdowns e selects: variando de tamanhos, estilos visuais de alta fidelidade, categorização de grupos e itens com caixas de marcação (Checkbox/Radio).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Real-time Customizer Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            
            {/* Left Column: Interactive Select Customizer */}
            <div className="space-y-6 p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Customizador de Select em Tempo Real
                </h3>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-200 dark:border-white/5">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Escolha o Tamanho:</span>
                  <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 text-xs font-semibold">
                    {(['sm', 'md', 'lg'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSizeVal(sz)}
                        className={cn(
                          "flex-1 py-1 rounded-md transition-all uppercase",
                          sizeVal === sz 
                            ? "bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm" 
                            : "text-zinc-400 hover:text-zinc-500"
                        )}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Escolha o Estilo:</span>
                  <Select
                    options={[
                      { label: 'Padrão (Default)', value: 'default' },
                      { label: 'Ghostly Flat', value: 'ghost' },
                      { label: 'Glassmorphic Glass', value: 'glass' },
                      { label: 'Cyber Neon', value: 'cyber' },
                    ]}
                    value={variantVal}
                    onChange={(val) => setVariantVal(val as any)}
                    size="sm"
                  />
                </div>
              </div>

              {/* Dynamic Live Previews */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Live Select Preview:</span>
                <Select
                  label="Select Simples com Tamanho e Estilo Dinâmicos"
                  options={groupedFrameworkOptions}
                  value={groupedSelection}
                  onChange={setGroupedSelection}
                  size={sizeVal}
                  variant={variantVal}
                  menuAnimation="slide"
                />

                <AdvancedSelect
                  label="Advanced Select com Multi-Tags e Filtro Integrado"
                  options={groupedFrameworkOptions}
                  value={groupedSelection}
                  onChange={setGroupedSelection}
                  size={sizeVal}
                  variant={variantVal}
                  searchable={true}
                  clearable={true}
                  menuAnimation="slide"
                />

                <div className="rounded-2xl border border-purple-500/10 bg-purple-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">Select Animado</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Portal fixo + scroll Pixon + entrada slide.</p>
                    </div>
                    <Badge variant="glass" className="text-[10px] uppercase tracking-wider">menuAnimation="slide"</Badge>
                  </div>
                  <Select
                    label="Framework com animação"
                    options={animatedFrameworkOptions}
                    value={animatedSelectValue}
                    onChange={setAnimatedSelectValue}
                    placeholder="Escolha um framework"
                    menuAnimation="slide"
                    size="lg"
                    variant="glass"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Premium Dropdown Menu with Checkbox & Radio items */}
            <div className="space-y-6 p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Menu de Ações com Checkbox &amp; Radio
              </h3>

              <div className="space-y-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  O componente de Overlay `DropdownMenu` de elite agora possui controle completo para itens booleanos (Checkbox) e de seleção mutuamente exclusiva (Radio Groups).
                </p>

                <div className="flex gap-4">
                  {/* Dropdown 1: Actions & Shortcuts */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/10">
                      Menu de Atalhos
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Configurações Rápidas</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <span>Nova Janela</span>
                        <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Salvar Projeto</span>
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <span>Exportar PDF</span>
                        <DropdownMenuShortcut>⌥⌘E</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600">
                        <span>Excluir Tudo</span>
                        <DropdownMenuShortcut>⇧⌘⌫</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Dropdown 2: Checkboxes */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors">
                      Exibição (Checkboxes)
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Alternar Elementos</DropdownMenuLabel>
                      <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
                        Mostrar Grid Bento
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked={showActivity} onCheckedChange={setShowActivity}>
                        Status Pulsante Live
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked={showStatus} onCheckedChange={setShowStatus}>
                        Mostrar Tags de Time
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Dropdown 3: Radios */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                      Tema (Radio Group)
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Selecione o Tema</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={themeSelection} onValueChange={setThemeSelection}>
                        <DropdownMenuRadioItem value="light">Claro (Light)</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="dark">Escuro (Dark)</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="system">Sistema (System)</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Display Current Dropdown States in modern badge rows */}
                <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-white/5">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Valores Atuais dos Dropdowns:</span>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg border",
                      showGrid ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : "bg-zinc-100 border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800"
                    )}>
                      Grid: {showGrid ? 'Visível' : 'Oculto'}
                    </span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg border",
                      showActivity ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : "bg-zinc-100 border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800"
                    )}>
                      Status Live: {showActivity ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg border",
                      showStatus ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : "bg-zinc-100 border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800"
                    )}>
                      Tags Time: {showStatus ? 'Mostrar' : 'Ocultar'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg border bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-300 capitalize">
                      Tema: {themeSelection}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* 2.5. PREMIUM EFFECTS & ANIMATIONS (ELITE MICRO-INTERACTIONS) */}
      <Card className="relative overflow-hidden">
        {/* Animated Background Ambient Glows */}
        <BackgroundGlow 
          color="rgba(168, 85, 247, 0.12)" 
          colorSecondary="rgba(236, 72, 153, 0.08)" 
        />

        <CardHeader className="relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
            <CardTitle>Animações de Alta Fidelidade (Elite Micro-interactions)</CardTitle>
          </div>
          <CardDescription>
            Efeitos visuais fluidos e tipografias interativas com aceleração de hardware nativa (zero dependências pesadas externas).
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8 relative z-10">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Col 1: Typography Effects */}
            <div className="space-y-6 p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Efeitos de Texto Dinâmicos
                </h3>
                <button
                  onClick={() => setRevealKey(prev => prev + 1)}
                  className="text-xs text-purple-500 hover:text-purple-400 hover:underline font-bold flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <Sparkles size={12} /> Animar Novamente
                </button>
              </div>

              {/* Sequential WordReveal */}
              <div className="py-4 border-b border-zinc-200/50 dark:border-white/5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Word Reveal (Apple-style):</span>
                <WordReveal 
                  key={revealKey}
                  text="Interfaces rápidas, componentes modulares e animações fluidas para produtos digitais de alta escala."
                  className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-left justify-start"
                  delay={0.06}
                />
              </div>

              {/* Typewriter Looper */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Typewriter (Loop de Tags):</span>
                <div className="h-12 flex items-center">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium mr-2">Nós construímos</span>
                  <Typewriter 
                    words={[
                      "Interfaces Ultra-premium.",
                      "Efeitos com FPS Máximo.",
                      "Experiências SaaS de Elite.",
                      "Design Responsivo e Lindo."
                    ]}
                    speed={70}
                    deleteSpeed={35}
                    delay={2200}
                    className="text-base font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Col 2: Container/Border Laser Effects */}
            <div className="space-y-6 p-6 rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
                  Efeitos de Contorno & Glow
                </h3>

                {/* Laser Border Beam Card */}
                <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] p-6">
                  {/* Neon border laser tracing effect */}
                  <BorderBeam 
                    duration={6} 
                    borderWidth={2}
                    colorFrom="#a855f7" 
                    colorTo="#3b82f6" 
                    beamSize={100}
                  />
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-purple-500 animate-ping" />
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        Laser Border Beam Ativo
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      Rastreamento de Borda Ativo
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Um feixe contínuo de laser neon que corre pela borda externa usando máscaras de padding CSS. 100% livre de loop JS!
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-zinc-200/50 dark:border-white/5">
                💡 <strong className="text-zinc-600 dark:text-zinc-300">Dica Premium:</strong> Os efeitos de contorno funcionam sobre qualquer formato que herde `rounded-[inherit]`, adaptando-se automaticamente a botões, chips ou cards!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2.75. MOTION SYSTEM SHOWCASE (Ultimate Animation Engine) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-500" />
            <CardTitle>Motion System (Engine de Animações Universal)</CardTitle>
          </div>
          <CardDescription>
            Crie animações personalizadas de complexidade ilimitada com a API mais simples possível. Sem Framer Motion, sem GSAP — apenas CSS nativo acelerado por GPU.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Row 1: Custom from/to + hover/tap */}
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Transições Customizadas com Hover &amp; Tap:</span>
            <div className="grid gap-4 md:grid-cols-3">
              <Motion
                from={{ opacity: 0, y: 30, scale: 0.9, blur: 8 }}
                to={{ opacity: 1, y: 0, scale: 1, blur: 0 }}
                hover={{ scale: 1.05, y: -5 }}
                tap={{ scale: 0.97 }}
                duration={600}
                easing="apple"
              >
                <div className="p-5 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/10 rounded-2xl cursor-pointer">
                  <Rocket className="h-5 w-5 text-purple-400 mb-2" />
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-white">Hover Magnético</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Passe o mouse e clique para sentir a interação elástica.</p>
                </div>
              </Motion>

              <Motion
                from={{ opacity: 0, x: -40, rotate: -5 }}
                to={{ opacity: 1, x: 0, rotate: 0 }}
                hover={{ rotate: 3, scale: 1.03 }}
                duration={700}
                delay={150}
                easing="spring"
              >
                <div className="p-5 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/10 rounded-2xl cursor-pointer">
                  <Heart className="h-5 w-5 text-pink-400 mb-2" />
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-white">Slide + Rotação</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Desliza da esquerda com rotação suave e spring natural.</p>
                </div>
              </Motion>

              <Motion
                from={{ opacity: 0, scale: 0.5, blur: 12 }}
                to={{ opacity: 1, scale: 1, blur: 0 }}
                hover={{ scale: 1.08, boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.25)' }}
                duration={500}
                delay={300}
                easing="bounce"
              >
                <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/10 rounded-2xl cursor-pointer">
                  <Star className="h-5 w-5 text-cyan-400 mb-2" />
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-white">Bounce + Glow</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Efeito de pulo com hover que gera shadow-glow premium.</p>
                </div>
              </Motion>
            </div>
          </div>

          {/* Row 2: Keyframes (complex multi-step) */}
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Keyframes Multi-Step (Animações Complexas):</span>
            <div className="grid gap-4 md:grid-cols-2">
              <Motion
                keyframes={[
                  { opacity: 0, y: 40, scale: 0.7, rotate: -10 },
                  { opacity: 1, y: -10, scale: 1.1, rotate: 3 },
                  { opacity: 1, y: 0, scale: 1, rotate: 0 },
                ]}
                duration={900}
                easing="spring"
              >
                <div className="p-5 bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">3 Etapas de Keyframe</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Este card executa uma sequência de 3 keyframes: surgir rotacionado → sobre-escalar → pousar suavemente no lugar.</p>
                </div>
              </Motion>

              <Motion
                keyframes={[
                  { y: 0, scale: 1 },
                  { y: -12, scale: 1.02 },
                  { y: 0, scale: 1 },
                ]}
                loop
                duration={2500}
                easing="ease-in-out"
              >
                <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/10 rounded-2xl text-center">
                  <Play className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-white">Loop Infinito</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Flutuação contínua suave — perfeita para ícones, FABs ou indicadores.</p>
                </div>
              </Motion>
            </div>
          </div>

          {/* Row 3: MotionGroup Stagger */}
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Stagger de Grupo (Cascata Sequencial):</span>
            <MotionGroup stagger={120} delay={0}>
              {['Performance Extrema', 'Zero Dependências', 'API Declarativa', 'GPU Nativa'].map((text, i) => (
                <Motion
                  key={text}
                  from={{ opacity: 0, x: -30, blur: 6 }}
                  to={{ opacity: 1, x: 0, blur: 0 }}
                  hover={{ x: 8 }}
                  duration={500}
                  easing="apple"
                >
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200/50 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.015] mb-2 cursor-pointer transition-colors hover:bg-purple-50/50 dark:hover:bg-purple-500/5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-sm font-black text-purple-500">
                      {i + 1}
                    </div>
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{text}</span>
                  </div>
                </Motion>
              ))}
            </MotionGroup>
          </div>

          {/* API Examples */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-white/5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3">✍️ Como escrever:</span>
            <pre className="text-[11px] text-zinc-400 leading-relaxed overflow-x-auto">
{`<Motion
  from={{ opacity: 0, y: 30, blur: 8 }}
  to={{ opacity: 1, y: 0, blur: 0 }}
  hover={{ scale: 1.05 }}
  tap={{ scale: 0.97 }}
  duration={500}
  easing="apple"
>
  <Card>Conteúdo animado</Card>
</Motion>`}
            </pre>
          </div>
        </CardContent>
      </Card>


      {/* 3. PREMIUM BENTO GRID SHOWCASE */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-purple-500" />
            Grid Bento Layout Apple-Style
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Layouts assimétricos de grade bento premium com detecção inteligente de mouse, refletores de borda e spotlights que seguem o cursor.
          </p>
        </div>

        <BentoGrid className="auto-rows-[18rem]">
          <BentoCard
            name="Performance Turbinada"
            description="Algoritmos acelerados por hardware garantem renderização fluida e zero latência."
            colSpan="md:col-span-2"
            Icon={Zap}
            cta="Ver relatórios de velocidade"
            spotlightColor="rgba(168, 85, 247, 0.15)"
            background={
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-indigo-500/5 dark:from-purple-500/20 dark:to-transparent" />
            }
          />
          <BentoCard
            name="Criptografia de Elite"
            description="Segurança máxima de ponta a ponta para seus dados confidenciais."
            colSpan="md:col-span-1"
            Icon={Shield}
            cta="Documentação técnica"
            spotlightColor="rgba(59, 130, 246, 0.15)"
            background={
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
            }
          />
          <BentoCard
            name="Sincronização de Banco de Dados"
            description="Espelhe e replique pipelines de dados dinamicamente com atualizações instantâneas via WebSockets."
            colSpan="md:col-span-1"
            Icon={Database}
            cta="Conectar bases"
            spotlightColor="rgba(236, 72, 153, 0.15)"
            background={
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-transparent" />
            }
          />
          <BentoCard
            name="Colaboração Multi-agentes"
            description="Coordene múltiplos agentes autônomos simultâneos trabalhando de forma integrada na sua conta."
            colSpan="md:col-span-2"
            Icon={Users}
            cta="Iniciar simulação"
            spotlightColor="rgba(34, 197, 94, 0.15)"
            background={
              <div className="absolute inset-0 bg-gradient-to-tl from-green-500/5 via-transparent to-emerald-500/5" />
            }
          />
        </BentoGrid>
      </div>

      {/* 4. INTERACTIVE SAAS PRICING TABLES */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              Tabela de Preços SaaS Interativa
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Grade de preços totalmente integrada com sliders para cálculo de assentos e tags flutuantes.
            </p>
          </div>

          {/* Monthly/Annual Billing Switcher */}
          <div className="flex items-center gap-3 bg-zinc-100 dark:bg-white/[0.04] p-1.5 rounded-full border border-zinc-200 dark:border-white/5 self-start md:self-auto">
            <span className={cn(
              "text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition-all",
              !isAnnualBilling ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-400"
            )}
            onClick={() => setIsAnnualBilling(false)}
            >
              Mensal
            </span>
            <span className={cn(
              "text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition-all inline-flex items-center gap-1.5",
              isAnnualBilling ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-400"
            )}
            onClick={() => setIsAnnualBilling(true)}
            >
              Anual
              <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded-md font-bold scale-90">
                -20%
              </span>
            </span>
          </div>
        </div>

        <PricingGrid>
          <PricingCard
            name="Essencial"
            description="Ferramentas fundamentais para pequenos times iniciarem sua automação."
            priceMonthly={29}
            priceAnnual={22}
            billingPeriod={billingPeriod}
            buttonText="Começar de Graça"
            buttonVariant="outline"
            features={[
              "Até 3 canais integrados",
              "1.500 mensagens por mês",
              "Painel básico de relatórios",
              { text: "Histórico estendido de conversas", included: false },
              { text: "Suporte 24h dedicado", included: false }
            ]}
          />

          <PricingCard
            name="Professional"
            description="Escalabilidade confiável e insights aprofundados para o seu negócio."
            priceMonthly={79}
            priceAnnual={59}
            billingPeriod={billingPeriod}
            badge="Mais Vendido"
            buttonText="Obter Professional"
            buttonVariant="cyber"
            enableCalculator={true}
            calculatorLabel="Membros"
            calculatorMin={2}
            calculatorMax={50}
            calculatorDefault={5}
            calculatorPricePerUnit={6}
            features={[
              "Canais integrados ilimitados",
              "Mensagens ilimitadas",
              "Relatórios analíticos em tempo real",
              "Controle de fila de atendimento",
              "Sincronização offline",
              "Suporte técnico prioritário"
            ]}
          />

          <PricingCard
            name="Custom Corporate"
            description="Atendimento e segurança sob medida para grandes corporações."
            priceMonthly={199}
            priceAnnual={149}
            billingPeriod={billingPeriod}
            buttonText="Falar com Especialista"
            buttonVariant="shine"
            features={[
              "Tudo no plano Professional",
              "Infraestrutura dedicada de alta performance",
              "SSO e logs de auditoria corporativos",
              "Suporte VIP 24/7",
              "SLA garantido em contrato"
            ]}
          />
        </PricingGrid>
      </div>

      <div className="h-px bg-zinc-200 dark:bg-white/5 w-full my-4" />

      {/* SHINY TEXT DEMO (PREVIOUS SUCCESSFUL IMPL) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <CardTitle>Shiny Text (Efeito Shimmer)</CardTitle>
          </div>
          <CardDescription>
            Tipografia interativa premium com varredura de luz (shimmer) e brilho retroiluminado (glow).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Predefinições Premium</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Gold Metallic:</span>
                <ShinyText variant="gold" className="text-lg font-bold">Ouro Imperial</ShinyText>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Neon Cyan-Pink:</span>
                <ShinyText variant="neon" className="text-lg font-bold">Retro Cyberpunk</ShinyText>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Sunset Horizon:</span>
                <ShinyText variant="sunset" className="text-lg font-bold">Warm Horizon</ShinyText>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Cyber Acid:</span>
                <ShinyText variant="cyber" className="text-lg font-bold">Cyber Acid-lime</ShinyText>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Spectrum Rainbow:</span>
                <ShinyText variant="rainbow" className="text-lg font-bold">Spectrum Sweep</ShinyText>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Recursos Interativos</h4>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Shimmer Glow Backing</span>
                <div className="flex gap-4">
                  <ShinyText variant="gold" glow className="text-base font-bold">Gold Glow</ShinyText>
                  <ShinyText variant="neon" glow className="text-base font-bold">Neon Glow</ShinyText>
                  <ShinyText variant="cyber" glow className="text-base font-bold">Cyber Glow</ShinyText>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Interação Hover-Only (Passe o Mouse)</span>
                <div>
                  <ShinyText variant="rainbow" hoverOnly className="text-sm font-semibold cursor-pointer py-1 border-b border-dashed border-white/10 hover:border-white/30 transition-colors">
                    Passe o mouse aqui para acionar o brilho rainbow!
                  </ShinyText>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ângulo e Velocidade customizados</span>
                <div className="flex gap-4">
                  <ShinyText angle={180} duration="4s" className="text-xs font-medium text-white/70">Vertical Lento (4s, 180°)</ShinyText>
                  <ShinyText angle={45} duration="0.8s" className="text-xs font-medium text-white/70">Diagonal Ultra Rápido (0.8s, 45°)</ShinyText>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. ADVANCED TEXT INPUTS DEMO */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <CardTitle>Text Inputs Avançados</CardTitle>
          </div>
          <CardDescription>
            Campos de entrada modernos com contadores reativos, botões para limpar e variantes de vidro.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <TextInput 
              label="Pesquisa com Ícones"
              placeholder="Digite sua busca..."
              value={inputText}
              onValueChange={setInputText}
              leftIcon={<Search size={16} />}
              showCharacterCount
              maxLength={25}
            />

            <TextInput 
              label="Campo Limpável (Clearable)"
              placeholder="Escreva algo..."
              value={clearableText}
              onValueChange={setClearableText}
              leftIcon={<Mail size={16} />}
              onClear={() => setClearableText('')}
            />
          </div>

          <div className="space-y-4">
            <TextInput 
              variant="glass"
              label="Campo Glassmorphic Premium"
              placeholder="Estilo de vidro translúcido..."
              leftIcon={<Sparkles size={16} className="text-purple-400" />}
            />

            <TextInput 
              label="Validação com Erro"
              placeholder="exemplo@email.com"
              value="email-invalido@"
              error="Por favor, insira um endereço de e-mail válido."
              leftIcon={<Mail size={16} />}
            />
          </div>
        </CardContent>
      </Card>

      {/* 6. USER PREVIEW DEMO */}
      <Card>
        <CardHeader>
          <CardTitle>User Preview</CardTitle>
          <CardDescription>A rich profile card for displaying user information.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <UserPreview 
            user={{
              name: "Sarah Wilson",
              role: "Product Designer",
              email: "sarah@pixon.ui",
              bio: "Passionate about building accessible and beautiful user interfaces.",
              stats: [
                { label: "Projects", value: 12 },
                { label: "Followers", value: "2.4k" },
                { label: "Following", value: 450 }
              ]
            }}
            onFollow={() => alert('Followed!')}
            onMessage={() => alert('Message sent!')}
          />
          
          <UserPreview 
            variant="glass"
            user={{
              name: "Alex Chen",
              role: "Senior Engineer",
              bio: "Full-stack developer loving React and TypeScript.",
              stats: [
                { label: "Commits", value: "8.5k" },
                { label: "PRs", value: 142 }
              ]
            }}
          />
        </CardContent>
      </Card>

      {/* 7. TIMELINE DEMO */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Vertical list for tracking events or history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Timeline>
            <TimelineItem 
              status="success"
              title="Order Delivered"
              date="Just now"
              description="Package was handed to resident."
              icon={<Check className="h-3 w-3" />}
            />
            <TimelineItem 
              status="active"
              title="Out for Delivery"
              date="2 hours ago"
              description="Driver is on the way to your location."
              icon={<Clock className="h-3 w-3" />}
            />
            <TimelineItem 
              status="default"
              title="Order Processed"
              date="Yesterday"
              description="Your order has been packed and is ready for shipping."
            />
            <TimelineItem 
              status="error"
              title="Payment Failed"
              date="2 days ago"
              description="First attempt to charge card failed."
              icon={<AlertCircle className="h-3 w-3" />}
              isLast
            />
          </Timeline>
        </CardContent>
      </Card>

      {/* 8. FILE DROPZONE DEMO */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-purple-400" />
            <CardTitle>File Dropzone Super Avançado</CardTitle>
          </div>
          <CardDescription>
            Área de envio inteligente com extração de miniatura de imagem, barras de progresso simuladas de envio e tipos de arquivos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Estilo Padrão</span>
              <FileDropzone 
                variant="default"
                maxFiles={3}
                maxSize={15 * 1024 * 1024} // 15MB
                simulateUpload
                showThumbnails
                onDrop={(files: File[]) => console.log('Dropped on default dropzone:', files)}
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Estilo Glassmorphic Premium</span>
              <FileDropzone 
                variant="glass"
                maxFiles={3}
                maxSize={10 * 1024 * 1024} // 10MB
                simulateUpload
                showThumbnails
                onDrop={(files: File[]) => console.log('Dropped on glass dropzone:', files)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
