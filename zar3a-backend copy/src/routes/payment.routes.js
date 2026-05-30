import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import {
  createOrderPayment,
  confirmPayment,
  getPaymentStatus,
  paymentWebhook,
} from '../controllers/payment.controller.js';

const router = Router();

// Public webhook endpoint (no authentication required)
// POST /payments/webhook & POST /api/payments/webhook
router.post('/webhook', paymentWebhook);

// Protected payment endpoints
router.use(authenticate);

// New standard checkout & payment session creation
// POST /payments/create-order
router.post('/create-order', createOrderPayment);

// Confirm payment after gateway redirect/success
// POST /payments/confirm
router.post('/confirm', confirmPayment);

// Legacy Check payment status
// GET /payments/:orderId/status
router.get('/:orderId/status', getPaymentStatus);

export default router;
