import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, MetricCard, Button, GlowCard } from '@pixonui/react';
import { Activity, TrendingUp, Users, DollarSign, Sparkles, Shield, Cpu } from 'lucide-react';

export function CardsDemo() {
  return (
    <div className="space-y-8">
      {/* Brand New GlowCard Showcase */}
      <div>
        <div className="mb-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
            Featured Premium Components
          </h4>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Spotlight Glow Cards
          </h2>
          <p className="text-sm text-gray-500 dark:text-white/50">
            Cursor-tracking radial gradients on a glassmorphic border and background, running smoothly at 120 FPS.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <GlowCard glowColor="rgba(6, 182, 212, 0.15)" glowSize={250}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Engine Core</h3>
                <p className="text-xs text-gray-500 dark:text-white/40">Supercharged model metrics</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-white/70 mb-4 leading-relaxed">
              Integrate advanced LLM reasoning, neural inference streams, and vector context structures directly with real-time streaming sockets.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Active Inference
              </span>
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white border-0 shadow-lg shadow-cyan-500/20">
                Configure Core
              </Button>
            </div>
          </GlowCard>

          <GlowCard glowColor="rgba(139, 92, 246, 0.15)" glowSize={250}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Enterprise Vault</h3>
                <p className="text-xs text-gray-500 dark:text-white/40">Hardware-level cryptography</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-white/70 mb-4 leading-relaxed">
              Enforce cryptographic signing protocols, private key rotational triggers, and fully customized identity providers safely within the edge network.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-violet-500 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                AES-256 Validated
              </span>
              <Button size="sm" className="bg-violet-500 hover:bg-violet-600 text-white border-0 shadow-lg shadow-violet-500/20">
                Access Security
              </Button>
            </div>
          </GlowCard>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-white/10" />

      {/* Standard Cards Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>Deploy your new project in one-click.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-white/70">
              Your project will be deployed to the edge network.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost">Cancel</Button>
            <Button>Deploy</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>You have 3 unread messages.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-4 rounded-md border border-gray-200 dark:border-white/5 p-4">
              <Activity className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                  Server Status
                </p>
                <p className="text-xs text-gray-500 dark:text-white/50">
                  All systems operational
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metric Cards Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          subtext="Total Revenue"
          value="$45,231.89"
          accent="teal"
          showWave
          icon={<DollarSign className="h-4 w-4 text-white/70" />}
        />
        <MetricCard
          subtext="Subscriptions"
          value="+2350"
          accent="violet"
          showWave
          icon={<Users className="h-4 w-4 text-white/70" />}
        />
        <MetricCard
          subtext="Active Now"
          value="+573"
          accent="amber"
          showWave
          icon={<Activity className="h-4 w-4 text-white/70" />}
        />
        <MetricCard
          subtext="Sales"
          value="+12,234"
          accent="rose"
          showWave
          icon={<TrendingUp className="h-4 w-4 text-white/70" />}
        />
      </div>
    </div>
  );
}
