export type UserStatus = 'online' | 'offline' | 'away' | 'busy';
export type PresenceStatus = 'unavailable' | 'available' | 'composing' | 'recording' | 'paused';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: UserStatus;
  presence?: PresenceStatus;
  lastSeen?: Date;
  bio?: string;
  phone?: string;
  isOnline?: boolean;
  verified?: boolean;
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
  | 'sticker'
  | 'template'
  | 'interactive'
  | 'reaction'
  | 'revoked';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'played';

export interface ChatAttachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video' | 'sticker';
  url: string;
  name?: string;
  size?: string;
  duration?: number;
  thumbnail?: string;
  mimetype?: string;
  caption?: string;
  blurhash?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

export interface InteractiveButton {
  id: string;
  text: string;
  type: 'reply' | 'url' | 'call';
  payload?: string;
  params?: any;
}

export interface InteractiveListSection {
  title?: string;
  rows: {
    id: string;
    title: string;
    description?: string;
  }[];
}

export interface InteractiveCard {
  header?: {
    type: 'image' | 'video';
    attachment: ChatAttachment;
  };
  body: string;
  footer?: string;
  buttons?: InteractiveButton[];
  nativeFlow?: {
    buttons: {
      name: string;
      buttonParamsJson: string;
    }[];
  };
}

export interface InteractiveContent {
  type: 'button' | 'list' | 'carousel';
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    text?: string;
    attachment?: ChatAttachment;
  };
  body: string;
  footer?: string;
  buttons?: InteractiveButton[];
  sections?: InteractiveListSection[];
  cards?: InteractiveCard[];
  nativeFlow?: {
    buttons: {
      name: string;
      buttonParamsJson: string;
    }[];
  };
}

export interface Message {
  id: string;
  remoteJid: string;
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
    name?: string;
  };
  contact?: {
    name: string;
    phone: string;
    avatar?: string;
    vcard?: string;
  };
  poll?: {
    question: string;
    options: PollOption[];
    multipleChoice?: boolean;
    expiresAt?: Date;
  };
  interactive?: InteractiveContent;
  ephemeralExpiration?: number;
  isEdited?: boolean;
  isPinned?: boolean;
  isForwarded?: boolean;
  forwardingScore?: number;
  broadcast?: boolean;
  starred?: boolean;
}

export interface Conversation {
  id: string;
  user?: User;
  group?: GroupInfo;
  lastMessage?: Message;
  unreadCount: number;
  isTyping?: boolean;
  presence?: Record<string, PresenceStatus>;
  isMuted?: boolean;
  muteExpiration?: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isReadOnly?: boolean;
  ephemeralExpiration?: number;
  labels?: string[];
  wallpaper?: string;
}

export interface GroupInfo {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  members: GroupMember[];
  admins: string[];
  createdBy: string;
  createdAt: Date;
  inviteCode?: string;
  restrict?: boolean;
  announce?: boolean;
}

export interface GroupMember extends User {
  role: 'admin' | 'member' | 'superadmin';
}

export interface ChatLabel {
  id: string;
  name: string;
  color: string;
  count?: number;
}
