import { 
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarGroup,
  Avatar,
  UserMenu,
  ThemeProvider,
  ThemeToggle,
  ScrollArea
} from '@pixonui/react';
import { useState, useMemo } from 'react';
import { registry, ComponentItem } from './registry';
import { ComponentDoc } from './ComponentDoc';
import { LandingPage } from './LandingPage';

export default function App() {
  const [view, setView] = useState<'landing' | 'gallery'>('landing');
  const [activeId, setActiveId] = useState('button');
  
  const activeComponent = useMemo(() => 
    registry.find(c => c.id === activeId) || registry[0], 
  [activeId]);

  // Group by category
  const categories = useMemo(() => {
    const groups: Record<string, ComponentItem[]> = {};
    // Define order
    const order = ['Inputs', 'Data Display', 'Navigation', 'Feedback', 'Overlay', 'Layout'];
    
    registry.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category]!.push(item);
    });
    
    // Sort categories based on defined order
    return Object.entries(groups).sort((a, b) => {
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    });
  }, []);

  if (view === 'landing') {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="pixonui-theme">
        <LandingPage onEnterGallery={() => setView('gallery')} />
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
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay opacity-5 dark:opacity-20"></div>
          <ScrollArea className="h-full w-full">
            <div className="p-10 min-h-full">
              {activeComponent && (
                <ComponentDoc 
                  key={activeComponent.id}
                  title={activeComponent.title}
                  description={activeComponent.description}
                  code={activeComponent.code}
                  componentSource={activeComponent.componentSource}
                >
                  {activeComponent.demo}
                </ComponentDoc>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
  </ThemeProvider>
  );
}