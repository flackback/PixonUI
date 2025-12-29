import React, { useEffect, useState } from 'react';
import { 
  ChatLayout, 
  ChatSidebar, 
  MessageList, 
  ChatHeader, 
  ChatInput,
  ChatProfile,
  useConversations, 
  useMessages, 
  useActiveChat, 
  chatStore
} from '../../../ui/src';
import type { Message, Conversation } from '../../../ui/src/components/chat/types';

// Simulation constants
const CONVERSATION_COUNT = 1000;

export function ChatMegaDemo() {
  const conversations = useConversations();
  const activeChat = useActiveChat();
  const messages = useMessages(activeChat?.id || null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | undefined>();

  // Initialize store with massive data
  useEffect(() => {
    const mockConversations: Conversation[] = Array.from({ length: CONVERSATION_COUNT }).map((_, i) => ({
      id: `chat-${i}`,
      user: {
        id: `user-${i}`,
        name: `Contact ${i}`,
        avatar: `https://i.pravatar.cc/150?u=${i}`,
        status: i % 5 === 0 ? 'online' : 'offline',
      },
      unreadCount: i % 10 === 0 ? Math.floor(Math.random() * 10) : 0,
      lastMessage: {
        id: `msg-last-${i}`,
        content: `Last message in conversation ${i}`,
        senderId: `user-${i}`,
        timestamp: new Date(Date.now() - i * 60000),
        status: 'read',
      },
    }));

    chatStore.setConversations(mockConversations);

    // Pre-load some messages for the first few chats
    mockConversations.slice(0, 5).forEach(conv => {
      const mockMessages: Message[] = [
        {
          id: `msg-${conv.id}-interactive`,
          content: "Check out our new features!",
          senderId: conv.user!.id,
          timestamp: new Date(Date.now() - 100000),
          type: 'interactive',
          interactive: {
            type: 'button',
            header: { type: 'text', text: 'Welcome!' },
            body: 'Choose an option below to get started.',
            footer: 'Powered by PixonUI',
            buttons: [
              { id: 'btn1', text: 'View Catalog', type: 'reply' },
              { id: 'btn2', text: 'Visit Website', type: 'url', payload: 'https://pixonui.com' },
              { id: 'btn3', text: 'Call Support', type: 'call', payload: '+123456789' }
            ]
          },
          remoteJid: conv.id
        },
        {
          id: `msg-${conv.id}-carousel`,
          content: "Our latest products",
          senderId: conv.user!.id,
          timestamp: new Date(Date.now() - 50000),
          type: 'interactive',
          interactive: {
            type: 'carousel',
            cards: [
              {
                header: { type: 'image', attachment: { id: '1', type: 'image', url: 'https://picsum.photos/400/300?random=1' } },
                body: 'Premium Wireless Headphones with noise cancellation.',
                footer: '$299.00',
                buttons: [{ id: 'buy1', text: 'Buy Now', type: 'reply' }]
              },
              {
                header: { type: 'image', attachment: { id: '2', type: 'image', url: 'https://picsum.photos/400/300?random=2' } },
                body: 'Smart Watch Series 5 with health tracking.',
                footer: '$399.00',
                buttons: [{ id: 'buy2', text: 'Buy Now', type: 'reply' }]
              },
              {
                header: { type: 'image', attachment: { id: '3', type: 'image', url: 'https://picsum.photos/400/300?random=3' } },
                body: 'Ultra Slim Laptop for professionals.',
                footer: '$1299.00',
                buttons: [{ id: 'buy3', text: 'Buy Now', type: 'reply' }]
              }
            ]
          },
          remoteJid: conv.id
        },
        ...Array.from({ length: 20 }).map((_, j) => ({
          id: `msg-${conv.id}-${j}`,
          content: `Message ${j} in ${conv.user?.name}. This is a high-performance virtualized list test.`,
          senderId: j % 2 === 0 ? 'me' : conv.user!.id,
          timestamp: new Date(Date.now() - (50 - j) * 10000),
          status: 'read' as const,
          type: 'text' as const,
          reactions: j === 5 ? { '❤️': ['user-1', 'me'], '🔥': ['user-2'] } : undefined,
          remoteJid: conv.id
        }))
      ];
      chatStore.setMessages(conv.id, mockMessages);
    });
  }, []);

  const handleLoadMore = () => {
    if (!activeChat || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Simulate network delay
    setTimeout(() => {
      const currentMessages = chatStore.getState().messages.get(activeChat.id) || [];
      const firstMsgTimestamp = currentMessages[0]?.timestamp.getTime() || Date.now();
      
      const olderMessages: Message[] = Array.from({ length: 20 }).map((_, i) => ({
        id: `msg-old-${activeChat.id}-${Date.now()}-${i}`,
        content: `Older message ${i} loaded from history.`,
        senderId: i % 2 === 0 ? 'me' : activeChat.user!.id,
        timestamp: new Date(firstMsgTimestamp - (20 - i) * 10000),
        status: 'read',
        remoteJid: activeChat.id
      }));
      
      chatStore.setMessages(activeChat.id, [...olderMessages, ...currentMessages]);
      setIsLoadingMore(false);
    }, 1000);
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomChatId = `chat-${Math.floor(Math.random() * 10)}`;
      const newMessage: Message = {
        id: `msg-new-${Date.now()}`,
        content: "New incoming message! 🚀",
        senderId: `user-${randomChatId.split('-')[1]}`,
        timestamp: new Date(),
        status: 'delivered',
        remoteJid: randomChatId
      };
      chatStore.addMessage(randomChatId, newMessage);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (content: string) => {
    if (!activeChat) return;
    const newMessage: Message = {
      id: `msg-sent-${Date.now()}`,
      content,
      senderId: 'me',
      timestamp: new Date(),
      status: 'sending',
      replyTo: replyingTo,
      replyToId: replyingTo?.id,
      remoteJid: activeChat.id
    };
    chatStore.addMessage(activeChat.id, newMessage);
    setReplyingTo(undefined);

    // Simulate server response
    setTimeout(() => {
      chatStore.updateMessageStatus(activeChat.id, newMessage.id, 'sent');
    }, 1000);
  };

  return (
    <div className="h-[800px] w-full max-w-6xl mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 backdrop-blur-xl flex">
      <ChatLayout>
        <ChatSidebar 
          conversations={conversations}
          activeId={activeChat?.id}
          onSelect={(id) => chatStore.setActiveChat(id)}
        />
        
        <div className="flex-1 flex flex-col min-w-0 bg-white/5">
          {activeChat ? (
            <>
              <ChatHeader 
                user={activeChat.user}
                group={activeChat.group}
                onInfoClick={() => setIsProfileOpen(true)}
              />
              <MessageList 
                messages={messages}
                currentUserId="me"
                onLoadMore={handleLoadMore}
                hasMore={true}
                isLoadingMore={isLoadingMore}
                onReply={(msg) => setReplyingTo(msg)}
                onReact={(msg, emoji) => chatStore.addReaction(activeChat.id, msg.id, emoji, 'me')}
                onDelete={(msg) => chatStore.deleteMessage(activeChat.id, msg.id)}
              />
              <ChatInput 
                onSend={handleSendMessage}
                users={conversations.map(c => c.user!).filter(Boolean)}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(undefined)}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <div className="text-center">
                <h3 className="text-xl font-medium mb-2">Select a chat to start</h3>
                <p className="text-sm">Optimized for 10,000+ messages and 1,000+ contacts</p>
              </div>
            </div>
          )}
        </div>

        {isProfileOpen && activeChat && (
          <ChatProfile 
            user={activeChat.user}
            group={activeChat.group}
            onClose={() => setIsProfileOpen(false)}
          />
        )}
      </ChatLayout>
    </div>
  );
}
