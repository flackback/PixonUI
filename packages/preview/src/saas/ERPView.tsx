import React, { useState } from 'react';
import { 
  Surface, 
  Heading, 
  Text, 
  Grid, 
  Stack, 
  Badge, 
  Button, 
  Stepper,
  Timeline,
  TimelineItem,
  StatusDot
} from '@pixonui/react';
import { 
  Package, 
  Truck, 
  Boxes, 
  ShoppingCart, 
  ArrowRight, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertTriangle, 
  Search,
  Settings,
} from 'lucide-react';

export function ERPView() {
  const [currentStep, setCurrentStep] = useState(2); // Passos: Pedido Recebido -> Em Processamento -> Despachado -> Entregue
  
  const erpTimeline = [
    { title: 'Remessa de Alumínio Recebida', time: 'Hoje, 14:32', desc: 'Lote #A984 verificado e armazenado no Corredor 4.', status: 'success' },
    { title: 'Auditoria de Inventário Bimestral', time: 'Ontem, 09:15', desc: 'Acurácia de estoque auditada em 99.85%.', status: 'success' },
    { title: 'Alerta de Baixo Estoque: Bobinas de Cobre', time: '08 de Maio, 17:00', desc: 'Estoque mínimo atingido (12 und). Disparado pedido automático de compra.', status: 'warning' },
    { title: 'Novo Fornecedor Homologado', time: '05 de Maio, 10:30', desc: 'Alumínios do Nordeste Ltda cadastrada para fornecimento de chapas.', status: 'active' },
  ];

  const warehouseInventory = [
    { part: 'Chapa de Aço Galv. 2mm', code: 'STL-GV-02', qty: '840 kg', minQty: '200 kg', status: 'optimal' },
    { part: 'Bobina de Fio de Cobre 1.5mm', code: 'COP-W-15', qty: '12 und', minQty: '20 und', status: 'low' },
    { part: 'Conectores RJ45 Cat6', code: 'RJ45-C6', qty: '1,500 und', minQty: '500 und', status: 'optimal' },
    { part: 'Resina Poliéster Industrial', code: 'RES-PL-IND', qty: '45 Litros', minQty: '50 Litros', status: 'critical' },
  ];

  return (
    <Stack gap={8} className="pb-12">
      {/* Header */}
      <div>
        <Heading as="h1" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
          ERP & Supply Chain Operations
        </Heading>
        <Text className="text-gray-500 dark:text-white/40 mt-1">
          Módulos unificados de controle de produção industrial, almoxarifado, compras e rastreamento de logística de entregas.
        </Text>
      </div>

      {/* Grid of operational indicators */}
      <Grid cols={1} gap={6} className="md:grid-cols-2 lg:grid-cols-4">
        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Armazém (Ocupação)</Text>
            <Heading as="h3" className="text-2xl font-black">74% ocupado</Heading>
            <Text className="text-[11px] text-zinc-500">Capacidade física operacional</Text>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Boxes className="h-6 w-6" />
          </div>
        </Surface>

        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Ordens de Compra</Text>
            <Heading as="h3" className="text-2xl font-black">18 Ativas</Heading>
            <Text className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> +3 aguardando envio
            </Text>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl">
            <ShoppingCart className="h-6 w-6" />
          </div>
        </Surface>

        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Entregas em Rota</Text>
            <Heading as="h3" className="text-2xl font-black">9 Caminhões</Heading>
            <Text className="text-[11px] text-zinc-500">Distribuição regional de carga</Text>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Truck className="h-6 w-6" />
          </div>
        </Surface>

        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Alertas Críticos</Text>
            <Heading as="h3" className="text-2xl font-black text-rose-500">2 Insumos</Heading>
            <Text className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Reposição imediata
            </Text>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <Package className="h-6 w-6" />
          </div>
        </Surface>
      </Grid>

      {/* Production Logistics tracker & Activity flow */}
      <Grid cols={1} gap={6} className="lg:grid-cols-3">
        {/* Logistics Shipping step progress tracker */}
        <Surface className="lg:col-span-2 p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/30 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Heading as="h3" className="text-lg font-bold">Rastreamento de Despacho de Cargas</Heading>
              <Text className="text-xs text-zinc-400">Rastreie o estágio atual da remessa de carga #REM-2026-948</Text>
            </div>
            <Badge variant="neutral" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Ativo</Badge>
          </div>

          <div className="py-4">
            <Stepper 
              currentStep={currentStep}
              onStepClick={setCurrentStep}
              steps={[
                { title: 'Pedido Fat.', description: 'Pronto p/ Embalar' },
                { title: 'Carregamento', description: 'Paletização Ok' },
                { title: 'Em Trânsito', description: 'Mercadoria despachada' },
                { title: 'Entregue', description: 'Cliente assinou termo' },
              ]}
            />
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4">
            <div className="text-xs text-zinc-400">
              Próxima atualização prevista: <strong className="text-zinc-900 dark:text-white">Hoje, 21:00</strong> (Previsão de chegada ao CD São Paulo).
            </div>
            <Button size="sm" variant="glass" className="text-xs text-emerald-500 border-emerald-500/10 bg-emerald-500/5">
              Visualizar Manifestos de Carga <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </Surface>

        {/* Inventory Critical levels list */}
        <Surface className="lg:col-span-1 p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/30 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <Heading as="h3" className="text-lg font-bold">Níveis de Estoque Almoxarifado</Heading>
              <Text className="text-xs text-zinc-400">Status dos componentes de manufatura</Text>
            </div>

            <div className="space-y-4">
              {warehouseInventory.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                  <div>
                    <div className="text-sm font-bold">{item.part}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{item.code} • Mínimo: {item.minQty}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-sm font-mono font-bold">{item.qty}</span>
                    <div className="flex items-center gap-1">
                      {item.status === 'optimal' && (
                        <>
                          <StatusDot variant="success" />
                          <span className="text-[9px] font-bold text-emerald-500 uppercase">Estável</span>
                        </>
                      )}
                      {item.status === 'low' && (
                        <>
                          <StatusDot variant="warning" animate />
                          <span className="text-[9px] font-bold text-amber-500 uppercase">Baixo</span>
                        </>
                      )}
                      {item.status === 'critical' && (
                        <>
                          <StatusDot variant="error" animate />
                          <span className="text-[9px] font-bold text-rose-500 uppercase">Crítico</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Surface>
      </Grid>

      {/* Operations timeline and log logs */}
      <section className="space-y-4">
        <div>
          <Heading as="h3" className="text-lg font-bold">Histórico e Registros Operacionais Recentes</Heading>
          <Text className="text-xs text-zinc-400 mt-1">Registros automáticos das máquinas da fábrica e faturamento eletrônico.</Text>
        </div>
        <Timeline className="border rounded-2xl p-6 bg-white dark:bg-zinc-950/40 border-gray-100 dark:border-white/5">
          {erpTimeline.map((item, idx) => (
            <TimelineItem 
              key={idx}
              title={item.title}
              date={item.time}
              status={item.status as any}
            >
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
            </TimelineItem>
          ))}
        </Timeline>
      </section>
    </Stack>
  );
}
