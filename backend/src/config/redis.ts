import Redis from 'ioredis';
import { env } from '../env';

let redis: Redis;

export const options = {
  host: env.REDIS_HOST || '127.0.0.1',
  port: Number(env.REDIS_PORT) || 6380,
  password: env.REDIS_PASSWORD || undefined,
  db: 0,
  maxRetriesPerRequest: null,
};
export async function connectRedis(): Promise<void> {
  redis = new Redis(options);

  await Promise.all([
    new Promise<void>((resolve, reject) => {
      redis.once('ready', () => {
        console.log('✅ Redis connected');
        resolve();
      });
      redis.once('error', (err) => {
        console.error('❌ Redis connection error:', err);
        reject(err);
      });
    }),
  ]);
}

export function getRedis() {
  if (!redis) throw new Error('Redis not connected');
  return redis;
}
