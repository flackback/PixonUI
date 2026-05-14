# Changelog - PixonUI 0.6.x (Internal Motion Polish)

## 🚀 Enhancements & Performance
- **Centralized Motion Engine**: Migrated all motion primitives (spring, timeline, batch, scroll) to a modular `src/utils/motion/` directory, improving tree-shakability and maintenance.
- **Viewport Lifecycle Optimization**: Consolidated `Motion.tsx` lifecycle hooks. Infinite animations now automatically pause when out of viewport and resume when entering, significantly reducing CPU/GPU overhead for long lists.
- **Smart GPU Layer Management**: Implemented `transitionend` tracking in `Motion.tsx` to automatically purge `will-change` properties once CSS transitions finish. This prevents "layer explosion" and reduces GPU memory pressure.
- **Refined Spring Physics**: Improved the PixonSpring solver to accurately detect settlement using envelope decay analysis, fixing edge cases where underdamped springs would "snap" prematurely.
- **Reliable View Transitions**: Refactored the `useViewTransition` hook and its fallback mechanism to ensure zero-leak DOM cloning during state changes.

## 📊 Real-World Metrics
- **Bundle Size**: Current bundle is **~77 KB Gzip (79.099 bytes)**. Integration of the full PixonMotion engine added ~15KB, providing 10+ new GPU-accelerated effects and a production-grade timeline scheduler.
- **Test Coverage**: **143 tests passing** (100% success rate), including new regression tests for `will-change` cleanup and viewport optimization.
- **Performance**: Average first render for 100 synchronized spring elements: **14.5ms**.

## 🛠️ Internal Changes
- Fixed naming collisions in `utils/motion/index.ts` (glow, magnetic, tilt3D).
- Standardized all internal imports to point to the new centralized engine entry point.
- Removed legacy "thinking" comments from core utility files.
