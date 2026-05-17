import React, { useState } from 'react';
import { useForm as useReactHookForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Button, 
  TextInput, 
  Textarea, 
  Switch, 
  Select, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  useToast,
  useForm as usePixonForm, // Our high-speed Native-First hook!
  Badge,
  cn
} from '@pixonui/react';
import { Check, ShieldCheck, Cpu, Play } from 'lucide-react';

// --- Zod + React Hook Form Setup ---
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username deve ter no mínimo 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um e-mail válido.",
  }),
  bio: z.string().max(160).min(4, {
    message: "A biografia deve ter entre 4 e 160 caracteres."
  }),
  notifications: z.boolean().default(false).optional(),
  role: z.string().min(1, { message: "Por favor, selecione um cargo." }),
});

type FormValues = z.infer<typeof formSchema>;

export function FormDemo() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'zod' | 'native'>('zod');

  // React Hook Form instance
  const rhForm = useReactHookForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      bio: "",
      notifications: false,
      role: ""
    },
  });

  // Native Pixon Form instance
  const nativeForm = usePixonForm({
    initialValues: {
      username: '',
      email: '',
      bio: '',
      role: '',
      notifications: false
    },
    onSubmit: async (values: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast({
        title: "Sucesso! Form enviado via Native Engine",
        description: (
          <pre className="mt-2 w-full max-w-[340px] rounded-xl bg-emerald-950/80 border border-emerald-500/20 p-4 text-xs font-mono text-emerald-300">
            <code>{JSON.stringify(values, null, 2)}</code>
          </pre>
        ),
      });
    }
  });

  // Zod form submission
  function onZodSubmit(data: FormValues) {
    toast({
      title: "Sucesso! Form enviado via Zod + Hook Form",
      description: (
        <pre className="mt-2 w-full max-w-[340px] rounded-xl bg-purple-950/80 border border-purple-500/20 p-4 text-xs font-mono text-purple-300">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      
      {/* Dynamic Tab Switcher */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 text-xs font-semibold max-w-[320px] mx-auto border border-zinc-200 dark:border-white/5">
        <button
          onClick={() => setActiveTab('zod')}
          className={cn(
            "flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === 'zod' 
              ? "bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm" 
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          <Cpu className="h-3.5 w-3.5" />
          Zod + Hook Form
        </button>
        <button
          onClick={() => setActiveTab('native')}
          className={cn(
            "flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === 'native' 
              ? "bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm" 
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Native-First (useForm)
        </button>
      </div>

      {activeTab === 'zod' ? (
        /* TAB 1: ZOD + REACT HOOK FORM */
        <Card className="border border-purple-100 dark:border-purple-500/10">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Configurações de Perfil (Zod)</CardTitle>
              <Badge variant="neutral">Heavy validation</Badge>
            </div>
            <CardDescription>Validação robusta com esquemas Zod e suporte do React Hook Form.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={rhForm.handleSubmit(onZodSubmit)} className="space-y-5">
              
              <Controller
                control={rhForm.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <TextInput placeholder="anderson" {...field} />
                    </FormControl>
                    <FormDescription>Seu nome público de exibição.</FormDescription>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <Controller
                control={rhForm.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <TextInput placeholder="anderson@pixon.ui" {...field} />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <Controller
                control={rhForm.control}
                name="bio"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Fale um pouco sobre você" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <Controller
                control={rhForm.control}
                name="role"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onChange={field.onChange}
                        options={[
                            { value: "developer", label: "Developer Sênior" },
                            { value: "designer", label: "Product Designer" },
                            { value: "cto", label: "Diretor de Tecnologia" },
                        ]}
                        placeholder="Selecione um cargo"
                        menuAnimation="slide"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <Controller
                control={rhForm.control}
                name="notifications"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold">Notificações por E-mail</FormLabel>
                      <FormDescription>
                        Receba novidades sobre novos recursos da plataforma.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={value}
                        onChange={(e: any) => onChange(e.target.checked)}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                Salvar Perfil (Zod)
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* TAB 2: NATIVE-FIRST BROWSER ENGINE VALIDATION */
        <Card className="border border-emerald-100 dark:border-emerald-500/10">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Configurações (Native Engine)</CardTitle>
              <Badge variant="success">Ultra-performance (Zero Deps)</Badge>
            </div>
            <CardDescription>
              Validação nativa de navegador ultra-leve que utiliza a API `ValidityState` integrada ao seu browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={nativeForm.handleSubmit} className="space-y-5" noValidate>
              
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <TextInput 
                    required 
                    minLength={2} 
                    placeholder="anderson_native"
                    name="username"
                    value={nativeForm.values.username}
                    onChange={nativeForm.handleChange}
                  />
                </FormControl>
                <FormDescription>Validação nativa: obrigatório, no mínimo 2 caracteres.</FormDescription>
                <FormMessage>{nativeForm.errors.username}</FormMessage>
              </FormItem>

              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <TextInput 
                    type="email" 
                    required 
                    placeholder="anderson@pixon.ui"
                    name="email"
                    value={nativeForm.values.email}
                    onChange={nativeForm.handleChange}
                  />
                </FormControl>
                <FormMessage>{nativeForm.errors.email}</FormMessage>
              </FormItem>

              <FormItem>
                <FormLabel>Biografia</FormLabel>
                <FormControl>
                  <Textarea 
                    required 
                    minLength={10}
                    placeholder="Fale um pouco sobre você (Mínimo de 10 caracteres nativos)" 
                    className="resize-none" 
                    name="bio"
                    value={nativeForm.values.bio}
                    onChange={nativeForm.handleChange}
                  />
                </FormControl>
                <FormMessage>{nativeForm.errors.bio}</FormMessage>
              </FormItem>

              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Select 
                    value={nativeForm.values.role} 
                    onChange={(val) => {
                      nativeForm.setValues((prev: any) => ({ ...prev, role: val }));
                      if (nativeForm.errors.role) {
                        nativeForm.setErrors((prev: any) => ({ ...prev, role: '' }));
                      }
                    }}
                    options={[
                        { value: "developer", label: "Developer Sênior" },
                        { value: "designer", label: "Product Designer" },
                        { value: "cto", label: "Diretor de Tecnologia" },
                    ]}
                    placeholder="Selecione um cargo nativo"
                    menuAnimation="fade"
                  />
                </FormControl>
                <FormMessage>{nativeForm.errors.role}</FormMessage>
              </FormItem>

              <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-semibold">Notificações Rápidas</FormLabel>
                  <FormDescription>
                    Ativar atualizações instantâneas de segundo plano.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={nativeForm.values.notifications}
                    onChange={(e: any) => nativeForm.setValues((prev: any) => ({ ...prev, notifications: e.target.checked }))}
                  />
                </FormControl>
              </FormItem>

              <Button 
                type="submit" 
                disabled={nativeForm.isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2"
              >
                {nativeForm.isSubmitting ? 'Sincronizando...' : 'Enviar (Nativo)'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
