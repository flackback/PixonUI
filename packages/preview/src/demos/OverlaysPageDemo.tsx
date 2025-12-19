import React from 'react';
import { ModalDemo, DrawerDemo, CommandDemo } from './OverlayDemos';
import { Divider } from '@pixonui/react';

export function OverlaysPageDemo() {
  return (
    <div className="space-y-12">
      <section>
        <h3 className="text-lg font-medium text-white mb-4">Modal</h3>
        <ModalDemo />
      </section>
      
      <Divider />
      
      <section>
        <h3 className="text-lg font-medium text-white mb-4">Drawer</h3>
        <DrawerDemo />
      </section>
      
      <Divider />
      
      <section>
        <h3 className="text-lg font-medium text-white mb-4">Command Palette</h3>
        <CommandDemo />
      </section>
    </div>
  );
}
