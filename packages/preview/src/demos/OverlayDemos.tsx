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
  const [spotlight, setSpotlight] = React.useState(true);
  const [colorPreset, setColorPreset] = React.useState('default');
  const [size, setSize] = React.useState(600);

  const colors: Record<string, string | undefined> = {
    default: undefined,
    cyan: 'rgba(6, 182, 212, 0.15)',
    purple: 'rgba(168, 85, 247, 0.15)',
    emerald: 'rgba(16, 185, 129, 0.15)',
    orange: 'rgba(249, 115, 22, 0.15)',
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-white">Modal Dynamic Glow</h4>
          <p className="text-xs text-white/50">Tweak the cursor spotlight to match your theme perfectly</p>
        </div>
        <PrimaryButton onClick={() => setOpen(true)}>Open Interactive Modal</PrimaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/70">Spotlight Tracker</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSpotlight(true)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                spotlight 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-white/60 border-white/10 hover:border-white/30'
              }`}
            >
              On
            </button>
            <button
              onClick={() => setSpotlight(false)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                !spotlight 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-white/60 border-white/10 hover:border-white/30'
              }`}
            >
              Off
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-white/70">Radial Hue Preset</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(colors).map((preset) => (
              <button
                key={preset}
                onClick={() => setColorPreset(preset)}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                  colorPreset === preset
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-transparent text-white/60 border-white/10 hover:border-white/30'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-white/70">
            <span>Gradient Radius</span>
            <span>{size}px</span>
          </div>
          <input
            type="range"
            min="200"
            max="1200"
            step="50"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>

      <Modal 
        isOpen={open} 
        onClose={() => setOpen(false)} 
        spotlight={spotlight}
        spotlightColor={colors[colorPreset]}
        spotlightSize={size}
      >
        <div className="mb-4 relative z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Example High-Fidelity Modal</h2>
          <p className="text-sm text-gray-500 dark:text-white/50">This modal contains the premium backdrop glow spotlight effect.</p>
        </div>
        <div className="py-4 text-gray-600 dark:text-white/70 relative z-10">
          Hover your mouse inside this panel to watch the spotlight follow your cursor seamlessly.
        </div>
        <div className="flex justify-end gap-2 mt-4 relative z-10">
          <PrimaryButton onClick={() => setOpen(false)}>Close Modal</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}

export function DrawerDemo() {
  const [open, setOpen] = React.useState(false);
  const [spotlight, setSpotlight] = React.useState(true);
  const [colorPreset, setColorPreset] = React.useState('default');
  const [size, setSize] = React.useState(600);

  const colors: Record<string, string | undefined> = {
    default: undefined,
    cyan: 'rgba(6, 182, 212, 0.15)',
    purple: 'rgba(168, 85, 247, 0.15)',
    emerald: 'rgba(16, 185, 129, 0.15)',
    orange: 'rgba(249, 115, 22, 0.15)',
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-white">Drawer Dynamic Glow</h4>
          <p className="text-xs text-white/50">Tweak the cursor spotlight to match your theme perfectly</p>
        </div>
        <PrimaryButton onClick={() => setOpen(true)}>Open Interactive Drawer</PrimaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/70">Spotlight Tracker</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSpotlight(true)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                spotlight 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-white/60 border-white/10 hover:border-white/30'
              }`}
            >
              On
            </button>
            <button
              onClick={() => setSpotlight(false)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                !spotlight 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-white/60 border-white/10 hover:border-white/30'
              }`}
            >
              Off
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-white/70">Radial Hue Preset</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(colors).map((preset) => (
              <button
                key={preset}
                onClick={() => setColorPreset(preset)}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                  colorPreset === preset
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-transparent text-white/60 border-white/10 hover:border-white/30'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-white/70">
            <span>Gradient Radius</span>
            <span>{size}px</span>
          </div>
          <input
            type="range"
            min="200"
            max="1200"
            step="50"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>

      <Drawer 
        isOpen={open} 
        onClose={() => setOpen(false)}
        spotlight={spotlight}
        spotlightColor={colors[colorPreset]}
        spotlightSize={size}
      >
        <div className="p-5 relative z-10">
          <div className="text-lg font-semibold text-white">Drawer with Dynamic Spotlight</div>
          <div className="text-sm text-white/50">Hover anywhere in this panel to watch the spotlight glow effect tracker follow you.</div>
        </div>
        <Divider className="relative z-10" />
        <div className="p-5 relative z-10">
          <p className="text-white/70 mb-4">You can dynamically customize the spotlight's behavior on the main page playground.</p>
          <PrimaryButton onClick={() => setOpen(false)}>Close Drawer</PrimaryButton>
        </div>
      </Drawer>
    </div>
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
