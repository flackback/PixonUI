import React, { useState } from 'react';
import { 
  ChatLayout, 
  ChatSidebar, 
  MessageList, 
  ChatInput, 
  ChatHeader,
  ChatProfile,
  Surface,
  Heading,
  Text,
  Badge,
  Button,
  ScrollArea,
  Stack,
  cn
} from '@pixonui/react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Mail,
  Globe,
  Calendar,
  Tag,
  UserPlus,
  CheckCircle2
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

const mockContacts = [
  { id: '1', name: 'Sarah Wilson', lastMessage: 'The integration is working perfectly!', time: new Date(), unread: 2, status: 'online', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { id: '2', name: 'Alex Chen', lastMessage: 'Can we schedule a call for tomorrow?', time: new Date(Date.now() - 3600000), unread: 0, status: 'offline', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { id: '3', name: 'James Martin', lastMessage: 'I sent the documents to your email.', time: new Date(Date.now() - 86400000), unread: 0, status: 'online' },
  { id: '4', name: 'Emily Davis', lastMessage: 'Thanks for the quick response!', time: new Date(Date.now() - 172800000), unread: 5, status: 'busy', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
];

const mockMessages: Message[] = [
  { id: '1', content: 'Hi there! I have a question about the enterprise plan.', senderId: 'user', timestamp: new Date(Date.now() - 500000), status: 'read' },
  { id: '2', content: 'Hello! I\'d be happy to help. What specifically would you like to know?', senderId: 'me', timestamp: new Date(Date.now() - 400000), status: 'read' },
  { id: '3', content: 'Does it include custom SSO integration?', senderId: 'user', timestamp: new Date(Date.now() - 300000), status: 'read' },
  { id: '4', content: 'Yes, it does! We support SAML, OIDC, and most major providers.', senderId: 'me', timestamp: new Date(Date.now() - 200000), status: 'read' },
  { id: '5', content: 'The integration is working perfectly!', senderId: 'user', timestamp: new Date(Date.now() - 100000), status: 'delivered' },
];

const mockConversations = mockContacts.map(c => ({
  id: c.id,
  user: {
    id: c.id,
    name: c.name,
    avatar: c.avatar,
    status: c.status as any
  },
  lastMessage: {
    id: `msg-${c.id}`,
    content: c.lastMessage,
    timestamp: c.time,
    senderId: 'user'
  },
  unreadCount: c.unread
}));

export function Inbox() {
  const [selectedContactId, setSelectedContactId] = useState('1');
  const [showProfile, setShowProfile] = useState(true);

  const selectedContact = mockContacts.find(c => c.id === selectedContactId);
  const selectedUser = {
    id: selectedContact?.id || '',
    name: selectedContact?.name || '',
    avatar: selectedContact?.avatar,
    status: selectedContact?.status as any
  };

  return (
    <div className="h-[calc(100vh-180px)] -m-8">
      <ChatLayout className="h-full border-none bg-transparent">
        {/* Left Sidebar: Conversation List */}
        <ChatSidebar 
          conversations={mockConversations}
          activeId={selectedContactId}
          onSelect={setSelectedContactId}
          className="w-80 border-r border-gray-200 dark:border-white/5 bg-white dark:bg-black/20"
        >
          <div className="p-6 border-b border-gray-200 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <Heading as="h3" className="text-xl font-bold">Messages</Heading>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {mockContacts.map((contact) => (
                <div 
                  key={contact.id}
                  onClick={() => setSelectedContactId(contact.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200",
                    selectedContactId === contact.id 
                      ? "bg-cyan-500/10 border border-cyan-500/20" 
                      : "hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden flex items-center justify-center font-bold">
                      {contact.avatar ? <img src={contact.avatar} alt={contact.name} className="h-full w-full object-cover" /> : contact.name[0]}
                    </div>
                    <div className={cn(
                      "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-black",
                      contact.status === 'online' ? "bg-emerald-500" : contact.status === 'busy' ? "bg-rose-500" : "bg-gray-400"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Text className="font-bold truncate">{contact.name}</Text>
                      <Text className="text-[10px] text-gray-400">
                        {contact.time instanceof Date ? contact.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : contact.time}
                      </Text>
                    </div>
                    <Text className="text-xs text-gray-500 dark:text-white/30 truncate">{contact.lastMessage}</Text>
                  </div>
                  {contact.unread > 0 && (
                    <div className="h-5 w-5 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
                      {contact.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </ChatSidebar>

        {/* Center: Active Chat */}
        <div className="flex-1 flex flex-col bg-white/40 dark:bg-black/10 backdrop-blur-sm">
          <ChatHeader 
            user={selectedUser}
            onInfo={() => setShowProfile(!showProfile)}
            className="h-20 px-8 border-b border-gray-200 dark:border-white/5"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden flex items-center justify-center font-bold">
                  {selectedUser.avatar ? 
                    <img src={selectedUser.avatar} className="h-full w-full object-cover" /> : 
                    selectedUser.name[0]
                  }
                </div>
                <div>
                  <Text className="font-bold">{selectedUser.name}</Text>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <Text className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Online</Text>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl"><Phone className="h-4.5 w-4.5" /></Button>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl"><Video className="h-4.5 w-4.5" /></Button>
                <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("h-10 w-10 p-0 rounded-xl", showProfile && "bg-cyan-500/10 text-cyan-500")}
                  onClick={() => setShowProfile(!showProfile)}
                >
                  <Info className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>
          </ChatHeader>

          <div className="flex-1 overflow-hidden relative">
            <MessageList 
              messages={mockMessages} 
              currentUserId="me"
              className="p-8"
            />
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-white/5 bg-white/40 dark:bg-black/20">
            <ChatInput 
              onSend={(msg) => console.log('Send:', msg)}
              placeholder="Type your message here..."
              className="bg-gray-100 dark:bg-white/5 border-none rounded-2xl h-14 px-6"
            />
          </div>
        </div>

        {/* Right Sidebar: Contact Profile */}
        {showProfile && (
          <div className="w-80 border-l border-gray-200 dark:border-white/5 bg-white dark:bg-black/20 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-blue-600 p-1 mb-4">
                    <div className="h-full w-full rounded-[1.8rem] bg-white dark:bg-black overflow-hidden flex items-center justify-center font-bold text-2xl">
                      {mockContacts.find(c => c.id === selectedContactId)?.avatar ? 
                        <img src={mockContacts.find(c => c.id === selectedContactId)?.avatar} className="h-full w-full object-cover" /> : 
                        mockContacts.find(c => c.id === selectedContactId)?.name[0]
                      }
                    </div>
                  </div>
                  <Heading as="h3" className="text-xl font-bold">{mockContacts.find(c => c.id === selectedContactId)?.name}</Heading>
                  <Text className="text-sm text-gray-500 dark:text-white/30 mt-1">Product Designer at Acme Inc.</Text>
                  <div className="flex gap-2 mt-6">
                    <Button size="sm" className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4">Message</Button>
                    <Button size="sm" variant="outline" className="rounded-xl border-gray-200 dark:border-white/10 px-4">Profile</Button>
                  </div>
                </div>

                <div className="space-y-8">
                  <Stack gap={4}>
                    <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Contact Info</Text>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <Text className="text-sm">sarah.w@acme.com</Text>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                          <Globe className="h-4 w-4 text-gray-400" />
                        </div>
                        <Text className="text-sm">www.acme.com</Text>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <Text className="text-sm">Joined Oct 2024</Text>
                      </div>
                    </div>
                  </Stack>

                  <Stack gap={4}>
                    <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Tags</Text>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="neutral" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">Enterprise</Badge>
                      <Badge variant="neutral" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Priority</Badge>
                      <Badge variant="neutral" className="bg-gray-100 dark:bg-white/5 border-transparent">Design</Badge>
                    </div>
                  </Stack>

                  <Stack gap={4}>
                    <div className="flex items-center justify-between">
                      <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Shared Files</Text>
                      <Button variant="ghost" size="sm" className="text-[10px] font-bold text-cyan-500 p-0 h-auto">View All</Button>
                    </div>
                    <div className="space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text className="text-xs font-bold truncate">Project_Brief_v2.pdf</Text>
                            <Text className="text-[10px] text-gray-400">2.4 MB • PDF</Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Stack>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </ChatLayout>
    </div>
  );
}
