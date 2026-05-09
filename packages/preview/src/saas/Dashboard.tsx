import React from 'react';
import { 
  MetricCard, 
  ChartContainer, 
  AreaChart, 
  BarChart, 
  ChartYAxis, 
  ChartTooltip,
  Heading, 
  Text, 
  Surface, 
  Grid, 
  Stack, 
  Badge, 
  Button, 
  Skeleton,
  AnimatedList,
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
  Download,
  RefreshCcw,
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

const conversationsMock = [
  { id: 1, name: 'John Doe', avatar: 'JD', text: '"I\'m having trouble with the new integration..."', time: '2m ago', badge: 'Pending', badgeVariant: 'warning' },
  { id: 2, name: 'Sarah Connor', avatar: 'SC', text: '"The API latency increased suddenly this afternoon."', time: '14m ago', badge: 'Open', badgeVariant: 'info' },
  { id: 3, name: 'Bruce Wayne', avatar: 'BW', text: '"Could we upgrade our enterprise support plan?"', time: '1h ago', badge: 'Completed', badgeVariant: 'success' },
  { id: 4, name: 'Peter Parker', avatar: 'PP', text: '"Is there any issue with the billing webhook?"', time: '3h ago', badge: 'Pending', badgeVariant: 'warning' },
];

const MetricCardSkeleton = () => (
  <Surface className="p-6 border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] rounded-2xl flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <Skeleton variant="circle" className="h-10 w-10" />
      <Skeleton variant="default" className="h-6 w-16" />
    </div>
    <div className="flex flex-col gap-2 mt-2">
      <Skeleton variant="text" className="h-8 w-24" />
      <Skeleton variant="text" className="h-4 w-16" />
    </div>
  </Surface>
);

const ChartSkeleton = ({ withBar }: { withBar?: boolean }) => (
  <Surface className="p-8 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/40 rounded-2xl flex flex-col gap-6">
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton variant="text" className="h-6 w-36" />
        <Skeleton variant="text" className="h-4 w-20" />
      </div>
      <Skeleton variant="default" className="h-6 w-16" />
    </div>
    <div className="h-[300px] w-full flex items-end gap-3 pt-6">
      {[...Array(7)].map((_, idx) => (
        <Skeleton 
          key={idx} 
          variant="default" 
          className={`w-full rounded-t-xl ${
            withBar ? "bg-purple-500/10 dark:bg-purple-500/5" : "bg-cyan-500/10 dark:bg-cyan-500/5"
          }`} 
          style={{ height: `${25 + Math.sin(idx + 1) * 35 + (idx % 3) * 10}%` }} 
        />
      ))}
    </div>
  </Surface>
);

const ConversationSkeleton = () => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
    <div className="flex items-center gap-4 w-full max-w-md">
      <Skeleton variant="circle" className="h-10 w-10 flex-shrink-0" />
      <div className="flex flex-col gap-2 w-full">
        <Skeleton variant="text" className="h-4 w-24" />
        <Skeleton variant="text" className="h-3 w-3/4" />
      </div>
    </div>
    <div className="flex items-center gap-6 flex-shrink-0">
      <Skeleton variant="default" className="h-6 w-16" />
      <Skeleton variant="text" className="h-4 w-8" />
    </div>
  </div>
);

export function Dashboard() {
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  return (
    <Stack gap={8}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading as="h1" className="text-3xl font-bold tracking-tight">Dashboard Overview</Heading>
          <Text className="text-gray-500 dark:text-white/40 mt-1">Welcome back, Alex. Here&apos;s what&apos;s happening today.</Text>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-10 border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 font-bold hover:text-cyan-500 hover:border-cyan-500/30"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin text-cyan-500" : ""}`} />
            {isLoading ? "Simulating Loading..." : "Simulate Loading"}
          </Button>
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
        {isLoading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
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
          </>
        )}
      </Grid>

      {/* Charts Section */}
      <Grid cols={1} gap={6} className="lg:grid-cols-3">
        {isLoading ? (
          <>
            <div className="lg:col-span-2">
              <ChartSkeleton />
            </div>
            <ChartSkeleton withBar />
          </>
        ) : (
          <>
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
                  <ChartTooltip align="edge" />
                </ChartContainer>
              </div>
            </Surface>

            <Surface className="p-8 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/40">
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
                  <ChartTooltip align="center" />
                </ChartContainer>
              </div>
            </Surface>
          </>
        )}
      </Grid>

      {/* Recent Activity / Table Preview */}
      <Surface className="p-8 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/40">
        <div className="flex items-center justify-between mb-8">
          <Heading as="h3" className="text-lg font-bold">Recent Conversations</Heading>
          <Button variant="ghost" size="sm" className="text-cyan-500 font-bold hover:bg-cyan-500/10">View All</Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </div>
        ) : (
          /* Stagger the list of items beautifully using our new AnimatedList! */
          <AnimatedList stagger={60} duration={350} animation="fade-up" className="space-y-4">
            {conversationsMock.map((conv) => (
              <div key={conv.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-cyan-500/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 dark:from-cyan-500/10 dark:to-indigo-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-xs text-white">
                    {conv.avatar}
                  </div>
                  <div>
                    <Text className="font-bold">{conv.name}</Text>
                    <Text className="text-xs text-gray-500 dark:text-white/30">{conv.text}</Text>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <Badge 
                    variant={conv.badgeVariant as any} 
                    className={
                      conv.badgeVariant === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : conv.badgeVariant === 'info'
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }
                  >
                    {conv.badge}
                  </Badge>
                  <Text className="text-xs text-gray-400">{conv.time}</Text>
                  <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-cyan-500 transition-colors" />
                </div>
              </div>
            ))}
          </AnimatedList>
        )}
      </Surface>
    </Stack>
  );
}
