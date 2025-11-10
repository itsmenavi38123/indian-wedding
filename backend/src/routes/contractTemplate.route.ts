import express, { Router } from 'express';
import { ContractTemplateController } from '@/controllers/contract.controller';
import { authenticate } from '@/middlewares/authMiddleware';

export function contractTemplateRoute(): Router {
  const router = express.Router();
  const controller = new ContractTemplateController();
  router.post('/templates', authenticate(), controller.createTemplate.bind(controller));
  router.get('/', authenticate(), controller.getAll.bind(controller));
  router.get('/:id', authenticate(), controller.getById.bind(controller));
  router.get('/:id/pdf', controller.generatePdf.bind(controller));
  router.post('/:id/fields', authenticate(), controller.saveSignatureFields.bind(controller));
  return router;
}
