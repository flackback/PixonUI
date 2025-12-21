import React, { useState } from 'react';
import { 
  ChatLayout, 
  ChatSidebar, 
  ChatHeader, 
  ChatInput, 
  MessageList,
  ChatBanner,
  TypingIndicator,
  useChatMessages,
  useTypingIndicator,
  useVoiceRecorder,
  useReadReceipts,
  useChatSearch,
  cn
} from '@pixonui/react';
import type { Message, User, GroupInfo } from '@pixonui/react';

const MOCK_USERS: User[] = [
  { id: '1', name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?u=1', status: 'online' },
  { id: '2', name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=2', status: 'offline' },
  { id: '3', name: 'Jordan Smith', avatar: 'https://i.pravatar.cc/150?u=3', status: 'online' },
];

const MOCK_GROUP: GroupInfo = {
  id: 'g1',
  name: 'Design System Team',
  avatar: 'https://i.pravatar.cc/150?u=group',
  members: MOCK_USERS,
  description: 'Discussion about PixonUI components and design tokens.',
  admins: ['1'],
  createdBy: '1',
  createdAt: new Date()
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Hey team! How is the new chat module coming along?',
    senderId: '2',
    timestamp: new Date(Date.now() - 3600000),
    status: 'read',
    type: 'text'
  },
  {
    id: '2',
    content: 'It is looking great! Just added voice messages and polls.',
    senderId: '1',
    timestamp: new Date(Date.now() - 1800000),
    status: 'read',
    type: 'text'
  },
  {
    id: '3',
    content: 'Check out this screenshot of the new dark mode.',
    senderId: '3',
    timestamp: new Date(Date.now() - 900000),
    status: 'read',
    type: 'image',
    attachments: [{ id: 'a1', type: 'image', url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&q=80' }]
  },
  {
    id: '4',
    content: 'Check out the documentation at https://pixonui.com for more details!',
    senderId: '1',
    timestamp: new Date(Date.now() - 300000),
    status: 'read',
    type: 'text'
  }
];

export function ChatMegaDemo() {
  const currentUserId = '1';
  const { messages, addMessage, updateMessageStatus, deleteMessage } = useChatMessages(INITIAL_MESSAGES);
  const { isTyping, setTyping } = useTypingIndicator();
  const { isRecording, duration, startRecording, stopRecording } = useVoiceRecorder();
  const { results, query, setQuery } = useChatSearch(messages);
  
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSendMessage = (content: string, type: any = 'text', attachments?: any[]) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      senderId: currentUserId,
      timestamp: new Date(),
      status: 'sent',
      type,
      attachments,
      replyTo: replyTo || undefined
    };
    addMessage(newMessage);
    setReplyTo(null);
    
    // Simulate reply
    setTimeout(() => {
      updateMessageStatus(newMessage.id, 'delivered');
      setTimeout(() => updateMessageStatus(newMessage.id, 'read'), 1000);
    }, 1000);
  };

  return (
    <div className="h-[800px] w-full border border-white/10 rounded-3xl overflow-hidden bg-black flex">
      <ChatLayout>
        <ChatSidebar 
          conversations={[{ id: MOCK_GROUP.id, group: MOCK_GROUP, lastMessage: messages[messages.length - 1] }]}
          activeId={MOCK_GROUP.id}
          className={cn(!isSidebarOpen && "hidden md:flex")}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <ChatHeader 
            user={{ id: 'group', name: MOCK_GROUP.name, avatar: MOCK_GROUP.avatar, status: 'online' }}
            onBack={() => setIsSidebarOpen(true)}
          />
          
          <div className="flex-1 flex flex-col min-h-0">
            <MessageList 
              messages={messages}
              currentUserId={currentUserId}
              onReply={setReplyTo}
              onDelete={(msg) => deleteMessage(msg.id)}
              className="flex-1"
            />
            
            {isTyping && (
              <div className="px-6 py-2">
                <TypingIndicator users={['Sarah']} />
              </div>
            )}
            
            <div className="p-4">
              <ChatInput 
                onSend={(content) => handleSendMessage(content)}
                placeholder="Type a message..."
                replyingTo={replyTo || undefined}
                onCancelReply={() => setReplyTo(null)}
                onMic={startRecording}
                isRecording={isRecording}
              />
            </div>
          </div>
        </div>
      </ChatLayout>
    </div>
  );
}
