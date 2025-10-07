import { Router } from 'express';
import { VendorController } from '@/controllers/vendor.controller';
import { VendorTeamController } from '@/controllers/vendorTeam.controller';
import { authenticate } from '@/middlewares/authMiddleware';
import { vendorUploadMiddleware } from '@/middlewares/vendorUploadMiddleware';
import { VendorServiceController } from '@/controllers/vendorService.controller';
import { vendorServiceUploadMiddleware } from '@/middlewares/vendorServiceUploadMiddleware';
import { authenticateVendor } from '@/middlewares/vendorAuthMiddleware';

export function vendorRoute(): Router {
  const vendorRouter = Router();
  const vendorController = new VendorController();
  const vendorTeamController = new VendorTeamController();
  const vendorServiceController = new VendorServiceController();

  vendorRouter.post(
    '/create',
    authenticate(),
    vendorUploadMiddleware,
    vendorController.createVendor.bind(vendorController)
  );

  vendorRouter.put(
    '/update/:id',
    authenticate(),
    vendorUploadMiddleware,
    vendorController.updateVendor.bind(vendorController)
  );

  vendorRouter.get('/list', authenticate(), vendorController.getVendors.bind(vendorController));
  vendorRouter.get('/events', authenticate(), vendorController.getEvents.bind(vendorController));

  vendorRouter.get('/:id', authenticate(), vendorController.getVendorById.bind(vendorController));

  vendorRouter.delete('/:id', authenticate(), vendorController.deleteVendor.bind(vendorController));

  vendorRouter.put(
    '/status/:id',
    authenticate(),
    vendorController.updateVendorStatus.bind(vendorController)
  );

  vendorRouter.put(
    '/bulk-update-status',
    authenticate(),
    vendorController.bulkUpdateVendorStatus.bind(vendorController)
  );

  vendorRouter.post(
    '/export-vendor-with-ids/csv',
    authenticate(),
    vendorController.exportVendorsWithIdsCsv.bind(vendorController)
  );

  /**
   * 🔹 Vendor Leads
   */
  vendorRouter.get('/leads', authenticate(), vendorController.getLeads.bind(vendorController));

  /**
   * 🔹 Team Routes
   */
  vendorRouter.post(
    '/team',
    authenticate(),
    vendorTeamController.createTeam.bind(vendorTeamController)
  );

  vendorRouter.get(
    '/teams',
    authenticate(),
    vendorTeamController.getTeamsByVendor.bind(vendorTeamController)
  );

  vendorRouter.get(
    '/team/:teamId/members',
    authenticate(),
    vendorTeamController.getTeamMembersByTeam.bind(vendorTeamController)
  );

  vendorRouter.put(
    '/team/:teamId',
    authenticate(),
    vendorTeamController.updateTeam.bind(vendorTeamController)
  );

  vendorRouter.delete(
    '/team/:teamId',
    authenticate(),
    vendorTeamController.deleteTeam.bind(vendorTeamController)
  );

  /**
   * 🔹 Team Member Routes
   */
  vendorRouter.post(
    '/team-member',
    authenticate(),
    vendorTeamController.createTeamMember.bind(vendorTeamController)
  );

  vendorRouter.get(
    '/team-members',
    authenticate(),
    vendorTeamController.getTeamMembers.bind(vendorTeamController)
  );

  vendorRouter.put(
    '/team-member/:teamMemberId',
    authenticate(),
    vendorTeamController.updateTeamMember.bind(vendorTeamController)
  );

  vendorRouter.delete(
    '/team-member/:teamMemberId',
    authenticate(),
    vendorTeamController.deleteTeamMember.bind(vendorTeamController)
  );

  vendorRouter.post(
    '/team-member/assign',
    authenticate(),
    vendorTeamController.assignMemberToTeam.bind(vendorTeamController)
  );

  /**
   * 🔹 Services Routes
   */
  vendorRouter.post(
    '/service/create',
    authenticateVendor,
    vendorServiceUploadMiddleware,
    vendorServiceController.createService.bind(vendorServiceController)
  );

  vendorRouter.put(
    '/service/update/:serviceId',
    authenticateVendor,
    vendorServiceUploadMiddleware,
    vendorServiceController.updateService.bind(vendorServiceController)
  );

  vendorRouter.get(
    '/get/services',
    vendorServiceController.getServices.bind(vendorServiceController)
  );

  vendorRouter.get(
    '/service/:serviceId',
    authenticateVendor,
    vendorServiceController.getServiceById.bind(vendorServiceController)
  );
  
  vendorRouter.get(
  '/get/services/category/:category',
  vendorServiceController.getServicesByCategory.bind(vendorServiceController)
);

  vendorRouter.delete(
    '/service/:serviceId',
    authenticateVendor,
    vendorServiceController.deleteService.bind(vendorServiceController)
  );

  return vendorRouter;
}
