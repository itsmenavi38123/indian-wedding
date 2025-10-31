import express, { Router } from 'express';
import { ContractTemplateController } from '@/controllers/contract.controller';
import { authenticate } from '@/middlewares/authMiddleware';

export function contractTemplateRoute(): Router {
  const router = express.Router();
  const controller = new ContractTemplateController();

  router.get('/', authenticate(), controller.getAll.bind(controller));
  router.get('/:id', authenticate(), controller.getById.bind(controller));
  router.get('/:id/pdf', controller.generatePdf.bind(controller));
  return router;
}
