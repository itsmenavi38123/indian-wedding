import { Router } from 'express';
import { KanbanController } from '@/controllers/kanban.controller';
import { authenticate } from '@/middlewares/authMiddleware';
import { authenticateVendor } from '@/middlewares/vendorAuthMiddleware';

export function kanbanRoute(): Router {
  const kanbanRouter = Router();
  const kanbanController = new KanbanController();

  kanbanRouter.put(
    '/cards/:cardId',
    authenticateVendor,
    kanbanController.updateKanbanCard.bind(kanbanController)
  );

  kanbanRouter.delete(
    '/cards/:cardId',
    authenticateVendor,
    kanbanController.deleteKanbanCard.bind(kanbanController)
  );

  // Update card status (move between boards) - Available to all authenticated users
  kanbanRouter.patch(
    '/card/:cardId',
    authenticate(),
    kanbanController.updateCardStatus.bind(kanbanController)
  );

  return kanbanRouter;
}
