import { PrimaryButton, Surface, Heading, Text, Badge, Divider, MetricCard, TextInput, Checkbox, Switch, Select, Textarea, RadioGroup, RadioGroupItem, useToast, Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter, Tooltip, Alert, Avatar, Tabs, TabsList, TabsTrigger, TabsContent, Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, Accordion, AccordionItem, AccordionTrigger, AccordionContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, Progress, Slider, DatePicker, Calendar, Popover, PopoverTrigger, PopoverContent, Label, Combobox, ComboboxTrigger, ComboboxContent, ComboboxInput, ComboboxList, ComboboxItem, ComboboxEmpty } from '@pixonui/react';
import { Mail, Lock, Search, AlertCircle, Info, Menu, User, Settings, LogOut, CreditCard } from 'lucide-react';
import { useState } from 'react';

export default function App() {
  const [role, setRole] = useState('');
  const [framework, setFramework] = useState('');
  const [plan, setPlan] = useState('free');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
          <div className="flex justify-center gap-[-10px] mb-4 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 ring-offset-[#0A0A0A] focus:ring-2 focus:ring-white/20">
                <Avatar src="https://i.pravatar.cc/150?u=1" fallback="JD" className="cursor-pointer hover:opacity-80 transition-opacity" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast({ title: "Profile clicked" })}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast({ title: "Billing clicked" })}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDrawerOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast({ title: "Logged out", variant: "warning" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Avatar src="https://i.pravatar.cc/150?u=2" fallback="AB" className="-ml-3 border-2 border-[#0A0A0A]" />
            <Avatar src="https://i.pravatar.cc/150?u=3" fallback="XY" className="-ml-3 border-2 border-[#0A0A0A]" />
            <Avatar fallback="+3" className="-ml-3 border-2 border-[#0A0A0A] bg-white/10 text-xs" />
          </div>
          <Heading as="h1">PixonUI</Heading>
          <Text variant="muted">Modern UI Framework Preview</Text>
        </div>

        <Divider />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4">
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
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <Alert variant="info" title="Analytics Module">
              Detailed analytics charts will be displayed here in the future.
            </Alert>
          </TabsContent>
        </Tabs>

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

            <div className="space-y-2">
              <Label>Framework</Label>
              <Combobox value={framework} onValueChange={setFramework}>
                <ComboboxTrigger>
                  {framework ? framework.charAt(0).toUpperCase() + framework.slice(1) : "Select framework..."}
                </ComboboxTrigger>
                <ComboboxContent>
                  <ComboboxInput placeholder="Search framework..." />
                  <ComboboxList>
                    <ComboboxEmpty>No framework found.</ComboboxEmpty>
                    <ComboboxItem value="next.js">Next.js</ComboboxItem>
                    <ComboboxItem value="react">React</ComboboxItem>
                    <ComboboxItem value="vue">Vue</ComboboxItem>
                    <ComboboxItem value="angular">Angular</ComboboxItem>
                    <ComboboxItem value="svelte">Svelte</ComboboxItem>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="space-y-2">
              <Label>sName="space-y-2">
              <Label>Date of Birth</Label>
              <DatePicker placeholder="Select your birth date" />
            </div>

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

            <div className="pt-4">
              <Heading as="h3" className="text-lg mb-2">FAQ</Heading>
              <Accordion type="single" defaultValue="item-1">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is it accessible?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is it styled?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It comes with default styles that matches the other components' aesthetic.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Is it animated?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It's animated by default, but you can disable it if you prefer.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <Text variant="muted">Storage Usage</Text>
                  <Text variant="muted">75%</Text>
                </div>
                <Progress value={75} />
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <Text variant="muted">Volume</Text>
                  <Text variant="muted">50%</Text>
                </div>
                <Slider defaultValue={50} max={100} step={1} />
              </div>

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
                <PrimaryButton onClick={() => setIsDrawerOpen(true)} className="bg-white/10 hover:bg-white/20">
                  <Menu size={16} className="mr-2" />
                  Open Drawer
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </Surface>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>
            Manage your account settings and preferences.
          </DrawerDescription>
        </DrawerHeader>
        <div className="py-4 space-y-4">
          <TextInput label="Username" defaultValue="johndoe" />
          <Select
            label="Language"
            placeholder="Select language"
            options={[
              { label: 'English', value: 'en' },
              { label: 'Portuguese', value: 'pt' },
              { label: 'Spanish', value: 'es' },
            ]}
          />
          <div className="space-y-2">
            <Switch label="Email Notifications" defaultChecked />
            <Switch label="Push Notifications" />
            <Switch label="Marketing Emails" />
          </div>
        </div>
        <DrawerFooter>
          <PrimaryButton onClick={() => setIsDrawerOpen(false)} className="w-full">
            Save Changes
          </PrimaryButton>
        </DrawerFooter>
      </Drawer
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
