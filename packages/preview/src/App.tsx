import { 
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarGroup,
  UserMenu,
  ThemeProvider,
  ThemeToggle,
  ScrollArea,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  PageTransition,
  useToast,
  Kbd
} from '@pixonui/react';
import { useState, useMemo, useEffect } from 'react';
import type { ComponentItem } from './registry';
import { registry } from './registry';
import { ComponentDoc } from './ComponentDoc';
import { LandingPage } from './LandingPage';
import { SaaSLayout } from './saas/SaaSLayout';
import { Dashboard } from './saas/Dashboard';
import { Inbox } from './saas/Inbox';
import { KanbanView } from './saas/KanbanView';
import { Settings } from './saas/Settings';
import { CRMView } from './saas/CRMView';
import { ERPView } from './saas/ERPView';
import { AnalyticsView } from './saas/AnalyticsView';
import { HelpDeskView } from './saas/HelpDeskView';
import { ProjectPortalView } from './saas/ProjectPortalView';

// Import our custom background simulator
import { useSimulator } from './saas/useSimulator';

// Lucide Icons for Command Dialog
import { 
  Home, 
  Layers, 
  LayoutDashboard, 
  MessageSquare, 
  Trello, 
  Settings2, 
  Users, 
  TrendingUp, 
  HelpCircle, 
  Briefcase, 
  Compass, 
  Terminal,
  Cpu,
  Activity
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'landing' | 'gallery' | 'saas'>('landing');
  const [activeId, setActiveId] = useState('button');
  const [saasTab, setSaasTab] = useState('dashboard');
  const [commandOpen, setCommandOpen] = useState(false);
  
  const { toast } = useToast();

  // Run the background telemetry simulation!
  useSimulator();

  // Handle global keydown ⌘K or Ctrl+K to toggle CommandDialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const categories = useMemo(() => {
    const groups: Record<string, ComponentItem[]> = {};
    const order = ['Inputs', 'Data Display', 'Feedback', 'Navigation', 'Overlay', 'Layout', 'Forms', 'Templates'];
    
    registry.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category]!.push(item);
    });
    
    // Sort categories based on defined order
    return Object.entries(groups).sort((a, b) => {
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    });
  }, []);

  const activeComponent = useMemo(() => 
    registry.find(c => c.id === activeId) || registry[0], 
  [activeId]);

  // Execute quick navigation actions from the Command Palette
  const handleCommandAction = (value: string) => {
    setCommandOpen(false);

    if (value.startsWith('view:')) {
      const targetView = value.split(':')[1] as 'landing' | 'gallery' | 'saas';
      setView(targetView);
      toast({
        title: "Navegação rápida",
        description: `Indo para a tela: ${targetView.toUpperCase()}`,
        duration: 2000
      });
    } else if (value.startsWith('saas:')) {
      const tab = value.split(':')[1]!;
      setView('saas');
      setSaasTab(tab);
      toast({
        title: "Navegação SaaS",
        description: `Visualizando painel: ${tab.toUpperCase()}`,
        duration: 2000
      });
    } else if (value.startsWith('comp:')) {
      const compId = value.split(':')[1]!;
      setView('gallery');
      setActiveId(compId);
      const found = registry.find(c => c.id === compId);
      toast({
        title: "Navegação de Componentes",
        description: `Renderizando documentação de: ${found?.title || compId}`,
        duration: 2000
      });
    }
  };

  if (view === 'landing') {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="pixonui-theme">
        <PageTransition key="landing" preset="fade" duration={400}>
          <LandingPage 
            onEnterGallery={() => setView('gallery')} 
            onEnterSaaS={() => setView('saas')}
          />
        </PageTransition>
        <GlobalCommandPalette 
          open={commandOpen} 
          onOpenChange={setCommandOpen} 
          onSelect={handleCommandAction} 
        />
      </ThemeProvider>
    );
  }

  if (view === 'saas') {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="pixonui-theme">
        <SaaSLayout 
          activeTab={saasTab} 
          onTabChange={setSaasTab}
          onBackToLanding={() => setView('landing')}
        >
          {/* Animated Tab View with View Transitions simulation using unique key */}
          <PageTransition key={saasTab} preset="slide-up" duration={350}>
            {saasTab === 'dashboard' && <Dashboard />}
            {saasTab === 'inbox' && <Inbox />}
            {saasTab === 'kanban' && <KanbanView />}
            {saasTab === 'settings' && <Settings />}
            {saasTab === 'crm' && <CRMView />}
            {saasTab === 'erp' && <ERPView />}
            {saasTab === 'analytics' && <AnalyticsView />}
            {saasTab === 'helpdesk' && <HelpDeskView />}
            {saasTab === 'projectportal' && <ProjectPortalView />}
          </PageTransition>
        </SaaSLayout>
        <GlobalCommandPalette 
          open={commandOpen} 
          onOpenChange={setCommandOpen} 
          onSelect={handleCommandAction} 
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="pixonui-theme">
      <div className="flex h-screen w-full overflow-hidden font-sans selection:bg-purple-500/30 transition-colors duration-200 bg-gray-50 text-gray-900 dark:bg-black dark:text-white">
          <Sidebar className="flex-shrink-0">
            <SidebarHeader>
              <div className="flex items-center justify-between px-2 w-full">
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setView('landing')}
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-purple-500/20" />
                  <div className="font-bold text-lg tracking-tight">PixonUI</div>
                </div>
                <ThemeToggle />
              </div>
            </SidebarHeader>
          
          <ScrollArea className="flex-1">
            <SidebarContent>
              {categories.map(([category, items]) => (
                <SidebarGroup key={category} label={category}>
                  {items.map(item => (
                    <SidebarItem 
                      key={item.id} 
                      active={activeId === item.id}
                      onClick={() => setActiveId(item.id)}
                    >
                      {item.title}
                    </SidebarItem>
                  ))}
                </SidebarGroup>
              ))}
            </SidebarContent>
          </ScrollArea>
          
          <SidebarFooter>
            <UserMenu 
              name="Preview User" 
              description="v0.1.0" 
              avatarSrc="https://github.com/shadcn.png" 
            />
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-hidden relative transition-colors duration-200 bg-gray-50 dark:bg-zinc-950">
          <div className="absolute inset-0 bg-[url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E&quot;)] pointer-events-none mix-blend-overlay opacity-5 dark:opacity-20"></div>
          
          <ScrollArea className="h-full w-full">
            <div className="p-10 min-h-full">
              {/* Dynamic Page Transition for active component document changes */}
              <PageTransition key={activeId} preset="fade" duration={300}>
                {activeComponent && (
                  <ComponentDoc 
                    title={activeComponent.title}
                    description={activeComponent.description}
                    code={activeComponent.code}
                    componentSource={activeComponent.componentSource}
                  >
                    {activeComponent.demo}
                  </ComponentDoc>
                )}
              </PageTransition>
            </div>
          </ScrollArea>
        </main>
      </div>

      <GlobalCommandPalette 
        open={commandOpen} 
        onOpenChange={setCommandOpen} 
        onSelect={handleCommandAction} 
      />
    </ThemeProvider>
  );
}

// --- Global Command Palette Component ---
interface GlobalCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
}

function GlobalCommandPalette({ open, onOpenChange, onSelect }: GlobalCommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Procure rotas, dashboards ou componentes... (Fuzzy Search)" />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        <CommandGroup heading="Ir para Geral">
          <CommandItem value="view:landing" onSelect={() => onSelect('view:landing')}>
            <Home className="mr-2 h-4 w-4 text-zinc-500" />
            <span>Página Inicial (Landing Page)</span>
            <CommandShortcut>Go Home</CommandShortcut>
          </CommandItem>
          <CommandItem value="view:gallery" onSelect={() => onSelect('view:gallery')}>
            <Layers className="mr-2 h-4 w-4 text-purple-400" />
            <span>Biblioteca de Componentes (Gallery)</span>
            <CommandShortcut>Components</CommandShortcut>
          </CommandItem>
          <CommandItem value="view:saas" onSelect={() => onSelect('view:saas')}>
            <Compass className="mr-2 h-4 w-4 text-emerald-400" />
            <span>Entrar no Portal SaaS</span>
            <CommandShortcut>SaaS Admin</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Painéis do SaaS">
          <CommandItem value="saas:dashboard" onSelect={() => onSelect('saas:dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-blue-400" />
            <span>Dashboard de Indicadores</span>
          </CommandItem>
          <CommandItem value="saas:inbox" onSelect={() => onSelect('saas:inbox')}>
            <MessageSquare className="mr-2 h-4 w-4 text-purple-400" />
            <span>Inbox / Chat Multicanal (Mega)</span>
          </CommandItem>
          <CommandItem value="saas:kanban" onSelect={() => onSelect('saas:kanban')}>
            <Trello className="mr-2 h-4 w-4 text-amber-400" />
            <span>Kanban Board & Heurísticas de IA</span>
          </CommandItem>
          <CommandItem value="saas:crm" onSelect={() => onSelect('saas:crm')}>
            <Users className="mr-2 h-4 w-4 text-teal-400" />
            <span>CRM de Clientes</span>
          </CommandItem>
          <CommandItem value="saas:analytics" onSelect={() => onSelect('saas:analytics')}>
            <TrendingUp className="mr-2 h-4 w-4 text-indigo-400" />
            <span>Analytics & Métricas</span>
          </CommandItem>
          <CommandItem value="saas:helpdesk" onSelect={() => onSelect('saas:helpdesk')}>
            <HelpCircle className="mr-2 h-4 w-4 text-rose-400" />
            <span>Suporte & HelpDesk</span>
          </CommandItem>
          <CommandItem value="saas:projectportal" onSelect={() => onSelect('saas:projectportal')}>
            <Briefcase className="mr-2 h-4 w-4 text-cyan-400" />
            <span>Portal de Projetos</span>
          </CommandItem>
          <CommandItem value="saas:settings" onSelect={() => onSelect('saas:settings')}>
            <Settings2 className="mr-2 h-4 w-4 text-zinc-400" />
            <span>Configurações do Sistema</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Componentes de Destaque">
          <CommandItem value="comp:new-components" onSelect={() => onSelect('comp:new-components')}>
            <Cpu className="mr-2 h-4 w-4 text-yellow-400 animate-pulse" />
            <span>Modern Essentials (Dropdown & Select Multi-Variants)</span>
            <CommandShortcut>Novo</CommandShortcut>
          </CommandItem>
          <CommandItem value="comp:form" onSelect={() => onSelect('comp:form')}>
            <Terminal className="mr-2 h-4 w-4 text-cyan-400" />
            <span>Form & Validação (Zod vs Native-First)</span>
            <CommandShortcut>FormDemo</CommandShortcut>
          </CommandItem>
          <CommandItem value="comp:motion-physics" onSelect={() => onSelect('comp:motion-physics')}>
            <Activity className="mr-2 h-4 w-4 text-emerald-400" />
            <span>Spring &amp; Audio Physics Studio</span>
            <CommandShortcut>Studio</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}