import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};

export const usePipelineSocket = (onUpdate: (event: string, data: any) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log('Initializing pipeline socket connection to:', SOCKET_URL);

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server for pipeline');
      // Join pipeline room
      socketRef.current?.emit('join-pipeline');
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Pipeline socket connection error:', err.message);
    });

    // Listen for pipeline events
    socketRef.current.on('lead-updated', (data) => {
      onUpdate('lead-updated', data);
    });

    socketRef.current.on('lead-status-updated', (data) => {
      onUpdate('lead-status-updated', data);
    });

    socketRef.current.on('lead-archived', (data) => {
      onUpdate('lead-archived', data);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-pipeline');
        socketRef.current.disconnect();
      }
    };
  }, [onUpdate]);

  return socketRef.current;
};
