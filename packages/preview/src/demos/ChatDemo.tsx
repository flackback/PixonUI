import React, { useState } from 'react';
import { 
  ChatLayout, 
  ChatSidebar, 
  ChatHeader, 
  MessageList, 
  ChatInput, 
  ChatProfile,
  Conversation,
  Message,
  User
} from '@pixonui/react';

const CURRENT_USER_ID = 'me';

const USERS: Record<string, User> = {
  '1': { id: '1', name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', status: 'online', bio: 'Product Designer at Pixon' },
  '2': { id: '2', name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', status: 'offline', lastSeen: new Date(Date.now() - 1000 * 60 * 30) },
  '3': { id: '3', name: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', status: 'busy' },
};

const INITIAL_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: '1', content: 'Hey! How is the new project going?', senderId: '1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), status: 'read' },
    { id: '2', content: 'It is going great! Just finishing up the chat component.', senderId: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9), status: 'read' },
    { id: '3', content: 'That sounds awesome. Can I see a preview?', senderId: '1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.8), status: 'read' },
    { id: '4', content: 'Sure! I will send you a link shortly.', senderId: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 5), status: 'delivered' },
  ],
  '2': [
    { id: '1', content: 'Did you see the latest design updates?', senderId: '2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'read' },
  ]
};

export function ChatDemo() {
  const [activeId, setActiveId] = useState('1');
  const [showProfile, setShowProfile] = useState(true);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const conversations: Conversation[] = [
    { id: '1', user: USERS['1']!, lastMessage: messages['1']?.[messages['1'].length - 1], unreadCount: 2 },
    { id: '2', user: USERS['2']!, lastMessage: messages['2']?.[messages['2'].length - 1] },
    { id: '3', user: USERS['3']!, lastMessage: { id: '0', content: 'Call me later', senderId: '3', timestamp: new Date() } },
  ];

  const handleSend = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: CURRENT_USER_ID,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMessage]
    }));

    // Simulate reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        content: "That's really cool! I love the glassmorphism effect.",
        senderId: activeId,
        timestamp: new Date(),
        status: 'delivered'
      };
      setMessages(prev => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), reply]
      }));
    }, 2000);
  };

  const handleReply = (message: Message) => {
    // In a real app, this would set a reply state in ChatInput
    console.log('Reply to:', message);
  };

  const handleReact = (message: Message, emoji: string) => {
    setMessages(prev => {
      const chatMessages = prev[activeId] || [];
      const updatedMessages = chatMessages.map(msg => {
        if (msg.id === message.id) {
          const reactions = msg.reactions || {};
          const userIds = reactions[emoji] || [];
          // Toggle reaction for current user
          if (userIds.includes(CURRENT_USER_ID)) {
             const newIds = userIds.filter(id => id !== CURRENT_USER_ID);
             const newReactions = { ...reactions };
             if (newIds.length === 0) {
               delete newReactions[emoji];
             } else {
               newReactions[emoji] = newIds;
             }
             return { ...msg, reactions: newReactions };
          } else {
             return { ...msg, reactions: { ...reactions, [emoji]: [...userIds, CURRENT_USER_ID] } };
          }
        }
        return msg;
      });
      return { ...prev, [activeId]: updatedMessages };
    });
  };

  const handleDelete = (message: Message) => {
    setMessages(prev => ({
      ...prev,
      [activeId]: (prev[activeId] || []).filter(m => m.id !== message.id)
    }));
  };

  const handleAttach = () => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: "",
      senderId: CURRENT_USER_ID,
      timestamp: new Date(),
      status: 'sent',
      type: 'image',
      attachments: [{
        id: Date.now().toString(),
        type: 'image',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
        name: 'design-mockup.jpg'
      }]
    };

    setMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMessage]
    }));
  };

  const activeUser = USERS[activeId] || USERS['1']!;
  const activeMessages = messages[activeId] || [];

  return (
    <ChatLayout className="h-[700px]">
      <ChatSidebar 
        conversations={conversations} 
        activeId={activeId} 
        onSelect={setActiveId}
        className="hidden md:flex"
      />
      
      <div className="flex-1 flex flex-col min-w-0 bg-white/50 dark:bg-black/20">
        <ChatHeader 
          user={activeUser} 
          onInfo={() => setShowProfile(!showProfile)}
        />
        
        <MessageList 
          messages={activeMessages} 
          currentUserId={CURRENT_USER_ID} 
          onReply={handleReply}
          onReact={handleReact}
          onDelete={handleDelete}
        />
        
        <ChatInput 
          onSend={handleSend} 
          onAttach={handleAttach} 
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
  );
}
