import { Router } from 'express';
import { PipelineController } from '@/controllers/pipeline.controller';
import { authenticate } from '@/middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

export function pipelineRoute(): Router {
  const pipelineRouter = Router();
  const pipelineController = new PipelineController();

  pipelineRouter.get('/leads', authenticate([UserRole.ADMIN]), pipelineController.getPipelineLeads);
  pipelineRouter.patch(
    '/leads/:id/status',
    authenticate([UserRole.ADMIN]),
    pipelineController.updatePipelineLeadStatus
  );
  pipelineRouter.put(
    '/leads/:id',
    authenticate([UserRole.ADMIN]),
    pipelineController.updatePipelineLead
  );
  pipelineRouter.delete(
    '/leads/:id/archive',
    authenticate([UserRole.ADMIN]),
    pipelineController.archivePipelineLead
  );

  return pipelineRouter;
}
