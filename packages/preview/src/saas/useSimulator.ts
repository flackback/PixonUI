import { useEffect } from 'react';
import { useToast } from '@pixonui/react';

const SIMULATED_EVENTS = [
  {
    title: "Sincronização via WebSocket",
    description: "Emily Chen alterou o status da tarefa 'SSO SAML Support' para Review.",
    type: "info"
  },
  {
    title: "Nova Mensagem Recebida",
    description: "Sarah Wilson: 'Consegui rodar a integração! Ficou super fluida.'",
    type: "chat"
  },
  {
    title: "Alerta de WIP (Work In Progress)",
    description: "Gargalo detectado na coluna 'Review'. Limite máximo de 3 tarefas atingido.",
    type: "warning"
  },
  {
    title: "Métrica de Performance SaaS",
    description: "Heurística de IA calculou o tempo estimado de entrega do sprint: 14 horas.",
    type: "success"
  },
  {
    title: "Aviso de Conexão",
    description: "Latência do cluster da América Latina estabilizada em 14ms.",
    type: "success"
  }
];

export function useSimulator() {
  // Disabled the background toast simulation to prevent intrusive popups.
  /*
  const { toast } = useToast();

  useEffect(() => {
    // We set up a periodic interval to fire simulated WebSocket events
    const interval = setInterval(() => {
      // Pick a random event
      const event = SIMULATED_EVENTS[Math.floor(Math.random() * SIMULATED_EVENTS.length)]!;
      
      // Determine background color based on event type
      let toastClass = "border border-zinc-100 dark:border-white/5";
      if (event.type === "success") {
        toastClass = "border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20";
      } else if (event.type === "warning") {
        toastClass = "border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20";
      } else if (event.type === "chat") {
        toastClass = "border border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20";
      }

      toast({
        title: `⚡ ${event.title}`,
        description: event.description,
        variant: event.type as any,
        duration: 4000
      });
    }, 25000); // Trigger every 25 seconds to keep it non-intrusive but active!

    return () => clearInterval(interval);
  }, [toast]);
  */
}
