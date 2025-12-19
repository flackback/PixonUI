import React, { useState } from 'react';
import { 
  OTPInput, 
  NumberInput, 
  ToggleGroup, 
  Rating, 
  Tree, 
  Terminal, 
  TerminalLine,
  Marquee, 
  StatusDot, 
  Stepper, 
  Spotlight,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button
} from '@pixonui/react';
import { LayoutGrid, List, Settings, User, Bell, Shield } from 'lucide-react';

export function TenNewComponentsDemo() {
  const [otp, setOtp] = useState("");
  const [rating, setRating] = useState(3);
  const [view, setView] = useState("grid");
  const [currentStep, setCurrentStep] = useState(1);

  const treeData = [
    {
      id: '1',
      label: 'src',
      children: [
        { id: '2', label: 'components', children: [
          { id: '3', label: 'Button.tsx' },
          { id: '4', label: 'Card.tsx' },
        ]},
        { id: '5', label: 'utils', children: [
          { id: '6', label: 'cn.ts' },
        ]},
        { id: '7', label: 'App.tsx' },
      ]
    },
    {
      id: '8',
      label: 'package.json',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Form Components */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>OTP Input</CardTitle>
            <CardDescription>One-time password input fields.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <OTPInput 
              value={otp} 
              onChange={setOtp} 
              onComplete={(val: string) => alert(`Completed: ${val}`)} 
            />
            <div className="text-sm text-gray-500">Value: {otp}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Number Input & Toggle</CardTitle>
            <CardDescription>Enhanced form controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Quantity:</label>
              <NumberInput min={0} max={10} defaultValue={1} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">View Mode:</label>
              <ToggleGroup 
                value={view} 
                onChange={setView}
                options={[
                  { label: "Grid", value: "grid", icon: <LayoutGrid className="h-4 w-4" /> },
                  { label: "List", value: "list", icon: <List className="h-4 w-4" /> },
                ]} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback & Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Stepper & Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <Stepper 
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            steps={[
              { title: "Account", description: "Login details" },
              { title: "Profile", description: "Personal info" },
              { title: "Review", description: "Check details" },
            ]}
          />
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Rate your experience:</span>
            <Rating value={rating} onChange={setRating} />
            <span className="text-sm text-gray-500">({rating}/5)</span>
          </div>
        </CardContent>
      </Card>

      {/* Data Display */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tree View</CardTitle>
          </CardHeader>
          <CardContent>
            <Tree data={treeData} className="border rounded-lg p-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terminal</CardTitle>
          </CardHeader>
          <CardContent>
            <Terminal>
              <TerminalLine prefix=">">npm install @pixonui/react</TerminalLine>
              <TerminalLine prefix=">">npm run dev</TerminalLine>
              <TerminalLine prefix="" className="text-gray-500">Ready in 200ms</TerminalLine>
              <TerminalLine prefix="" className="text-emerald-500">➜ Local: http://localhost:5173/</TerminalLine>
            </Terminal>
          </CardContent>
        </Card>
      </div>

      {/* Visual Effects */}
      <Card>
        <CardHeader>
          <CardTitle>Spotlight & Marquee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <Spotlight className="p-8 text-center">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Hover over me
            </h3>
            <p className="text-gray-500 mt-2">
              A subtle spotlight effect follows your cursor.
            </p>
          </Spotlight>

          <div className="border-y border-gray-200 dark:border-white/10 py-4">
            <Marquee pauseOnHover>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mx-4 flex items-center gap-2 rounded-lg border bg-white px-4 py-2 shadow-sm dark:bg-white/5 dark:border-white/10">
                  <StatusDot variant="success" animate />
                  <span className="font-medium">System Operational</span>
                </div>
              ))}
            </Marquee>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
