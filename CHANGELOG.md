# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-12-21

### Added
- **Mega Expansion of Hooks**:
  - `useChat`: Full chat state management with message history and typing indicators.
  - `useKanban`: Normalized state management for Kanban boards.
  - `useVirtualList`: High-performance windowing for large datasets.
  - `useInfiniteScroll`: Intersection Observer-based infinite loading.
  - `useHistory`: Generic Undo/Redo state management.
  - `useSearch`: Client-side fuzzy search with multi-key support.
  - `useLocalStorage`: Type-safe persistent state with cross-tab sync.
  - `useSessionStorage`: Type-safe persistent state for session.
  - `useKeyboardShortcuts`: Declarative hotkey management.
  - `useClipboard`: Copy-to-clipboard utility.
  - `useDebounce` & `useThrottle`: Performance optimization hooks.
  - `usePrevious`, `useToggle`, `useLifecycle`: Utility hooks.
  - `useAsync` & `useFetch`: Asynchronous operation management.
  - `useFlip`: FLIP technique for smooth layout transitions.
  - `useViewTransition`: Native Browser View Transitions API wrapper.
  - `useDrag`: Gesture-based dragging with touch support.
  - `useTextScramble`: Hacker-style text animation.
  - `useStagger`: Animation orchestration utility.
  - `useScrollTransform`, `useScrollVelocity`, `useScrollDirection`, `useScrollLock`: Advanced scroll-linked animation hooks.
- **New Components**:
  - `PasswordInput`: Input with visibility toggle.
  - `ConfirmDialog`: Specialized modal for confirmations.
  - `TagInput`: Multi-tag management input.
  - `ColorPicker`: Styled color selection.
  - `SkipToContent`: Accessibility helper for keyboard users.
- **Utility Functions**:
  - `formatDate`, `formatNumber`, `formatCurrency`: Locale-aware formatters.
  - `truncate`, `slugify`: String manipulation helpers.
- New `HooksDemo` in preview application.

### Changed
- Optimized all scroll hooks with `requestAnimationFrame` for 120fps performance.
- Renamed internal Kanban types to `KanbanBoardTask` and `KanbanBoardColumn` to avoid export collisions.
- Updated `ChatDemo` to use the new `useChat` hook.

### Fixed
- TypeScript error in `useInfiniteScroll` where `target` was possibly undefined.
- TypeScript error in `useHistory` where `previous` state could be undefined.
- Duplicate export error in `index.ts` for Kanban types.

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
