import { AdminController } from '@/controllers/admin.controller';
import { authenticate } from '@/middlewares/authMiddleware';
import { UserRole } from '@prisma/client';
import { Router } from 'express';

export function adminRouter(): Router {
  const adminRouter = Router();
  const adminController = new AdminController();

  adminRouter.post(
    '/team',
    authenticate([UserRole.ADMIN]),
    adminController.createTeamAdmin.bind(adminController)
  );

  adminRouter.get(
    '/get/teams',
    authenticate([UserRole.ADMIN]),
    adminController.getTeamsByAdmin.bind(adminController)
  );

  adminRouter.get(
    '/get/team/:teamId',
    authenticate([UserRole.ADMIN]),
    adminController.getTeamByIdAdmin.bind(adminController)
  );

  adminRouter.put(
    '/team/:teamId',
    authenticate([UserRole.ADMIN]),
    adminController.updateTeamAdmin.bind(adminController)
  );

  adminRouter.delete(
    '/team/:teamId',
    authenticate([UserRole.ADMIN]),
    adminController.deleteTeamAdmin.bind(adminController)
  );

  adminRouter.post(
    '/teams',
    authenticate([UserRole.ADMIN]),
    adminController.createAdminTeams.bind(adminController)
  );

  adminRouter.put(
    '/team/:teamId/members',
    authenticate([UserRole.ADMIN]),
    adminController.updateTeamWithMembersAdmin.bind(adminController)
  );

  adminRouter.post(
    '/team-member',
    authenticate([UserRole.ADMIN]),
    adminController.createTeamMemberAdmin.bind(adminController)
  );

  adminRouter.get(
    '/team-members',
    authenticate([UserRole.ADMIN]),
    adminController.getTeamMembersAdmin.bind(adminController)
  );

  adminRouter.put(
    '/team-member/:teamMemberId',
    authenticate(),
    adminController.updateTeamMemberAdmin.bind(adminController)
  );

  adminRouter.delete(
    '/team-member/:teamMemberId',
    authenticate(),
    adminController.deleteTeamMemberAdmin.bind(adminController)
  );

  adminRouter.get(
    '/team/:teamId/members',
    authenticate(),
    adminController.getTeamMembersByTeamAdmin.bind(adminController)
  );

  return adminRouter;
}
