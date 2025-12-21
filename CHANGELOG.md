# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-12-21

### Added
- **Chat Mega Expansion**:
  - `useChatMessages`: Advanced state management for chat history, reactions, and status.
  - `useVoiceRecorder`: Native `MediaRecorder` wrapper for audio capture.
  - `useReadReceipts`: Visibility-based message tracking using `IntersectionObserver`.
  - `useTypingIndicator`: Real-time typing state management.
  - `useChatSearch`: High-performance local message search.
  - `AudioPlayer`: Specialized component for voice messages with waveforms.
  - `EmojiPicker`: Lightweight, custom emoji selection.
  - `VoiceRecorder`: UI component for audio recording with duration tracking.
  - `MessageSearch`: Integrated search interface for chat history.
  - `MentionList`: User tagging system for chat inputs.
  - `ReplyPreview`: Contextual UI for message replies.
  - `ChatBanner`: Informational banners for chat headers.
  - `DateSeparator`: Automatic message grouping by date.
  - `OnlineIndicator`: Real-time user status visualization.
  - `ReadReceipt`: Visual indicators for sent/delivered/read states.
  - `SystemMessage`: Specialized rendering for non-user events.
  - `LinkPreview`: Automatic URL detection and previewing.
  - `GroupHeader`: Support for group chat metadata and member lists.
- **New Demo**: `ChatMegaDemo` showcasing the full messaging ecosystem.

### Changed
- Upgraded `ChatLayout`, `ChatSidebar`, `ChatHeader`, and `ChatInput` to support rich media, groups, and advanced interactions.
- Refactored `MessageList` and `MessageBubble` for better performance and extensibility.
- Centralized all hooks in `packages/ui/src/hooks/index.ts` for easier consumption.

### Fixed
- Resolved TypeScript prop collisions in `MessageList`, `MentionList`, `EmojiPicker`, and `MessageSearch`.
- Fixed syntax errors in `ChatInput` and `ChatSidebar` caused by duplicate code blocks.
- Corrected `MessageBubble` rendering logic for complex attachment types.

## [0.2.0] - 2025-12-21

## [0.1.0] - 2025-12-20

### Added
- Initial release of PixonUI.
- Core components: Button, Card, Input, Modal, Tabs, Dropdown, etc.
- AI-specific components: AIPromptInput, AIResponse.
- Data display components: Kanban, Charts (Area, Bar, Line, Radar), Table, Tree.
- Primitives: Surface, Badge, Divider, Kbd.
- Hooks: useToast, useInView, useFloating, useForm.
- Theme support with dark mode and glassmorphism.
- Comprehensive test suite with Vitest.
- WAI-ARIA accessibility support for interactive components.

### Changed
- Standardized design system with `rounded-2xl` and glassmorphism.
- Refactored Kanban component for better modularity.
- Improved Chart components with TypeScript generics.
- Moved `lucide-react` to peerDependencies.

### Fixed
- TypeScript arithmetic errors in RadarChart.
- Accessibility roles in Combobox and Kanban.
- Type safety in Slot utility.
