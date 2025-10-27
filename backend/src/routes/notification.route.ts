import { Router } from 'express';
import { NotificationController } from '@/controllers/notification.controller';
import { authenticate } from '@/middlewares/authMiddleware';

export function notificationRoute(): Router {
  const router = Router();
  const notificationController = new NotificationController();

  router.get(
    '/',
    authenticate(),
    notificationController.getNotifications.bind(notificationController)
  );

  router.put(
    '/:id/read',
    authenticate(),
    notificationController.markAsRead.bind(notificationController)
  );
  router.put(
    '/mark-all-read',
    authenticate(),
    notificationController.markAllAsRead.bind(notificationController)
  );

  return router;
}
