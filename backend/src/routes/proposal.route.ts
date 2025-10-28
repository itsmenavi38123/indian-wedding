import { Router } from 'express';
import { proposalController } from '@/controllers/proposal.controller';
import { authenticate } from '@/middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

export const proposalRoute = () => {
  const router = Router();

  // All routes require authentication (admin only)
  const authMiddleware = authenticate([UserRole.ADMIN]);

  // Wedding Package routes (public - no auth required) - MUST COME BEFORE /:id route
  router.get('/packages', proposalController.getAllPackages.bind(proposalController));
  router.get('/packages/:packageId', proposalController.getPackageById.bind(proposalController));

  // Draft management - specific routes before generic ones
  router.post(
    '/draft/:leadId',
    authMiddleware,
    proposalController.saveDraft.bind(proposalController)
  );
  router.get(
    '/draft/:leadId',
    authMiddleware,
    proposalController.getDraft.bind(proposalController)
  );

  // Version management
  router.post(
    '/version/:proposalId',
    authMiddleware,
    proposalController.saveVersion.bind(proposalController)
  );

  // Finalize proposal
  router.post(
    '/finalize/:proposalId',
    authMiddleware,
    proposalController.finalizeProposal.bind(proposalController)
  );

  router.post(
    '/assign-vendors/:proposalId',
    authMiddleware,
    proposalController.assignVendors.bind(proposalController)
  );

  // Get all proposals
  router.get('/', authMiddleware, proposalController.getAllProposals.bind(proposalController));

  // Get proposal by ID - MUST BE LAST as it catches all /:id patterns
  router.get('/:id', authMiddleware, proposalController.getProposalById.bind(proposalController));

  return router;
};
