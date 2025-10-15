import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '@/logger';
import { config } from 'dotenv';
config();

let io: SocketIOServer | null = null;
const origin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

export const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: origin,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Join pipeline room for real-time updates
    socket.on('join-pipeline', () => {
      socket.join('pipeline');
      logger.info(`Client ${socket.id} joined pipeline room`);
    });

    // Leave pipeline room
    socket.on('leave-pipeline', () => {
      socket.leave('pipeline');
      logger.info(`Client ${socket.id} left pipeline room`);
    });

    // Join user/admin/vendor rooms for notifications
    socket.on('join-user', (userId: string) => {
      if (userId) socket.join(`user:${userId}`);
    });
    socket.on('join-admin', (adminId: string) => {
      if (adminId) socket.join(`admin:${adminId}`);
    });
    socket.on('join-vendor', (vendorId: string) => {
      if (vendorId) socket.join(`vendor:${vendorId}`);
    });

    // Chat groups
    socket.on('join-chat', (groupId: string) => {
      if (groupId) socket.join(`chat:${groupId}`);
    });
    socket.on('leave-chat', (groupId: string) => {
      if (groupId) socket.leave(`chat:${groupId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
};

// Pipeline-specific events
export const emitPipelineUpdate = (event: string, data: any) => {
  if (io) {
    io.to('pipeline').emit(event, data);
    logger.info(`Emitted ${event} to pipeline room`, { data });
  }
};

// Notification helpers
export const emitToUser = (userId: string, event: string, data: any) => {
  if (io && userId) io.to(`user:${userId}`).emit(event, data);
};
export const emitToAdmin = (adminId: string, event: string, data: any) => {
  if (io && adminId) io.to(`admin:${adminId}`).emit(event, data);
};
export const emitToVendor = (vendorId: string, event: string, data: any) => {
  if (io && vendorId) io.to(`vendor:${vendorId}`).emit(event, data);
};

// Chat helpers
export const emitChatMessage = (groupId: string, data: any) => {
  if (io && groupId) io.to(`chat:${groupId}`).emit('chat:message', data);
};
