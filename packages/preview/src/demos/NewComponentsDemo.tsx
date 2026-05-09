import React, { useState } from 'react';
import { 
  UserPreview, 
  Timeline, 
  TimelineItem, 
  FileDropzone, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription,
  ShinyText,
  TextInput
} from '@pixonui/react';
import { Check, AlertCircle, Clock, Sparkles, Search, Mail, FileUp } from 'lucide-react';

export function NewComponentsDemo() {
  const [inputText, setInputText] = useState('');
  const [clearableText, setClearableText] = useState('PixonUI 2026');

  return (
    <div className="space-y-8 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <CardTitle>Shiny Text (Efeito Shimmer)</CardTitle>
          </div>
          <CardDescription>
            Tipografia interativa premium com varredura de luz (shimmer) e brilho retroiluminado (glow).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Predefinições Premium</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Gold Metallic:</span>
                <ShinyText variant="gold" className="text-lg font-bold">Ouro Imperial</ShinyText>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Neon Cyan-Pink:</span>
                <ShinyText variant="neon" className="text-lg font-bold">Retro Cyberpunk</ShinyText>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Sunset Horizon:</span>
                <ShinyText variant="sunset" className="text-lg font-bold">Warm Horizon</ShinyText>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Cyber Acid:</span>
                <ShinyText variant="cyber" className="text-lg font-bold">Cyber Acid-lime</ShinyText>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Spectrum Rainbow:</span>
                <ShinyText variant="rainbow" className="text-lg font-bold">Spectrum Sweep</ShinyText>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Recursos Interativos</h4>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Shimmer Glow Backing</span>
                <div className="flex gap-4">
                  <ShinyText variant="gold" glow className="text-base font-bold">Gold Glow</ShinyText>
                  <ShinyText variant="neon" glow className="text-base font-bold">Neon Glow</ShinyText>
                  <ShinyText variant="cyber" glow className="text-base font-bold">Cyber Glow</ShinyText>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Interação Hover-Only (Passe o Mouse)</span>
                <div>
                  <ShinyText variant="rainbow" hoverOnly className="text-sm font-semibold cursor-pointer py-1 border-b border-dashed border-white/10 hover:border-white/30 transition-colors">
                    Passe o mouse aqui para acionar o brilho rainbow!
                  </ShinyText>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ângulo e Velocidade customizados</span>
                <div className="flex gap-4">
                  <ShinyText angle={180} duration="4s" className="text-xs font-medium text-white/70">Vertical Lento (4s, 180°)</ShinyText>
                  <ShinyText angle={45} duration="0.8s" className="text-xs font-medium text-white/70">Diagonal Ultra Rápido (0.8s, 45°)</ShinyText>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <CardTitle>Text Inputs Avançados</CardTitle>
          </div>
          <CardDescription>
            Campos de entrada modernos com contadores reativos, botões para limpar e variantes de vidro.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <TextInput 
              label="Pesquisa com Ícones"
              placeholder="Digite sua busca..."
              value={inputText}
              onValueChange={setInputText}
              leftIcon={<Search size={16} />}
              showCharacterCount
              maxLength={25}
            />

            <TextInput 
              label="Campo Limpável (Clearable)"
              placeholder="Escreva algo..."
              value={clearableText}
              onValueChange={setClearableText}
              leftIcon={<Mail size={16} />}
              onClear={() => setClearableText('')}
            />
          </div>

          <div className="space-y-4">
            <TextInput 
              variant="glass"
              label="Campo Glassmorphic Premium"
              placeholder="Estilo de vidro translúcido..."
              leftIcon={<Sparkles size={16} className="text-purple-400" />}
            />

            <TextInput 
              label="Validação com Erro"
              placeholder="exemplo@email.com"
              value="email-invalido@"
              error="Por favor, insira um endereço de e-mail válido."
              leftIcon={<Mail size={16} />}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Preview</CardTitle>
          <CardDescription>A rich profile card for displaying user information.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <UserPreview 
            user={{
              name: "Sarah Wilson",
              role: "Product Designer",
              email: "sarah@pixon.ui",
              bio: "Passionate about building accessible and beautiful user interfaces.",
              stats: [
                { label: "Projects", value: 12 },
                { label: "Followers", value: "2.4k" },
                { label: "Following", value: 450 }
              ]
            }}
            onFollow={() => alert('Followed!')}
            onMessage={() => alert('Message sent!')}
          />
          
          <UserPreview 
            variant="glass"
            user={{
              name: "Alex Chen",
              role: "Senior Engineer",
              bio: "Full-stack developer loving React and TypeScript.",
              stats: [
                { label: "Commits", value: "8.5k" },
                { label: "PRs", value: 142 }
              ]
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Vertical list for tracking events or history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Timeline>
            <TimelineItem 
              status="success"
              title="Order Delivered"
              date="Just now"
              description="Package was handed to resident."
              icon={<Check className="h-3 w-3" />}
            />
            <TimelineItem 
              status="active"
              title="Out for Delivery"
              date="2 hours ago"
              description="Driver is on the way to your location."
              icon={<Clock className="h-3 w-3" />}
            />
            <TimelineItem 
              status="default"
              title="Order Processed"
              date="Yesterday"
              description="Your order has been packed and is ready for shipping."
            />
            <TimelineItem 
              status="error"
              title="Payment Failed"
              date="2 days ago"
              description="First attempt to charge card failed."
              icon={<AlertCircle className="h-3 w-3" />}
              isLast
            />
          </Timeline>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-purple-400" />
            <CardTitle>File Dropzone Super Avançado</CardTitle>
          </div>
          <CardDescription>
            Área de envio inteligente com extração de miniatura de imagem, barras de progresso simuladas de envio e tipos de arquivos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Estilo Padrão</span>
              <FileDropzone 
                variant="default"
                maxFiles={3}
                maxSize={15 * 1024 * 1024} // 15MB
                simulateUpload
                showThumbnails
                onDrop={(files: File[]) => console.log('Dropped on default dropzone:', files)}
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Estilo Glassmorphic Premium</span>
              <FileDropzone 
                variant="glass"
                maxFiles={3}
                maxSize={10 * 1024 * 1024} // 10MB
                simulateUpload
                showThumbnails
                onDrop={(files: File[]) => console.log('Dropped on glass dropzone:', files)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
