import React, { useState, useEffect, useRef } from 'react';
import { 
  AIPromptInput, 
  AIResponse, 
  AIReasoningCollapse, 
  RAGInlineCitation, 
  RAGSourcesList, 
  AIToolCall,
  AITaskProgress,
  WorkflowTask,
  AISuggestions,
  AICostContext,
  AIMessageBranch,
  AIVoicePersona,
  AIAttachment,
  AIAttachmentItem,
  AIThread,
  AIMessage,
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@pixonui/react';
import { Sparkles, Cpu, Activity, Volume2, Coins, MessageSquare, Plus, FileText, Layout } from 'lucide-react';

interface DemoMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: AIAttachmentItem[];
  sources?: any[];
  branchIndex?: number;
  tokensCount?: { input: number; output: number; reasoning: number };
}

export function AIDemo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const [attachments, setAttachments] = useState<AIAttachmentItem[]>([]);
  const [isListening, setIsListening] = useState(false);

  // States for reasoning and grounding simulation
  const [isThinking, setIsThinking] = useState(false);
  const [thoughtsText, setThoughtsText] = useState('');
  const [showThoughts, setShowThoughts] = useState(false);

  // Voice Persona Active states
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');

  // Live telemetry counters for Token usage
  const [inputTokens, setInputTokens] = useState(148);
  const [outputTokens, setOutputTokens] = useState(384);
  const [reasoningTokens, setReasoningTokens] = useState(120);
  const [contextUsed, setContextUsed] = useState(14500);

  // Active streaming message content accumulator
  const [activeStreamingResponse, setActiveStreamingResponse] = useState<string | null>(null);

  // Thread Message List
  const [messages, setMessages] = useState<DemoMessage[]>([
    {
      id: "m1",
      role: "user",
      content: "Can you help me design a custom layout for PixonUI landing pages?",
      timestamp: "10 mins ago",
      attachments: [
        { id: "att-init-1", name: "wireframe_sketches.png", type: "image", size: "1.4 MB", status: "completed", url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=150" }
      ]
    },
    {
      id: "m2",
      role: "assistant",
      content: "Of course! To build a gorgeous layout, you should use our new BentoGrid layout system [1]. It features premium cards that expand beautifully on hover and support Tilt animations [2]. This ensures your landing page looks extremely premium and interactive out of the box.",
      timestamp: "9 mins ago",
      sources: [
        { id: "1", title: "PixonUI Bento Grid Docs", url: "https://pixonui.com/docs/components/bento-grid", confidence: 0.98 },
        { id: "2", title: "Framer Motion Layout Animations", url: "https://framer.com/motion/layout-animations", confidence: 0.91 }
      ],
      branchIndex: 1,
      tokensCount: { input: 148, output: 384, reasoning: 120 }
    }
  ]);

  // Suggestions templates
  const suggestions = [
    {
      id: "s1",
      label: "Responsive Bento Grid",
      prompt: "Generate a premium bento grid with neon hover scales and tilt motions.",
      icon: "code" as const
    },
    {
      id: "s2",
      label: "Glassmorphic Dialog Blur",
      prompt: "Design a high-end modal dialog using overlay backdrops and tight shadows.",
      icon: "idea" as const
    },
    {
      id: "s3",
      label: "Dynamic Tabulator SaaS",
      prompt: "Show me code for an interactive Kanban column flow featuring spacer gaps.",
      icon: "prompt" as const
    },
    {
      id: "s4",
      label: "Optimized Spring Physics",
      prompt: "Create an custom frame layout that morphs coordinates on render transitions.",
      icon: "sparkle" as const
    }
  ];

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
      status: "completed" as const,
      args: { component: "BentoGrid", grid_columns: 4, responsive: true, glow_effects: true },
      result: {
        status: "success",
        generated_lines: 42,
        preview_ready: true
      }
    }
  ]);

  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTask[]>([
    { id: "w1", title: "Parse user semantic query", description: "Analyzing semantic nodes, entity intents, and constraints.", status: "completed" },
    { id: "w2", title: "Query semantic vector database", description: "Fetching grounded context files and references match metadata.", status: "completed" },
    { id: "w3", title: "Synthesize JSX markup components", description: "Writing JSX blocks with responsive utilities and layouts.", status: "completed" },
    { id: "w4", title: "Compile final React bundle & check types", description: "Validating TS imports, compiling build, output validation.", status: "completed" }
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

  const handleSelectSuggestion = (prompt: string) => {
    setPromptValue(prompt);
    handleSubmit(prompt);
  };

  const handleSubmit = (prompt: string) => {
    if (isGenerating) return;

    // 1. Add User Message to feed
    const userMsgId = "m-user-" + Date.now();
    const newUserMessage: DemoMessage = {
      id: userMsgId,
      role: "user",
      content: prompt,
      timestamp: "Just now",
      attachments: [...attachments]
    };

    setMessages(prev => [...prev, newUserMessage]);
    setAttachments([]); // Reset inputs attachments

    // 2. Trigger Active Generation steps
    setIsGenerating(true);
    setPromptValue('');
    setActiveStreamingResponse(null);
    setThoughtsText('');
    setShowThoughts(true);
    setIsThinking(true);

    // Dynamic states for Voice / Cost telemetry
    setVoiceState('thinking');
    setInputTokens(Math.round(prompt.length * 0.75 + 10));
    setOutputTokens(0);
    setReasoningTokens(80);
    setContextUsed(prev => prev + 450);

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

    // Simulated Event Progression Timer

    // Time 800ms: Parser finished, DB search starts running
    setTimeout(() => {
      setThoughtsText(prev => prev + "1. Analyzing prompt intent & keywords: '" + prompt + "'\n");
      setReasoningTokens(prev => prev + 60);
      
      setWorkflowTasks(prev => [
        { ...prev[0]!, status: "completed" },
        { ...prev[1]!, status: "running", progress: 50 },
        prev[2]!,
        prev[3]!
      ]);
    }, 800);

    // Time 1800ms: Vector Search completed, JSX synthesizer starts running
    setTimeout(() => {
      setThoughtsText(prev => prev + "2. Querying semantic vector database for layout components (PixonUI/BentoGrid)...\n");
      setReasoningTokens(prev => prev + 120);
      setContextUsed(prev => prev + 800);
      
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

    // Time 2700ms: Synthesizer progress goes to 75%
    setTimeout(() => {
      setThoughtsText(prev => prev + "3. Synthesizing responsive layouts. Compiling CSS animation classes...\n");
      setReasoningTokens(prev => prev + 90);
      
      setWorkflowTasks(prev => [
        prev[0]!,
        prev[1]!,
        { ...prev[2]!, progress: 75 },
        prev[3]!
      ]);
    }, 2700);

    // Time 3400ms: JSX generation completed, React compilation running
    setTimeout(() => {
      setThoughtsText(prev => prev + "4. Completed code execution. Preparing final natural language output with source citations.\n");
      setReasoningTokens(prev => prev + 100);
      
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

    // Time 4000ms: Full workflow completed, start streaming response
    setTimeout(() => {
      setIsThinking(false);
      setVoiceState('speaking');
      
      setWorkflowTasks(prev => [
        prev[0]!,
        prev[1]!,
        prev[2]!,
        { ...prev[3]!, status: "completed" }
      ]);

      const text = "To build a gorgeous layout, you should use our new BentoGrid layout system [1]. It features premium cards that expand beautifully on hover and support Tilt animations [2]. This ensures your landing page looks extremely premium and interactive out of the box.";
      
      // Fast typewriter effect simulation for response text
      let currentIdx = 0;
      let accumulatedText = '';
      
      const interval = setInterval(() => {
        if (currentIdx < text.length) {
          accumulatedText += text.substring(currentIdx, currentIdx + 2);
          setActiveStreamingResponse(accumulatedText);
          setOutputTokens(prev => prev + 2); // Tokens increase in real time!
          currentIdx += 2; // Stream 2 chars at a time for speed
        } else {
          clearInterval(interval);
          
          // Complete Active response and save into permanent messages list
          const assistantMsgId = "m-assistant-" + Date.now();
          const newAssistantMessage: DemoMessage = {
            id: assistantMsgId,
            role: "assistant",
            content: text,
            timestamp: "Just now",
            sources: [...sampleCitations],
            branchIndex: 1,
            tokensCount: { input: Math.round(prompt.length * 0.75 + 10), output: text.length / 2, reasoning: 120 }
          };

          setMessages(prev => [...prev, newAssistantMessage]);
          setActiveStreamingResponse(null);
          setIsGenerating(false);
          setVoiceState('idle');
        }
      }, 25);

    }, 4000);
  };

  const handleStop = () => {
    setIsGenerating(false);
    setIsThinking(false);
    setActiveStreamingResponse(null);
    setVoiceState('idle');
  };

  // Simulated File Dropzone file mapping
  const handleFilesSelected = (files: FileList) => {
    const freshAttachments = Array.from(files).map((file, i) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let type: AIAttachmentItem['type'] = 'other';
      if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) type = 'image';
      else if (['mp4', 'mov', 'webm'].includes(ext)) type = 'video';
      else if (['mp3', 'wav', 'ogg'].includes(ext)) type = 'audio';
      else if (['pdf', 'docx', 'txt'].includes(ext)) type = 'document';
      else if (['csv', 'xlsx', 'xls'].includes(ext)) type = 'spreadsheet';
      else if (['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json'].includes(ext)) type = 'code';

      const fileId = "att-" + Math.random().toString(36).substring(2, 9);

      // Start upload progression simulator
      simulateUploadProgress(fileId);

      return {
        id: fileId,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        type,
        progress: 10,
        status: 'uploading' as const
      };
    });

    setAttachments(prev => [...prev, ...freshAttachments]);
  };

  const simulateUploadProgress = (id: string) => {
    let currentPercent = 10;
    const interval = setInterval(() => {
      currentPercent += Math.round(Math.random() * 20 + 5);
      if (currentPercent >= 100) {
        currentPercent = 100;
        clearInterval(interval);
        setAttachments(prev => prev.map(item => 
          item.id === id ? { ...item, progress: 100, status: 'completed' } : item
        ));
      } else {
        setAttachments(prev => prev.map(item => 
          item.id === id ? { ...item, progress: currentPercent } : item
        ));
      }
    }, 250);
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
      setVoiceState('idle');
      return;
    }

    setIsListening(true);
    setVoiceState('listening');
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
      setVoiceState('idle');
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      setVoiceState('idle');
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

  // Simulate alternate generation branching toggles
  const handleBranchChange = (msgId: string, newBranch: number) => {
    const responseBranches = [
      "To build a gorgeous layout, you should use our new BentoGrid layout system [1]. It features premium cards that expand beautifully on hover and support Tilt animations [2]. This ensures your landing page looks extremely premium and interactive out of the box.",
      "For high-fidelity landing pages, the Pixon BentoGrid [1] combined with custom Tilt effects [2] creates unparalleled depth. Hovering over cards triggers interactive glow gradients and responsive coordinate transitions that delight users.",
      "If you want a state-of-the-art layout, our responsive BentoGrid system is fully optimized with custom shaders and spring parameters [2]. Selecting card coordinates dynamically updates parent layout scopes via lightweight spring animations [1]."
    ];

    setMessages(prev => prev.map(msg => 
      msg.id === msgId 
        ? { ...msg, branchIndex: newBranch, content: responseBranches[newBranch - 1] || responseBranches[0]! } 
        : msg
    ));
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Core Conversational Thread Sandbox Card */}
      <Card className="border-zinc-200/80 bg-white/80 dark:border-white/5 dark:bg-zinc-950/40 backdrop-blur-md h-[600px] flex flex-col overflow-hidden">
        <CardHeader className="border-b border-gray-150/40 dark:border-white/5 pb-4.5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">AI Message Thread (`AIThread` & `AIMessage`)</CardTitle>
                <CardDescription className="text-xs">
                  Unified conversation feed displaying auto-scroll anchors, file upload streams, and RAG groundings.
                </CardDescription>
              </div>
            </div>
            
            {/* Active listener label */}
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-100/40 dark:bg-cyan-950/25 px-2 py-0.5 rounded-full">
              active stream
            </span>
          </div>
        </CardHeader>
        
        {/* Full AI scroll container */}
        <div className="flex-1 min-h-0 p-5 bg-gray-50/20 dark:bg-black/10">
          <AIThread isGenerating={isGenerating}>
            {messages.map((msg) => (
              <AIMessage
                key={msg.id}
                role={msg.role}
                name={msg.role === 'user' ? 'Anderson (You)' : 'DeepSeek-R1 (Grounding)'}
                timestamp={msg.timestamp}
                attachments={msg.attachments}
                sources={msg.sources}
                usage={msg.tokensCount ? `${msg.tokensCount.input} in / ${msg.tokensCount.output} out` : undefined}
                headerActions={
                  msg.role === 'assistant' && msg.branchIndex ? (
                    <AIMessageBranch 
                      current={msg.branchIndex} 
                      total={3}
                      onPrev={() => handleBranchChange(msg.id, msg.branchIndex! - 1)}
                      onNext={() => handleBranchChange(msg.id, msg.branchIndex! + 1)}
                    />
                  ) : undefined
                }
              >
                {renderResponseWithCitations(msg.content)}
              </AIMessage>
            ))}

            {/* Active Streaming Thinking view */}
            {isThinking && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <AIReasoningCollapse thinking={true} defaultOpen={true}>
                  {thoughtsText || "Initiating thinking models..."}
                </AIReasoningCollapse>
              </div>
            )}

            {/* Active Streaming Response view */}
            {activeStreamingResponse && (
              <AIMessage role="assistant" name="DeepSeek-R1" timestamp="Just now">
                {renderResponseWithCitations(activeStreamingResponse)}
              </AIMessage>
            )}
          </AIThread>
        </div>

        {/* Footer Prompt Input box container */}
        <div className="p-4 border-t border-gray-150/40 dark:border-white/5 bg-white/50 dark:bg-zinc-950/10 shrink-0 flex flex-col gap-3">
          
          {/* Active upload items progress indicators */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2.5 animate-in slide-in-from-bottom-2">
              {attachments.map((file) => (
                <AIAttachment 
                  key={file.id} 
                  item={file} 
                  onRemove={handleRemoveAttachment}
                />
              ))}
            </div>
          )}

          <AIPromptInput 
            value={promptValue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPromptValue(e.target.value)}
            onSubmit={handleSubmit}
            isGenerating={isGenerating}
            onStop={handleStop}
            onMic={handleMic}
            onFilesSelected={handleFilesSelected}
            maxLength={500}
            placeholder={isListening ? "Listening..." : "Ask me to generate a premium Bento Grid layout..."}
            footer={
              <div className="flex justify-between items-center w-full">
                <span>Press Enter or click Sparkle to send</span>
                <span className="opacity-70 flex items-center gap-1 font-semibold text-[10px] uppercase">
                  <Sparkles className="h-3 w-3 text-purple-500" /> Grounded by RAG
                </span>
              </div>
            }
          />
        </div>
      </Card>

      {/* 2. Quick Suggestions Section */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" /> Prompt Recommendations (`AISuggestions`)
        </span>
        <AISuggestions 
          suggestions={suggestions} 
          onSelect={handleSelectSuggestion} 
        />
      </div>

      {/* 3. Advanced Agentic Tool Calling & Progress Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
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
          <CardContent className="space-y-3.5 max-h-[350px] overflow-y-auto scrollbar-thin">
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

      {/* Row 4: Voice Visualizer Persona & Cost Breakdown Context Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Voice Persona Visualizer Dashboard Card */}
        <Card className="border-zinc-200/80 bg-white/80 dark:border-white/5 dark:bg-zinc-950/40 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-cyan-500" />
              <div>
                <CardTitle className="text-sm font-bold">Live Voice Persona (`AIVoicePersona`)</CardTitle>
                <CardDescription className="text-xs">
                  Siri-style voice interaction animations displaying listening, thinking, and speaking waveforms.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col items-center">
            <AIVoicePersona 
              name="Lumina Core Persona"
              state={voiceState}
              className="border-none bg-transparent dark:bg-transparent shadow-none p-0"
            />
            
            {/* Toggles to test the voice states */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-gray-150/40 dark:border-white/5 w-full">
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider w-full text-center mb-1">
                Trigger animation overrides
              </span>
              {(['idle', 'listening', 'thinking', 'speaking'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setVoiceState(st)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                    voiceState === st 
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm' 
                      : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-zinc-400 hover:bg-gray-100/40 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Context detailed telemetry dashboard Card */}
        <Card className="border-zinc-200/80 bg-white/80 dark:border-white/5 dark:bg-zinc-950/40 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-cyan-500" />
              <div>
                <CardTitle className="text-sm font-bold">Live Model Token Analytics (`AICostContext`)</CardTitle>
                <CardDescription className="text-xs">
                  SaaS metrics calculator computing active prompt cost variables and history storage limits.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AICostContext
              modelName="DeepSeek-R1 (Custom Pricing)"
              inputTokens={inputTokens}
              outputTokens={outputTokens}
              reasoningTokens={reasoningTokens}
              costPerMillionInput={0.55} // Custom competitive rates
              costPerMillionOutput={2.19}
              contextLimit={128000}
              contextUsed={contextUsed}
              className="border-none bg-transparent dark:bg-transparent shadow-none p-0"
            />
          </CardContent>
        </Card>

      </div>

      {/* 5. Original Button Showcase */}
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
