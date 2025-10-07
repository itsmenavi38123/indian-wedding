import express from 'express';
import type { Router } from 'express';
import { LeadController } from '@/controllers/leads.controller';
import { validate } from '@/middlewares/validateMiddleware';
import { createLeadSchema } from '@/validators/leads/createLead';
import {
  bulkUpdateLeadStatusSchema,
  updateLeadStatusSchema,
} from '@/validators/leads/updateStatusLead';
import { exportLeadsWithIdsCsvSchema } from '@/validators/leads/exportLeads';
import { authenticate, authenticateMiddleware } from '@/middlewares/authMiddleware';

export function leadsRoute(): Router {
  const controller = new LeadController();
  const router = express.Router();

  router.post(
    '/create',
    authenticate(),
    validate(createLeadSchema),
    controller.createLead.bind(controller)
  );
  router.get('/get-all', authenticateMiddleware(), controller.getLeads.bind(controller));
  router.get('/get-by-id/:id', authenticate(), controller.getLeadById.bind(controller));
  router.get('/get-board-data', authenticate(), controller.getBoardLeads.bind(controller));
  router.get(
    '/get-vendors-by-lead-id/:id',
    authenticate(),
    controller.getVendorsByLeadId.bind(controller)
  );
  router.post('/update/lead-id/:id', authenticate(), controller.updateLead.bind(controller));
  router.post(
    '/update-status/lead-id/:id',
    authenticate(),
    validate(updateLeadStatusSchema),
    controller.updateLeadStatus.bind(controller)
  );
  router.post(
    '/save-status/lead-id/:id',
    authenticate(),
    controller.updateLeadSaveStatus.bind(controller)
  );
  router.post(
    '/bulk-update-status',
    authenticate(),
    validate(bulkUpdateLeadStatusSchema),
    controller.bulkUpdateLeadStatus.bind(controller)
  );
  router.post(
    '/export-lead-with-ids/csv',
    authenticate(),
    validate(exportLeadsWithIdsCsvSchema),
    controller.exportLeadsWithIdsCsv.bind(controller)
  );

  return router;
}
