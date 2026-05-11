import React, { useState } from 'react';
import { 
  Surface, 
  Heading, 
  Text, 
  Grid, 
  Stack, 
  Badge, 
  Button, 
  AdvancedSlider,
  RetroGrid,
  ChartContainer,
  LineChart,
  AreaChart,
  ChartYAxis,
  ChartTooltip
} from '@pixonui/react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Network, 
  Sparkles, 
  Database, 
  ArrowUpRight, 
  RefreshCcw, 
} from 'lucide-react';

export function AnalyticsView() {
  const [cpuThrottling, setCpuThrottling] = useState(15);
  const [dbConnections, setDbConnections] = useState(45);
  const [refreshCount, setRefreshCount] = useState(0);

  // Dynamic values driven by inputs
  const throttlingMultiplier = 1 - (cpuThrottling - 15) / 120;
  const connectionMultiplier = 1 + (dbConnections - 45) / 100;

  // Throughput (AreaChart) dynamically degrades on CPU Throttling
  const throughputData = [
    { label: '10:00', value: Math.max(100, Math.round(3400 * throttlingMultiplier)) },
    { label: '11:00', value: Math.max(100, Math.round(4100 * throttlingMultiplier)) },
    { label: '12:00', value: Math.max(100, Math.round(3900 * throttlingMultiplier)) },
    { label: '13:00', value: Math.max(100, Math.round(5200 * throttlingMultiplier)) },
    { label: '14:00', value: Math.max(100, Math.round(6100 * throttlingMultiplier)) },
    { label: '15:00', value: Math.max(100, Math.round(5800 * throttlingMultiplier)) },
    { label: '16:00', value: Math.max(100, Math.round(7200 * throttlingMultiplier)) },
  ];

  // Error Rate (LineChart) spikes when CPU Throttling is high
  const errorFactor = 1 + (cpuThrottling - 15) / 15;
  const errorRateData = [
    { label: '10:00', value: Number((0.12 * errorFactor).toFixed(2)) },
    { label: '11:00', value: Number((0.15 * errorFactor).toFixed(2)) },
    { label: '12:00', value: Number((0.08 * errorFactor).toFixed(2)) },
    { label: '13:00', value: Number((0.05 * errorFactor).toFixed(2)) },
    { label: '14:00', value: Number((0.22 * errorFactor).toFixed(2)) },
    { label: '15:00', value: Number((0.11 * errorFactor).toFixed(2)) },
    { label: '16:00', value: Number((0.04 * errorFactor).toFixed(2)) },
  ];

  // SQL Latencies scale according to connection pools
  const queryPerformanceLog = [
    { 
      query: 'SELECT * FROM users WHERE active = 1 LIMIT 50', 
      latency: `${(0.4 * connectionMultiplier).toFixed(1)}ms`, 
      status: dbConnections > 140 ? 'warning' : 'optimal' 
    },
    { 
      query: 'UPDATE profiles SET avatar_url = $1 WHERE user_id = $2', 
      latency: `${(1.8 * connectionMultiplier).toFixed(1)}ms`, 
      status: dbConnections > 140 ? 'warning' : 'optimal' 
    },
    { 
      query: 'SELECT SUM(amount) FROM ledger GROUP BY company_id', 
      latency: `${(48.2 * connectionMultiplier).toFixed(1)}ms`, 
      status: dbConnections > 150 ? 'critical' : (dbConnections > 90 ? 'warning' : 'optimal') 
    },
    { 
      query: 'INSERT INTO analytic_logs (event, payload) VALUES ($1, $2)', 
      latency: `${(0.8 * connectionMultiplier).toFixed(1)}ms`, 
      status: dbConnections > 140 ? 'warning' : 'optimal' 
    },
    { 
      query: 'SELECT * FROM messages WHERE contains_vector($1)', 
      latency: `${(124.5 * connectionMultiplier).toFixed(1)}ms`, 
      status: dbConnections > 110 ? 'critical' : 'warning' 
    },
  ];

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  return (
    <Stack gap={8} className="pb-12 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div>
          <Heading as="h1" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Telemetry & Deep Analytics
          </Heading>
          <Text className="text-gray-500 dark:text-white/40 mt-1">
            Métricas de performance, consumo de recursos e monitoramento em tempo real da infraestrutura global.
          </Text>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="bg-white/5 border-white/10 text-white font-bold h-10 px-4 hover:bg-white/10 transition-all active:scale-95 flex items-center"
        >
          <RefreshCcw className="h-4 w-4 mr-2 text-cyan-400" /> Atualizar Telemetria
        </Button>
      </div>

      {/* Grid of hardware and network indicators */}
      <Grid cols={1} gap={6} className="md:grid-cols-2 lg:grid-cols-4 z-10">
        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl flex items-center justify-between shadow-lg hover:shadow-cyan-500/5 transition-all">
          <div className="space-y-2">
            <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Média de Uso do CPU</Text>
            <Heading as="h3" className="text-2xl font-black text-white">{(24.5 * connectionMultiplier).toFixed(1)}%</Heading>
            <Text className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
              Estável • 12 Cores virtuais
            </Text>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl">
            <Cpu className="h-6 w-6" />
          </div>
        </Surface>

        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-2">
            <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Taxa de Memória</Text>
            <Heading as="h3" className="text-2xl font-black text-white">{(4.8 * (1 + cpuThrottling / 180)).toFixed(1)} GB / 16GB</Heading>
            <Text className="text-[11px] text-zinc-500">Buffer livre: {(16 - 4.8 * (1 + cpuThrottling / 180)).toFixed(1)} GB</Text>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <HardDrive className="h-6 w-6" />
          </div>
        </Surface>

        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-2">
            <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Taxa de Requisições</Text>
            <Heading as="h3" className="text-2xl font-black text-white">{(6.4 * throttlingMultiplier).toFixed(1)}K req / s</Heading>
            <Text className={`text-[11px] font-semibold flex items-center gap-1 ${throttlingMultiplier > 0.7 ? 'text-emerald-500' : 'text-rose-500'}`}>
              <ArrowUpRight className="h-3 w-3" /> {throttlingMultiplier > 0.7 ? 'Fluxo saudável' : 'Uso severo de CPU'}
            </Text>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Network className="h-6 w-6" />
          </div>
        </Surface>

        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-2">
            <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Atraso na Rede (Ping)</Text>
            <Heading as="h3" className="text-2xl font-black text-white">{(12.4 * connectionMultiplier).toFixed(1)} ms</Heading>
            <Text className="text-[11px] text-zinc-500">Média global CDNs Cloudflare</Text>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
        </Surface>
      </Grid>

      {/* Slide and Grid system controls */}
      <Grid cols={1} gap={6} className="lg:grid-cols-3 z-10">
        
        {/* Resource Allocation controls */}
        <Surface className="lg:col-span-1 p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/30 rounded-2xl flex flex-col justify-between gap-6 shadow-xl">
          <div>
            <div className="mb-4">
              <Heading as="h3" className="text-lg font-bold">Simulador de Limitação</Heading>
              <Text className="text-xs text-zinc-400">Arraste os sliders abaixo para simular sobrecarga de infraestrutura em tempo real!</Text>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-400 uppercase tracking-wider">Cap do CPU Throttling</span>
                  <span className="text-cyan-400 font-black">{cpuThrottling}%</span>
                </div>
                <AdvancedSlider 
                  value={cpuThrottling}
                  onChange={setCpuThrottling}
                  min={5}
                  max={95}
                  suffix="%"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-400 uppercase tracking-wider">Pool Max de Conexões DB</span>
                  <span className="text-purple-400 font-black">{dbConnections} conexões</span>
                </div>
                <AdvancedSlider 
                  value={dbConnections}
                  onChange={setDbConnections}
                  min={10}
                  max={200}
                  bars={[10, 15, 20, 25, 45, 65, 80, 95, 85, 70, 50, 40, 25, 30, 45, 60, 75, 90, 100, 80, 45]}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Gráficos e latências reativos ativados</span>
            </div>
          </div>
        </Surface>

        {/* Charts & Graphs block */}
        <Surface className="lg:col-span-2 p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/30 rounded-2xl relative shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Throughput */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Heading as="h4" className="text-sm font-bold">Processamento e Throughput</Heading>
                  <Text className="text-[10px] text-zinc-400">Pacotes processados por min.</Text>
                </div>
                <Badge variant="neutral" className="bg-cyan-500/10 text-cyan-400 border-transparent text-[10px]">Live</Badge>
              </div>

              <div className="h-[180px] w-full">
                <ChartContainer data={throughputData}>
                  <ChartYAxis />
                  <AreaChart color="cyan" />
                  <ChartTooltip align="center" />
                </ChartContainer>
              </div>
            </div>

            {/* Chart 2: Error Rate */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Heading as="h4" className="text-sm font-bold">Taxa de Erros Operacionais</Heading>
                  <Text className="text-[10px] text-zinc-400">Percentual de falhas HTTP 5xx.</Text>
                </div>
                <Badge variant="neutral" className="bg-rose-500/10 text-rose-400 border-transparent text-[10px]">Alerta</Badge>
              </div>

              <div className="h-[180px] w-full">
                <ChartContainer data={errorRateData}>
                  <ChartYAxis />
                  <LineChart color="rose" />
                  <ChartTooltip align="center" />
                </ChartContainer>
              </div>
            </div>

          </div>
        </Surface>
      </Grid>

      {/* Query Performance logs table under perspective grid widget */}
      <section className="relative rounded-2xl border border-gray-200 dark:border-white/5 bg-zinc-900/10 dark:bg-black/40 overflow-hidden p-6 z-10 shadow-xl">
        <RetroGrid className="opacity-40" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <Heading as="h3" className="text-lg font-bold flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-500" />
                Desempenho de Queries em Tempo Real
              </Heading>
              <Text className="text-xs text-zinc-400">Rastreamento de tempos de latência e consumo de I/O das tabelas SQL.</Text>
            </div>
            <Badge variant="neutral" className="bg-purple-500/10 text-purple-500 border-purple-500/20 flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-pulse text-purple-400" /> Monitor Dinâmico
            </Badge>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-white/5 bg-white/75 dark:bg-black/40 backdrop-blur-md">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5 text-zinc-400 text-xs uppercase font-extrabold tracking-wider">
                  <th className="py-3 px-4">Instrução SQL</th>
                  <th className="py-3 px-4 text-right">Latência</th>
                  <th className="py-3 px-4 text-center">Status de Saúde</th>
                </tr>
              </thead>
              <tbody>
                {queryPerformanceLog.map((log, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-zinc-600 dark:text-zinc-300 max-w-[400px] truncate">{log.query}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white transition-all duration-300">{log.latency}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {log.status === 'optimal' && (
                          <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold py-0.5 px-2">Ótimo</Badge>
                        )}
                        {log.status === 'warning' && (
                          <Badge variant="neutral" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-bold py-0.5 px-2">Sub-ótimo</Badge>
                        )}
                        {log.status === 'critical' && (
                          <Badge variant="danger" className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] font-bold py-0.5 px-2 animate-pulse">Crítico</Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </Stack>
  );
}
