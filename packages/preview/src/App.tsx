import { PrimaryButton, Surface, Heading, Text, Badge, Divider } from '@pixonui/react';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 gap-8">
      <Surface className="flex w-full max-w-md flex-col gap-6 p-8">
        <div className="space-y-2 text-center">
          <Heading as="h1">PixonUI</Heading>
          <Text variant="muted">Modern UI Framework Preview</Text>
        </div>

        <Divider />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </div>

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