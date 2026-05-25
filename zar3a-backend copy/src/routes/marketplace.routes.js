import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import authenticate from '../middlewares/authenticate.js';
import {
  getCropMarketProducts,
  createCropMarketProduct,
  getAgriShopProducts,
  createAgriShopProduct,
  getExpertListings,
  createExpertListing,
  searchProducts,
  getProductById,
} from '../controllers/marketplace.controller.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

// ─────────────────────────────────────────────────────────
// CROP MARKET ENDPOINTS
// ─────────────────────────────────────────────────────────

// GET /marketplace/crop-products
// Get all Crop Market products (public)
router.get('/crop-products', getCropMarketProducts);

// POST /marketplace/crop-products
// Add product to Crop Market (FARMER ONLY)
router.post(
  '/crop-products',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  ],
  validate,
  createCropMarketProduct
);

// ─────────────────────────────────────────────────────────
// AGRI SHOP ENDPOINTS
// ─────────────────────────────────────────────────────────

// GET /marketplace/agri-products
// Get all Agri Shop products (public)
router.get('/agri-products', getAgriShopProducts);

// POST /marketplace/agri-products
// Add product to Agri Shop (SUPPLIER ONLY)
router.post(
  '/agri-products',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  ],
  validate,
  createAgriShopProduct
);

// ─────────────────────────────────────────────────────────
// PRODUCT SEARCH & DETAILS
// ─────────────────────────────────────────────────────────

// GET /marketplace/search
// Search products across both marketplaces
// Query: ?q=search&marketplace=crop|agri&category=SEEDS
router.get('/search', searchProducts);

// GET /marketplace/products/:productId
// Get detailed product info
router.get('/products/:productId', getProductById);

// ─────────────────────────────────────────────────────────
// EXPERT LISTINGS ENDPOINTS
// ─────────────────────────────────────────────────────────

// GET /marketplace/expert-listings
// Get all APPROVED expert listings (public)
router.get('/expert-listings', getExpertListings);

// POST /marketplace/expert-listings
// Create expert listing (APPROVED AGRO_EXPERT ONLY)
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
