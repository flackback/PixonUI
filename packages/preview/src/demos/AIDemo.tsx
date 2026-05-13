import React, { useState, useEffect } from 'react';
import { 
  AIPromptInput, 
  AIResponse, 
  AIReasoningCollapse, 
  RAGInlineCitation, 
  RAGSourcesList, 
  AIToolCall,
  AITaskProgress,
  WorkflowTask,
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@pixonui/react';
import { Brain, FileText, Send, Sparkles, Cpu, Activity, Terminal } from 'lucide-react';

export function AIDemo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [attachments, setAttachments] = useState<{id: string, name: string}[]>([]);
  const [isListening, setIsListening] = useState(false);

  // States for reasoning and grounding simulation
  const [isThinking, setIsThinking] = useState(false);
  const [thoughtsText, setThoughtsText] = useState('');
  const [showThoughts, setShowThoughts] = useState(false);

  // Static/Demo States for Tool Calls and Tasks Progress (Shown initially)
  const [toolCalls, setToolCalls] = useState<any[]>([
    {
      id: "t1",
      name: "search_vector_database",
      status: "completed" as const,
      args: { query: "modern dashboard landing page layouts", limit: 3, include_metadata: true },
      result: {
        matches: [
          { document_id: "bento_grid_docs", similarity_score: 0.98, title: "PixonUI Bento Grid Component docs" },
          { document_id: "tilt_effects", similarity_score: 0.91, title: "PixonUI Tilt Animation Component docs" }
        ],
        query_latency: "45ms"
      }
    },
    {
      id: "t2",
      name: "generate_jsx_code",
      status: "running" as const,
      args: { component: "BentoGrid", grid_columns: 4, responsive: true, glow_effects: true },
    }
  ]);

  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTask[]>([
    { id: "w1", title: "Parse user semantic query", description: "Analyzing semantic nodes, entity intents, and constraints.", status: "completed" },
    { id: "w2", title: "Query semantic vector database", description: "Fetching grounded context files and references match metadata.", status: "completed" },
    { id: "w3", title: "Synthesize JSX markup components", description: "Writing JSX blocks with responsive utilities and layouts.", status: "running", progress: 45 },
    { id: "w4", title: "Compile final React bundle & check types", description: "Validating TS imports, compiling build, output validation.", status: "pending" }
  ]);

  const sampleCitations = [
    {
      id: "1",
      title: "PixonUI Bento Grid Docs",
      url: "https://pixonui.com/docs/components/bento-grid",
      confidence: 0.98,
      excerpt: "The BentoGrid component combines flexible flex-wrap layers and grid layouts, powered by custom PixonMotion hover scale transforms for stunning aesthetics.",
      type: "file" as const
    },
    {
      id: "2",
      title: "Framer Motion Layout Animations",
      url: "https://framer.com/motion/layout-animations",
      confidence: 0.91,
      excerpt: "Layout animations smoothly morph width and height coordinates across render cycles when matching layoutId matches.",
      type: "web" as const
    }
  ];

  const handleSubmit = (prompt: string) => {
    setIsGenerating(true);
    setPromptValue(prompt);
    setResponse(null);
    setThoughtsText('');
    setShowThoughts(true);
    setIsThinking(true);

    // Initial Active simulation states
    setToolCalls([
      { id: "t1", name: "search_vector_database", status: "running" as const, args: { query: prompt, limit: 3, include_metadata: true } }
    ]);

    setWorkflowTasks([
      { id: "w1", title: "Parse user semantic query", description: "Analyzing semantic nodes, entity intents, and constraints.", status: "running", progress: 20 },
      { id: "w2", title: "Query semantic vector database", description: "Fetching grounded context files and references match metadata.", status: "pending" },
      { id: "w3", title: "Synthesize JSX markup components", description: "Writing JSX blocks with responsive utilities and layouts.", status: "pending" },
      { id: "w4", title: "Compile final React bundle & check types", description: "Validating TS imports, compiling build, output validation.", status: "pending" }
    ]);

    // Step-by-Step Simulated Event Progression

    // Time 600ms: Parser finished, DB search starts running
    setTimeout(() => {
      setThoughtsText(prev => prev + "1. Analyzing prompt intent & keywords: '" + prompt + "'\n");
      
      setWorkflowTasks(prev => [
        { ...prev[0]!, status: "completed" },
        { ...prev[1]!, status: "running", progress: 50 },
        prev[2]!,
        prev[3]!
      ]);
    }, 800);

    // Time 1500ms: Vector Search completed, JSX synthesizer starts running
    setTimeout(() => {
      setThoughtsText(prev => prev + "2. Querying semantic vector database for layout components (PixonUI/BentoGrid)...\n");
      
      setToolCalls([
        { 
          id: "t1", 
          name: "search_vector_database", 
          status: "completed" as const, 
          args: { query: prompt, limit: 3, include_metadata: true },
          result: {
            matches: [
              { document_id: "bento_grid_docs", similarity_score: 0.98, title: "PixonUI Bento Grid Component docs" },
              { document_id: "tilt_effects", similarity_score: 0.91, title: "PixonUI Tilt Animation Component docs" }
            ],
            query_latency: "32ms"
          }
        },
        {
          id: "t2",
          name: "generate_jsx_code",
          status: "running" as const,
          args: { component: "BentoGrid", grid_columns: 3, responsive: true }
        }
      ]);

      setWorkflowTasks(prev => [
        prev[0]!,
        { ...prev[1]!, status: "completed" },
        { ...prev[2]!, status: "running", progress: 30 },
        prev[3]!
      ]);
    }, 1800);

    // Time 2600ms: Synthesizer progress goes to 75%
    setTimeout(() => {
      setThoughtsText(prev => prev + "3. Synthesizing responsive layouts. Compiling CSS animation classes...\n");
      
      setWorkflowTasks(prev => [
        prev[0]!,
        prev[1]!,
        { ...prev[2]!, progress: 75 },
        prev[3]!
      ]);
    }, 2700);

    // Time 3200ms: JSX generation completed, React compilation running
    setTimeout(() => {
      setThoughtsText(prev => prev + "4. Completed code execution. Preparing final natural language output with source citations.\n");
      
      setToolCalls(prev => [
        prev[0]!,
        {
          id: "t2",
          name: "generate_jsx_code",
          status: "completed" as const,
          args: { component: "BentoGrid", grid_columns: 3, responsive: true },
          result: {
            status: "success",
            generated_lines: 42,
            preview_ready: true
          }
        }
      ]);

      setWorkflowTasks(prev => [
        prev[0]!,
        prev[1]!,
        { ...prev[2]!, status: "completed" },
        { ...prev[3]!, status: "running", progress: 80 }
      ]);
    }, 3400);

    // Time 3800ms: Full workflow completed, start streaming response
    setTimeout(() => {
      setIsThinking(false);
      
      setWorkflowTasks(prev => [
        prev[0]!,
        prev[1]!,
        prev[2]!,
        { ...prev[3]!, status: "completed" }
      ]);

      const text = "To build a gorgeous layout, you should use our new BentoGrid layout system [1]. It features premium cards that expand beautifully on hover and support Tilt animations [2]. This ensures your landing page looks extremely premium and interactive out of the box.";
      
      // Fast typewriter effect simulation for response text
      let currentIdx = 0;
      setResponse('');
      const interval = setInterval(() => {
        if (currentIdx < text.length) {
          setResponse(prev => (prev || '') + text.charAt(currentIdx));
          currentIdx += 2; // Stream 2 chars at a time for speed
        } else {
          clearInterval(interval);
          setIsGenerating(false);
        }
      }, 20);

    }, 4000);
  };

  const handleStop = () => {
    setIsGenerating(false);
    setIsThinking(false);
    setResponse("Generation stopped by user.");
  };

  const handleFilesSelected = (files: FileList) => {
    const newAttachments = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleMic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPromptValue(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Helper to parse text and inject live interactive citations
  const renderResponseWithCitations = (text: string) => {
    if (!text) return null;
    
    // Simple parsing of "[1]" and "[2]"
    const parts = text.split(/(\[1\]|\[2\])/g);
    return parts.map((part, i) => {
      if (part === '[1]' && sampleCitations[0]) {
        return <RAGInlineCitation key={i} citation={sampleCitations[0]} indexLabel="1" />;
      }
      if (part === '[2]' && sampleCitations[1]) {
        return <RAGInlineCitation key={i} citation={sampleCitations[1]} indexLabel="2" />;
      }
      return part;
    });
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Core Chat & AI Generation View */}
      <Card className="border-zinc-200/80 bg-white/80 dark:border-white/5 dark:bg-zinc-950/40 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>AI Core & RAG Components</CardTitle>
              <CardDescription>
                Premium interactive components designed for streaming thinking steps and grounding citation references.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              Prompt Input
            </h3>
            <AIPromptInput 
              value={promptValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPromptValue(e.target.value)}
              onSubmit={handleSubmit}
              isGenerating={isGenerating}
              onStop={handleStop}
              onMic={handleMic}
              onFilesSelected={handleFilesSelected}
              attachments={attachments}
              onRemoveAttachment={handleRemoveAttachment}
              maxLength={500}
              placeholder={isListening ? "Listening..." : "Ask me to generate a premium Bento Grid layout..."}
              footer={
                <div className="flex justify-between items-center w-full">
                  <span>Press Enter or click Sparkle to send</span>
                  <span className="opacity-70 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple-500" /> Powered by PixonUI AI
                  </span>
                </div>
              }
            />
          </div>

          {/* Reasoning & Response Output */}
          {(showThoughts || response) && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                AI Generation Stream
              </h3>

              {/* Collapsed/Active Thoughts Panel */}
              {showThoughts && (
                <AIReasoningCollapse 
                  thinking={isThinking} 
                  defaultOpen={true}
                  className="shadow-sm"
                >
                  {thoughtsText ? (
                    <div className="whitespace-pre-line leading-relaxed font-mono text-xs text-cyan-800/80 dark:text-cyan-300/80">
                      {thoughtsText}
                    </div>
                  ) : (
                    "Initiating thinking process..."
                  )}
                </AIReasoningCollapse>
              )}

              {/* Streaming Answer Box */}
              {response && (
                <AIResponse 
                  onRegenerate={() => handleSubmit(promptValue)}
                  onCopy={() => navigator.clipboard.writeText(response)}
                  onShare={() => alert("Simulated share action")}
                  onEdit={() => alert("Simulated edit action")}
                  timestamp="Just now"
                  model="DeepSeek-R1 (Reasoning)"
                  usage="186 prompt tokens, 452 reasoning tokens"
                  className="shadow-md"
                >
                  <div className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-zinc-200">
                    {renderResponseWithCitations(response)}
                  </div>

                  {/* Sources List Grid bottom */}
                  {!isThinking && !isGenerating && (
                    <RAGSourcesList citations={sampleCitations} className="animate-in fade-in duration-500" />
                  )}
                </AIResponse>
              )}
            </div>
          )}

        </CardContent>
      </Card>

      {/* 2. Advanced Agentic Tool Calling & Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tool Call Log List card */}
        <Card className="border-zinc-200/80 bg-white/80 dark:border-white/5 dark:bg-zinc-950/40 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-500" />
              <div>
                <CardTitle className="text-sm font-bold">Function & Tool Calling (`AIToolCall`)</CardTitle>
                <CardDescription className="text-xs">Collapsible, high-fidelity visualization of AI model tools invocations.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 max-h-[480px] overflow-y-auto scrollbar-thin">
            {toolCalls.map((tc) => (
              <AIToolCall
                key={tc.id}
                name={tc.name}
                status={tc.status}
                args={tc.args}
                result={tc.result}
                defaultOpen={tc.status === "running"}
              />
            ))}
          </CardContent>
        </Card>

        {/* Task Progress connected steps card */}
        <Card className="border-zinc-200/80 bg-white/80 dark:border-white/5 dark:bg-zinc-950/40 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-500" />
              <div>
                <CardTitle className="text-sm font-bold">Workflow Progress Steps (`AITaskProgress`)</CardTitle>
                <CardDescription className="text-xs">Connected status lines showing subtask progression in AI operations.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AITaskProgress
              title="Agent Generation Queue"
              description="Tracking real-time steps in custom code compilation pipelines."
              tasks={workflowTasks}
              active={isGenerating}
            />
          </CardContent>
        </Card>

      </div>

      {/* 3. Original Button Showcase */}
      <Card className="border-zinc-200/80 bg-white/80 dark:border-white/5 dark:bg-zinc-950/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Button Shapes & Shadows</CardTitle>
          <CardDescription>
            Tailored shapes and shadows for fine-tuning layout integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Button shape="default">Default</Button>
            <Button shape="pill">Pill Shape</Button>
            <Button shape="square">Square</Button>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary" shadow={true}>With Shadow</Button>
            <Button variant="primary" shadow={false}>No Shadow</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
