import prisma from '@/config/prisma';
import { UserRole } from '@prisma/client';
import { getSocketIO } from '@/config/socket';

interface NotificationParams {
  message: string;
  type: string;
  recipientId?: string;
  recipientRole?: UserRole;
}

export class NotificationService {
  public async sendNotification(params: NotificationParams) {
    const { message, type, recipientId, recipientRole } = params;

    const notification = await prisma.notification.create({
      data: {
        message,
        type,
        recipientId,
        recipientRole,
        isRead: false,
      },
    });

    const io = getSocketIO();
    if (recipientId) {
      io.to(`user:${recipientId}`).emit('new_notification', notification);
    } else if (recipientRole) {
      io.to(recipientRole.toLowerCase()).emit('new_notification', notification);
    }
    return notification;
  }
}

export const notificationService = new NotificationService();
