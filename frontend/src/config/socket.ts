import { API_BASE_URL } from '@/lib/constant';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to socket:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket');
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket.io client not initialized! Call initSocket() first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket manually disconnected');
  }
};
