# PixonUI Accessibility & Focus Matrix Audit

PixonUI is built from the ground up to achieve 100% compliance with W3C WCAG 2.1/2.2 AA standards and Section 508. This document outlines the tested ARIA structures, visual focus management patterns, and interactive keyboard navigation schemes across our premium components.

> [!IMPORTANT]
> All interactive components preserve natural DOM tab-order and implement programmatic focus traps where required (e.g., Modals, Popovers, and Dialogs) to prevent focus leaks.

---

## 1. General Principles

1. **Logical Focus Order**: Interactive elements follow a top-to-bottom, left-to-right visual order. For Right-to-Left (RTL) mode, focus order automatically adjusts to follow the right-to-left layout direction.
2. **Focus Visibility**: Every focusable element maintains a distinct, high-contrast, double-ring focus indicator (`focus-visible:ring-2 focus-visible:ring-offset-2`) leveraging the active palette theme.
3. **Semantic Markup**: HTML5 landmark and structural elements (`<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`) are strictly used alongside logical heading hierarchies.

---

## 2. Component Focus & ARIA Matrix

### Button & GlowButton
Custom buttons map directly to native `<button>` or incorporate precise structural ARIA fallback hooks.

| Attribute / Action | Target Value | Purpose |
| :--- | :--- | :--- |
| `role` | `"button"` | Declares element as an interactive button |
| `tabindex` | `"0"` | Includes element in document tab sequence |
| `aria-disabled` | `"true" / "false"` | Informs screen readers of disabled state |
| `aria-pressed` | `"true" / "false"` | For toggle buttons, communicates selection state |

**Keyboard Navigation Matrix:**
*   `Tab`: Focuses button.
*   `Space` / `Enter`: Activates the button's click event.

---

### DataTable
The DataTable component manages tab navigation, dynamic column header states, and column sorting announcements.

| Attribute / Action | Target Value | Purpose |
| :--- | :--- | :--- |
| `role` | `"grid"` / `"table"` | Declares table/grid context |
| `aria-readonly` | `"true"` | Denotes data cell non-editable state |
| `aria-sort` | `"ascending"` / `"descending"` | Announces sort state on column headers |
| `aria-colcount` | `"{number}"` | Announces total columns count |
| `aria-rowcount` | `"{number}"` | Announces total rows count |

**Keyboard Navigation Matrix:**
*   `Tab`: Focuses the grid.
*   `ArrowRight` / `ArrowLeft`: Navigates focus horizontally between headers or cells.
*   `ArrowUp` / `ArrowDown`: Navigates focus vertically between rows.
*   `Space` / `Enter` (on header cell): Toggles sorting for the focused column.
*   `Home` / `End`: Jumps to the first/last cell of the current row.

---

### Kanban Board
The Kanban Board coordinates complex drag-and-drop actions, column switching, and keyboard-driven task cards sorting/moving.

| Attribute / Action | Target Value | Purpose |
| :--- | :--- | :--- |
| `role` | `"application"` | Communicates application role for drag and drop |
| `aria-grabbed` | `"true"` / `"false"` | Announces if a card is currently picked up |
| `aria-dropeffect` | `"move"` / `"none"` | Informs drag targets of allowed action types |
| `aria-describedby` | `"{help-id}"` | References helper text describing keyboard move actions |

**Keyboard Navigation Matrix (when Keyboard Navigation Mode is active):**
*   `Tab`: Moves focus through KanbanColumns and TaskCards.
*   `ArrowRight` / `ArrowLeft`: Moves focus between columns.
*   `ArrowUp` / `ArrowDown`: Moves focus vertically between cards within a column.
*   `Space`: Selects/grabs the active card for movement.
*   `ArrowUp` / `ArrowDown` (while grabbed): Moves card position within column list.
*   `ArrowRight` / `ArrowLeft` (while grabbed): Moves card to the adjacent column.
*   `Escape`: Cancels move/drag action and returns card to its original position.

---

### Chat System
The ChatInbox and ChatInput systems manage real-time input fields, typing status indicators, attachment lists, and message bubble navigation.

| Attribute / Action | Target Value | Purpose |
| :--- | :--- | :--- |
| `role` | `"log"` / `"feed"` | Announces new messages automatically as they append |
| `aria-live` | `"polite"` | Screen readers read outgoing and incoming dynamic text |
| `aria-haspopup` | `"true"` | Declares attachment action dropdown attachment |
| `aria-expanded` | `"true"` / `"false"` | Tracks attachment menu visible/collapsed state |

**Keyboard Navigation Matrix:**
*   `Tab`: Cycles focus from active message list to ChatInput textarea, emoji buttons, and attachments dropdown.
*   `Enter` (inside textarea): Sends text message.
*   `Shift + Enter` (inside textarea): Inserts a newline character.
*   `Escape` (inside attachment dropdown): Closes the attachments overlay.
*   `ArrowDown` / `ArrowUp` (with typing suggestions active): Cycles through `@mention` usernames.

---

## 3. Compliance Testing & Verification

Each component has been manually verified using:
1. **Screen Readers**: NVDA (Windows) and VoiceOver (macOS).
2. **Keyboard-Only Traversal**: 100% functionality without cursor pointing.
3. **Color Contrast Audits**: All text matches or exceeds WCAG AA **4.5:1** contrast ratio for normal text, and **3:1** for large text, verified across all 7 premium runtime color palettes.
