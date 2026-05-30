import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import { getCart, updateCart, clearCart } from '../controllers/cart.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', getCart);
router.put('/', updateCart);
router.delete('/', clearCart);

export default router;
