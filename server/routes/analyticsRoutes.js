import express from 'express';
import {
  getDashboardMetrics,
  generateReport,
  getLatestReport,
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest, reportGenSchema } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);
router.use(authorize('agent')); // Only agents/admins view executive analytics

router.get('/metrics', getDashboardMetrics);
router.post('/executive-report', validateRequest(reportGenSchema), generateReport);
router.get('/executive-report/latest', getLatestReport);

export default router;
