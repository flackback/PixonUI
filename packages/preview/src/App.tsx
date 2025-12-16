import { PrimaryButton, Surface, Heading, Text, Badge, Divider, MetricCard } from '@pixonui/react';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 gap-8">
      <Surface className="flex w-full max-w-3xl flex-col gap-8 p-8">
        <div className="space-y-2 text-center">
          <Heading as="h1">PixonUI</Heading>
          <Text variant="muted">Modern UI Framework Preview</Text>
        </div>

        <Divider />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            title="Total Revenue"
            value="$45,231.89"
            trend={{ value: "20.1%", isPositive: true }}
          />
          <MetricCard
            title="Active Users"
            value="+2350"
            trend={{ value: "180.1%", isPositive: true }}
          />
          <MetricCard
            title="Bounce Rate"
            value="12.23%"
            trend={{ value: "4.1%", isPositive: false }}
          />
        </div>

        <Divider />

        <div className="flex flex-col gap-4 items-center">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </div>

          <PrimaryButton onClick={() => alert('Clicked!')}>
            Get Started
          </PrimaryButton>
        </div>
      </Surface>
    </div>
  );
}