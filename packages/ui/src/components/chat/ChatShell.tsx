import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { useChatController, type UseChatControllerOptions } from '../../hooks/useChatController';
import { useChatNotifications, type ChatNotificationEvent } from '../../hooks/useChatNotifications';
import { ChatLayout } from './ChatLayout';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatProfile } from './ChatProfile';
import type { Conversation, GroupInfo, Message, User } from './types';

export type ChatShellPreset = 'support' | 'whatsapp' | 'ai' | 'compact';

export interface ChatShellFeatures {
  search?: boolean;
  profile?: boolean;
  voice?: boolean;
  attachments?: boolean;
  reactions?: boolean;
  virtualized?: boolean;
  notifications?: boolean;
}

export interface ChatShellSlots {
  Layout?: React.ComponentType<any>;
  Sidebar?: React.ComponentType<any>;
  Header?: React.ComponentType<any>;
  MessageList?: React.ComponentType<any>;
  Composer?: React.ComponentType<any>;
  Profile?: React.ComponentType<any>;
  EmptyState?: React.ComponentType<{ activeConversation?: Conversation }>;
  ErrorState?: React.ComponentType<{ error: Error; retry?: () => void }>;
}

export interface ChatShellProps extends Omit<UseChatControllerOptions, 'initialMessages'> {
  conversations?: Conversation[];
  activeConversation?: Conversation;
  activeUser?: User;
  group?: GroupInfo;
  initialMessages?: Message[];
  preset?: ChatShellPreset;
  features?: ChatShellFeatures;
  slots?: ChatShellSlots;
  users?: User[];
  className?: string;
  onSelectConversation?: (id: string) => void;
  onNotify?: (event: ChatNotificationEvent) => void;
}

const defaultFeatures: Required<ChatShellFeatures> = {
  search: true,
  profile: true,
  voice: true,
  attachments: true,
  reactions: true,
  virtualized: true,
  notifications: false,
};

function DefaultErrorState({ error, retry }: { error: Error; retry?: () => void }) {
  return (
    <div className="mx-4 mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-200">
      <div className="font-semibold">Não foi possível sincronizar o chat.</div>
      <div className="mt-1 opacity-80">{error.message}</div>
      {retry && (
        <button className="mt-2 text-xs font-semibold underline" onClick={retry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

function DefaultEmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-zinc-500 dark:text-white/45">
      Selecione uma conversa ou envie a primeira mensagem.
    </div>
  );
}

export const ChatShell = React.memo(function ChatShell({
  chatId,
  currentUserId,
  adapter,
  initialMessages,
  pageSize,
  autoLoad,
  conversations = [],
  activeConversation,
  activeUser,
  group,
  preset = 'support',
  features,
  slots,
  users = [],
  className,
  onSelectConversation,
  onNotify,
}: ChatShellProps) {
  const mergedFeatures = useMemo(
    () => ({ ...defaultFeatures, ...features }),
    [features]
  );

  const [showProfile, setShowProfile] = useState(false);
  const chat = useChatController({
    chatId,
    currentUserId,
    adapter,
    initialMessages,
    pageSize,
    autoLoad,
  });
  const notifications = useChatNotifications({
    currentUserId,
    enabled: mergedFeatures.notifications,
    onNotify,
  });
  const { notifyError, notifyMessage } = notifications;
  const notifiedMessageIds = useRef(new Set<string>());

  const selectedConversation = activeConversation ?? conversations.find((conversation) => conversation.id === chatId);
  const headerUser = activeUser ?? selectedConversation?.user;
  const headerGroup = group ?? selectedConversation?.group;

  useEffect(() => {
    if (!mergedFeatures.notifications) return;
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (!lastMessage || notifiedMessageIds.current.has(lastMessage.id)) return;
    notifiedMessageIds.current.add(lastMessage.id);
    notifyMessage(lastMessage);
  }, [chat.messages, mergedFeatures.notifications, notifyMessage]);

  useEffect(() => {
    if (chat.error) notifyError(chat.error);
  }, [chat.error, notifyError]);

  const LayoutSlot = slots?.Layout ?? ChatLayout;
  const SidebarSlot = slots?.Sidebar ?? ChatSidebar;
  const HeaderSlot = slots?.Header ?? ChatHeader;
  const MessageListSlot = slots?.MessageList ?? MessageList;
  const ComposerSlot = slots?.Composer ?? ChatInput;
  const ProfileSlot = slots?.Profile ?? ChatProfile;
  const EmptyStateSlot = slots?.EmptyState ?? DefaultEmptyState;
  const ErrorStateSlot = slots?.ErrorState ?? DefaultErrorState;

  return (
    <LayoutSlot
      className={cn(
        'h-[720px]',
        preset === 'compact' && 'text-sm',
        preset === 'whatsapp' && 'rounded-none border-0',
        className
      )}
    >
      {conversations.length > 0 && (
        <SidebarSlot
          conversations={conversations}
          activeId={chatId ?? undefined}
          onSelect={onSelectConversation}
          virtualized={mergedFeatures.virtualized}
          onSearch={mergedFeatures.search ? undefined : undefined}
          className="hidden md:flex"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col bg-white/50 dark:bg-black/20">
        <HeaderSlot
          user={headerUser}
          group={headerGroup}
          onInfo={mergedFeatures.profile ? () => setShowProfile((value) => !value) : undefined}
          onSearch={mergedFeatures.search ? undefined : undefined}
        />

        {chat.error && (
          <ErrorStateSlot error={chat.error} retry={chat.loadInitialMessages} />
        )}

        {chat.messages.length === 0 && !chat.isLoadingInitial ? (
          <EmptyStateSlot activeConversation={selectedConversation} />
        ) : (
          <MessageListSlot
            messages={chat.messages}
            currentUserId={currentUserId}
            virtualized={mergedFeatures.virtualized}
            isLoading={chat.isLoadingInitial}
            hasMore={chat.hasMore}
            isLoadingMore={chat.isLoadingOlder}
            onLoadMore={chat.loadOlderMessages}
            onReact={mergedFeatures.reactions ? (message: Message, emoji: string) => chat.reactToMessage(message.id, emoji) : undefined}
            onDelete={(message: Message) => chat.deleteMessage(message.id)}
          />
        )}

        <ComposerSlot
          onSend={(content: string) => void chat.sendMessage(content)}
          users={users}
          disabled={chat.isSending}
          onAttach={mergedFeatures.attachments ? undefined : undefined}
          onVoiceEnd={mergedFeatures.voice ? undefined : undefined}
        />
      </div>

      {mergedFeatures.profile && showProfile && (
        <ProfileSlot
          user={headerUser}
          group={headerGroup}
          onClose={() => setShowProfile(false)}
          className="hidden lg:flex"
        />
      )}
    </LayoutSlot>
  );
});
