import React from 'react';
import { 
  MetricCard, 
  ChartContainer, 
  AreaChart, 
  BarChart, 
  ChartYAxis, 
  Heading, 
  Text, 
  Surface, 
  Grid, 
  Stack, 
  Badge,
  Button,
  cn
} from '@pixonui/react';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreHorizontal,
  Filter,
  Download
} from 'lucide-react';

const conversationData = [
  { label: 'Mon', value: 45 },
  { label: 'Tue', value: 52 },
  { label: 'Wed', value: 38 },
  { label: 'Thu', value: 65 },
  { label: 'Fri', value: 48 },
  { label: 'Sat', value: 24 },
  { label: 'Sun', value: 31 },
];

const responseTimeData = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 15 },
  { label: 'Wed', value: 10 },
  { label: 'Thu', value: 8 },
  { label: 'Fri', value: 11 },
  { label: 'Sat', value: 14 },
  { label: 'Sun', value: 13 },
];

export function Dashboard() {
  return (
    <Stack gap={8}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading as="h1" className="text-3xl font-bold tracking-tight">Dashboard Overview</Heading>
          <Text className="text-gray-500 dark:text-white/40 mt-1">Welcome back, Alex. Here's what's happening today.</Text>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-10 border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="h-10 border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <Grid cols={1} gap={6} className="md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          accent="blue"
          icon={<MessageSquare className="h-5 w-5 text-white" />}
          value="1,284"
          subtext={
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
              <ArrowUpRight className="h-3 w-3" /> +12.5%
            </div>
          }
          showWave
        />
        <MetricCard 
          accent="violet"
          icon={<Users className="h-5 w-5 text-white" />}
          value="842"
          subtext={
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
              <ArrowUpRight className="h-3 w-3" /> +5.2%
            </div>
          }
          showWave
        />
        <MetricCard 
          accent="amber"
          icon={<Clock className="h-5 w-5 text-white" />}
          value="4m 12s"
          subtext={
            <div className="flex items-center gap-1 text-rose-500 font-bold text-xs">
              <ArrowDownRight className="h-3 w-3" /> -2.1%
            </div>
          }
          showWave
        />
        <MetricCard 
          accent="emerald"
          icon={<Zap className="h-5 w-5 text-white" />}
          value="98.2%"
          subtext={
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
              <ArrowUpRight className="h-3 w-3" /> +0.4%
            </div>
          }
          showWave
        />
      </Grid>

      {/* Charts Section */}
      <Grid cols={1} gap={6} className="lg:grid-cols-3">
        <Surface className="lg:col-span-2 p-8 border-gray-200 dark:border-white/5 bg-white dark:bg-black/40">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Heading as="h3" className="text-lg font-bold">Conversation Volume</Heading>
              <Text className="text-xs text-gray-500 dark:text-white/30 uppercase tracking-widest font-bold mt-1">Weekly Activity</Text>
            </div>
            <Badge variant="neutral" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Live Updates</Badge>
          </div>
          <div className="h-[300px] w-full">
            <ChartContainer data={conversationData} padding={{ top: 20, right: 20, bottom: 40, left: 40 }}>
              <ChartYAxis />
              <AreaChart color="cyan" />
            </ChartContainer>
          </div>
        </Surface>

        <Surface className="p-8 border-gray-200 dark:border-white/5 bg-white dark:bg-black/40">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Heading as="h3" className="text-lg font-bold">Response Time</Heading>
              <Text className="text-xs text-gray-500 dark:text-white/30 uppercase tracking-widest font-bold mt-1">Avg. Minutes</Text>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-[300px] w-full">
            <ChartContainer data={responseTimeData} padding={{ top: 20, right: 20, bottom: 40, left: 40 }}>
              <ChartYAxis />
              <BarChart color="purple" />
            </ChartContainer>
          </div>
        </Surface>
      </Grid>

      {/* Recent Activity / Table Preview */}
      <Surface className="p-8 border-gray-200 dark:border-white/5 bg-white dark:bg-black/40">
        <div className="flex items-center justify-between mb-8">
          <Heading as="h3" className="text-lg font-bold">Recent Conversations</Heading>
          <Button variant="ghost" size="sm" className="text-cyan-500 font-bold hover:bg-cyan-500/10">View All</Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-cyan-500/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-white/10 dark:to-white/5 flex items-center justify-center font-bold text-xs">
                  JD
                </div>
                <div>
                  <Text className="font-bold">John Doe</Text>
                  <Text className="text-xs text-gray-500 dark:text-white/30">"I'm having trouble with the new integration..."</Text>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Badge variant="neutral" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>
                <Text className="text-xs text-gray-400">2m ago</Text>
                <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-cyan-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </Surface>
    </Stack>
  );
}
