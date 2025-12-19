import React from 'react';
import { NewComponentsDemo } from './NewComponentsDemo';
import { TenNewComponentsDemo } from './TenNewComponentsDemo';
import { Separator } from '@pixonui/react';

export function ExtrasDemo() {
  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">New Components</h3>
        <NewComponentsDemo />
      </div>
      
      <Separator className="my-8" />

      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">10 New Components</h3>
        <TenNewComponentsDemo />
      </div>
    </div>
  );
}
