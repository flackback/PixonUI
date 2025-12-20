# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
