// Tracking routes - triggers nodemon restart 3
import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import { getOrderTracking } from '../controllers/tracking.controller.js';

const router = Router();

router.use(authenticate);
router.get('/orders', getOrderTracking);

export default router;
