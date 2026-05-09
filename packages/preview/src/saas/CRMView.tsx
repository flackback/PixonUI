import React, { useRef, useState } from 'react';
import { 
  Surface, 
  Heading, 
  Text, 
  Grid, 
  Stack, 
  Badge, 
  Button, 
  StatusDot, 
  TestimonialGrid,
  SpotlightEffectCard,
  Confetti,
  ConfettiRef,
} from '@pixonui/react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Award, 
  ArrowUpRight, 
  Star, 
  CheckCircle2, 
  PhoneCall, 
  Sparkles,
} from 'lucide-react';

const testimonialsSample = [
  {
    name: "Juliana Santos",
    role: "Diretora de Vendas @ TechBR",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    content: "O PixonUI CRM revolucionou nossa equipe de vendas. Conseguimos fechar negócios 40% mais rápido devido à interface limpa e rápida.",
    rating: 5,
  },
  {
    name: "Marcos Oliveira",
    role: "VP de Contas @ GrowthCo",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    content: "A visualização de funil é espetacular. O carregamento de dados é instantâneo.",
    rating: 5,
  },
  {
    name: "Beatriz Costa",
    role: "Gerente de Customer Success",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    content: "Facilidade de customização sem precedentes. Nossos clientes elogiam a estética premium de cada dashboard.",
    rating: 5,
  }
];

export function CRMView() {
  const confettiRef = useRef<ConfettiRef>(null);
  const [deals, setDeals] = useState([
    { id: 1, company: 'Acme Corp', value: 'R$ 45.000', status: 'negotiation', stage: 'Proposta Enviada', owner: 'Carlos Souza' },
    { id: 2, company: 'Stark Industries', value: 'R$ 120.000', status: 'lead', stage: 'Qualificação', owner: 'Mariana Lima' },
    { id: 3, company: 'Wayne Enterprises', value: 'R$ 85.000', status: 'won', stage: 'Fechado Ganho', owner: 'Carlos Souza' },
    { id: 4, company: 'Umbrella Corp', value: 'R$ 30.000', status: 'lost', stage: 'Perdido', owner: 'Alice Ramos' },
  ]);

  const handleSimulateWin = () => {
    confettiRef.current?.fire({
      count: 100,
      spread: 70,
      gravity: 0.8,
    });
    
    // Add a new won deal dynamically
    const newDeal = {
      id: Date.now(),
      company: `Globex SaaS ${Math.floor(Math.random() * 100)}`,
      value: `R$ ${Math.floor(Math.random() * 50 + 10) * 1000}`,
      status: 'won',
      stage: 'Fechado Ganho',
      owner: 'Mariana Lima'
    };
    setDeals(prev => [newDeal, ...prev]);
  };

  return (
    <Stack gap={8} className="pb-12">
      <Confetti ref={confettiRef} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading as="h1" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
            CRM & Deal pipeline
          </Heading>
          <Text className="text-gray-500 dark:text-white/40 mt-1">
            Gerenciamento inteligente de leads, oportunidades de vendas e inteligência de mercado.
          </Text>
        </div>
        <div>
          <Button 
            onClick={handleSimulateWin}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-11 px-5 rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2 group transition-all"
          >
            <Sparkles className="h-4 w-4 text-amber-300 group-hover:scale-125 transition-transform" />
            Simular Negócio Ganho!
          </Button>
        </div>
      </div>

      {/* Key Stats Cards */}
      <Grid cols={1} gap={6} className="md:grid-cols-2 lg:grid-cols-4">
        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <DollarSign className="h-6 w-6" />
            </div>
            <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> +18.4%
            </Badge>
          </div>
          <div className="mt-4">
            <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Faturamento Projetado</Text>
            <Heading as="h3" className="text-2xl font-black mt-1">R$ 285.000</Heading>
          </div>
        </Surface>

        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> +12.3%
            </Badge>
          </div>
          <div className="mt-4">
            <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Taxa de Conversão</Text>
            <Heading as="h3" className="text-2xl font-black mt-1">24.8%</Heading>
          </div>
        </Surface>

        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Users className="h-6 w-6" />
            </div>
            <Badge variant="neutral" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">Meta 95%</Badge>
          </div>
          <div className="mt-4">
            <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Leads Qualificados</Text>
            <Heading as="h3" className="text-2xl font-black mt-1">1,482</Heading>
          </div>
        </Surface>

        <Surface className="p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500">
              <Briefcase className="h-6 w-6" />
            </div>
            <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1">
              +4 novos
            </Badge>
          </div>
          <div className="mt-4">
            <Text className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Negócios em Aberto</Text>
            <Heading as="h3" className="text-2xl font-black mt-1">32 Ativos</Heading>
          </div>
        </Surface>
      </Grid>

      {/* Spotlight & Pipeline Grid */}
      <Grid cols={1} gap={6} className="lg:grid-cols-3">
        {/* Sales Representative Spotlight */}
        <div className="lg:col-span-1">
          <SpotlightEffectCard className="h-full p-6 border border-purple-500/15 bg-purple-950/5 flex flex-col justify-between" glowBorder>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-400">
                <Award className="h-5 w-5" />
                <span className="text-xs font-extrabold uppercase tracking-widest">Destaque do Mês</span>
              </div>
              <div>
                <Heading as="h3" className="text-xl font-bold">Mariana Lima</Heading>
                <Text className="text-xs text-zinc-400 mt-1">Key Account Manager</Text>
              </div>
              <div className="space-y-2 border-t border-purple-500/10 pt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Vendas Fechadas:</span>
                  <span className="font-bold text-white">R$ 145.000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Meta Atingida:</span>
                  <span className="font-bold text-emerald-400">145%</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button size="sm" variant="glass" className="w-full text-xs py-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
                <PhoneCall className="h-3.5 w-3.5 mr-2" /> Agendar Alinhamento
              </Button>
            </div>
          </SpotlightEffectCard>
        </div>

        {/* Pipeline Table */}
        <Surface className="lg:col-span-2 p-6 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/30 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Heading as="h3" className="text-lg font-bold">Pipeline de Negócios</Heading>
              <Badge variant="neutral" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Oportunidades Recentes</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5 text-zinc-400 text-xs uppercase font-extrabold tracking-wider">
                    <th className="py-3 px-4">Empresa</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Etapa</th>
                    <th className="py-3 px-4">Responsável</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map(deal => (
                    <tr key={deal.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 px-4 font-bold">{deal.company}</td>
                      <td className="py-3 px-4 text-purple-500 dark:text-purple-400 font-mono font-semibold">{deal.value}</td>
                      <td className="py-3 px-4 text-xs font-medium text-zinc-500 dark:text-zinc-300">{deal.stage}</td>
                      <td className="py-3 px-4 text-zinc-400">{deal.owner}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {deal.status === 'won' && (
                            <>
                              <StatusDot variant="success" animate />
                              <span className="text-xs font-bold text-emerald-500">Ganho</span>
                            </>
                          )}
                          {deal.status === 'negotiation' && (
                            <>
                              <StatusDot variant="warning" animate />
                              <span className="text-xs font-bold text-amber-500">Negociação</span>
                            </>
                          )}
                          {deal.status === 'lead' && (
                            <>
                              <StatusDot variant="info" />
                              <span className="text-xs font-bold text-sky-500">Qualificação</span>
                            </>
                          )}
                          {deal.status === 'lost' && (
                            <>
                              <StatusDot variant="error" />
                              <span className="text-xs font-bold text-rose-500">Perdido</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Surface>
      </Grid>

      {/* Customer Testimonials Grid / Feedback Center */}
      <section className="space-y-4">
        <div className="flex flex-col">
          <Heading as="h3" className="text-lg font-bold">Feedback e Avaliações de Clientes</Heading>
          <Text className="text-xs text-zinc-400 mt-1">Depoimentos reais capturados em tempo real pelo canal de satisfação.</Text>
        </div>
        <TestimonialGrid testimonials={testimonialsSample} columns={3} variant="glass" />
      </section>
    </Stack>
  );
}
