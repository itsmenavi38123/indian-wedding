import { Router } from 'express';
import { leadsRoute } from '@/routes/lead.route';
import { authRoute } from './auth.route';
import { kanbanRoute } from './kanban.route';
import { pipelineRoute } from './pipeline.route';
import { proposalRoute } from './proposal.route';
import { proposalTemplateRoute } from './proposalTemplate.route';
import { vendorRoute } from './vendor.route';
import { landingPageRoute } from './home.route';
import { weddingPlanRoute } from './weddingPlan.route';

const router = Router();

router.use('/auth', authRoute());
router.use('/lead', leadsRoute());
router.use('/kanban', kanbanRoute());

router.use('/pipeline', pipelineRoute());

router.use('/proposal-templates', proposalTemplateRoute());
router.use('/proposals', proposalRoute());
router.use('/vendor', vendorRoute());
router.use('/home', landingPageRoute());
router.use('/wedding-plan', weddingPlanRoute());

export default router;
