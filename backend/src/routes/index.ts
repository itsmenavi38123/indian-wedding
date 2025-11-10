import { Router } from 'express';
import { leadsRoute } from '@/routes/lead.route';
import { authRoute } from './auth.route';
import { kanbanRoute } from './kanban.route';
import { pipelineRoute } from './pipeline.route';
import { proposalRoute } from './proposal.route';
import { proposalTemplateRoute } from './proposalTemplate.route';
import { adminRouter } from './admin.route';
import { vendorRoute } from './vendor.route';
import { landingPageRoute } from './home.route';
import { weddingPlanRoute } from './weddingPlan.route';
import { notificationRoute } from './notification.route';
import { contractTemplateRoute } from './contractTemplate.route';
import { configuratorRoute } from './configurator.route';
import { vibeManagementRoute } from './vibeManagement.route';

const router = Router();

router.use('/auth', authRoute());
router.use('/lead', leadsRoute());
router.use('/kanban', kanbanRoute());

router.use('/pipeline', pipelineRoute());

router.use('/proposal-templates', proposalTemplateRoute());
router.use('/proposals', proposalRoute());
router.use('/vendor', vendorRoute());
router.use('/admin', adminRouter());
router.use('/home', landingPageRoute());
router.use('/wedding-plan', weddingPlanRoute());
router.use('/notifications', notificationRoute());
router.use('/contract-templates', contractTemplateRoute());
router.use('/configurator', configuratorRoute());
router.use('/vibes', vibeManagementRoute());

export default router;
