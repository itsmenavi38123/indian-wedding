import { destinationController } from '@/controllers/destination.controller';
import { Router } from 'express';

export function destinationRoute(): Router {
  const router = Router();
  router.get('/suggest', destinationController.suggest.bind(destinationController));
  router.get('/:destinationId/photos', destinationController.photos.bind(destinationController));

  // Planning Flow APIs
  router.get('/', destinationController.getAllDestinations.bind(destinationController));
  router.get(
    '/:destinationId',
    destinationController.getDestinationDetails.bind(destinationController)
  );
  router.get(
    '/:destinationId/photos/:category',
    destinationController.getPhotosByCategory.bind(destinationController)
  );

  return router;
}
