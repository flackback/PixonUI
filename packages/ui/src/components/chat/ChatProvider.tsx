import React, { createContext, useContext } from 'react';
import { useChatController, type UseChatControllerOptions } from '../../hooks/useChatController';

export type ChatControllerValue = ReturnType<typeof useChatController>;

const ChatContext = createContext<ChatControllerValue | null>(null);

export interface ChatProviderProps extends UseChatControllerOptions {
  children: React.ReactNode;
}

export function ChatProvider({ children, ...options }: ChatProviderProps) {
  const controller = useChatController(options);

  return (
    <ChatContext.Provider value={controller}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChatContext must be used inside ChatProvider.');
  }

  return context;
}
