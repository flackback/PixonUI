import React, { useState, useEffect } from 'react';
import { AIPromptInput, AIResponse, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@pixonui/react';

export function AIDemo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [attachments, setAttachments] = useState<{id: string, name: string}[]>([]);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (prompt: string) => {
    setIsGenerating(true);
    setPromptValue(prompt);
    setResponse(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      setResponse(`Here is a simulated response to your prompt: "${prompt}". \n\nPixonUI components are designed to be flexible and easy to use.`);
    }, 3000);
  };

  const handleStop = () => {
    setIsGenerating(false);
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

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>AI Components</CardTitle>
          <CardDescription>
            Specialized components for building AI interfaces.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-white/50">Prompt Input</h3>
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
              placeholder={isListening ? "Listening..." : "Ask me to generate a component..."}
              footer={
                <div className="flex justify-between items-center w-full">
                  <span>Press Enter to send</span>
                  <span className="opacity-50">Powered by PixonUI AI</span>
                </div>
              }
            />
          </div>

          {response && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-sm font-medium text-gray-500 dark:text-white/50">AI Response</h3>
              <AIResponse 
                onRegenerate={() => handleSubmit(promptValue)}
                onCopy={() => navigator.clipboard.writeText(response)}
                onShare={() => alert("Share clicked")}
                onEdit={() => alert("Edit clicked")}
                timestamp="Just now"
                model="GPT-4"
                usage="150 tokens"
                sources={[
                  { title: "PixonUI Documentation", url: "#" },
                  { title: "React Docs", url: "https://react.dev" }
                ]}
              >
                <p className="whitespace-pre-wrap">{response}</p>
              </AIResponse>
            </div>
          )}

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Button Shapes & Shadows</CardTitle>
          <CardDescription>
            New button customization options.
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
