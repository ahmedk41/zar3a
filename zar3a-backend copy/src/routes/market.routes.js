import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import authenticate from '../middlewares/authenticate.js';
import {
  getProducts,
  createProduct,
  getExpertListings,
  createExpertListing,
} from '../controllers/market.controller.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

router.get('/products', getProducts);
router.post(
  '/products',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('marketplaceType').optional().isIn(['CROP_MARKET', 'AGRI_MARKET']).withMessage('Invalid marketplace type'),
    body('productSource').optional().isIn(['MANUAL', 'SENSED']).withMessage('Invalid product source'),
  ],
  validate,
  createProduct
);

router.get('/expert-listings', getExpertListings);
router.post(
  '/expert-listings',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('specialty').trim().notEmpty().withMessage('Specialty is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('hourlyRate').isFloat({ gt: 0 }).withMessage('Hourly rate must be greater than 0'),
  ],
  validate,
  createExpertListing
);

export default router;
