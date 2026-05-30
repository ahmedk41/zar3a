import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import authenticate from '../middlewares/authenticate.js';
import adminOnly from '../middlewares/adminOnly.js';
import {
  getAllUsers,
  getUserDetails,
  changeUserRole,
  deleteUser,
  deleteProduct,
  getAdminStats,
  updateSensorStatus,
} from '../controllers/admin.controller.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

router.use(authenticate, adminOnly);

router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.post(
  '/users/:userId/role',
  [body('newRole').isIn(['FARMER', 'SUPPLIER', 'BUYER', 'ADMIN']).withMessage('Invalid role')],
  validate,
  changeUserRole
);
router.delete('/users/:userId', deleteUser);
router.delete('/products/:productId', deleteProduct);
router.get('/stats', getAdminStats);
router.put('/sensors/:profileId', updateSensorStatus);

export default router;
