import React, { useState } from 'react';
import {
  Surface,
  Grid,
  Stack,
  Heading,
  Text,
  Button,
  Badge,
  Avatar,
  StatusDot,
  ChartContainer,
  BarChart,
  LineChart,
  RadarChart,
  Sparkline,
  AIPromptInput,
  AIResponse,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn
} from '@pixonui/react';
import { 
  Download, 
  TrendingUp, 
  Users, 
  Activity, 
  DollarSign, 
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// --- Mock Data ---

const REVENUE_DATA = [40, 35, 55, 60, 50, 65, 80, 75, 90, 85, 100, 110];
const USERS_DATA = [100, 120, 115, 130, 140, 135, 150, 160, 155, 170, 180, 190];
const BOUNCE_DATA = [40, 38, 35, 32, 30, 28, 25, 22, 20, 18, 15, 12];
const LOAD_DATA = [20, 25, 30, 28, 35, 40, 38, 45, 50, 55, 60, 58];

const MAIN_CHART_DATA = Array.from({ length: 12 }, (_, i) => ({
  label: `Month ${i + 1}`,
  value: Math.floor(Math.random() * 5000) + 2000,
  trend: Math.floor(Math.random() * 1000) + 500,
}));

const RADAR_DATA = [
  { subject: 'Performance', A: 120, B: 110, fullMark: 150 },
  { subject: 'Reliability', A: 98, B: 130, fullMark: 150 },
  { subject: 'Scale', A: 86, B: 130, fullMark: 150 },
  { subject: 'Security', A: 99, B: 100, fullMark: 150 },
  { subject: 'Usability', A: 85, B: 90, fullMark: 150 },
  { subject: 'Cost', A: 65, B: 85, fullMark: 150 },
];

const TRANSACTIONS = [
  { id: 1, user: 'Sarah Wilson', amount: '$1,200.00', status: 'completed', date: '2 mins ago' },
  { id: 2, user: 'Alex Chen', amount: '$850.00', status: 'processing', date: '15 mins ago' },
  { id: 3, user: 'Emily Davis', amount: '$2,300.00', status: 'completed', date: '1 hour ago' },
  { id: 4, user: 'Michael Brown', amount: '$450.00', status: 'failed', date: '3 hours ago' },
];

// --- Components ---

function StatCard({ 
  title, 
  value, 
  trend, 
  trendUp, 
  icon: Icon, 
  data, 
  color 
}: { 
  title: string; 
  value: string; 
  trend: string; 
  trendUp: boolean; 
  icon: any; 
  data: number[];
  color: 'cyan' | 'purple' | 'emerald' | 'rose';
}) {
  return (
    <Surface className="relative overflow-hidden p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Text className="text-white/60 text-sm font-medium mb-1">{title}</Text>
          <Heading as="h3" className="text-3xl font-bold tracking-tight">{value}</Heading>
        </div>
        <div className={cn("p-3 rounded-xl bg-white/5 backdrop-blur-sm", {
          'text-cyan-400': color === 'cyan',
          'text-purple-400': color === 'purple',
          'text-emerald-400': color === 'emerald',
          'text-rose-400': color === 'rose',
        })}>
          <Icon size={24} />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div className={cn("flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg bg-white/5", 
          trendUp ? "text-emerald-400" : "text-rose-400"
        )}>
          {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trend}
        </div>
        <div className="w-24 h-12 -mb-2">
          <Sparkline data={data} color={color} height={40} strokeWidth={2} fill />
        </div>
      </div>
    </Surface>
  );
}

export function DashboardDemo() {
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiSubmit = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setAiResponse("Based on the current data, revenue has increased by 12% compared to last month. User acquisition is steady, but server load is peaking during business hours. I recommend scaling the database cluster.");
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading as="h1" className="text-3xl font-bold">Dashboard</Heading>
          <Text className="text-white/60">Overview of your project's performance</Text>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost">Last 7 Days</Button>
          <Button variant="primary" className="gap-2">
            <Download size={16} /> Export Report
          </Button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="$45,231.89" 
          trend="+20.1%" 
          trendUp={true} 
          icon={DollarSign} 
          data={REVENUE_DATA} 
          color="emerald" 
        />
        <StatCard 
          title="Active Users" 
          value="+2350" 
          trend="+180.1%" 
          trendUp={true} 
          icon={Users} 
          data={USERS_DATA} 
          color="cyan" 
        />
        <StatCard 
          title="Bounce Rate" 
          value="12.23%" 
          trend="-4.5%" 
          trendUp={true} // Good thing
          icon={Activity} 
          data={BOUNCE_DATA} 
          color="purple" 
        />
        <StatCard 
          title="Server Load" 
          value="54.2%" 
          trend="+12%" 
          trendUp={false} // Bad thing
          icon={TrendingUp} 
          data={LOAD_DATA} 
          color="rose" 
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (2/3) */}
        <Surface className="lg:col-span-2 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <Heading as="h3">Revenue vs Trend</Heading>
            <div className="flex gap-2">
              <Badge variant="neutral" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Revenue</Badge>
              <Badge variant="neutral" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Trend</Badge>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ChartContainer data={MAIN_CHART_DATA} height={300}>
              <BarChart color="emerald" showValues={false} animationDelay={0.2} />
              <LineChart color="cyan" strokeWidth={3} align="center" />
            </ChartContainer>
          </div>
        </Surface>

        {/* Radar Chart (1/3) */}
        <Surface className="p-6 flex flex-col">
          <Heading as="h3" className="mb-6">System Health</Heading>
          <div className="flex-1 flex items-center justify-center">
            <RadarChart 
              data={RADAR_DATA} 
              keys={['A', 'B']} 
              colors={['cyan', 'purple']} 
              height={300} 
            />
          </div>
          <div className="flex justify-center gap-4 mt-4">
             <div className="flex items-center gap-2 text-sm text-white/60">
                <div className="w-3 h-3 rounded-full bg-cyan-500" /> Current
             </div>
             <div className="flex items-center gap-2 text-sm text-white/60">
                <div className="w-3 h-3 rounded-full bg-purple-500" /> Target
             </div>
          </div>
        </Surface>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Surface className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Heading as="h3">Recent Transactions</Heading>
            <Button variant="ghost" size="sm"><MoreHorizontal size={16} /></Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TRANSACTIONS.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar src={`https://i.pravatar.cc/150?u=${t.id}`} fallback={t.user[0]} size="sm" />
                      <Text className="font-medium">{t.user}</Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusDot variant={t.status === 'completed' ? 'success' : t.status === 'processing' ? 'warning' : 'neutral'} />
                    <span className="ml-2 capitalize">{t.status}</span>
                  </TableCell>
                  <TableCell className="text-white/60">{t.date}</TableCell>
                  <TableCell className="text-right font-mono">{t.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Surface>

        {/* AI Analyst */}
        <Surface className="p-6 flex flex-col gap-4">
          <Heading as="h3">AI Analyst</Heading>
          <div className="flex-1 bg-white/[0.02] rounded-xl p-4 border border-white/5 min-h-[200px]">
            {!aiResponse && !isGenerating && (
              <div className="h-full flex flex-col items-center justify-center text-white/40 text-center">
                <Activity size={32} className="mb-2 opacity-50" />
                <p>Ask me to analyze your data...</p>
              </div>
            )}
            {isGenerating && (
               <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                 <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-75" />
                 <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-150" />
                 Analyzing data...
               </div>
            )}
            {aiResponse && (
              <AIResponse>
                {aiResponse}
              </AIResponse>
            )}
          </div>
          <AIPromptInput 
            value={aiQuery}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAiQuery(e.target.value)}
            onSubmit={handleAiSubmit}
            placeholder="Ask about revenue trends..."
            isGenerating={isGenerating}
          />
        </Surface>
      </div>
    </div>
  );
}
