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

    const childrenProps = children.props as any;

    return React.cloneElement(children, {
      ...props,
      ...childrenProps,
      ref: (node: HTMLElement | null) => {
        // Handle forwardedRef
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }

        // Handle children's own ref
        const { ref } = children as any;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref && 'current' in ref) {
          ref.current = node;
        }
      },
      className: cn(props.className, childrenProps.className),
    } as any);
  }
);

Slot.displayName = 'Slot';
