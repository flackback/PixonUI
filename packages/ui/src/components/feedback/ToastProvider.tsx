import React, { createContext, useState, useCallback, useContext } from 'react';
import type { ToastProps} from './Toast';
import { Toast, ToastVariant } from './Toast';

export type ToastOptions = Omit<ToastProps, 'id' | 'onDismiss'>;

export interface ToastContextType {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string | ToastOptions;
      success: string | ((data: T) => ToastOptions);
      error: string | ((error: any) => ToastOptions);
    }
  ) => Promise<T>;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...options, id, onDismiss: dismiss }]);
    return id;
  }, [dismiss]);

  const updateToast = useCallback((id: string, options: Partial<ToastOptions>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...options } : t))
    );
  }, []);

  const promise = useCallback(
    async <T,>(
      promise: Promise<T>,
      options: {
        loading: string | ToastOptions;
        success: string | ((data: T) => ToastOptions);
        error: string | ((error: any) => ToastOptions);
      }
    ) => {
      const loadingOptions = typeof options.loading === 'string' 
        ? { title: options.loading, variant: 'loading' as const } 
        : { variant: 'loading' as const, ...options.loading };
      
      const id = toast({ ...loadingOptions, duration: Infinity });

      try {
        const data = await promise;
        const successOptions = typeof options.success === 'function'
          ? options.success(data)
          : typeof options.success === 'string'
          ? { title: options.success, variant: 'success' as const }
          : options.success;

        updateToast(id, { ...successOptions, duration: 5000 });
        return data;
      } catch (err) {
        const errorOptions = typeof options.error === 'function'
          ? options.error(err)
          : typeof options.error === 'string'
          ? { title: options.error, variant: 'error' as const }
          : options.error;

        updateToast(id, { ...errorOptions, duration: 5000 });
        throw err;
      }
    },
    [toast, updateToast]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss, promise }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[150] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
