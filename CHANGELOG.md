# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-12-21

### Added
- **Kanban Mega Expansion**:
  - `KanbanTaskModal`: Comprehensive task editor with subtasks, checklists, activity feed, and attachments.
  - `KanbanHeader`: Advanced board header with view switching, filtering, and member management.
  - `KanbanQuickAdd`: Inline task creation for rapid workflow.
  - `KanbanSwimlane`: Support for horizontal grouping of tasks.
  - `KanbanListView`: Alternative list-based visualization for tasks.
  - `KanbanTimelineView`: Gantt-style timeline for project scheduling.
  - `KanbanTableView`: Structured data view for bulk task management.
  - `KanbanFilterBar`: Advanced filtering system with saved filters and multi-select.
  - `useKanbanFilters`: Hook for complex task filtering and searching.
  - `useKanbanUndo`: History management with Undo/Redo support (Ctrl+Z/Ctrl+Y).
  - `useKanbanKeyboard`: Global keyboard shortcuts for Kanban operations.
  - `useKanbanSync`: Real-time synchronization logic for collaborative boards.
  - `useKanbanHistory`: Detailed activity tracking for tasks and boards.
  - **Support Components**: `SubtaskList`, `Checklist`, `TaskActivity`, `TaskComments`, `TaskAttachments`, `LabelPicker`, `AssigneePicker`, `DueDatePicker`, `TimeTracker`, `ColumnLimit`.

### Changed
- Overhauled `KanbanBoard` and `KanbanColumn` to support WIP limits, swimlanes, and multiple views.
- Enhanced `KanbanCard` with selection states, time tracking indicators, and rich metadata display.
- Expanded `KanbanTask` and `KanbanColumn` types to support professional project management features.

### Fixed
- Improved drag-and-drop performance for large boards.
- Resolved accessibility issues in task interactions.
- Fixed layout shifts when switching between Kanban views.

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
  - `LinkPreview`: Automatic URL detection and previewing in `MessageBubble`.
  - `TypingIndicator`: Standalone component now integrated into `ChatSidebar`.
  - `EmojiPicker`: Enhanced manual implementation with 200+ emojis and categories.
  - `VoiceRecorder`: Full-featured recording UI with waveform animation.
  - `AudioPlayer`: Native-first audio playback with progress tracking.
- **New Hooks**:
  - `useChatMessages`: Advanced state management for chat history.
  - `useTypingIndicator`: Real-time typing state logic.
  - `useVoiceRecorder`: Native `MediaRecorder` wrapper.
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

## [0.5.34] - 2026-01-12

### Added
- Release build and npm publication for `@pixonui/react@0.5.34`.

### Changed
- Improved audio playback: waveform seeking, variable playback speed, and download support in `WaveformAudio`.
- Strict instance isolation: socket events now include `instanceId` and frontend filtering was tightened to avoid cross-instance bleeding.

### Fixed
- Reaction picker now closes after selection and reactions map correctly in message rendering.
- Hidden Gupshup-only session window for Baileys provider to avoid irrelevant UI for web-emulated sessions.

