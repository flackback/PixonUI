import { useEffect, useRef, useCallback } from 'react';

export function useReadReceipts(onRead: (messageId: string) => void) {
  const observer = useRef<IntersectionObserver | null>(null);

  const registerMessage = useCallback((el: HTMLElement | null, messageId: string, isMe: boolean) => {
    if (!el || isMe || !observer.current) return;
    
    el.dataset.messageId = messageId;
    observer.current.observe(el);
  }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = (entry.target as HTMLElement).dataset.messageId;
          if (messageId) {
            onRead(messageId);
            observer.current?.unobserve(entry.target);
          }
        }
      });
    }, { threshold: 0.5 });

    return () => {
      observer.current?.disconnect();
    };
  }, [onRead]);

  return { registerMessage };
}
