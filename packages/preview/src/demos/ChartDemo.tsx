import React, { useState } from 'react';
import { 
  ChartContainer, 
  ChartGrid, 
  ChartXAxis, 
  ChartYAxis,
  ChartTooltip, 
  BarChart, 
  AreaChart,
  LineChart,
  PieChart,
  RadarChart,
  Sparkline,
  ChartSkeleton,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  Switch,
  Label
} from '@pixonui/react';

const initialData = [
  { label: 'Jan', value: 400, details: "Strong start to the year with post-holiday sales." },
  { label: 'Feb', value: 300, details: "Slight dip due to shorter month." },
  { label: 'Mar', value: 550, details: "End of Q1 push exceeded targets." },
  { label: 'Apr', value: 450, details: "Steady performance in early spring." },
  { label: 'May', value: 600, details: "Marketing campaign ROI kicking in." },
  { label: 'Jun', value: 700, details: "Record breaking month before summer." },
];

const secondaryData = [
  { label: 'Jan', value: 200, details: "Slow start." },
  { label: 'Feb', value: 450, details: "Recovery phase." },
  { label: 'Mar', value: 300, details: "Market correction." },
  { label: 'Apr', value: 500, details: "New product launch." },
  { label: 'May', value: 350, details: "Supply chain issues." },
  { label: 'Jun', value: 600, details: "Resolved issues." },
];

export function ChartDemo() {
  const [data, setData] = useState(initialData);
  const [chartType, setChartType] = useState<'bar' | 'area' | 'line' | 'pie'>('bar');
  const [showValues, setShowValues] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  const toggleData = () => {
    setIsLoading(true);
    setTimeout(() => {
        setData(prev => prev === initialData ? secondaryData : initialData);
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 w-full max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue performance for 2024.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
               <div className="flex items-center gap-2 mr-4">
                  <Switch id="show-values" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} />
                  <Label htmlFor="show-values" className="text-xs">Values</Label>
               </div>
               <div className="bg-white/5 p-1 rounded-lg flex gap-1">
                   <Button 
                     variant={chartType === 'bar' ? 'primary' : 'ghost'} 
                     onClick={() => setChartType('bar')}
                     size="sm"
                     className="h-7 text-xs"
                   >
                     Bar
                   </Button>
                   <Button 
                     variant={chartType === 'area' ? 'primary' : 'ghost'} 
                     onClick={() => setChartType('area')}
                     size="sm"
                     className="h-7 text-xs"
                   >
                     Area
                   </Button>
                   <Button 
                     variant={chartType === 'line' ? 'primary' : 'ghost'} 
                     onClick={() => setChartType('line')}
                     size="sm"
                     className="h-7 text-xs"
                   >
                     Line
                   </Button>
                   <Button 
                     variant={chartType === 'pie' ? 'primary' : 'ghost'} 
                     onClick={() => setChartType('pie')}
                     size="sm"
                     className="h-7 text-xs"
                   >
                     Pie
                   </Button>
               </div>
               <Button variant="outline" onClick={toggleData} size="sm" className="h-8 text-xs">
                 {isLoading ? 'Loading...' : 'Update Data'}
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            {isLoading ? (
                <ChartSkeleton />
            ) : (
                <ChartContainer data={data} height={350}>
                    {chartType !== 'pie' && <ChartGrid />}
                    {chartType !== 'pie' && <ChartXAxis />}
                    {chartType !== 'pie' && <ChartYAxis />}
                    
                    {chartType === 'bar' && (
                      <BarChart 
                          color="cyan" 
                          showValues={showValues} 
                          onValueClick={setSelectedPoint}
                      />
                    )}
                    {chartType === 'area' && (
                      <AreaChart 
                          color="purple" 
                          showValues={showValues}
                          onValueClick={setSelectedPoint}
                      />
                    )}
                    {chartType === 'line' && (
                      <LineChart 
                          color="emerald" 
                          showValues={showValues}
                          onValueClick={setSelectedPoint}
                          curve="smooth"
                      />
                    )}
                    {chartType === 'pie' && (
                      <PieChart 
                          showLabels={showValues}
                          innerRadius={0.6} // Donut style by default looks nice
                      />
                    )}
                    
                    <ChartTooltip />
                </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card>
            <CardHeader>
               <CardTitle>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
               <ChartContainer data={initialData} height={200}>
                  <AreaChart color="emerald" animationDelay={0.5} />
                  <ChartTooltip />
               </ChartContainer>
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
               <CardTitle>Sales Volume</CardTitle>
            </CardHeader>
            <CardContent>
               <ChartContainer data={secondaryData} height={200}>
                  <BarChart color="rose" animationDelay={0.5} />
                  <ChartTooltip />
               </ChartContainer>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card>
            <CardHeader>
               <CardTitle>System Health (Radar)</CardTitle>
               <CardDescription>Multi-variable performance metrics.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
               <RadarChart 
                  data={[
                    { subject: 'Speed', A: 120, B: 110 },
                    { subject: 'Reliability', A: 98, B: 130 },
                    { subject: 'Security', A: 86, B: 130 },
                    { subject: 'UX', A: 99, B: 100 },
                    { subject: 'Cost', A: 85, B: 90 },
                  ]} 
                  keys={['A', 'B']} 
                  colors={['cyan', 'purple']} 
                  height={250} 
               />
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
               <CardTitle>Quick Trends (Sparklines)</CardTitle>
               <CardDescription>Lightweight mini-charts for dashboards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 uppercase font-bold">Revenue</p>
                    <p className="text-xl font-bold">$45,231</p>
                  </div>
                  <div className="w-32">
                    <Sparkline data={[30, 40, 35, 50, 45, 60, 55, 70]} color="emerald" fill />
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 uppercase font-bold">Users</p>
                    <p className="text-xl font-bold">12,402</p>
                  </div>
                  <div className="w-32">
                    <Sparkline data={[70, 60, 65, 50, 55, 40, 45, 30]} color="rose" fill />
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 uppercase font-bold">Uptime</p>
                    <p className="text-xl font-bold">99.9%</p>
                  </div>
                  <div className="w-32">
                    <Sparkline data={[99, 98, 100, 99, 99, 100, 99, 100]} color="cyan" />
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      <Drawer isOpen={!!selectedPoint} onClose={() => setSelectedPoint(null)}>
            <div className="mx-auto w-full max-w-sm h-full flex flex-col">
                <DrawerHeader>
                    <DrawerTitle>{selectedPoint?.label} Performance</DrawerTitle>
                    <DrawerDescription>Detailed breakdown for this period.</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 pb-8 flex-1">
                    <div className="flex items-center justify-center py-8">
                        <span className="text-6xl font-bold tracking-tighter">
                            {selectedPoint?.value}
                        </span>
                        <span className="text-xl text-white/50 ml-2">units</span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-sm text-white/80">
                            {selectedPoint?.details || "No additional details available for this data point."}
                        </p>
                    </div>
                </div>
            </div>
      </Drawer>
    </div>
  );
}
