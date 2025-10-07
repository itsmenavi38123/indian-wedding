import { Worker } from 'bullmq';
import { options } from '@/config/redis';
import { sendResetPasswordEmail } from '@/services/emailService';

const emailWorker = new Worker(
  'email-queue',
  async (job) => {
    const { to, otp } = job.data;
    console.log(`📧 Sending reset email to ${to} - ${otp}`);
    await sendResetPasswordEmail(to, otp);
  },
  {
    connection: options,
    limiter: {
      max: 8, // 8 emails per second
      duration: 1000,
    },
  }
);

emailWorker.on('completed', (job) => {
  console.log(`✅ Email sent for job ${job.id}`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Failed job ${job?.id}: ${err.message}`);
});

export default emailWorker;
