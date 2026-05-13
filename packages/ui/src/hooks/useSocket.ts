import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  url: string;
  token?: string;
  rooms?: string[];
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export interface UseSocketReturn {
  socket: Socket | null;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => () => void;
  isConnected: boolean;
}

/**
 * Advanced Socket.io hook with Redis-ready event handling and automatic room management.
 */
export function useSocket({ url, token, rooms = [], onConnect, onDisconnect, onError }: UseSocketOptions): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, Set<(...args: any[]) => void>>>(new Map());

  useEffect(() => {
    const socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Re-bind all active listeners to the newly created socket instance
    listenersRef.current.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        socket.on(event, callback);
      });
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      rooms.forEach(room => socket.emit('join', room));
      onConnect?.();
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      onDisconnect?.();
    });

    socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      onError?.(error);
    });

    return () => {
      socket.disconnect();
    };
  }, [url, token, rooms, onConnect, onDisconnect, onError]);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected. Event buffered or dropped:', event);
    }
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);

    socketRef.current?.on(event, callback);
    return () => {
      const callbacks = listenersRef.current.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          listenersRef.current.delete(event);
        }
      }
      socketRef.current?.off(event, callback);
    };
  }, []);

  return {
    socket: socketRef.current,
    emit,
    on,
    isConnected: socketRef.current?.connected || false,
  };
}
