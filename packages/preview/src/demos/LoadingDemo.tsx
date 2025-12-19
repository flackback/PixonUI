import React from 'react';
import { Skeleton, Progress, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@pixonui/react';

export function LoadingDemo() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Skeleton</CardTitle>
          <CardDescription>Use to show a placeholder while content is loading.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>Displays an indicator showing the completion progress of a task.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="text-xs text-white/50">Default (60%)</div>
            <Progress value={60} />
          </div>
          <div className="space-y-2">
            <div className="text-xs text-white/50">Success (80%)</div>
            <Progress value={80} variant="success" />
          </div>
          <div className="space-y-2">
            <div className="text-xs text-white/50">Warning + Stripe (40%)</div>
            <Progress value={40} variant="warning" hasStripe />
          </div>
          <div className="space-y-2">
            <div className="text-xs text-white/50">Indeterminate</div>
            <Progress isIndeterminate variant="gradient" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
