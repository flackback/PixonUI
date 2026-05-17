import React, { useState, useEffect } from 'react';
import type {
  Conversation,
  Message,
  User,
  MessageStatus
} from '@pixonui/react';
import { 
  ChatLayout, 
  ChatSidebar, 
  ChatHeader, 
  MessageList, 
  ChatInput, 
  ChatProfile,
  useChatMessages,
  useTypingIndicator
} from '@pixonui/react';

const CURRENT_USER_ID = 'me';

const USERS: Record<string, User> = {
  '1': { id: '1', name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', status: 'online', bio: 'Product Designer at Pixon' },
  '2': { id: '2', name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', status: 'offline', lastSeen: new Date(Date.now() - 1000 * 60 * 30) },
  '3': { id: '3', name: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', status: 'busy' },
};

const INITIAL_MESSAGES: Message[] = [
  { id: '1', content: 'Hey! How is the new project going?', senderId: '1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), status: 'read' },
  { id: '2', content: 'It is going great! Just finishing up the chat component.', senderId: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9), status: 'read' },
  { id: '3', content: 'That sounds awesome. Can I see a preview?', senderId: '1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.8), status: 'read' },
  { id: '4', content: 'Sure! I will send you a link shortly.', senderId: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 5), status: 'delivered' },
];

export function ChatDemo() {
  const [activeId, setActiveId] = useState('1');
  const [showProfile, setShowProfile] = useState(true);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const { 
    messages, 
    addMessage
  } = useChatMessages(INITIAL_MESSAGES);

  const { isTyping, setTyping } = useTypingIndicator();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingChats(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectChat = (id: string) => {
    setIsLoadingMessages(true);
    setActiveId(id);
    setTimeout(() => {
      setIsLoadingMessages(false);
    }, 800);
  };

  const conversations: Conversation[] = [
    { id: '1', user: USERS['1']!, lastMessage: messages[messages.length - 1], unreadCount: 2 },
    { id: '2', user: USERS['2']!, lastMessage: { id: '1', content: 'Did you see the latest design updates?', senderId: '2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'read' }, unreadCount: 0 },
    { id: '3', user: USERS['3']!, lastMessage: { id: '0', content: 'Call me later', senderId: '3', timestamp: new Date() }, unreadCount: 0 },
  ];

  const handleSend = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: CURRENT_USER_ID,
      timestamp: new Date(),
      status: 'sent'
    };
    addMessage(newMessage);

    // Simulate reply
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        content: "That's really cool! I love the glassmorphism effect.",
        senderId: activeId,
        timestamp: new Date(),
        status: 'sent'
      };
      addMessage(reply);
    }, 2000);
  };

  const handleReply = (message: Message) => {
    console.log('Reply to:', message);
  };

  const handleReact = (message: Message, emoji: string) => {
    console.log('React to:', message, emoji);
  };

  const activeUser = USERS[activeId] || USERS['1']!;

  return (
    <div className="space-y-6">
      <ChatLayout className="h-[700px]">
        <ChatSidebar 
          conversations={conversations} 
          activeId={activeId} 
          onSelect={handleSelectChat}
          isLoading={isLoadingChats}
          className="hidden md:flex"
        />
        
        <div className="flex-1 flex flex-col min-w-0 bg-white/50 dark:bg-black/20">
          <ChatHeader 
            user={activeUser} 
            onInfo={() => setShowProfile(!showProfile)}
          />
          
          <MessageList 
            messages={messages} 
            currentUserId={CURRENT_USER_ID} 
            isLoading={isLoadingMessages}
            onReply={handleReply}
            onReact={handleReact}
            onDelete={(id) => console.log('Delete:', id)}
          />
          
          <ChatInput 
            onSend={handleSend} 
            onAttach={() => console.log('Attach')} 
            users={Object.values(USERS)}
          />
        </div>

        {showProfile && (
          <ChatProfile 
            user={activeUser} 
            onClose={() => setShowProfile(false)} 
            className="hidden lg:flex"
          />
        )}
      </ChatLayout>

      <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 text-sm text-zinc-300">
        <h3 className="text-xl font-black text-white">Chat API de produção</h3>
        <p className="mt-2 text-zinc-400">
          O Pixon mantém a UI simples e delega busca/filtros pesados ao backend, no mesmo modelo eficiente do Chatwoot.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <pre className="overflow-auto rounded-2xl bg-black/60 p-4 text-xs text-cyan-100"><code>{`<ChatShell
  chatId={chatId}
  currentUserId={userId}
  adapter={adapter}
  conversations={conversations}
  features={{ virtualized: true, notifications: true }}
  slots={{ Header: MyHeader, Composer: MyComposer }}
  onNotify={(event) => toast(event.description)}
/>`}</code></pre>
          <pre className="overflow-auto rounded-2xl bg-black/60 p-4 text-xs text-cyan-100"><code>{`const chat = useChatController({
  chatId,
  currentUserId,
  pageSize: 50,
  maxMessages: 2000,
  adapter: {
    fetchMessages,
    searchMessages,
    filterConversations,
    sendMessage,
    subscribe,
  },
});

<ChatSidebar conversations={conversations} virtualized />
<MessageList messages={chat.messages} virtualized />
<ChatInput onSend={chat.sendMessage} />`}</code></pre>
          <pre className="overflow-auto rounded-2xl bg-black/60 p-4 text-xs text-cyan-100 lg:col-span-2"><code>{`const search = useChatSearchController({
  chatId,
  adapter,
  filters: {
    combinator: 'and',
    rules: [
      { field: 'senderId', operator: 'eq', value: 'user-1' },
      { field: 'timestamp', operator: 'between', value: [from, to] },
    ],
  },
});

<MessageSearch
  onSearch={search.setQuery}
  results={search.results}
  isLoading={search.isSearching}
  hasMore={search.hasMore}
  onLoadMore={search.loadMore}
/>`}</code></pre>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 p-4">
            <strong className="text-white">Hooks</strong>
            <p className="mt-2 text-zinc-400">useChatController, useChatContext, useChatNotifications, useChatSearchController, useConversationFilters, useChatDrafts.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <strong className="text-white">Props</strong>
            <p className="mt-2 text-zinc-400">ChatShell features, preset, slots, onNotify; ChatSidebar virtualized; MessageList virtualized; useChatController maxMessages.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <strong className="text-white">Slots</strong>
            <p className="mt-2 text-zinc-400">Layout, Sidebar, Header, MessageList, Composer, Profile, EmptyState e ErrorState sem reescrever o core.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <strong className="text-white">Helpers</strong>
            <p className="mt-2 text-zinc-400">buildOptimisticMessage, upsertMessages, groupMessagesByDate, preserveScrollAnchor, sortMessages.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
