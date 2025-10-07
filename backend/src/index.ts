import http from 'http';
import { env } from '@/env';
import { createApp } from '@/app';
import { logger } from '@/logger';
import { connectRedis } from './config/redis';
import { initializeSocket } from './config/socket';

async function main() {
  try {
    await connectRedis();

    const PORT: number = +(env.PORT ?? 3000);

    const server = http.createServer(createApp());

    // Initialize Socket.IO
    initializeSocket(server);

    await import('./queues/emailQueue');
    await import('./queues/emailWorker');

    server.listen(PORT, () => {
      logger.info(`Server listening on port: ${PORT}`);
    });
  } catch (error) {
    logger.error(`Error starting server`, error);
  }
}

main();
