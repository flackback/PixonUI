import React, { useState } from 'react';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarItem, 
  SidebarGroup,
  Navbar,
  UserMenu,
  ThemeToggle,
  Badge,
  TextInput,
  Button,
  Surface,
  ScrollArea,
  cn
} from '@pixonui/react';
import { 
  LayoutDashboard, 
  Inbox, 
  Kanban as KanbanIcon, 
  Users, 
  Settings, 
  Search, 
  Bell, 
  Plus, 
  Command,
  HelpCircle,
  MessageSquare,
  BarChart3,
  ShieldCheck
} from 'lucide-react';

interface SaaSLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBackToLanding: () => void;
}

export function SaaSLayout({ children, activeTab, onTabChange, onBackToLanding }: SaaSLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8f9fa] dark:bg-[#050505] text-gray-900 dark:text-white font-sans">
      {/* Sidebar */}
      <Sidebar className="flex-shrink-0 border-r border-gray-200 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-2xl">
        <SidebarHeader className="h-20 border-b border-gray-200 dark:border-white/5">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onBackToLanding}
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-none">PixonSaaS</span>
              <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mt-1">Enterprise</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="py-6">
          <SidebarGroup label="Main">
            <SidebarItem 
              icon={<LayoutDashboard className="h-4 w-4" />} 
              active={activeTab === 'dashboard'}
              onClick={() => onTabChange('dashboard')}
            >
              Dashboard
            </SidebarItem>
            <SidebarItem 
              icon={<Inbox className="h-4 w-4" />} 
              active={activeTab === 'inbox'}
              onClick={() => onTabChange('inbox')}
              badge="12"
            >
              Inbox
            </SidebarItem>
            <SidebarItem 
              icon={<KanbanIcon className="h-4 w-4" />} 
              active={activeTab === 'kanban'}
              onClick={() => onTabChange('kanban')}
            >
              Kanban
            </SidebarItem>
          </SidebarGroup>

          <SidebarGroup label="Management" className="mt-6">
            <SidebarItem 
              icon={<Users className="h-4 w-4" />} 
              active={activeTab === 'customers'}
              onClick={() => onTabChange('customers')}
            >
              Customers
            </SidebarItem>
            <SidebarItem 
              icon={<BarChart3 className="h-4 w-4" />} 
              active={activeTab === 'reports'}
              onClick={() => onTabChange('reports')}
            >
              Reports
            </SidebarItem>
          </SidebarGroup>

          <SidebarGroup label="System" className="mt-6">
            <SidebarItem 
              icon={<Settings className="h-4 w-4" />} 
              active={activeTab === 'settings'}
              onClick={() => onTabChange('settings')}
            >
              Settings
            </SidebarItem>
            <SidebarItem 
              icon={<HelpCircle className="h-4 w-4" />} 
              active={activeTab === 'help'}
              onClick={() => onTabChange('help')}
            >
              Help Center
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-gray-200 dark:border-white/5">
          <UserMenu 
            name="Alex Rivera" 
            description="Admin Account" 
            avatarSrc="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" 
          />
        </SidebarFooter>
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-gray-200 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
              <TextInput 
                placeholder="Search conversations, customers, or tasks... (Ctrl+K)" 
                className="pl-10 bg-gray-100 dark:bg-white/5 border-transparent focus:border-cyan-500/50 h-11 rounded-xl w-full"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-[10px] font-bold text-gray-400">
                <Command className="h-2.5 w-2.5" /> K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl relative">
              <Bell className="h-5 w-5 text-gray-500 dark:text-white/60" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-black" />
            </Button>
            <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2" />
            <ThemeToggle />
            <Button className="ml-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl h-10 px-4 gap-2 shadow-lg shadow-cyan-500/20">
              <Plus className="h-4 w-4" /> New Ticket
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full w-full">
            <div className="p-8 min-h-full">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
