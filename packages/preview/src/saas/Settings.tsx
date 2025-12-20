import React from 'react';
import { 
  Heading, 
  Text, 
  Surface, 
  Stack, 
  Button, 
  TextInput, 
  Textarea,
  Label,
  Avatar,
  Divider
} from '@pixonui/react';
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  CreditCard, 
  Shield,
  Mail,
  Camera
} from 'lucide-react';

export function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Heading as="h2" className="text-3xl font-bold tracking-tight">Settings</Heading>
        <Text className="text-gray-500 dark:text-white/40 mt-1">Manage your account settings and preferences.</Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-1">
          {[
            { icon: User, label: 'Profile', active: true },
            { icon: Bell, label: 'Notifications', active: false },
            { icon: Lock, label: 'Security', active: false },
            { icon: Globe, label: 'Appearance', active: false },
            { icon: CreditCard, label: 'Billing', active: false },
            { icon: Shield, label: 'Privacy', active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                item.active 
                  ? "bg-cyan-500/10 text-cyan-500" 
                  : "text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          <Surface className="p-8">
            <Stack gap={8}>
              <div>
                <Heading as="h4" className="text-lg font-bold mb-1">Public Profile</Heading>
                <Text className="text-sm text-gray-500 dark:text-white/30">This information will be displayed publicly.</Text>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-white dark:border-black shadow-xl" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" />
                  <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-cyan-600 text-white flex items-center justify-center border-2 border-white dark:border-black hover:bg-cyan-500 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <Text className="font-bold">Profile Picture</Text>
                  <Text className="text-xs text-gray-500 dark:text-white/30 mt-1">JPG, GIF or PNG. Max size of 800K</Text>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg text-xs">Upload</Button>
                    <Button size="sm" variant="ghost" className="h-8 px-3 rounded-lg text-xs text-rose-500 hover:bg-rose-500/10">Remove</Button>
                  </div>
                </div>
              </div>

              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <TextInput placeholder="Sarah" className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <TextInput placeholder="Wilson" className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 rounded-xl" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <TextInput placeholder="sarah.wilson@example.com" className="pl-10 bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Bio</Label>
                  <Textarea placeholder="Product Designer at Acme Inc. Passionate about glassmorphism and UI/UX." className="min-h-[100px] bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 rounded-xl" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="rounded-xl px-6">Cancel</Button>
                <Button className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl px-8 font-bold">Save Changes</Button>
              </div>
            </Stack>
          </Surface>

          <Surface className="p-8 border-rose-500/20 bg-rose-500/[0.02]">
            <Stack gap={4}>
              <div>
                <Heading as="h4" className="text-lg font-bold text-rose-500 mb-1">Danger Zone</Heading>
                <Text className="text-sm text-gray-500 dark:text-white/30">Irreversible actions for your account.</Text>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <div>
                  <Text className="font-bold text-sm">Delete Account</Text>
                  <Text className="text-xs text-gray-500 dark:text-white/30">Once you delete your account, there is no going back.</Text>
                </div>
                <Button variant="outline" className="border-rose-500/50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl px-4 h-9 text-xs font-bold">
                  Delete Account
                </Button>
              </div>
            </Stack>
          </Surface>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
