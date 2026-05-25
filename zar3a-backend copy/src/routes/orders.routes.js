import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import adminOnly from '../middlewares/adminOnly.js';
import {
  createOrder,
  checkout,
  listUserOrders,
  getOrderById,
  updateOrderStatus,
  listAllOrders,
  updatePaymentStatus,
} from '../controllers/orders.controller.js';

const router = Router();

router.use(authenticate);

// User endpoints
router.post('/', createOrder); // Single product order
router.post('/checkout', checkout); // Multi-item cart checkout
router.get('/', listUserOrders); // Get user's orders (filtered by role/marketplace)
router.get('/:orderId', getOrderById); // Get specific order details

// Admin endpoints
router.patch('/:orderId/status', adminOnly, updateOrderStatus); // Update order status
router.get('/admin/all', adminOnly, listAllOrders); // List all orders

// Dev endpoint: Mark order as paid (for testing without Stripe)
if (process.env.NODE_ENV === 'development') {
  router.post('/dev/mark-paid/:orderId', authenticate, (req, res) => {
    const orderId = req.params.orderId;
    updatePaymentStatus(req, res, orderId, 'PAID');
  });
}

export default router;
