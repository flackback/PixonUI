import * as React from 'react';
import { cn } from './cn';

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, forwardedRef) => {
    if (!React.isValidElement(children)) {
      return null;
    }

    const child = children as React.ReactElement & { ref?: React.Ref<HTMLElement> };

    return React.cloneElement(child, {
      ...props,
      ...child.props,
      ref: (node: HTMLElement | null) => {
        // Handle forwardedRef
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }

        // Handle children's own ref
        const { ref } = child;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref && 'current' in ref) {
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      className: cn(props.className, child.props.className),
    });
  }
);

Slot.displayName = 'Slot';
