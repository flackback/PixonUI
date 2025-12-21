import React, { useState, useRef } from 'react';
import { 
  Surface, 
  Heading, 
  Text, 
  Button, 
  Badge,
  TextInput,
  useKeyboardShortcuts,
  useClipboard,
  useHistory,
  useSearch,
  useLocalStorage,
  useInfiniteScroll,
  useVirtualList,
  cn
} from '@pixonui/react';
import { 
  Command, 
  Copy, 
  RotateCcw, 
  RotateCw, 
  Search as SearchIcon, 
  Save, 
  Trash2,
  Keyboard,
  History,
  Database,
  List
} from 'lucide-react';

export function HooksDemo() {
  // 1. useHistory Demo
  const { state: historyState, set: setHistory, undo, redo, canUndo, canRedo } = useHistory('Initial Text');

  // 2. useClipboard Demo
  const { copy, copied } = useClipboard();

  // 3. useSearch Demo
  const items = [
    { id: 1, name: 'Apple', category: 'Fruit' },
    { id: 2, name: 'Banana', category: 'Fruit' },
    { id: 3, name: 'Carrot', category: 'Vegetable' },
    { id: 4, name: 'Date', category: 'Fruit' },
    { id: 5, name: 'Eggplant', category: 'Vegetable' },
  ];
  const { results, query, setQuery } = useSearch(items, { keys: ['name', 'category'] });

  // 4. useLocalStorage Demo
  const [storedValue, setStoredValue] = useLocalStorage('demo-key', 'Default Value');

  // 5. useKeyboardShortcuts Demo
  const [shortcutTriggered, setShortcutTriggered] = useState(false);
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      handler: () => {
        setShortcutTriggered(true);
        setTimeout(() => setShortcutTriggered(false), 2000);
      }
    }
  ]);

  // 6. useVirtualList Demo
  const longList = Array.from({ length: 10000 }).map((_, i) => `Item ${i + 1}`);
  const containerRef = useRef<HTMLDivElement>(null);
  const { virtualItems, totalHeight } = useVirtualList({
    itemCount: longList.length,
    itemHeight: 40,
    containerRef,
    overscan: 5
  });

  return (
    <div className="space-y-8 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* History & Clipboard */}
        <Surface className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-blue-400" />
            <Heading level={3}>History & Clipboard</Heading>
          </div>
          <TextInput 
            value={historyState} 
            onChange={(e) => setHistory(e.target.value)}
            placeholder="Type something..."
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo}>
              <RotateCcw className="w-4 h-4 mr-2" /> Undo
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo}>
              <RotateCw className="w-4 h-4 mr-2" /> Redo
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copy(historyState)}
              className={cn(copied && "text-green-400 border-green-400/50")}
            >
              <Copy className="w-4 h-4 mr-2" /> {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </Surface>

        {/* Search Demo */}
        <Surface className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <SearchIcon className="w-5 h-5 text-purple-400" />
            <Heading level={3}>Smart Search</Heading>
          </div>
          <TextInput 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fruits or vegetables..."
            leftIcon={<SearchIcon className="w-4 h-4" />}
          />
          <div className="space-y-2">
            {results.map(item => (
              <div key={item.id} className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10">
                <Text>{item.name}</Text>
                <Badge variant="outline">{item.category}</Badge>
              </div>
            ))}
          </div>
        </Surface>

        {/* Local Storage & Shortcuts */}
        <Surface className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <Heading level={3}>Persistence & Shortcuts</Heading>
          </div>
          <div className="space-y-2">
            <Text size="sm" className="text-white/60">Local Storage Value:</Text>
            <TextInput 
              value={storedValue} 
              onChange={(e) => setStoredValue(e.target.value)}
            />
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Keyboard className="w-5 h-5 text-amber-400" />
              <div>
                <Text weight="medium">Ctrl + S</Text>
                <Text size="xs" className="text-white/40">Try the shortcut</Text>
              </div>
            </div>
            {shortcutTriggered && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                Saved!
              </Badge>
            )}
          </div>
        </Surface>

        {/* Virtual List Demo */}
        <Surface className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <List className="w-5 h-5 text-pink-400" />
            <Heading level={3}>Virtualization (10k items)</Heading>
          </div>
          <div 
            ref={containerRef}
            className="h-[200px] overflow-auto rounded-xl border border-white/10 bg-black/20 custom-scrollbar"
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              {virtualItems.map(item => (
                <div
                  key={item.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    transform: `translateY(${item.offsetTop}px)`,
                    height: 40,
                    width: '100%',
                  }}
                  className="flex items-center px-4 border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <Text size="sm">{longList[item.index]}</Text>
                </div>
              ))}
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );
}
