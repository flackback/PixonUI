export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: UserStatus;
  lastSeen?: Date;
  bio?: string;
  phone?: string;
}

export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name?: string;
  size?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  status?: MessageStatus;
  type?: MessageType;
  attachments?: ChatAttachment[];
  replyToId?: string;
  reactions?: Record<string, string[]>;
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage?: Message;
  unreadCount?: number;
  isTyping?: boolean;
}
