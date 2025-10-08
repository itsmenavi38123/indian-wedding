'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Attempting to connect to Socket.IO at:', SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      setError(null);
      // Join pipeline room
      newSocket.emit('join-pipeline');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError(err.message);
    });

    return () => {
      newSocket.emit('leave-pipeline');
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`h-2 w-2 rounded-full ${
          isConnected ? 'bg-green-500' : error ? 'bg-red-500' : 'bg-gray-400'
        } ${!error && 'animate-pulse'}`}
      />
      <span className="text-gray-600">
        {isConnected ? 'Live updates enabled' : error ? 'Connection failed' : 'Connecting...'}
      </span>
    </div>
  );
}
