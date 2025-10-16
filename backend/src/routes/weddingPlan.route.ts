import { Router } from 'express';
import { WeddingPlanController } from '@/controllers/weddingPlan.controller';
import { authenticate } from '@/middlewares/authMiddleware';

export function weddingPlanRoute(): Router {
  const router = Router();
  const weddingPlanController = new WeddingPlanController();

  router.post(
    '/create',
    authenticate(),
    weddingPlanController.createWeddingPlan.bind(weddingPlanController)
  );

  return router;
}
