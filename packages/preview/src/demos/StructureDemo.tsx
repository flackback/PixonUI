import React from 'react';
import { Separator, Collapse, Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@pixonui/react';

export function StructureDemo() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Separator</CardTitle>
          <CardDescription>Visually separate content in lists or layouts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none text-white">Pixon UI</h4>
              <p className="text-sm text-gray-400">An open-source UI component library.</p>
            </div>
            <Separator className="my-4" />
            <div className="flex h-5 items-center space-x-4 text-sm text-white">
              <div>Blog</div>
              <Separator orientation="vertical" />
              <div>Docs</div>
              <Separator orientation="vertical" />
              <div>Source</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collapse</CardTitle>
          <CardDescription>A collapsible panel for hiding and showing content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Collapse 
            title="What is Pixon UI?" 
            defaultOpen
          >
            <p className="text-sm text-gray-400">
              Pixon UI is a modern, component-based UI library designed for speed and flexibility.
              It features a zero-runtime CSS-in-JS approach using Tailwind CSS.
            </p>
          </Collapse>

          <Collapse title="Is it accessible?">
            <p className="text-sm text-gray-400">
              Yes. It adheres to the WAI-ARIA design patterns where possible.
            </p>
          </Collapse>

          <Collapse title="Can I use it in my project?" disabled>
            <p className="text-sm text-gray-400">
              This content is disabled and cannot be toggled.
            </p>
          </Collapse>
        </CardContent>
      </Card>
    </div>
  );
}
