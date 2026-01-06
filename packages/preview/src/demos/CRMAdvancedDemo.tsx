import React from 'react';
import { 
  WaveformAudio, 
  AISummaryCard, 
  SmartReplySuggestions, 
  BulkActionBar, 
  ConnectionStatusBanner,
  Card,
  Heading,
  Text,
  Stack,
  MessageBubble
} from '@pixonui/react';
import { useState } from 'react';
import { Trash2, Archive, CheckCircle } from 'lucide-react';

export function CRMAdvancedDemo() {
  const [selectedCount, setSelectedCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'reconnecting' | 'error' | 'connected'>('disconnected');

  return (
    <div className="space-y-8 pb-20">
      <section>
        <Heading level={3} className="mb-4">Status de Conexão</Heading>
        <div className="relative h-24 border border-white/10 rounded-xl overflow-hidden bg-black/20 flex flex-col items-center justify-center">
          <ConnectionStatusBanner 
            status={connectionStatus === 'connected' ? 'connecting' : connectionStatus as any} 
            onRetry={() => setConnectionStatus('connecting')}
          />
          <div className="mt-8 flex gap-2">
            <button onClick={() => setConnectionStatus('disconnected')} className="text-[10px] px-2 py-1 bg-white/5 rounded">Simular Queda</button>
            <button onClick={() => setConnectionStatus('connecting')} className="text-[10px] px-2 py-1 bg-white/5 rounded">Simular Conexão</button>
            <button onClick={() => setConnectionStatus('error')} className="text-[10px] px-2 py-1 bg-white/5 rounded">Simular Erro</button>
          </div>
        </div>
      </section>

      <section>
        <Heading level={3} className="mb-4">CRM & Atendimento</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4 space-y-4">
            <Text className="font-bold border-b border-white/5 pb-2 mb-2">Mensagem com Atribuíção</Text>
            <MessageBubble 
              message={{
                id: '1',
                text: 'Olá! Como posso ajudar você hoje?',
                timestamp: new Date().toISOString(),
                fromMe: true,
                status: 'read',
                agentName: 'Robson Silva',
                type: 'chat'
              }}
            />
            
            <Text className="font-bold border-b border-white/5 pb-2 mt-4 mb-2">Nota Interna (Rascunho)</Text>
            <MessageBubble 
              message={{
                id: '2',
                text: 'CLIENTE VIP: Priorizar atendimento e oferecer desconto de 10%.',
                timestamp: new Date().toISOString(),
                fromMe: true,
                status: 'read',
                isInternalNote: true,
                type: 'chat'
              }}
            />
          </Card>

          <Card className="p-4 space-y-4">
            <Text className="font-bold border-b border-white/5 pb-2 mb-2">Player Waveform (WhatsApp Style)</Text>
            <div className="bg-white/5 p-4 rounded-xl">
              <WaveformAudio 
                audioUrl="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
                duration={180}
              />
            </div>
            <Text className="text-xs text-white/40">Visualização de ondas dinâmica baseada no áudio ou aleatória para mock.</Text>
          </Card>
        </div>
      </section>

      <section>
        <Heading level={3} className="mb-4">AI Intelligence</Heading>
        <div className="space-y-4">
          <AISummaryCard 
            summary="O cliente está interessado na renovação do plano Maxzapp Pro. Ele demonstrou frustração com a demora no suporte anterior, mas ficou satisfeito com a solução apresentada agora. Próximo passo: Enviar link de checkout com cupom."
            sentiment="positive"
            onAction={(action) => console.log('Action:', action)}
          />
          
          <div className="p-4 border border-white/5 rounded-2xl bg-white/[0.02]">
            <Text className="text-xs font-bold text-white/40 mb-3 uppercase tracking-wider">Sugestões de Respostas Rápidas</Text>
            <SmartReplySuggestions 
              suggestions={[
                "Com certeza, vou gerar o link agora mesmo!",
                "Qual plano você teria interesse?",
                "Posso te ajudar com mais alguma coisa?",
                "Ok, entendi perfeitamente."
              ]}
              onSelect={(s) => alert('Selecionado: ' + s)}
            />
          </div>
        </div>
      </section>

      <section>
        <Heading level={3} className="mb-4">Bulk Actions (Seleção em Massa)</Heading>
        <div className="relative h-48 border border-white/10 rounded-xl bg-black/20 p-8 flex flex-col items-center justify-center gap-4">
          <Text>Selecione itens para ver a barra de ações</Text>
          <div className="flex gap-2">
            <button onClick={() => setSelectedCount(1)} className="px-3 py-1 bg-white/10 rounded">Selecionar 1</button>
            <button onClick={() => setSelectedCount(5)} className="px-3 py-1 bg-white/10 rounded">Selecionar 5</button>
            <button onClick={() => setSelectedCount(0)} className="px-3 py-1 bg-white/20 rounded">Limpar</button>
          </div>

          <BulkActionBar 
            isVisible={selectedCount > 0}
            selectedCount={selectedCount}
            onClear={() => setSelectedCount(0)}
            actions={[
              { label: 'Marcar Lida', icon: <CheckCircle size={16} />, onClick: () => {}, variant: 'default' },
              { label: 'Arquivar', icon: <Archive size={16} />, onClick: () => {}, variant: 'secondary' },
              { label: 'Excluir', icon: <Trash2 size={16} />, onClick: () => {}, variant: 'danger' },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
