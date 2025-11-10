import express from 'express';
import { ConfiguratorController } from '@/controllers/configurator.controller';
import { authenticate } from '@/middlewares/authMiddleware';

const router = express.Router();
const configuratorController = new ConfiguratorController();

// PUBLIC ROUTES (Guest Mode - No Auth Required)

// Step 1: Create guest wedding plan (as soon as "Next" is clicked)
router.post(
  '/guest/create',
  configuratorController.createGuestWeddingPlan.bind(configuratorController)
);

// Update guest wedding plan as they progress through steps
router.put(
  '/guest/update/:weddingPlanId',
  configuratorController.updateGuestWeddingPlan.bind(configuratorController)
);

// Delete guest wedding plan
router.delete(
  '/guest/delete/:weddingPlanId',
  configuratorController.deleteGuestWeddingPlan.bind(configuratorController)
);

// Step 2: Get wedding vibes
router.get('/vibes', configuratorController.getVibes.bind(configuratorController));

// Step 2: Generate personalized vibe description
router.post(
  '/vibes/personalized-description',
  configuratorController.generatePersonalizedVibeDescription.bind(configuratorController)
);

// Step 3: Get regions
router.get('/regions', configuratorController.getRegions.bind(configuratorController));

// Step 3: Get venues by region
router.get(
  '/venues/:region',
  configuratorController.getVenuesByRegion.bind(configuratorController)
);

// Step 6: Get vendors (filtered)
router.get('/vendors', configuratorController.getVendors.bind(configuratorController));

// Get public wedding site
router.get(
  '/wedding-site/:subdomain',
  configuratorController.getPublicSite.bind(configuratorController)
);

// AUTHENTICATED ROUTES (Requires Login)

// Step 7: Claim guest wedding plan (when user logs in)
router.post(
  '/claim',
  authenticate(),
  configuratorController.claimWeddingPlan.bind(configuratorController)
);

// Step 7: Create wedding plan (legacy - for direct authenticated creation)
router.post(
  '/create',
  authenticate(),
  configuratorController.startConfiguration.bind(configuratorController)
);

// Step 7: Publish wedding site
router.post(
  '/publish-site',
  authenticate(),
  configuratorController.publishSite.bind(configuratorController)
);

export const configuratorRoute = () => router;
export default configuratorRoute;
