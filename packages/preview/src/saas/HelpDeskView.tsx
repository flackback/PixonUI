import React, { useState } from 'react';
import { 
  Surface, 
  Heading, 
  Text, 
  Grid, 
  Stack, 
  Badge, 
  Button, 
  StatusDot,
  WaveformAudio,
  AISummaryCard,
  SmartReplySuggestions
} from '@pixonui/react';
import { 
  MessageSquare, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Send, 
  Sparkles,
  PhoneCall,
  Video
} from 'lucide-react';

export function HelpDeskView() {
  const [selectedTicketId, setSelectedTicketId] = useState(1);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'customer', text: 'Olá, comprei o plano Pro mas a minha conta ainda consta como gratuita. Podem verificar por favor?', time: '14:20' },
    { id: 2, sender: 'agent', text: 'Olá! Sou o Robson e vou te ajudar. Pode me informar o e-mail de compra cadastrado?', time: '14:22' },
    { id: 3, sender: 'customer', text: 'Claro, é contato@startupbr.co. Segue também o áudio que gravei detalhando os erros.', time: '14:23' },
  ]);
  const [inputText, setInputText] = useState('');

  const tickets = [
    { id: 1, customer: 'StartupBR LTDA', subject: 'Upgrade de Plano pendente', priority: 'high', status: 'open', lastActive: '2 min ago', avatar: 'S' },
    { id: 2, customer: 'Julio Cezar', subject: 'Dúvidas sobre Webhooks', priority: 'medium', status: 'open', lastActive: '12 min ago', avatar: 'J' },
    { id: 3, customer: 'Alina Becker', subject: 'Problemas de autenticação Auth0', priority: 'critical', status: 'open', lastActive: '23 min ago', avatar: 'A' },
    { id: 4, customer: 'TechFlow Inc', subject: 'Exportação de relatórios XLS', priority: 'low', status: 'closed', lastActive: '1 dia atrás', avatar: 'T' },
  ];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'agent',
      text: inputText,
      time: '14:25'
    };
    setMessages([...messages, newMsg]);
    setInputText('');
  };

  const handleSuggestionSelect = (text: string) => {
    setInputText(text);
  };

  return (
    <Stack gap={8} className="pb-12 h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header */}
      <div className="flex-shrink-0">
        <Heading as="h1" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          HelpDesk & Smart Ticketing
        </Heading>
        <Text className="text-gray-500 dark:text-white/40 mt-1">
          Atendimento integrado ao cliente com copiloto de IA, resumos automáticos de chamados e canais de áudio integrados.
        </Text>
      </div>

      {/* Main split dashboard area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Ticket List */}
        <Surface className="lg:col-span-1 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/30 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input 
                placeholder="Filtrar chamados..." 
                className="w-full bg-zinc-50 dark:bg-white/5 border-transparent dark:border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <Button variant="outline" className="h-9 w-9 p-0 rounded-xl border-gray-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  selectedTicketId === ticket.id
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-sm'
                    : 'bg-zinc-50/50 dark:bg-white/[0.01] border-transparent hover:bg-zinc-50 dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xs">
                  {ticket.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate text-zinc-900 dark:text-white">{ticket.customer}</span>
                    <span className="text-[10px] text-zinc-400 whitespace-nowrap">{ticket.lastActive}</span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 truncate mt-0.5">{ticket.subject}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {ticket.priority === 'critical' && <Badge variant="danger" className="text-[9px] px-1.5 py-0">Urgente</Badge>}
                    {ticket.priority === 'high' && <Badge variant="neutral" className="bg-orange-500/10 text-orange-500 border-orange-500/10 text-[9px] px-1.5 py-0">Alta</Badge>}
                    {ticket.priority === 'medium' && <Badge variant="neutral" className="bg-blue-500/10 text-blue-500 border-blue-500/10 text-[9px] px-1.5 py-0">Média</Badge>}
                    {ticket.priority === 'low' && <Badge variant="neutral" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/10 text-[9px] px-1.5 py-0">Baixa</Badge>}
                    
                    <div className="flex items-center gap-1">
                      <StatusDot variant={ticket.status === 'open' ? 'success' : 'neutral'} />
                      <span className="text-[10px] font-bold text-zinc-400">{ticket.status === 'open' ? 'Aberto' : 'Resolvido'}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Surface>

        {/* Right column: Chat and AI Copilot */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          {/* AI Copilot Ticket Summary Card */}
          <div className="flex-shrink-0">
            <AISummaryCard 
              summary="Cliente comprou plano Pro, mas o sistema de billing ainda não liberou o painel administrativo. Recomenda-se confirmar a aprovação na Stripe, consultar o log ID #7418 e usar a Resposta Rápida de correção."
              onRegenerate={() => {}}
            />
          </div>

          {/* Chat Conversational bubbles container */}
          <Surface className="flex-1 border border-gray-200 dark:border-white/5 bg-white dark:bg-black/30 rounded-2xl p-4 flex flex-col min-h-0">
            {/* Chat header */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <StatusDot variant="success" animate />
                <div>
                  <Heading as="h4" className="text-sm font-bold">StartupBR LTDA • Chamado #9482</Heading>
                  <Text className="text-[11px] text-zinc-400">Canal de Chat da Central de Ajuda</Text>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 rounded-lg bg-zinc-50 dark:bg-white/5 border-gray-200 dark:border-white/10">
                  <PhoneCall className="h-3.5 w-3.5 mr-1" /> Chamar por Voz
                </Button>
                <Button size="sm" variant="outline" className="h-8 rounded-lg bg-zinc-50 dark:bg-white/5 border-gray-200 dark:border-white/10">
                  <Video className="h-3.5 w-3.5 mr-1" /> Video-conferência
                </Button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 flex flex-col">
              {messages.map((msg, i) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col max-w-[70%] ${
                    msg.sender === 'agent' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                    msg.sender === 'agent' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-zinc-300 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                  
                  {/* Display WhatsApp-style voice player mockup on third message */}
                  {i === 2 && (
                    <div className="mt-2 w-[280px] bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl rounded-bl-none border border-gray-100 dark:border-white/5">
                      <WaveformAudio 
                        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
                        duration={54}
                        isMe={false}
                      />
                    </div>
                  )}

                  <span className="text-[10px] text-zinc-400 mt-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Smart Suggestions and Reply Box */}
            <div className="flex-shrink-0 space-y-3 pt-3 border-t border-gray-100 dark:border-white/5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                Sugestões IA Copiloto
              </div>
              
              <SmartReplySuggestions 
                replies={[
                  "Verifiquei o pagamento e acabei de ativar seu plano manualmente!",
                  "Qual é o ID da transação que aparece no seu recibo?",
                  "Vou repassar ao time financeiro para apurarem o atraso na API."
                ]}
                onSelect={handleSuggestionSelect}
              />

              <div className="flex items-center gap-2 mt-2">
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escreva sua resposta..." 
                  className="flex-1 bg-zinc-50 dark:bg-white/5 border-transparent dark:border-white/5 rounded-xl py-3 px-4 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 w-11 p-0 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/10"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Surface>
        </div>

      </div>

    </Stack>
  );
}
