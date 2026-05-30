import { Product, ExpertListing, User, OrderTracking } from '../models/index.js';
import notificationService from './notification.controller.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: User, attributes: ['id', 'fullName', 'username', 'role'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const user = req.user;
    if (!['SUPPLIER', 'ADMIN', 'FARMER'].includes(user.role)) {
      return res.status(403).json({ message: 'Only suppliers, farmers, and admins can add marketplace products' });
    }

    const { title, description, category, price, unit, region, imageUrl, marketplaceType, productSource } = req.body;
    if (!title || !description || !category || !price) {
      return res.status(400).json({ message: 'Title, description, category and price are required' });
    }

    // Normalize category to backend enum values (case-insensitive)
    const CATEGORY_MAP = {
      seeds: 'SEEDS',
      fertilizers: 'FERTILIZERS',
      tools: 'TOOLS',
      produce: 'PRODUCE',
      equipment: 'EQUIPMENT',
      other: 'OTHER',
    };
    const normalizedCategory = (category || '').toString().trim().toLowerCase();
    const dbCategory = CATEGORY_MAP[normalizedCategory] || 'OTHER';

    // Normalize marketplaceType
    const MARKETPLACE_MAP = {
      market: 'CROP_MARKET',
      crop_market: 'CROP_MARKET',
      cropmarket: 'CROP_MARKET',
      agri: 'AGRI_MARKET',
      agri_market: 'AGRI_MARKET',
      agrimarket: 'AGRI_MARKET',
      CROP_MARKET: 'CROP_MARKET',
      AGRI_MARKET: 'AGRI_MARKET',
    };
    const dbMarketplace = MARKETPLACE_MAP[(marketplaceType || '').toString().trim()] || 'CROP_MARKET';

    // Normalize productSource
    const SOURCE_MAP = { manual: 'MANUAL', sensed: 'SENSED', MANUAL: 'MANUAL', SENSED: 'SENSED' };
    const dbSource = SOURCE_MAP[(productSource || '').toString().trim().toLowerCase()] || 'MANUAL';

    const product = await Product.create({
      userId: user.id,
      title,
      description,
      category: dbCategory,
      price: Number(price),
      unit: unit || 'unit',
      region: region || '',
      imageUrl: imageUrl || '',
      marketplaceType: dbMarketplace,
      productSource: dbSource,
      isVerified: false,
    });

    await OrderTracking.create({
      productId: product.id,
      userId: user.id,
      marketplaceType: product.marketplaceType,
      productSource: product.productSource,
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      unit: product.unit,
      region: product.region,
      imageUrl: product.imageUrl,
      quantity: 1,
      status: product.status,
    });

    await notificationService.notifyUsersOnProductAdded(product, user);

    return res.status(201).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getExpertListings = async (req, res) => {
  try {
    const listings = await ExpertListing.findAll({
      include: [{ model: User, attributes: ['id', 'fullName', 'username', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(listings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createExpertListing = async (req, res) => {
  try {
    const user = req.user;
    if (!['ADMIN','AGRO_EXPERT'].includes(user.role)) {
      return res.status(403).json({ message: 'Only experts and admins can create expert listings' });
    }
    if (user.role === 'AGRO_EXPERT' && !user.isApproved) {
      return res.status(403).json({ message: 'Only approved experts can create expert listings' });
    }

    const { title, specialty, description, hourlyRate, location, imageUrl } = req.body;
    if (!title || !specialty || !description || !hourlyRate) {
      return res.status(400).json({ message: 'Title, specialty, description and hourlyRate are required' });
    }

    const listing = await ExpertListing.create({
      userId: user.id,
      title,
      specialty,
      description,
      hourlyRate: Number(hourlyRate),
      location: location || '',
      imageUrl: imageUrl || '',
      isVerified: true,
    });

    return res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
