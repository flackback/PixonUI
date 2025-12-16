import { PrimaryButton, Surface } from '@pixonui/react';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <Surface className="flex w-full max-w-md flex-col gap-6 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">PixonUI</h1>
          <p className="text-white/60">Modern UI Framework Preview</p>
        </div>

        <div className="flex flex-col gap-4">
          <PrimaryButton onClick={() => alert('Clicked!')}>
            Get Started
          </PrimaryButton>
          
          <div className="flex justify-center gap-4 text-sm text-white/40">
            <span>Glassmorphism</span>
            <span>•</span>
            <span>Tailwind</span>
            <span>•</span>
            <span>React</span>
          </div>
        </div>
      </Surface>
    </div>
  );
}