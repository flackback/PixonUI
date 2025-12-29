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

/**
 * Advanced Socket.io hook with Redis-ready event handling and automatic room management.
 */
export function useSocket({ url, token, rooms = [], onConnect, onDisconnect, onError }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(url, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      rooms.forEach(room => socket.emit('join', room));
      onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
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
    socketRef.current?.on(event, callback);
    return () => {
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
