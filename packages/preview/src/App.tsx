import { PrimaryButton, Surface, Heading, Text, Badge, Divider, MetricCard, TextInput } from '@pixonui/react';
import { Mail, Lock, Search, AlertCircle } from 'lucide-react';

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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <Heading as="h3" className="text-lg">Form Elements</Heading>
            <TextInput 
              label="Email Address" 
              placeholder="john@example.com" 
              type="email"
              leftIcon={<Mail size={16} />}
            />
            <TextInput 
              label="Password" 
              placeholder="••••••••" 
              type="password"
              leftIcon={<Lock size={16} />}
            />
            <TextInput 
              label="Search" 
              placeholder="Search..." 
              rightIcon={<Search size={16} />}
            />
            <TextInput 
              label="With Error" 
              placeholder="Invalid input" 
              defaultValue="wrong value"
              error="This field is required"
              rightIcon={<AlertCircle size={16} className="text-rose-500" />}
            />
          </div>

          <div className="flex flex-col gap-4 items-center justify-center border border-white/5 rounded-xl p-4 bg-white/[0.02]">
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
        </div>
      </Surface>
    </div>
  );
}              defaultValue="Wrong value"
            />
          </div>
          
          <div className="space-y-4">
             <Heading as="h3" className="text-lg">States</Heading>
             <TextInput 
              label="Disabled" 
              placeholder="Cannot type here" 
              disabled
            />
             <TextInput 
              label="With Icon" 
              placeholder="Search..." 
              leftIcon={<span>🔍</span>}
            />
          </div>
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