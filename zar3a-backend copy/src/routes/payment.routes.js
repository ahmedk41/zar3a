import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  stripeWebhook,
} from '../controllers/payment.controller.js';

const router = Router();

// Public webhook endpoint (no authentication required)
// POST /payments/webhook
// Stripe sends payment updates here
router.post('/webhook', stripeWebhook);

// Protected payment endpoints
router.use(authenticate);

// POST /payments/intent
// Create a Stripe payment intent for an order
router.post('/intent', createPaymentIntent);

// POST /payments/confirm
// Confirm payment after Stripe success
router.post('/confirm', confirmPayment);

// GET /payments/:orderId/status
// Check payment status
router.get('/:orderId/status', getPaymentStatus);

export default router;
