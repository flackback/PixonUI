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
  useChatSearch
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
  description: 'Discussion about PixonUI components and design tokens.'
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
  const { messages, addMessage, updateMessageStatus, deleteMessage, reactToMessage } = useChatMessages(INITIAL_MESSAGES);
  const { isTyping, setTyping } = useTypingIndicator();
  const { isRecording, duration, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();
  const { results, searchMessages } = useChatSearch(messages);
  
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
      replyTo: replyTo ? { id: replyTo.id, content: replyTo.content, senderName: 'User' } : undefined
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
      <ChatLayout
        sidebar={
          <ChatSidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            groups={[MOCK_GROUP]}
            activeId={MOCK_GROUP.id}
          />
        }
        header={
          <ChatHeader 
            title={MOCK_GROUP.name}
            subtitle={`${MOCK_USERS.length} members • 2 online`}
            avatar={MOCK_GROUP.avatar}
            onBack={() => setIsSidebarOpen(true)}
          />
        }
        footer={
          <div className="p-4">
            <ChatInput 
              onSend={(content) => handleSendMessage(content)}
              onTyping={() => setTyping(true)}
              placeholder="Type a message..."
              replyTo={replyTo || undefined}
              onCancelReply={() => setReplyTo(null)}
              onVoiceStart={startRecording}
              onVoiceStop={(blob) => {
                stopRecording();
                handleSendMessage('Voice message', 'audio', [{ id: 'v1', type: 'audio', url: URL.createObjectURL(blob), duration }]);
              }}
              isRecording={isRecording}
              recordingDuration={duration}
            />
          </div>
        }
      >
        <div className="flex-1 flex flex-col min-h-0">
          <ChatBanner 
            content="This is a preview of the PixonUI Chat Mega Expansion. All features are functional." 
            type="info"
            closable
          />
          <MessageList 
            messages={messages}
            currentUserId={currentUserId}
            onReply={setReplyTo}
            onReact={(msg, emoji) => reactToMessage(msg.id, '1', emoji)}
            onDelete={(msg) => deleteMessage(msg.id)}
            className="flex-1"
          />
          {isTyping && (
            <div className="px-6 py-2">
              <TypingIndicator users={['Sarah']} />
            </div>
          )}
        </div>
      </ChatLayout>
    </div>
  );
}
