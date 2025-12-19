# PixonUI - AI Context & Guidelines

This document provides a comprehensive overview of PixonUI for LLMs. Use this context to generate accurate, high-performance, and idiomatic code using the PixonUI library.

## 1. Core Philosophy: Native-First
PixonUI is built to be lightweight, stable, and performant by leveraging native browser APIs instead of heavy third-party libraries.

- **No Radix/Headless UI**: We build our own logic for accessibility and behavior.
- **Native Overlays**: We use the HTML5 `<dialog>` tag for Modals/Dialogs.
- **Native Validation**: We use the `ValidityState` API for forms.
- **Native Motion**: We use CSS Transitions, WAAPI, and View Transitions API.
- **Performance**: We use `content-visibility: auto` for large data displays like Tables.

## 2. Design System (Tailwind CSS)
- **Theme**: Dark mode by default.
- **Glassmorphism**: Use `bg-white/[0.03]`, `backdrop-blur`, and `border-white/10`.
- **Shapes**: Standard radius is `rounded-2xl`.
- **Animations**: Use `transition-all duration-200` and `animate-in` from `tailwindcss-animate`.

## 3. Key Components & Usage

### Layout
- `Surface`: The base container. `<Surface className="p-6">...</Surface>`
- `Card`: Glassmorphic card. Supports `glow` prop for mouse-follow effect.
- `Kanban`: Board with native DnD. Uses `columns` and `tasks` props.

### Overlays (Native-First)
- `Dialog`: Uses `<dialog>`. Props: `isOpen`, `onClose`.
- `DropdownMenu`: Positioned via `useFloating`.
- `Popover`: Lightweight overlay for settings/info.
- `Tooltip`: Portal-based, high-performance tooltips.

### Motion
- `Reveal`: Mask-based entry animation. `<Reveal direction="up">...</Reveal>`
- `Magnetic`: Cursor attraction. `<Magnetic strength={0.5}><Button>...</Button></Magnetic>`
- `NumberTicker`: Animated counter. `<NumberTicker value={100} />`
- `ScrollProgress`: Page reading indicator.

## 4. Native Hooks
- `useFloating(triggerRef, contentRef, options)`: For custom overlays.
- `useForm({ initialValues, onSubmit })`: Returns `register`, `handleSubmit`, `errors`.
- `useScroll()`: Returns `scrollProgressY` (0 to 1).
- `useResponsive()`: Includes `useBreakpoint` and `useContainerQuery`.
- `useIntersection(ref)`: For lazy-loading and scroll animations.

## 5. Implementation Rules for AI
1. **Always use `cn()`** for merging Tailwind classes.
2. **Prefer `fixed` positioning** for portals (Dropdowns, Tooltips).
3. **Use `asChild` pattern** (via Radix Slot if available, or custom implementation) when nesting interactive elements.
4. **Strict TypeScript**: Never use `any`. Define interfaces for all props.
5. **Accessibility**: Always include `aria-*` attributes and ensure keyboard navigation works (native in `<dialog>`).

## 6. Example: Modern Form with Native Validation
```tsx
import { useForm, TextInput, Button, Surface } from '@pixonui/react';

export function ContactForm() {
  const { register, handleSubmit, errors } = useForm({
    initialValues: { email: '', message: '' },
    onSubmit: (values) => console.log(values),
  });

  return (
    <Surface className="p-6 max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput 
          label="Email"
          required
          type="email"
          {...register('email')}
        />
        <TextInput 
          label="Message"
          required
          minLength={10}
          {...register('message')}
        />
        <Button type="submit" variant="primary">Send</Button>
      </form>
    </Surface>
  );
}
```
