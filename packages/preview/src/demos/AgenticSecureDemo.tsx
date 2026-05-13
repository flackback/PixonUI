import React, { useState } from 'react';
import { 
  AIConfirmation, 
  AICheckpoint, 
  AISchemaDisplay, 
  SchemaField,
  useToast,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  cn
} from '@pixonui/react';
import { Shield, GitBranch, Binary, Layers, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

export function AgenticSecureDemo() {
  const { toast } = useToast();
  
  // States for the AIConfirmation Demo
  const [risk, setRisk] = useState<'low' | 'moderate' | 'high' | 'critical'>('high');
  const [confirmStatus, setConfirmStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);

  // States for the AICheckpoints Demo
  const [activeCheckpoint, setActiveCheckpoint] = useState<string>('cp-3');

  // Schema data for AISchemaDisplay Demo
  const invoiceSchemaFields: SchemaField[] = [
    {
      name: 'invoice_id',
      type: 'string',
      required: true,
      description: 'The unique alphanumeric invoice identifier (must start with INV-).'
    },
    {
      name: 'client_metadata',
      type: 'object',
      required: true,
      description: 'Nested container of verified client profile parameters.',
      children: [
        {
          name: 'name',
          type: 'string',
          required: true,
          description: 'Legal registered name of the enterprise.'
        },
        {
          name: 'tax_exempt',
          type: 'boolean',
          required: false,
          description: 'Flag indicating federal tax-exempt certification status.'
        },
        {
          name: 'contacts',
          type: 'array',
          required: false,
          description: 'Primary accounts-payable point of contacts list.',
          children: [
            {
              name: 'email',
              type: 'string',
              required: true,
              description: 'Primary verified electronic billing email address.'
            }
          ]
        }
      ]
    },
    {
      name: 'line_items',
      type: 'array',
      required: true,
      description: 'Individual line billing transactions to invoice.',
      children: [
        {
          name: 'description',
          type: 'string',
          required: true,
          description: 'Plain-text explanation of completed deliverables.'
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          description: 'Subtotal value in USD.'
        }
      ]
    },
    {
      name: 'notify_channel',
      type: 'string',
      required: false,
      description: 'Direct webhook pipeline callback (e.g., discord, slack, email).'
    }
  ];

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setConfirmStatus('approved');
      toast({
        title: "Action Authorized Successfully",
        description: "The AI agent has been granted permission and the transaction was secure.",
        duration: 3500
      });
    }, 1500);
  };

  const handleReject = () => {
    setConfirmStatus('rejected');
    toast({
      title: "Action Cancelled",
      description: "You have denied authorization. The execution loop was safely halted.",
      duration: 3500
    });
  };

  const handleResetConfirmation = () => {
    setConfirmStatus('pending');
  };

  const handleRestoreCheckpoint = (id: string, name: string) => {
    setActiveCheckpoint(id);
    toast({
      title: "Workspace Restored",
      description: `State reverted to milestone snapshot: "${name}"`,
      duration: 3000
    });
  };

  const handleForkCheckpoint = (name: string) => {
    toast({
      title: "Thread Branch Forked",
      description: `A brand-new conversation thread has been branched from "${name}".`,
      duration: 3000
    });
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-4">
      {/* Introduction Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/10 dark:border-purple-500/20 bg-gradient-to-br from-purple-500/[0.03] to-blue-500/[0.03] p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="gradient" className="font-extrabold uppercase tracking-widest text-[9px] px-2.5 py-1">Next-Gen AI Elements</Badge>
              <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-zinc-500">v1.3.0 Release</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Agentic Trust &amp; Structural Validation
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              PixonUI leads in developer ergonomics by delivering high-fidelity AI-human collaboration controls. Safeguard execution loops with beautiful confirmation triggers, inspect typing schemas, and fork timelines seamlessly.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-extrabold text-xl">
              P
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Safety Gate & Schema */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: AIConfirmation Demo */}
          <Card className="border border-gray-200/60 bg-white/40 dark:border-white/5 dark:bg-zinc-950/20 backdrop-blur-md overflow-hidden rounded-3xl">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    Interactive AI Safety Gate
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Validate agent parameters, rate risk boundaries, and intercept destructive operations.
                  </CardDescription>
                </div>
                {confirmStatus !== 'pending' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResetConfirmation}
                    leftIcon={<RefreshCw className="h-3 w-3" />}
                    className="text-[10px] uppercase font-bold"
                  >
                    Reset Gate
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Controls to change Risk Level */}
              {confirmStatus === 'pending' && (
                <div className="space-y-2.5 bg-gray-50/50 dark:bg-zinc-900/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">
                    Simulate System Risk Level
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(['low', 'moderate', 'high', 'critical'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setRisk(level)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition-all active:scale-95",
                          risk === level 
                            ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-black shadow-sm"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rendered AIConfirmation */}
              <div className="space-y-2">
                <AIConfirmation
                  toolName="compile_and_deploy_production"
                  riskLevel={risk}
                  status={confirmStatus}
                  isLoading={isProcessing}
                  args={{
                    project_id: "pixon-ui-v1",
                    environment: "production",
                    branch: "release/v1.3.0",
                    optimize_assets: true,
                    purge_cache: true,
                    database_migration: {
                      run: true,
                      target_revision: "2026_migration_schema_v4",
                      allow_rollback: false
                    }
                  }}
                  description="The AI Agent seeks permission to trigger a production build compilation and deploy the bundle. This action triggers a database migration sequence."
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>

              {/* Auxiliary information */}
              <div className="text-[11px] text-gray-400 dark:text-zinc-500 leading-relaxed font-medium flex items-start gap-1.5 px-1 select-none">
                <Cpu className="h-3.5 w-3.5 shrink-0 text-purple-500/60 mt-0.5" />
                <span>
                  Safety Gate component automatically captures user confirmation context and formats state arguments cleanly inside tool loops. Supports nested argument editing callbacks.
                </span>
              </div>

            </CardContent>
          </Card>

          {/* Section 2: AISchemaDisplay Demo */}
          <Card className="border border-gray-200/60 bg-white/40 dark:border-white/5 dark:bg-zinc-950/20 backdrop-blur-md overflow-hidden rounded-3xl">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-white/5">
              <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                <Binary className="h-4 w-4 text-purple-500" />
                Structural Schema Visualizer
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect structured JSON parameter validation rules visually with nested levels and types.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <AISchemaDisplay 
                title="publish_enterprise_invoice: Parameters"
                description="Validates the parameters and nested deliverables when registering a billing transaction."
                fields={invoiceSchemaFields}
                defaultOpen={true}
              />
            </CardContent>
          </Card>

        </div>

        {/* Right Side: Chronological Branching & Timelines */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Section 3: AICheckpoint Demo */}
          <Card className="border border-gray-200/60 bg-white/40 dark:border-white/5 dark:bg-zinc-950/20 backdrop-blur-md overflow-hidden rounded-3xl h-full">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-white/5">
              <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-purple-500" />
                Chronological State Branching
              </CardTitle>
              <CardDescription className="text-xs">
                Represent history commits and state savepoints in AI reasoning workflows. Allows easy backtracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Checkpoint list showcasing states */}
              <div className="space-y-4 relative pl-3 before:absolute before:left-[27px] before:top-6 before:bottom-6 before:w-0.5 before:bg-gradient-to-b before:from-purple-500/20 before:via-gray-200 dark:before:via-white/5 before:to-emerald-500/20">
                
                <AICheckpoint
                  title="Final Production Deploy Code-Review"
                  description="All TypeScript files passed strict verification. Sandbox environment compiled 42 lines."
                  status={activeCheckpoint === 'cp-4' ? 'active' : 'saved'}
                  timestamp="Just now"
                  changesCount={1}
                  onRestore={() => handleRestoreCheckpoint('cp-4', 'Final Production Deploy Code-Review')}
                  onFork={() => handleForkCheckpoint('Final Production Deploy Code-Review')}
                />

                <AICheckpoint
                  title="Authorized: compile_and_deploy_production"
                  description="User approved execution gate with critical risk level configuration."
                  status={activeCheckpoint === 'cp-3' ? 'active' : 'restored'}
                  timestamp="3 mins ago"
                  changesCount={0}
                  onRestore={() => handleRestoreCheckpoint('cp-3', 'Authorized: compile_and_deploy_production')}
                  onFork={() => handleForkCheckpoint('Authorized: compile_and_deploy_production')}
                />

                <AICheckpoint
                  title="Structured Deliverables Schemas Generated"
                  description="Validated parameter typing constraints and mapped transaction variables."
                  status={activeCheckpoint === 'cp-2' ? 'active' : 'saved'}
                  timestamp="12 mins ago"
                  changesCount={4}
                  onRestore={() => handleRestoreCheckpoint('cp-2', 'Structured Deliverables Schemas Generated')}
                  onFork={() => handleForkCheckpoint('Structured Deliverables Schemas Generated')}
                />

                <AICheckpoint
                  title="Initial Grounding Sketched"
                  description="Analyzed semantic query nodes and initialized workspace directory structures."
                  status={activeCheckpoint === 'cp-1' ? 'active' : 'saved'}
                  timestamp="20 mins ago"
                  changesCount={1}
                  onRestore={() => handleRestoreCheckpoint('cp-1', 'Initial Grounding Sketched')}
                  onFork={() => handleForkCheckpoint('Initial Grounding Sketched')}
                />

              </div>

              {/* Explanation note */}
              <div className="bg-purple-500/[0.02] border border-purple-500/10 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 block">
                  How does branching work?
                </span>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-medium">
                  Each checkpoint records a immutable snapshot state. By clicking <b>Restore here</b>, you safely revert the conversational runtime back to that moment, discarding downstream hallucinations or logic branch errors.
                </p>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
