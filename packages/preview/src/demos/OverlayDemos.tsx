import React from 'react';
import { 
  PrimaryButton, 
  Modal, 
  Drawer, 
  Divider,
  Button,
  Kbd,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut
} from '@pixonui/react';
import { Calendar, Search, Calculator, User, CreditCard, Settings } from 'lucide-react';

export function ModalDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>Open Modal</PrimaryButton>
      <Modal 
        isOpen={open} 
        onClose={() => setOpen(false)} 
      >
        <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Example Modal</h2>
            <p className="text-sm text-gray-500 dark:text-white/50">This is a modal description.</p>
        </div>
        <div className="py-4 text-gray-600 dark:text-white/70">
          Click outside or press ESC to close.
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <PrimaryButton onClick={() => setOpen(false)}>Close</PrimaryButton>
        </div>
      </Modal>
    </>
  );
}

export function DrawerDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>Open Drawer</PrimaryButton>
      <Drawer isOpen={open} onClose={() => setOpen(false)}>
        <div className="p-5">
          <div className="text-lg font-semibold text-white">Drawer Title</div>
          <div className="text-sm text-white/50">This is a drawer component.</div>
        </div>
        <Divider />
        <div className="p-5">
          <p className="text-white/70">Drawer content goes here.</p>
        </div>
      </Drawer>
    </>
  );
}

export function CommandDemo() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-white/50">
          Press <Kbd>⌘ K</Kbd> or <Kbd>Ctrl K</Kbd> to open the command menu
        </p>
        <Button onClick={() => setOpen(true)}>Open Command Menu</Button>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem value="calendar">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem value="search">
              <Search className="mr-2 h-4 w-4" />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem value="calculator">
              <Calculator className="mr-2 h-4 w-4" />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <Divider className="my-2" />
          <CommandGroup heading="Settings">
            <CommandItem value="profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem value="billing">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem value="settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
