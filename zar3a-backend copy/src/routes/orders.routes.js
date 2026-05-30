import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import adminOnly from '../middlewares/adminOnly.js';
import {
  checkout,
  listUserOrders,
  getOrderById,
  updateOrderStatus,
  listAllOrders,
  getTrackingOrders,
  getFarmerOrders,
  getSupplierOrders,
  getAdminOrders,
} from '../controllers/orders.controller.js';

const router = Router();

router.use(authenticate);

// User endpoints
router.post('/checkout', checkout); // Multi-item cart checkout
router.get('/', listUserOrders); // Get user's own orders (purchase history)
router.get('/tracking', getTrackingOrders); // Get role-based sales tracking feed (dynamic wrapper)
router.get('/farmer', getFarmerOrders); // GET /orders/farmer -> Crop market only
router.get('/supplier', getSupplierOrders); // GET /orders/supplier -> Agri shop only
router.get('/admin', adminOnly, getAdminOrders); // GET /orders/admin -> Admin only all orders
router.get('/:orderId', getOrderById); // Get specific order details

// Admin endpoints
router.patch('/:orderId/status', adminOnly, updateOrderStatus); // Update order status
router.get('/admin/all', adminOnly, listAllOrders); // List all orders

export default router;
