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

    return React.cloneElement(children, {
      ...props,
      ...children.props,
      // @ts-ignore
      ref: forwardedRef ? (node: HTMLElement) => {
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else {
          (forwardedRef as any).current = node;
        }
        // @ts-ignore
        const { ref } = children;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      } : (children as any).ref,
      className: cn(props.className, (children as any).props.className),
    });
  }
);

Slot.displayName = 'Slot';
