import React from 'react';
import { 
  Button,
  GlowButton,
  PrimaryButton, 
  MetricCard, 
  TextInput, 
  Skeleton, 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage, 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationPrevious, 
  PaginationNext, 
  PaginationEllipsis,
  Navbar,
  Switch,
  Checkbox,
  Badge,
  Select,
  Avatar,
  Progress,
  Surface,
  Textarea,
  Slider,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  DatePicker,
  DateTimePicker,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarItem,
  Modal,
  Drawer,
  useToast,
  Divider,
  Kbd,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  UserMenu,
  ScrollArea,
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxItem,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Image,
  Container,
  Stack,
  Grid,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  Reveal,
  Magnetic,
  NumberTicker,
  PageTransition,
  Parallax,
  Motion,
  MotionGroup
} from '@pixonui/react';
import { Zap, Search, Home, Check, Activity, Settings, Mail, Users, Copy, Share, Plus, AlertTriangle, MoreHorizontal, ChevronDown, Calculator, User, CreditCard, Calendar } from 'lucide-react';
import { DropdownSearchDemo, DropdownSimpleDemo } from './demos/DropdownDemos';
import { ToastDemo } from './demos/FeedbackDemos';
import { FormDemo } from './demos/FormDemo';
import { AIDemo } from './demos/AIDemo';
import { ChartDemo } from './demos/ChartDemo';
import { ExtrasDemo } from './demos/ExtrasDemo';
import { TableDemo } from './demos/TableDemo';
import { MotionDemo } from './demos/MotionDemo';
import { StructureDemo } from './demos/StructureDemo';
import StructureDemoSource from './demos/StructureDemo.tsx?raw';
import { DatePickersDemo } from './demos/DatePickersDemo';
import { SelectionControlsDemo } from './demos/SelectionControlsDemo';
import { LoadingDemo } from './demos/LoadingDemo';
import { CardsDemo } from './demos/CardsDemo';
import { OverlaysPageDemo } from './demos/OverlaysPageDemo';
import { PageLoaderDemo } from './demos/PageLoaderDemo';
import { ChatDemo } from './demos/ChatDemo';
import { KanbanDemo } from './demos/KanbanDemo';
import { BackgroundDemo } from './demos/BackgroundDemo';
import { HeroDemo } from './demos/HeroDemo';
import { DashboardDemo } from './demos/DashboardDemo';
import BackgroundSource from '../../ui/src/components/layout/Background.tsx?raw';
import HeroTextSource from '../../ui/src/components/typography/HeroText.tsx?raw';
import LetterPullupSource from '../../ui/src/components/typography/LetterPullup.tsx?raw';
import SeparatorSource from '../../ui/src/components/data-display/Separator.tsx?raw';
import PageLoaderSource from '../../ui/src/components/feedback/PageLoader.tsx?raw';
import PageTransitionSource from '../../ui/src/components/feedback/PageTransition.tsx?raw';

// New Components Sources
import UserPreviewSource from '../../ui/src/components/data-display/UserPreview.tsx?raw';
import TimelineSource from '../../ui/src/components/data-display/Timeline.tsx?raw';
import FileDropzoneSource from '../../ui/src/components/form/FileDropzone.tsx?raw';

// Ten New Components Sources
import OTPInputSource from '../../ui/src/components/form/OTPInput.tsx?raw';
import NumberInputSource from '../../ui/src/components/form/NumberInput.tsx?raw';
import ToggleGroupSource from '../../ui/src/components/form/ToggleGroup.tsx?raw';
import RatingSource from '../../ui/src/components/feedback/Rating.tsx?raw';
import TreeSource from '../../ui/src/components/data-display/Tree.tsx?raw';
import TerminalSource from '../../ui/src/components/data-display/Terminal.tsx?raw';
import MarqueeSource from '../../ui/src/components/data-display/Marquee.tsx?raw';
import StatusDotSource from '../../ui/src/components/data-display/StatusDot.tsx?raw';
import StepperSource from '../../ui/src/components/navigation/Stepper.tsx?raw';
import SpotlightSource from '../../ui/src/components/layout/Spotlight.tsx?raw';



export type ComponentItem = {
  id: string;
  title: string;
  category: 'Inputs' | 'Data Display' | 'Feedback' | 'Navigation' | 'Overlay' | 'Layout' | 'Forms' | 'Templates';
  description: string;
  code: string;
  componentSource?: string;
  demo: React.ReactNode;
};

// --- Registry ---

export const registry: ComponentItem[] = [
  {
    id: 'chart',
    title: 'Chart',
    category: 'Data Display',
    description: 'Animated SVG charts with zero dependencies. Supports Bar, Area, Line, Pie, Radar, and Sparkline variants.',
    code: `import { 
  ChartContainer, 
  BarChart, 
  AreaChart, 
  LineChart, 
  PieChart, 
  RadarChart, 
  Sparkline 
} from '@pixonui/react';

// Standard Chart
<ChartContainer data={data} height={300}>
  <BarChart color="cyan" />
</ChartContainer>

// Radar Chart
<RadarChart 
  data={radarData} 
  keys={['A', 'B']} 
  colors={['cyan', 'purple']} 
/>

// Sparkline
<Sparkline data={[10, 20, 15, 30]} color="emerald" fill />`,
    demo: <ChartDemo />
  },
  {
    id: 'button',
    title: 'Button',
    category: 'Inputs',
    description: 'Interactive element that triggers an action. Supports multiple variants and sizes.',
    code: `import { Button } from '@pixonui/react';
import { Zap, Trash2, Check, AlertTriangle } from 'lucide-react';

<div className="flex flex-wrap gap-4">
  <Button variant="primary" leftIcon={<Zap size={18} />}>Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="success" leftIcon={<Check size={18} />}>Success</Button>
  <Button variant="alert" leftIcon={<AlertTriangle size={18} />}>Alert</Button>
  <Button variant="danger" leftIcon={<Trash2 size={18} />}>Danger</Button>
</div>`,
    demo: (
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <Button variant="primary" leftIcon={<Zap size={18} />}>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="success" leftIcon={<Check size={18} />}>Success</Button>
        <Button variant="alert" leftIcon={<AlertTriangle size={18} />}>Alert</Button>
        <Button variant="danger">Danger</Button>
        <GlowButton leftIcon={<Zap size={18} />}>Glow</GlowButton>
      </div>
    )
  },
  {
    id: 'dropdown',
    title: 'Dropdown',
    category: 'Inputs',
    description: 'A flexible dropdown component that supports search and simple selection.',
    code: `import { Combobox, ComboboxTrigger, ComboboxContent, ComboboxInput, ComboboxList, ComboboxItem } from '@pixonui/react';

// Searchable Dropdown
<Combobox>
  <ComboboxTrigger>Select framework...</ComboboxTrigger>
  <ComboboxContent>
    <ComboboxInput placeholder="Search framework..." />
    <ComboboxList>
      <ComboboxItem value="next.js">Next.js</ComboboxItem>
      <ComboboxItem value="sveltekit">SvelteKit</ComboboxItem>
    </ComboboxList>
  </ComboboxContent>
</Combobox>

// Simple Dropdown
<Combobox>
  <ComboboxTrigger>Select framework...</ComboboxTrigger>
  <ComboboxContent>
    <ComboboxList>
      <ComboboxItem value="next.js">Next.js</ComboboxItem>
      <ComboboxItem value="sveltekit">SvelteKit</ComboboxItem>
    </ComboboxList>
  </ComboboxContent>
</Combobox>`,
    demo: (
      <div className="flex flex-col gap-8 w-full items-center">
        <div className="w-full max-w-sm space-y-2">
          <div className="text-sm text-white/50">Searchable</div>
          <DropdownSearchDemo />
        </div>
        <div className="w-full max-w-sm space-y-2">
          <div className="text-sm text-white/50">Simple</div>
          <DropdownSimpleDemo />
        </div>
      </div>
    )
  },
  {
    id: 'text-input',
    title: 'Text Input',
    category: 'Inputs',
    description: 'A fundamental text input field with support for icons and labels.',
    code: `import { TextInput } from '@pixonui/react';
import { Search } from 'lucide-react';

<TextInput 
  label="Search" 
  placeholder="Type to search..." 
  leftIcon={<Search size={16} />} 
/>`,
    demo: <TextInput label="Search" placeholder="Type to search..." leftIcon={<Search size={16} />} />
  },
  {
    id: 'textarea',
    title: 'Textarea',
    category: 'Inputs',
    description: 'A multi-line text input field.',
    code: `import { Textarea } from '@pixonui/react';

<Textarea 
  label="Description" 
  placeholder="Enter your description..." 
  rows={4}
/>`,
    demo: <Textarea label="Description" placeholder="Enter your description..." rows={4} />
  },
  {
    id: 'select',
    title: 'Select',
    category: 'Inputs',
    description: 'A dropdown menu for selecting a value from a list of options.',
    code: `import { Select } from '@pixonui/react';

<Select
  label="Framework"
  placeholder="Select a framework"
  options={[
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Svelte', value: 'svelte' },
  ]}
/>`,
    demo: <Select
      label="Framework"
      placeholder="Select a framework"
      options={[
        { label: 'React', value: 'react' },
        { label: 'Vue', value: 'vue' },
        { label: 'Svelte', value: 'svelte' },
      ]}
    />
  },
  {
    id: 'selection-controls',
    title: 'Selection Controls',
    category: 'Inputs',
    description: 'Selection controls allow users to select options, switch settings, and adjust values.',
    code: `import { Switch, Checkbox, Slider } from '@pixonui/react';

// Switch
<Switch defaultChecked />

// Checkbox
<Checkbox id="terms" />

// Slider
<Slider defaultValue={50} max={100} step={1} />`,
    demo: <SelectionControlsDemo />
  },
  {
    id: 'date-pickers',
    title: 'Date & Time',
    category: 'Inputs',
    description: 'Components for selecting dates and times.',
    code: `import { DatePicker, DateTimePicker } from '@pixonui/react';

// Date Picker
<DatePicker />

// Date Time Picker
<DateTimePicker />`,
    demo: <DatePickersDemo />
  },
  {
    id: 'cards',
    title: 'Cards',
    category: 'Data Display',
    description: 'Displays a card with header, content, and footer.',
    code: `import { Card, MetricCard } from '@pixonui/react';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
</Card>`,
    demo: <CardsDemo />
  },
  {
    id: 'table',
    title: 'Table',
    category: 'Data Display',
    description: 'A responsive table component with support for sorting, searching, and custom cell rendering.',
    code: `import { DataTable, Badge, Avatar } from '@pixonui/react';

const columns = [
  { 
    key: 'name', 
    header: 'User', 
    sortable: true,
    render: (user) => (
      <div className="flex items-center gap-3">
        <Avatar fallback={user.name[0]} />
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs text-white/50">{user.email}</span>
        </div>
      </div>
    )
  },
  { key: 'role', header: 'Role', sortable: true },
  { 
    key: 'status', 
    header: 'Status', 
    render: (user) => (
      <Badge variant={user.status === 'Active' ? 'success' : 'warning'}>
        {user.status}
      </Badge>
    )
  }
];

const data = [
  { name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Admin', status: 'Active' },
  { name: 'Alex Chen', email: 'alex@example.com', role: 'Editor', status: 'Active' },
];

// High-level DataTable with built-in search and sort
<DataTable 
  data={data} 
  columns={columns} 
  searchKeys={['name', 'email', 'role']}
  onRowClick={(user) => console.log(user)}
/>`,
    demo: <TableDemo />
  },
  {
    id: 'kanban',
    title: 'Kanban Board',
    category: 'Data Display',
    description: 'A high-performance, drag-and-drop enabled board with independent column scrolling, lazy loading, and a rich event API.',
    code: `import { Kanban, KanbanColumn, KanbanTask } from '@pixonui/react';

const columns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', color: '#94a3b8' },
  { id: 'in-progress', title: 'In Progress', color: '#06b6d4', limit: 5 },
  { id: 'done', title: 'Done', color: '#10b981' }
];

const tasks: KanbanTask[] = [
  { id: '1', title: 'Task 1', columnId: 'todo', priority: 'high' }
];

// Ultra-performance features:
// - pageSize: Number of items to load per scroll (default: 20)
// - columnHeight: Independent scroll height for each column
// - onTaskDrop: Detailed event for backend sync
// - onTaskRemove: Event for task deletion

<Kanban 
  columns={columns} 
  tasks={tasks} 
  pageSize={20}
  columnHeight="600px"
  onTaskMove={(id, toCol, index) => handleMove(id, toCol, index)}
  onTaskDrop={(id, from, to, idx) => syncWithBackend(id, from, to, idx)}
  onTaskRemove={(id) => deleteTask(id)}
  onTaskClick={(task) => openDetails(task)}
  selectable
  showDividers
/>`,
    demo: <KanbanDemo />
  },
  {
    id: 'accordion',
    title: 'Accordion',
    category: 'Data Display',
    description: 'A vertically stacked set of interactive headings that each reveal a section of content.',
    code: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@pixonui/react';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
  </AccordionItem>
</Accordion>`,
    demo: (
      <Accordion type="single" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that matches the other components' aesthetic.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is it animated?</AccordionTrigger>
          <AccordionContent>
            Yes. It's animated by default, but you can disable it if you prefer.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  },
  {
    id: 'avatar',
    title: 'Avatar',
    category: 'Data Display',
    description: 'An image element with a fallback for representing the user.',
    code: `import { Avatar } from '@pixonui/react';

<Avatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN" />`,
    demo: (
      <div className="flex gap-4">
        <Avatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN" />
        <Avatar fallback="JD" />
      </div>
    )
  },
  {
    id: 'badge',
    title: 'Badge',
    category: 'Data Display',
    description: 'Displays a badge or a component that looks like a badge.',
    code: `import { Badge } from '@pixonui/react';

<Badge>Default</Badge>
<Badge variant="neutral">Neutral</Badge>
<Badge variant="danger">Danger</Badge>`,
    demo: (
      <div className="flex gap-2">
        <Badge>Default</Badge>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="danger">Danger</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="info">Info</Badge>
      </div>
    )
  },
  {
    id: 'loading',
    title: 'Loading',
    category: 'Feedback',
    description: 'Indicators for loading states.',
    code: `import { Skeleton, Progress } from '@pixonui/react';

// Skeleton
<Skeleton className="h-4 w-[250px]" />

// Progress
<Progress value={60} />`,
    demo: <LoadingDemo />
  },
  {
    id: 'toast',
    title: 'Toast',
    category: 'Feedback',
    description: 'A succinct message that is displayed temporarily.',
    code: `import { useToast } from '@pixonui/react';

const { toast } = useToast();

<Button onClick={() => toast({ title: "Scheduled: Catch up", description: "Friday, February 10, 2023 at 5:57 PM" })}>
  Show Toast
</Button>`,
    demo: <ToastDemo />
  },
  {
    id: 'navbar',
    title: 'Navbar',
    category: 'Navigation',
    description: 'A responsive navigation bar with dynamic scroll-blur and mobile menu.',
    code: `import { Navbar, Button } from '@pixonui/react';

<Navbar 
  logo={<span className="text-xl font-bold tracking-tighter">PIXON</span>}
  links={[
    { label: 'Features', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'About', href: '#' },
  ]}
  actions={
    <>
      <Button variant="ghost" size="sm">Log in</Button>
      <Button size="sm">Get Started</Button>
    </>
  }
/>`,
    demo: (
      <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950">
        <div className="absolute inset-0 overflow-y-auto p-4">
          <Navbar 
            className="absolute"
            logo={<span className="text-xl font-bold tracking-tighter">PIXON</span>}
            links={[
              { label: 'Features', href: '#' },
              { label: 'Pricing', href: '#' },
              { label: 'About', href: '#' },
            ]}
            actions={
              <>
                <Button variant="ghost" size="sm">Log in</Button>
                <Button size="sm">Get Started</Button>
              </>
            }
          />
          <div className="h-[1000px] pt-32 px-8">
            <h1 className="text-4xl font-bold mb-4">Scroll down to see the effect</h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
              The navbar will transition from transparent to a glassmorphism effect as you scroll down.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'breadcrumb',
    title: 'Breadcrumb',
    category: 'Navigation',
    description: 'Displays the path to the current resource using a hierarchy of links.',
    code: `import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@pixonui/react';

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/components">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`,
    demo: (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/components">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  },
  {
    id: 'pagination',
    title: 'Pagination',
    category: 'Navigation',
    description: 'Pagination with page navigation, next and previous links.',
    code: `import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from '@pixonui/react';

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
    demo: (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  },
  {
    id: 'sidebar',
    title: 'Sidebar',
    category: 'Layout',
    description: 'A composable sidebar component.',
    code: `import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarItem } from '@pixonui/react';

<Sidebar>
  <SidebarHeader>App Name</SidebarHeader>
  <SidebarContent>
    <SidebarGroup label="Menu">
      <SidebarItem icon={<Home />}>Home</SidebarItem>
      <SidebarItem icon={<Settings />}>Settings</SidebarItem>
    </SidebarGroup>
  </SidebarContent>
  <SidebarFooter>User</SidebarFooter>
</Sidebar>`,
    demo: (
      <div className="h-[400px] border border-white/10 rounded-lg overflow-hidden flex">
        <Sidebar className="w-64 border-r border-white/10">
          <SidebarHeader className="border-b border-white/10 p-4">
            <div className="font-bold">My App</div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarGroup label="Main">
              <SidebarItem icon={<Home size={16} />}>Dashboard</SidebarItem>
              <SidebarItem icon={<Mail size={16} />}>Messages</SidebarItem>
              <SidebarItem icon={<Calendar size={16} />}>Calendar</SidebarItem>
            </SidebarGroup>
            <SidebarGroup label="Settings">
              <SidebarItem icon={<User size={16} />}>Profile</SidebarItem>
              <SidebarItem icon={<Settings size={16} />}>Preferences</SidebarItem>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-white/10 p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/10" />
              <div className="text-sm">User Name</div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 p-8 bg-white/[0.02]">
          Content Area
        </div>
      </div>
    )
  },
  {
    id: 'overlays',
    title: 'Overlays',
    category: 'Overlay',
    description: 'Overlay components including Modal, Drawer, and Command Palette.',
    code: `import { Modal, Drawer, CommandDialog } from '@pixonui/react';

// Modal
<Modal isOpen={open} onClose={() => setOpen(false)}>...</Modal>

// Drawer
<Drawer isOpen={open} onClose={() => setOpen(false)}>...</Drawer>

// Command
<CommandDialog open={open} onOpenChange={setOpen}>...</CommandDialog>`,
    demo: <OverlaysPageDemo />
  },
  {
    id: 'scroll-area',
    title: 'Scroll Area',
    category: 'Data Display',
    description: 'Augments native scroll functionality for custom, cross-browser styling.',
    code: `import { ScrollArea } from '@pixonui/react';

<ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
  Jokester began sneaking into the castle in the middle of the night...
</ScrollArea>`,
    demo: (
      <ScrollArea className="h-[200px] w-full rounded-md border border-white/10 p-4">
        <div className="space-y-4">
          <h4 className="text-sm font-medium leading-none">Tags</h4>
          {Array.from({ length: 50 }).map((_, i, a) => (
            <div key={i} className="text-sm">
              v1.2.0-beta.{a.length - i}
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  },
  {
    id: 'user-menu',
    title: 'User Menu',
    category: 'Navigation',
    description: 'A pre-built user menu dropdown.',
    code: `import { UserMenu } from '@pixonui/react';

<UserMenu 
  name="John Doe" 
  description="john@example.com"
/>`,
    demo: (
      <div className="flex justify-center">
        <UserMenu 
          name="John Doe" 
          description="john@example.com"
        />
      </div>
    )
  },
  {
    id: 'image',
    title: 'Image',
    category: 'Data Display',
    description: 'An enhanced image component with fallback and loading states.',
    code: `import { Image } from '@pixonui/react';

<Image 
  src="https://images.unsplash.com/photo-1579353977828-2a4eab540b9a" 
  alt="Sample" 
  width={300} 
  height={200} 
  className="rounded-lg"
/>`,
    demo: (
      <div className="flex justify-center">
        <Image 
          src="https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?q=80&w=1000&auto=format&fit=crop" 
          alt="Sample" 
          width={400} 
          height={300} 
          className="rounded-lg object-cover"
        />
      </div>
    )
  },
  {
    id: 'layout-primitives',
    title: 'Layout Primitives',
    category: 'Layout',
    description: 'Fundamental layout components: Container, Stack, Grid.',
    code: `import { Container, Stack, Grid } from '@pixonui/react';

<Container>
  <Stack gap={4}>
    <Grid cols={3} gap={4}>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </Grid>
  </Stack>
</Container>`,
    demo: (
      <Container>
        <Stack gap={4} className="p-4 border border-white/10 rounded-lg">
          <div className="p-2 bg-white/5 rounded">Stack Item 1</div>
          <div className="p-2 bg-white/5 rounded">Stack Item 2</div>
          <Grid cols={2} gap={4}>
            <div className="p-2 bg-white/5 rounded">Grid Item 1</div>
            <div className="p-2 bg-white/5 rounded">Grid Item 2</div>
          </Grid>
        </Stack>
      </Container>
    )
  },
  {
    id: 'form',
    title: 'Form',
    category: 'Forms',
    description: 'Building forms with React Hook Form and Zod validation.',
    code: `import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@pixonui/react';
// See FormDemo.tsx for full implementation`,
    demo: <FormDemo />
  },
  {
    id: 'ai',
    title: 'AI Components',
    category: 'Feedback',
    description: 'Components for building AI interfaces.',
    code: `import { AIPromptInput, AIResponse } from '@pixonui/react';
// See AIDemo.tsx`,
    demo: <AIDemo />
  },
  {
    id: 'extras',
    title: 'Extras',
    category: 'Data Display',
    description: 'Showcase of recently added components and extras.',
    code: `import { 
  UserPreview, Timeline, FileDropzone,
  OTPInput, NumberInput, ToggleGroup, ToggleGroupItem, Rating, 
  Tree, Terminal, TerminalLine, Marquee, StatusDot, Stepper, Spotlight 
} from '@pixonui/react';

// --- New Components ---

// User Preview
<UserPreview 
  user={{ name: "Sarah", role: "Designer" }} 
  onFollow={() => {}} 
/>

// Timeline
<Timeline items={[
  { title: "Event 1", date: "2024-01-01", description: "Description" }
]} />

// File Dropzone
<FileDropzone onDrop={(files) => console.log(files)} />

// --- 10 New Components ---

// OTP Input
<OTPInput length={6} onChange={console.log} />

// Number Input
<NumberInput min={0} max={100} />

// Toggle Group
<ToggleGroup type="single">
  <ToggleGroupItem value="a">A</ToggleGroupItem>
</ToggleGroup>

// Rating
<Rating value={4} onChange={console.log} />

// Tree
<Tree data={treeData} />

// Terminal
<Terminal>
  <TerminalLine>npm install</TerminalLine>
</Terminal>

// Marquee
<Marquee>Content scrolling...</Marquee>

// Status Dot
<StatusDot status="online" />

// Stepper
<Stepper steps={['Step 1', 'Step 2']} currentStep={1} />

// Spotlight
<Spotlight>
  <Card>...</Card>
</Spotlight>`,
    componentSource: `// UserPreview.tsx
${UserPreviewSource}

// Timeline.tsx
${TimelineSource}

// FileDropzone.tsx
${FileDropzoneSource}

// OTPInput.tsx
${OTPInputSource}

// NumberInput.tsx
${NumberInputSource}

// ToggleGroup.tsx
${ToggleGroupSource}

// Rating.tsx
${RatingSource}

// Tree.tsx
${TreeSource}

// Terminal.tsx
${TerminalSource}

// Marquee.tsx
${MarqueeSource}

// StatusDot.tsx
${StatusDotSource}

// Stepper.tsx
${StepperSource}

// Spotlight.tsx
${SpotlightSource}`,
    demo: <ExtrasDemo />
  },
  {
    id: 'advanced-motion',
    title: 'Advanced Motion',
    category: 'Feedback',
    description: 'High-performance animation primitives using WAAPI and View Transitions.',
    code: `import { Reveal, Magnetic, NumberTicker, Parallax } from '@pixonui/react';

// Reveal
<Reveal direction="up">
  <h1>Hello World</h1>
</Reveal>

// Magnetic
<Magnetic>
  <Button>Hover Me</Button>
</Magnetic>

// Number Ticker
<NumberTicker value={100} />

// Parallax
<Parallax speed={0.5}>
  <img src="..." />
</Parallax>`,
    demo: <MotionDemo />
  },
  {
    id: 'motion',
    title: 'Motion',
    category: 'Feedback',
    description: 'Animation primitives for building fluid interfaces.',
    code: `import { Motion, MotionGroup } from '@pixonui/react';
// See MotionDemo.tsx`,
    demo: <MotionDemo />
  },
  {
    id: 'structure',
    title: 'Structure',
    category: 'Data Display',
    description: 'Structural components for organizing content.',
    code: StructureDemoSource,
    componentSource: SeparatorSource,
    demo: <StructureDemo />
  },
  {
    id: 'page-loader',
    title: 'Page Loader & Transition',
    category: 'Feedback',
    description: 'Components for full-page loading states and page transitions.',
    code: `import { PageLoader, PageTransition } from '@pixonui/react';

// Page Loader
<PageLoader variant="spinner" />

// Page Transition
<PageTransition preset="fade">
  <Content />
</PageTransition>`,
    componentSource: `// PageLoader.tsx
${PageLoaderSource}

// PageTransition.tsx
${PageTransitionSource}`,
    demo: <PageLoaderDemo />
  },
  {
    id: 'chat',
    title: 'Chat System',
    category: 'Data Display',
    description: 'A complete, modern chat interface with sidebar, messages, and profile view.',
    code: `import { 
  ChatLayout, ChatSidebar, ChatHeader, 
  MessageList, ChatInput, ChatProfile 
} from '@pixonui/react';

// See ChatDemo.tsx for full implementation`,
    demo: <ChatDemo />
  },
  {
    id: 'background',
    title: 'Background Patterns',
    category: 'Layout',
    description: 'Decorative background patterns including dots, grids, and mesh gradients.',
    code: `import { Background } from '@pixonui/react';

// Dot Pattern
<div className="relative h-64 overflow-hidden">
  <Background variant="dots" size={20} patternColor="rgba(255,255,255,0.1)" />
  <Content />
</div>

// Grid Pattern with Mask
<div className="relative h-64 overflow-hidden">
  <Background variant="grid" size={32} mask="fade" />
  <Content />
</div>

// Animated Mesh
<div className="relative h-64 overflow-hidden">
  <Background variant="mesh" animate />
  <Content />
</div>`,
    componentSource: BackgroundSource,
    demo: <BackgroundDemo />
  },
  {
    id: 'hero',
    title: 'Hero Sections',
    category: 'Templates',
    description: 'High-impact hero sections combining background patterns and creative typography.',
    code: `import { HeroText, LetterPullup, Background } from '@pixonui/react';

<div className="relative min-h-[600px] overflow-hidden">
  <Background variant="grid" mask="fade" />
  <HeroText 
    title="The future of"
    highlight="Interfaces"
    subtitle="Experience the next generation of UI components."
  />
</div>`,
    componentSource: `// HeroText.tsx
${HeroTextSource}

// LetterPullup.tsx
${LetterPullupSource}`,
    demo: <HeroDemo />
  },
  {
    id: 'dashboard',
    title: 'Analytics Dashboard',
    category: 'Templates',
    description: 'A comprehensive analytics dashboard template featuring advanced charts, AI integration, and data tables.',
    code: `// See DashboardDemo.tsx for full implementation`,
    demo: <DashboardDemo />
  }
];
