import { Router } from 'express';
import { ProposalTemplateController } from '../controllers/proposalTemplate.controller';

export function proposalTemplateRoute(): Router {
  const controller = new ProposalTemplateController();
  const router = Router();

  router.get('/templates', controller.getAllTemplates.bind(controller));
  router.get('/templates/:id', controller.getTemplateById.bind(controller));
  router.post('/templates', controller.createTemplate.bind(controller));
  router.put('/templates/:id', controller.updateTemplate.bind(controller));
  router.delete('/templates/:id', controller.deleteTemplate.bind(controller));
  router.post('/templates/seed', controller.seedDefaultTemplates.bind(controller));

  return router;
}
