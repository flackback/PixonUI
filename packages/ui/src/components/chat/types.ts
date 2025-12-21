export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: UserStatus;
  lastSeen?: Date;
  bio?: string;
  phone?: string;
  isOnline?: boolean;
}

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'file' 
  | 'system' 
  | 'audio' 
  | 'video' 
  | 'location' 
  | 'contact' 
  | 'poll' 
  | 'sticker';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatAttachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  name?: string;
  size?: string;
  duration?: number; // for audio/video
  thumbnail?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user ids
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
  replyTo?: Message;
  reactions?: Record<string, string[]>;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contact?: {
    name: string;
    phone: string;
    avatar?: string;
  };
  poll?: {
    question: string;
    options: PollOption[];
    multipleChoice?: boolean;
    expiresAt?: Date;
  };
  isEdited?: boolean;
  isPinned?: boolean;
}

export interface Conversation {
  id: string;
  user?: User; // For 1-to-1
  group?: GroupInfo; // For groups
  lastMessage?: Message;
  unreadCount?: number;
  isTyping?: boolean;
  typingUsers?: string[]; // user ids
  isMuted?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface GroupInfo {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  members: User[];
  admins: string[]; // user ids
  createdBy: string;
  createdAt: Date;
}
