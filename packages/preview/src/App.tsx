import { PrimaryButton, Surface, Heading, Text, Badge, Divider, MetricCard, TextInput, Checkbox, Switch, Select, Textarea, RadioGroup, RadioGroupItem, useToast, Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter, Tooltip, Alert } from '@pixonui/react';
import { Mail, Lock, Search, AlertCircle, Info } from 'lucide-react';
import { useState } from 'react';

export default function App() {
  const [role, setRole] = useState('');
  const [plan, setPlan] = useState('free');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Changes saved",
      description: "Your profile has been updated successfully.",
      variant: "success"
    });
  };

  const handleError = () => {
    toast({
      title: "Error",
      description: "Something went wrong. Please try again.",
      variant: "error"
    });
  };

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
            value=",231.89"
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

        <Alert variant="info" title="New Features Available">
          We've just updated the dashboard with new analytics tools. Check them out!
        </Alert>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <Heading as="h3" className="text-lg flex items-center gap-2">
              Form Elements
              <Tooltip content="These are the core form components" position="right">
                <Info size={16} className="text-white/40 cursor-help" />
              </Tooltip>
            </Heading>
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
            
            <Select
              label="Role"
              placeholder="Select a role..."
              value={role}
              onChange={setRole}
              options={[
                { label: 'Administrator', value: 'admin' },
                { label: 'Editor', value: 'editor' },
                { label: 'Viewer', value: 'viewer' },
                { label: 'Guest', value: 'guest' },
              ]}
            />

            <Textarea 
              label="Bio" 
              placeholder="Tell us about yourself..." 
              rows={3}
            />

            <div className="flex flex-col gap-4 pt-2">
              <Checkbox label="Remember me" defaultChecked />
              <Checkbox label="I agree to the Terms of Service" />
              <Switch label="Enable Notifications" defaultChecked />
              <Switch label="Dark Mode" defaultChecked disabled />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Heading as="h3" className="text-lg">States & Validation</Heading>
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
            
            <Select
              label="Disabled Select"
              placeholder="Cannot select"
              disabled
              options={[]}
            />

            <RadioGroup label="Subscription Plan" value={plan} onChange={setPlan}>
              <RadioGroupItem value="free" label="Free Plan" />
              <RadioGroupItem value="pro" label="Pro Plan (/mo)" />
              <RadioGroupItem value="enterprise" label="Enterprise" disabled />
            </RadioGroup>

            <div className="flex flex-col gap-4 items-center justify-center border border-white/5 rounded-xl p-4 bg-white/[0.02] mt-4">
              <div className="flex flex-wrap gap-2 justify-center">
                <Tooltip content="Default variant">
                  <Badge variant="default">Default</Badge>
                </Tooltip>
                <Tooltip content="Success variant">
                  <Badge variant="success">Success</Badge>
                </Tooltip>
                <Tooltip content="Warning variant">
                  <Badge variant="warning">Warning</Badge>
                </Tooltip>
                <Tooltip content="Danger variant">
                  <Badge variant="danger">Danger</Badge>
                </Tooltip>
              </div>

              <div className="flex gap-2 flex-wrap justify-center">
                <Tooltip content="Save your changes to the database" position="bottom">
                  <PrimaryButton onClick={handleSave}>
                    Save Changes
                  </PrimaryButton>
                </Tooltip>
                <PrimaryButton onClick={handleError} className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20">
                  Trigger Error
                </PrimaryButton>
                <PrimaryButton onClick={() => setIsModalOpen(true)} className="bg-white/10 hover:bg-white/20">
                  Open Modal
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </Surface>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Confirm Action</ModalTitle>
          <ModalDescription>
            Are you sure you want to proceed? This action cannot be undone.
          </ModalDescription>
        </ModalHeader>
        <div className="py-4">
          <Alert variant="warning" title="Warning">
            This action will permanently delete your account data.
          </Alert>
        </div>
        <ModalFooter>
          <PrimaryButton 
            onClick={() => setIsModalOpen(false)} 
            className="bg-white/5 hover:bg-white/10 border-white/10"
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton onClick={() => {
            setIsModalOpen(false);
            toast({ title: "Action Confirmed", variant: "success" });
          }}>
            Confirm
          </PrimaryButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
