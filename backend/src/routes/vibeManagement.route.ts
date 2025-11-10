import express from 'express';
import { VibeManagementController } from '@/controllers/vibeManagement.controller';
import { authenticate } from '@/middlewares/authMiddleware';

const router = express.Router();
const vibeController = new VibeManagementController();

// ADMIN ROUTES (Protected)

// AI-POWERED GENERATION
// Generate complete vibe content from prompt (No auth - for guest configurator)
router.post('/ai/generate', vibeController.generateVibeWithAI.bind(vibeController));

// Generate image with DALL-E (optional - costs money)
router.post(
  '/ai/generate-image',
  authenticate(),
  vibeController.generateVibeImage.bind(vibeController)
);

// Enhance description with AI
router.post(
  '/ai/enhance-description',
  authenticate(),
  vibeController.enhanceDescription.bind(vibeController)
);

// CRUD OPERATIONS
// Create new vibe (manually or with AI-generated content)
router.post('/', authenticate(), vibeController.createVibe.bind(vibeController));

// Update vibe
router.put('/:id', authenticate(), vibeController.updateVibe.bind(vibeController));

// Delete vibe
router.delete('/:id', authenticate(), vibeController.deleteVibe.bind(vibeController));

// Toggle vibe active status
router.patch('/:id/toggle', authenticate(), vibeController.toggleVibeStatus.bind(vibeController));

// Reorder vibes
router.post('/reorder', authenticate(), vibeController.reorderVibes.bind(vibeController));

// PUBLIC ROUTES
// Get single vibe by ID
router.get('/:id', vibeController.getVibeById.bind(vibeController));

export const vibeManagementRoute = () => router;
