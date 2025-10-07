import { options } from '@/config/redis';
import { Queue } from 'bullmq';

const emailQueue = new Queue('email-queue', { connection: options });

export function getEmailQueue() {
  if (!emailQueue) throw new Error('EmailQueue not initialized');
  return emailQueue;
}

export async function enqueuePushEmail(data: any) {
  await emailQueue.add('send-email', data);
}
