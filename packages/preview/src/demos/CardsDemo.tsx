import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, MetricCard, Button } from '@pixonui/react';
import { Activity, TrendingUp, Users, DollarSign } from 'lucide-react';

export function CardsDemo() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>Deploy your new project in one-click.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70">
              Your project will be deployed to the edge network.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost">Cancel</Button>
            <Button>Deploy</Button>
          </CardFooter>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>You have 3 unread messages.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-4 rounded-md border border-white/5 p-4">
              <Activity className="h-5 w-5 text-blue-400" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Server Status
                </p>
                <p className="text-xs text-white/50">
                  All systems operational
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
