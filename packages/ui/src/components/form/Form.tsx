import React from 'react';
import { cn } from '../../utils/cn';
import { Label } from './Label';

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

export const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();
    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef<React.ElementRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(
  ({ className, ...props }, ref) => {
    const { id } = React.useContext(FormItemContext);
    return (
      <Label
        ref={ref}
        className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
        htmlFor={id}
        {...props}
      />
    );
  }
);
FormLabel.displayName = "FormLabel";

export const FormControl = React.forwardRef<React.ElementRef<"div">, React.HTMLAttributes<HTMLDivElement>>(
  ({ ...props }, ref) => {
    const { id } = React.useContext(FormItemContext);
    const { children, ...rest } = props;
    
    if (React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement, {
            id,
            "aria-describedby": `${id}-description ${id}-message`,
            ...rest,
            ...(children.props as any)
        });
    }
    return <div ref={ref} {...props} />;
  }
);
FormControl.displayName = "FormControl";

export const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { id } = React.useContext(FormItemContext);
    return (
      <p
        ref={ref}
        id={`${id}-description`}
        className={cn("text-xs text-white/50", className)}
        {...props}
      />
    );
  }
);
FormDescription.displayName = "FormDescription";

export const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { id } = React.useContext(FormItemContext);
    
    if (!children) {
      return null;
    }

    return (
      <p
        ref={ref}
        id={`${id}-message`}
        className={cn("text-xs font-medium text-rose-500", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
FormMessage.displayName = "FormMessage";
