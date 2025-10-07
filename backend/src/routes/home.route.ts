import { LandingPageController } from '@/controllers/home.controller';
import { authenticate } from '@/middlewares/authMiddleware';
import { landingpageUploadMiddleware } from '@/middlewares/homepageUploadMiddleware';
import { Router } from 'express';

export function landingPageRoute(): Router {
  const landingPageRouter = Router();
  const landingPageController = new LandingPageController();

  landingPageRouter.put(
    '/section/:sectionKey',
    authenticate(),
    landingpageUploadMiddleware,
    landingPageController.updateSection.bind(landingPageController)
  );

  return landingPageRouter;
}
