import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChatLayout, 
  ChatSidebar, 
  MessageList, 
  ChatInput, 
  ChatHeader,
  Heading,
  Text,
  Badge,
  Button,
  ScrollArea,
  Stack,
  cn,
  UnifiedPreviewModal,
  FileAttachment
} from '@pixonui/react';
import type {
  Conversation,
  Message,
  UserStatus
} from '@pixonui/react';
import { 
  Search, 
  Filter, 
  Phone, 
  Video, 
  Info,
  Mail,
  Globe,
  Calendar,
  CheckCircle2,
  X,
  Paperclip,
  Sparkles
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  time: Date;
  unread: number;
  status: UserStatus;
  avatar?: string;
}

const mockContacts: Contact[] = [
  { id: '1', name: 'Sarah Wilson', lastMessage: 'The integration is working perfectly!', time: new Date(), unread: 2, status: 'online', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { id: '2', name: 'Alex Chen', lastMessage: 'Can we schedule a call for tomorrow?', time: new Date(Date.now() - 3600000), unread: 0, status: 'offline', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { id: '3', name: 'James Martin', lastMessage: 'I sent the documents to your email.', time: new Date(Date.now() - 86400000), unread: 0, status: 'online' },
  { id: '4', name: 'Emily Davis', lastMessage: 'Thanks for the quick response!', time: new Date(Date.now() - 172800000), unread: 5, status: 'busy', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
];

const initialChatMessages: Record<string, Message[]> = {
  '1': [
    { id: '1-1', content: 'Hi there! I have a question about the enterprise plan.', senderId: 'user', timestamp: new Date(Date.now() - 500000), status: 'read', reactions: { '👍': ['Alex Chen'] } },
    { id: '1-2', content: 'Hello! I\'d be happy to help. What specifically would you like to know?', senderId: 'me', timestamp: new Date(Date.now() - 400000), status: 'read' },
    { id: '1-3', content: 'Does it include custom SSO integration?', senderId: 'user', timestamp: new Date(Date.now() - 300000), status: 'read' },
    { id: '1-4', content: 'Yes, it does! We support SAML, OIDC, and most major providers.', senderId: 'me', timestamp: new Date(Date.now() - 200000), status: 'read' },
    { id: '1-5', content: 'The integration is working perfectly!', senderId: 'user', timestamp: new Date(Date.now() - 100000), status: 'delivered' },
    { 
      id: '1-6', 
      content: '', 
      senderId: 'user', 
      timestamp: new Date(Date.now() - 80000), 
      status: 'read', 
      type: 'file', 
      attachments: [{ id: 'att-1-6', type: 'file', name: 'Relatorio_Performance_PixonUI.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: '1.2 MB' }] 
    },
    { 
      id: '1-7', 
      content: '', 
      senderId: 'me', 
      timestamp: new Date(Date.now() - 60000), 
      status: 'read', 
      type: 'file', 
      attachments: [{ id: 'att-1-7', type: 'file', name: 'Relatorio_Vendas_May_2026.xlsx', url: '', size: '420 KB' }] 
    },
    { 
      id: '1-8', 
      content: '00020126580014BR.GOV.BCB.PIX0136pixonui-supremo-key-payment-address520400005303986540510.005802BR5924PIXONUI ENTERPRISE LTD6009SAO PAULO62070503***6304BF92', 
      senderId: 'user', 
      timestamp: new Date(Date.now() - 40000), 
      status: 'read', 
      type: 'qrcode' 
    },
    { 
      id: '1-9', 
      content: '🚀 PixonUI Supremo Core Team', 
      senderId: 'me', 
      timestamp: new Date(Date.now() - 20000), 
      status: 'read', 
      type: 'group' 
    }
  ],
  '2': [
    { id: '2-1', content: 'Hey Anderson, did you check the new PixonUI design?', senderId: 'user', timestamp: new Date(Date.now() - 7200000), status: 'read' },
    { id: '2-2', content: 'Yes, it looks absolutely stunning!', senderId: 'me', timestamp: new Date(Date.now() - 3600000), status: 'read' },
    { id: '2-3', content: 'Can we schedule a call for tomorrow?', senderId: 'user', timestamp: new Date(Date.now() - 1800000), status: 'delivered' },
    { 
      id: '2-4', 
      content: '', 
      senderId: 'user', 
      timestamp: new Date(Date.now() - 900000), 
      status: 'read', 
      type: 'file', 
      attachments: [{ id: 'att-2-4', type: 'file', name: 'Proposta_Comercial_PixonUI.docx', url: '', size: '154 KB' }] 
    },
    { 
      id: '2-5', 
      content: '', 
      senderId: 'me', 
      timestamp: new Date(Date.now() - 300000), 
      status: 'read', 
      type: 'file', 
      attachments: [{ id: 'att-2-5', type: 'audio', name: 'Auditoria_Audio_Sync.mp3', url: '', size: '2.8 MB' }] 
    }
  ],
  '3': [
    { id: '3-1', content: 'Hi! Let know when you receive the contract.', senderId: 'user', timestamp: new Date(Date.now() - 86400000), status: 'read' },
    { id: '3-2', content: 'I sent the documents to your email.', senderId: 'user', timestamp: new Date(Date.now() - 43200000), status: 'read' },
  ],
  '4': [
    { id: '4-1', content: 'We need some adjustments in the dashboard component.', senderId: 'user', timestamp: new Date(Date.now() - 172800000), status: 'read' },
    { id: '4-2', content: 'Adjustments are deployed and updated on staging.', senderId: 'me', timestamp: new Date(Date.now() - 86400000), status: 'read' },
    { id: '4-3', content: 'Thanks for the quick response!', senderId: 'user', timestamp: new Date(Date.now() - 10000), status: 'read' },
  ],
};

const getUniqueId = (prefix: string) => {
  return `${prefix}-${Date.now()}`;
};

const getAIResponse = (userMsg: string, _contactName: string) => {
  const msg = userMsg.toLowerCase();
  if (msg.includes('hello') || msg.includes('hi')) {
    return `Hey there! Great to hear from you. How's everything going with your PixonUI integration?`;
  }
  if (msg.includes('sso') || msg.includes('saml') || msg.includes('enterprise')) {
    return `Absolutely! Our enterprise plan supports complete SAML, OIDC, and Okta integration. I can get our solutions architect on a quick call to map this out for you.`;
  }
  if (msg.includes('pricing') || msg.includes('cost')) {
    return `We have options starting at $49/mo for pro developers up to custom volume plans for larger teams. Which tier fits your current scope best?`;
  }
  if (msg.includes('bug') || msg.includes('error') || msg.includes('fail')) {
    return `Oh, I'm sorry to hear that! Could you paste the stack trace or share a screenshot? I'll escalate this to our core platform team right away!`;
  }
  return `Thanks for the details! I'm sharing this with the product team now so we can explore how to support this in our next release sprint. Is there anything else you'd like us to include?`;
};

export function Inbox() {
  const [selectedContactId, setSelectedContactId] = useState('1');
  const [showProfile, setShowProfile] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(initialChatMessages);
  
  const [inputValue, setInputValue] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  
  const [typingContactId, setTypingContactId] = useState<string | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Direct contact hover drag tracking state
  const [dragOverContactId, setDragOverContactId] = useState<string | null>(null);

  // File queue state to bind to ChatInput queue
  const [inputFiles, setInputFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Loading States for Skeletons
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConversationsLoading(false);
    }, 1200);
    return () => {
      clearTimeout(timer);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  const handleFileClick = (file: FileAttachment) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  
  const selectedUser = useMemo(() => ({
    id: selectedContact?.id || '',
    name: selectedContact?.name || '',
    avatar: selectedContact?.avatar,
    status: selectedContact?.status
  }), [selectedContact]);

  // Compute conversations dynamically for the sidebar
  const conversations = useMemo<Conversation[]>(() => {
    return contacts.map(c => {
      const msgs = chatMessages[c.id] || [];
      const lastMsg = msgs[msgs.length - 1];
      return {
        id: c.id,
        user: {
          id: c.id,
          name: c.name,
          avatar: c.avatar,
          status: c.status
        },
        lastMessage: lastMsg ? {
          id: lastMsg.id,
          content: lastMsg.content,
          timestamp: lastMsg.timestamp,
          senderId: lastMsg.senderId
        } : {
          id: `empty-${c.id}`,
          content: "No messages yet",
          timestamp: c.time,
          senderId: 'user'
        },
        unreadCount: c.unread
      };
    });
  }, [contacts, chatMessages]);

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const term = searchTerm.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.lastMessage.toLowerCase().includes(term)
    );
  }, [contacts, searchTerm]);

  const handleSelectContact = (id: string) => {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    setIsMessagesLoading(true);
    setSelectedContactId(id);
    setContacts(prev => prev.map(c => 
      c.id === id ? { ...c, unread: 0 } : c
    ));
    setReplyToMessage(null);
    setEditMessage(null);
    setInputValue("");
    setInputFiles([]);
    setShowSlashMenu(false);

    messageTimerRef.current = setTimeout(() => {
      setIsMessagesLoading(false);
    }, 600);
  };

  const handleSend = (text: string, files?: File[]) => {
    const hasText = text.trim().length > 0;
    const hasFiles = files && files.length > 0;
    if (!hasText && !hasFiles) return;

    if (editMessage) {
      // Editing Mode
      const updated = chatMessages[selectedContactId]?.map(msg => 
        msg.id === editMessage.id ? { ...msg, content: text, isEdited: true } : msg
      ) || [];
      setChatMessages(prev => ({
        ...prev,
        [selectedContactId]: updated
      }));
      setEditMessage(null);
      setInputValue("");
      return;
    }

    const newMsgId = getUniqueId('msg');
    let newMsg: Message;

    if (hasFiles) {
      const firstFile = files![0] as File;
      const isImage = firstFile.type.startsWith('image/');
      const isVideo = firstFile.type.startsWith('video/');
      const isAudio = firstFile.type.startsWith('audio/');
      
      let msgType: 'image' | 'video' | 'audio' | 'file' = 'file';
      if (isImage) msgType = 'image';
      else if (isVideo) msgType = 'video';
      else if (isAudio) msgType = 'audio';

      newMsg = {
        id: newMsgId,
        content: text || `Sent file: ${firstFile.name}`,
        senderId: 'me',
        timestamp: new Date(),
        status: 'sending',
        type: msgType,
        replyTo: replyToMessage || undefined,
        replyToId: replyToMessage?.id || undefined,
        attachments: files.map(f => ({
          id: getUniqueId('att'),
          type: f.type.startsWith('image/') ? 'image' : f.type.startsWith('video/') ? 'video' : 'file',
          url: f.type.startsWith('image/') ? URL.createObjectURL(f) : '#',
          name: f.name,
          size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`
        }))
      };
    } else {
      newMsg = {
        id: newMsgId,
        content: text,
        senderId: 'me',
        timestamp: new Date(),
        status: 'sending',
        replyTo: replyToMessage || undefined,
        replyToId: replyToMessage?.id || undefined
      };
    }

    // Append to list
    const currentMsgs = chatMessages[selectedContactId] || [];
    setChatMessages(prev => ({
      ...prev,
      [selectedContactId]: [...currentMsgs, newMsg]
    }));

    // Clear inputs
    setInputValue("");
    setInputFiles([]);
    setReplyToMessage(null);

    // Update contacts list lastMessage
    const displayLastMsg = hasFiles ? `📁 Encolheu ${files.length} arquivos` : text;
    setContacts(prev => prev.map(c => 
      c.id === selectedContactId 
        ? { ...c, lastMessage: displayLastMsg, time: new Date() }
        : c
    ));

    // Simulate states
    setTimeout(() => {
      setChatMessages(prev => ({
        ...prev,
        [selectedContactId]: prev[selectedContactId]?.map(m => 
          m.id === newMsgId ? { ...m, status: 'sent' } : m
        ) || []
      }));
    }, 500);

    setTimeout(() => {
      setChatMessages(prev => ({
        ...prev,
        [selectedContactId]: prev[selectedContactId]?.map(m => 
          m.id === newMsgId ? { ...m, status: 'delivered' } : m
        ) || []
      }));
    }, 1000);

    setTimeout(() => {
      setChatMessages(prev => ({
        ...prev,
        [selectedContactId]: prev[selectedContactId]?.map(m => 
          m.id === newMsgId ? { ...m, status: 'read' } : m
        ) || []
      }));
    }, 1500);

    triggerContactReply(hasFiles ? `[File Attachments PREVIEW]` : text);
  };

  const triggerContactReply = (userText: string) => {
    const targetContactId = selectedContactId;
    setTimeout(() => {
      setTypingContactId(targetContactId);
    }, 1500);

    setTimeout(() => {
      const replyText = getAIResponse(userText, selectedContact?.name || "Sarah Wilson");
      const replyMsgId = getUniqueId('reply');
      
      const replyMsg: Message = {
        id: replyMsgId,
        content: replyText,
        senderId: 'user',
        timestamp: new Date(),
        status: 'delivered'
      };

      setChatMessages(prev => {
        const current = prev[targetContactId] || [];
        return {
          ...prev,
          [targetContactId]: [...current, replyMsg]
        };
      });

      setTypingContactId(null);

      setContacts(prev => prev.map(c => 
        c.id === targetContactId 
          ? { 
              ...c, 
              lastMessage: replyText, 
              time: new Date(), 
              unread: selectedContactId === targetContactId ? 0 : c.unread + 1 
            }
          : c
      ));
    }, 3500);
  };

  const handleReact = (message: Message, emoji: string) => {
    const currentReactions = message.reactions || {};
    const userVotes = currentReactions[emoji] || [];
    
    let updatedVotes: string[];
    if (userVotes.includes('me')) {
      updatedVotes = userVotes.filter((v: string) => v !== 'me');
    } else {
      updatedVotes = [...userVotes, 'me'];
    }

    const updatedReactions = {
      ...currentReactions,
      [emoji]: updatedVotes
    };

    if (updatedVotes.length === 0) {
      delete updatedReactions[emoji];
    }

    const updated = chatMessages[selectedContactId]?.map(msg => 
      msg.id === message.id ? { ...msg, reactions: updatedReactions } : msg
    ) || [];

    setChatMessages(prev => ({
      ...prev,
      [selectedContactId]: updated
    }));
  };

  const handleEdit = (msg: Message) => {
    setEditMessage(msg);
    setInputValue(msg.content);
  };

  const handleReply = (msg: Message) => {
    setReplyToMessage(msg);
  };

  const handleDelete = (msg: Message) => {
    setChatMessages(prev => ({
      ...prev,
      [selectedContactId]: prev[selectedContactId]?.filter(m => m.id !== msg.id) || []
    }));
  };

  const handlePin = (msg: Message) => {
    const updated = chatMessages[selectedContactId]?.map(m => 
      m.id === msg.id ? { ...m, isPinned: !m.isPinned } : m
    ) || [];
    setChatMessages(prev => ({
      ...prev,
      [selectedContactId]: updated
    }));
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (val.startsWith('/')) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleSelectSlashCommand = (cmd: string) => {
    if (cmd === '/shrug') {
      setInputValue(prev => prev.replace(/^\/\w*/, '') + ' ¯\\_(ツ)_/¯');
    } else if (cmd === '/ai') {
      handleSend("Explain SSO integration to a customer. [AI Simulation Request]");
    } else if (cmd === '/gif') {
      const newMsgId = getUniqueId('msg');
      const newMsg: Message = {
        id: newMsgId,
        content: "Compile success! Ready to ship! 🚀",
        senderId: 'me',
        timestamp: new Date(),
        status: 'sending',
        type: 'image',
        attachments: [{
          id: getUniqueId('gif'),
          type: 'image',
          url: 'https://media.giphy.com/media/V83FJFpAAtv16D9rS3/giphy.gif',
          name: 'deploying.gif'
        }]
      };
      setChatMessages(prev => ({
        ...prev,
        [selectedContactId]: [...(prev[selectedContactId] || []), newMsg]
      }));
      setInputValue("");
      triggerContactReply("Compile success!");
    } else if (cmd === '/clear') {
      setChatMessages(prev => ({ ...prev, [selectedContactId]: [] }));
      setInputValue("");
    }
    setShowSlashMenu(false);
  };

  const handleVoiceSend = (blob: Blob, duration: number) => {
    const newMsgId = getUniqueId('msg');
    const newMsg: Message = {
      id: newMsgId,
      content: "Mensagem de voz",
      senderId: 'me',
      timestamp: new Date(),
      status: 'sending',
      type: 'audio',
      attachments: [{
        id: getUniqueId('voice'),
        type: 'audio',
        url: URL.createObjectURL(blob),
        name: 'voice_note.ogg',
        duration
      }]
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), newMsg]
    }));

    setIsRecording(false);

    setContacts(prev => prev.map(c => 
      c.id === selectedContactId 
        ? { ...c, lastMessage: "🎙️ Mensagem de voz", time: new Date() }
        : c
    ));

    // Simulate sending progress
    setTimeout(() => {
      setChatMessages(prev => ({
        ...prev,
        [selectedContactId]: prev[selectedContactId]?.map(m => 
          m.id === newMsgId ? { ...m, status: 'read' } : m
        ) || []
      }));
    }, 1500);

    triggerContactReply("Enviou mensagem de voz");
  };

  // Drag and Drop File Handlers for container backdrop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Put file inside the input upload queue instantly!
      setInputFiles(Array.from(files));
    }
  };

  const currentMessages = chatMessages[selectedContactId] || [];

  return (
    <div className="h-[calc(100vh-180px)] -m-8 relative overflow-hidden rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-2xl bg-white/40 dark:bg-black/10 backdrop-blur-md">
      <ChatLayout className="h-full border-none bg-transparent">
        {/* Left Sidebar: Conversation List */}
        <ChatSidebar 
          conversations={conversations}
          activeId={selectedContactId}
          onSelect={handleSelectContact}
          className="w-80 border-r border-gray-200 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-md"
        >
          <div className="p-6 border-b border-gray-200 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <Heading as="h3" className="text-xl font-bold bg-gradient-to-r from-gray-950 to-gray-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">Messages</Heading>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 dark:bg-white/[0.03] border border-gray-200/50 dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/50 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isConversationsLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div 
                    key={`sidebar-skeleton-${idx}`}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-transparent animate-pulse"
                  >
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-white/[0.04] shrink-0" />
                    <div className="flex-1 space-y-2.5 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-28 bg-gray-200 dark:bg-white/[0.04] rounded" />
                        <div className="h-3 w-8 bg-gray-200 dark:bg-white/[0.04] rounded" />
                      </div>
                      <div className="h-3.5 w-40 bg-gray-200 dark:bg-white/[0.04] rounded" />
                    </div>
                  </div>
                ))
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">Nenhuma conversa encontrada</div>
              ) : (
                filteredContacts.map((contact) => (
                  <div 
                    key={contact.id}
                    onClick={() => handleSelectContact(contact.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverContactId(contact.id);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverContactId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverContactId(null);
                      handleSelectContact(contact.id);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        setInputFiles(Array.from(e.dataTransfer.files));
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 relative group border",
                      selectedContactId === contact.id 
                        ? "bg-cyan-500/10 border-cyan-500/20 shadow-lg shadow-cyan-500/5" 
                        : dragOverContactId === contact.id
                          ? "bg-cyan-500/20 border-cyan-500/50 scale-[1.02] shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse"
                          : "hover:bg-gray-50/80 dark:hover:bg-white/[0.02] border-transparent"
                    )}
                  >
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden flex items-center justify-center font-bold text-gray-700 dark:text-gray-200">
                        {contact.avatar ? <img src={contact.avatar} alt={contact.name} className="h-full w-full object-cover" /> : contact.name[0]}
                      </div>
                      <div className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-black",
                        contact.status === 'online' ? "bg-emerald-500" : contact.status === 'busy' ? "bg-rose-500" : "bg-gray-400"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Text className="font-bold truncate text-gray-900 dark:text-white">{contact.name}</Text>
                        <Text className="text-[10px] text-gray-400">
                          {contact.time instanceof Date ? contact.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : contact.time}
                        </Text>
                      </div>
                      <Text className="text-xs text-gray-500 dark:text-white/40 truncate">
                        {typingContactId === contact.id ? (
                          <span className="text-cyan-500 font-medium animate-pulse">typing...</span>
                        ) : (
                          contact.lastMessage
                        )}
                      </Text>
                    </div>
                    {contact.unread > 0 && selectedContactId !== contact.id && (
                      <div className="h-5 w-5 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-cyan-500/20">
                        {contact.unread}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </ChatSidebar>

        {/* Center: Active Chat */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex-1 flex flex-col bg-white/40 dark:bg-black/10 backdrop-blur-sm relative"
        >
          {/* Custom File Drag Overlay Banner */}
          {dragActive && (
            <div className="absolute inset-0 z-50 bg-cyan-500/10 dark:bg-cyan-500/5 backdrop-blur-sm border-2 border-dashed border-cyan-500/50 m-4 rounded-3xl flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
              <div className="h-16 w-16 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                <Paperclip className="h-8 w-8 animate-bounce" />
              </div>
              <Heading as="h4" className="text-lg font-bold text-cyan-600 dark:text-cyan-400">Arraste para enviar arquivos</Heading>
              <Text className="text-xs text-gray-500 dark:text-white/40">Solte para colocar os arquivos diretamente na fila de envio</Text>
            </div>
          )}

          <ChatHeader 
            user={selectedUser}
            onInfo={() => setShowProfile(!showProfile)}
            className="h-20 px-8 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-md"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-cyan-500/15 overflow-hidden">
                    {selectedContact?.avatar ? <img src={selectedContact?.avatar} alt={selectedContact?.name} className="h-full w-full object-cover" /> : selectedContact?.name[0]}
                  </div>
                  <div className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-black",
                    selectedContact?.status === 'online' ? "bg-emerald-500" : selectedContact?.status === 'busy' ? "bg-rose-500" : "bg-gray-400"
                  )} />
                </div>
                <div>
                  <Heading as="h4" className="text-sm font-bold text-gray-950 dark:text-white">{selectedContact?.name}</Heading>
                  <Text className="text-xs text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active now
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300">
                  <Video className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowProfile(!showProfile)}
                  className={cn(
                    "h-10 w-10 p-0 rounded-xl transition-all text-gray-600 dark:text-gray-300",
                    showProfile ? "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/15" : "hover:bg-gray-100 dark:hover:bg-white/5"
                  )}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </ChatHeader>

          <div className="flex-1 overflow-hidden relative">
            {isMessagesLoading ? (
              <div className="px-8 py-6 h-full overflow-y-auto space-y-6 animate-in fade-in duration-300">
                {/* Left Bubble (Received) */}
                <div className="flex items-start gap-3 max-w-[70%]">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/[0.04] animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-12 w-48 bg-gray-200 dark:bg-white/[0.04] rounded-2xl rounded-tl-none animate-pulse" />
                    <div className="h-3 w-16 bg-gray-100 dark:bg-white/[0.02] rounded animate-pulse" />
                  </div>
                </div>

                {/* Right Bubble (Sent) */}
                <div className="flex items-start gap-3 max-w-[70%] ml-auto justify-end">
                  <div className="space-y-2 flex-1 flex flex-col items-end">
                    <div className="h-16 w-64 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-2xl rounded-tr-none animate-pulse" />
                    <div className="h-3 w-12 bg-gray-100 dark:bg-white/[0.02] rounded animate-pulse" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 animate-pulse shrink-0" />
                </div>

                {/* Left Bubble (Received) */}
                <div className="flex items-start gap-3 max-w-[70%]">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/[0.04] animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-20 w-80 bg-gray-200 dark:bg-white/[0.04] rounded-2xl rounded-tl-none animate-pulse" />
                    <div className="h-3 w-20 bg-gray-100 dark:bg-white/[0.02] rounded animate-pulse" />
                  </div>
                </div>

                {/* Right Bubble (Sent) */}
                <div className="flex items-start gap-3 max-w-[70%] ml-auto justify-end">
                  <div className="space-y-2 flex-1 flex flex-col items-end">
                    <div className="h-10 w-40 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-2xl rounded-tr-none animate-pulse" />
                    <div className="h-3 w-12 bg-gray-100 dark:bg-white/[0.02] rounded animate-pulse" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 animate-pulse shrink-0" />
                </div>
              </div>
            ) : (
              <MessageList 
                messages={currentMessages}
                currentUserId="me"
                onReact={(msg, emoji) => handleReact(msg, emoji)}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPin={handlePin}
                onFileClick={handleFileClick}
                hasAi={true}
                className="px-8 py-6 h-full overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-black/10 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/20 dark:hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent"
              />
            )}
          </div>

          {/* Interactive Banners: Edit banner & Slash commands popover */}
          {editMessage && (
            <div className="px-8 py-2.5 bg-cyan-500/10 border-l-4 border-cyan-500 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Editing Message</p>
                <p className="text-xs text-gray-600 dark:text-white/60 truncate">{editMessage.content}</p>
              </div>
              <button 
                onClick={() => {
                  setEditMessage(null);
                  setInputValue("");
                }}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 dark:text-white/40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Custom Slash Commands Palette Popover */}
          {showSlashMenu && (
            <div className="absolute bottom-24 left-8 z-30 w-80 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-2 animate-in slide-in-from-bottom-4 duration-200">
              <div className="px-3 py-1.5 border-b border-gray-100 dark:border-neutral-800 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Slash Commands</span>
                <Sparkles className="h-3 w-3 text-cyan-500" />
              </div>
              {[
                { cmd: '/shrug', desc: 'Append shrug face ¯\\_(ツ)_/¯', icon: '🤷' },
                { cmd: '/ai', desc: 'Generate an instant smart AI reply', icon: '✨' },
                { cmd: '/gif', desc: 'Insert a cool animated compilation GIF', icon: '🎬' },
                { cmd: '/clear', desc: 'Clear conversation history', icon: '🗑️' }
              ].map((item) => (
                <button
                  key={item.cmd}
                  onClick={() => handleSelectSlashCommand(item.cmd)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-xl transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="font-semibold">{item.cmd}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{item.desc}</span>
                </button>
              ))}
            </div>
          )}

          <div className="p-6 border-t border-gray-200 dark:border-white/5 bg-white/40 dark:bg-black/20">
            <ChatInput 
              value={inputValue}
              onChange={handleInputChange}
              onSend={handleSend}
              files={inputFiles}
              onFilesChange={setInputFiles}
              isRecording={isRecording}
              onMic={() => setIsRecording(true)}
              onVoiceEnd={handleVoiceSend}
              replyingTo={replyToMessage || undefined}
              onCancelReply={() => {
                setReplyToMessage(null);
                setIsRecording(false);
              }}
              placeholder="Digite sua mensagem rica aqui..."
              className="bg-gray-100 dark:bg-white/5 border-none rounded-3xl px-4 py-3 focus-within:ring-2 focus-within:ring-cyan-500/30 transition-all shadow-lg shadow-black/[0.02]"
            />
          </div>
        </div>

        {/* Right Sidebar: Contact Profile */}
        {showProfile && (
          <div className="w-80 border-l border-gray-200 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-md flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-blue-600 p-1 mb-4 shadow-xl shadow-cyan-500/10">
                    <div className="h-full w-full rounded-[1.8rem] bg-white dark:bg-black overflow-hidden flex items-center justify-center font-bold text-2xl text-gray-800 dark:text-white">
                      {selectedContact?.avatar ? 
                        <img src={selectedContact?.avatar} className="h-full w-full object-cover" /> : 
                        selectedContact?.name[0]
                      }
                    </div>
                  </div>
                  <Heading as="h3" className="text-xl font-bold text-gray-950 dark:text-white">{selectedContact?.name}</Heading>
                  <Text className="text-sm text-gray-500 dark:text-white/30 mt-1">Product Designer at Acme Inc.</Text>
                  <div className="flex gap-2 mt-6">
                    <Button size="sm" className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 shadow-lg shadow-cyan-600/10 transition-all">Message</Button>
                    <Button size="sm" variant="outline" className="rounded-xl border-gray-200 dark:border-white/10 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Profile</Button>
                  </div>
                </div>

                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-100">
                  <Stack gap={4}>
                    <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Contact Info</Text>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200/50 dark:border-white/5">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <Text className="text-sm text-gray-700 dark:text-gray-300">sarah.w@acme.com</Text>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200/50 dark:border-white/5">
                          <Globe className="h-4 w-4 text-gray-400" />
                        </div>
                        <Text className="text-sm text-gray-700 dark:text-gray-300">www.acme.com</Text>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200/50 dark:border-white/5">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <Text className="text-sm text-gray-700 dark:text-gray-300">Joined Oct 2024</Text>
                      </div>
                    </div>
                  </Stack>

                  <Stack gap={4}>
                    <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Tags</Text>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="neutral" className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">Enterprise</Badge>
                      <Badge variant="neutral" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Priority</Badge>
                      <Badge variant="neutral" className="bg-gray-100 dark:bg-white/5 border border-transparent text-gray-600 dark:text-gray-300">Design</Badge>
                    </div>
                  </Stack>

                  <Stack gap={4}>
                    <div className="flex items-center justify-between">
                      <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Shared Files</Text>
                      <Button variant="ghost" size="sm" className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 p-0 h-auto">View All</Button>
                    </div>
                    <div className="space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all cursor-pointer">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text className="text-xs font-bold truncate text-gray-950 dark:text-white">Project_Brief_v2.pdf</Text>
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

      <UnifiedPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={previewFile}
      />
    </div>
  );
}
