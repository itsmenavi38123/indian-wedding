import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { statusCodes, errorMessages } from '@/constant';
import { AuthenticatedRequest } from '@/middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

export class NotificationController {
  public async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const userRole = req.userRole;

      if (!userRole) {
        return res
          .status(400)
          .json({ message: 'User role not found. Cannot fetch notifications.' });
      }
      if (!userId) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, 'Unauthorized'));
      }

      const notifications = await prisma.notification.findMany({
        where: {
          OR: [{ recipientId: userId }, { recipientRole: userRole }],
          isRead: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(statusCodes.OK).json(new ApiResponse(statusCodes.OK, notifications));
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            err.message || errorMessages.FETCH_FAILED
          )
        );
    }
  }

  public async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const notification = await prisma.notification.findUnique({ where: { id } });

      if (!notification) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Notification not found'));
      }

      if (notification.recipientId !== userId && notification.recipientRole !== req.userRole) {
        return res
          .status(statusCodes.FORBIDDEN)
          .json(new ApiResponse(statusCodes.FORBIDDEN, null, 'Not allowed'));
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return res.status(statusCodes.OK).json(new ApiResponse(statusCodes.OK, updated));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            err.message || errorMessages.UPDATE_FAILED
          )
        );
    }
  }

  public async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const userRole = req.userRole;

      const updated = await prisma.notification.updateMany({
        where: {
          OR: [{ recipientId: userId }, { recipientRole: userRole }],
          isRead: false,
        },
        data: { isRead: true },
      });

      return res.status(statusCodes.OK).json(new ApiResponse(statusCodes.OK, updated));
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            err.message || errorMessages.UPDATE_FAILED
          )
        );
    }
  }
}
