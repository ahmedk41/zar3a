import { Product, ExpertListing, User, AgroExpertProfile, OrderTracking, Order, OrderItem, ProductReview } from '../models/index.js';
import notificationService from './notification.controller.js';

/**
 * ─────────────────────────────────────────────────────────
 * CROP MARKET ENDPOINTS
 * (for FARMER role only)
 * ─────────────────────────────────────────────────────────
 */

export const getCropMarketProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { marketplaceType: 'CROP_MARKET' },
      include: [{ model: User, attributes: ['id', 'fullName', 'username', 'role'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createCropMarketProduct = async (req, res) => {
  try {
    const user = req.user;

    // Enforce role: only FARMER can add to crop market
    if (user.role !== 'FARMER' && user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Only farmers can add products to Crop Market. Your role is: ' + user.role,
      });
    }

    const { title, description, category, price, unit, region, imageUrl, productSource } =
      req.body;

    if (!title || !description || !category || !price) {
      return res.status(400).json({
        message: 'Title, description, category and price are required',
      });
    }

    let finalImageUrl = imageUrl || '';
    if (req.file) {
      finalImageUrl = `/uploads/products/${req.file.filename}`;
    }

    // Normalize category
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
      imageUrl: finalImageUrl,
      marketplaceType: 'CROP_MARKET', // ← ALWAYS crop market for this endpoint
      productSource: dbSource,
      isVerified: false,
    });

    // Create tracking record
    await OrderTracking.create({
      productId: product.id,
      userId: user.id,
      marketplaceType: 'CROP_MARKET',
      productSource: dbSource,
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

    return res.status(201).json({
      ...product.toJSON(),
      message: 'Crop market product added successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * AGRI SHOP ENDPOINTS
 * (for SUPPLIER role only)
 * ─────────────────────────────────────────────────────────
 */

export const getAgriShopProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { marketplaceType: 'AGRI_MARKET' },
      include: [{ model: User, attributes: ['id', 'fullName', 'username', 'role'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createAgriShopProduct = async (req, res) => {
  try {
    const user = req.user;

    // Enforce role: only SUPPLIER can add to agri shop
    if (user.role !== 'SUPPLIER' && user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Only suppliers can add products to Agri Shop. Your role is: ' + user.role,
      });
    }

    const { title, description, category, price, unit, region, imageUrl, productSource } =
      req.body;

    if (!title || !description || !category || !price) {
      return res.status(400).json({
        message: 'Title, description, category and price are required',
      });
    }

    let finalImageUrl = imageUrl || '';
    if (req.file) {
      finalImageUrl = `/uploads/products/${req.file.filename}`;
    }

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
      imageUrl: finalImageUrl,
      marketplaceType: 'AGRI_MARKET', // ← ALWAYS agri market for this endpoint
      productSource: dbSource,
      isVerified: false,
    });

    // Create tracking record
    await OrderTracking.create({
      productId: product.id,
      userId: user.id,
      marketplaceType: 'AGRI_MARKET',
      productSource: dbSource,
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

    return res.status(201).json({
      ...product.toJSON(),
      message: 'Agri shop product added successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * EXPERT LISTINGS (unchanged)
 * ─────────────────────────────────────────────────────────
 */

export const getExpertListings = async (req, res) => {
  try {
    // Only show APPROVED experts
    const listings = await ExpertListing.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'username', 'email', 'isApproved'],
          where: { isApproved: true, role: ['AGRO_EXPERT', 'ADMIN'] },
          include: [
            {
              model: AgroExpertProfile,
              attributes: ['academicDegree', 'experienceYears', 'cvFilePath', 'bio'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const formattedListings = listings.map((l) => {
      const data = l.toJSON ? l.toJSON() : l;
      return {
        ...data,
        name: data.User?.fullName || data.User?.username || 'Expert',
        specialization: data.specialty,
        academicDegree: data.User?.AgroExpertProfile?.academicDegree || '',
        experienceYears: data.User?.AgroExpertProfile?.experienceYears || 0,
      };
    });

    return res.json(formattedListings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createExpertListing = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'AGRO_EXPERT' && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only experts can create expert listings' });
    }

    // Enforce: expert must be APPROVED to list
    if (user.role === 'AGRO_EXPERT' && !user.isApproved) {
      return res
        .status(403)
        .json({ message: 'Expert must be approved before creating listings' });
    }

    // Enforce: expert must have uploaded CV
    // const expertProfile = await user.getExpertProfile?.();
    // if (!expertProfile?.cvFilePath) {
    //   return res.status(403).json({
    //     message: 'CV upload is required before creating expert listings',
    //   });
    // }

    const { title, specialty, description, hourlyRate, location, imageUrl } = req.body;

    if (!title || !specialty || !description || !hourlyRate) {
      return res.status(400).json({
        message: 'Title, specialty, description and hourlyRate are required',
      });
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
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * PRODUCT SEARCH (gets both marketplaces)
 * ─────────────────────────────────────────────────────────
 */

export const searchProducts = async (req, res) => {
  try {
    const { q, marketplace, category } = req.query;
    const where = {};

    if (marketplace === 'crop') where.marketplaceType = 'CROP_MARKET';
    if (marketplace === 'agri') where.marketplaceType = 'AGRI_MARKET';
    if (category) where.category = category.toUpperCase();

    if (q) {
      where.$or = [
        sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', `%${q.toLowerCase()}%`),
        sequelize.where(sequelize.fn('LOWER', sequelize.col('description')), 'LIKE', `%${q.toLowerCase()}%`),
      ];
    }

    const products = await Product.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'fullName', 'username', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId, {
      include: [{ model: User, attributes: ['id', 'fullName', 'username', 'role'] }],
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Admin can delete ANY product
    if (user.role === 'ADMIN') {
      await product.destroy();
      return res.json({ message: 'Product deleted successfully by Admin' });
    }

    // Farmer can delete ONLY crop products
    if (user.role === 'FARMER') {
      if (product.marketplaceType !== 'CROP_MARKET') {
        return res.status(403).json({ message: 'Farmers can only delete crop products' });
      }
      await product.destroy();
      return res.json({ message: 'Product deleted successfully' });
    }

    // Supplier can delete ONLY agri products
    if (user.role === 'SUPPLIER') {
      if (product.marketplaceType !== 'AGRI_MARKET') {
        return res.status(403).json({ message: 'Suppliers can only delete agri products' });
      }
      await product.destroy();
      return res.json({ message: 'Product deleted successfully' });
    }

    return res.status(403).json({ message: 'Unauthorized to delete this product' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PUT /marketplace/products/:productId
 * Edit / Update an existing product
 */
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;
    const { title, description, category, price, unit, region, imageUrl, productSource, status } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Owner check or Admin check
    if (product.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized to update this product' });
    }

    let finalImageUrl = product.imageUrl;
    if (req.file) {
      finalImageUrl = `/uploads/products/${req.file.filename}`;
    } else if (imageUrl !== undefined) {
      finalImageUrl = imageUrl;
    }

    const CATEGORY_MAP = {
      seeds: 'SEEDS',
      fertilizers: 'FERTILIZERS',
      tools: 'TOOLS',
      produce: 'PRODUCE',
      equipment: 'EQUIPMENT',
      other: 'OTHER',
      SEEDS: 'SEEDS',
      FERTILIZERS: 'FERTILIZERS',
      TOOLS: 'TOOLS',
      PRODUCE: 'PRODUCE',
      EQUIPMENT: 'EQUIPMENT',
      OTHER: 'OTHER',
    };

    let dbCategory = product.category;
    if (category) {
      dbCategory = CATEGORY_MAP[category.toString().trim()] || CATEGORY_MAP[category.toString().trim().toLowerCase()] || 'OTHER';
    }

    await product.update({
      title: title !== undefined ? title : product.title,
      description: description !== undefined ? description : product.description,
      category: dbCategory,
      price: price !== undefined ? Number(price) : product.price,
      unit: unit !== undefined ? unit : product.unit,
      region: region !== undefined ? region : product.region,
      imageUrl: finalImageUrl,
      productSource: productSource !== undefined ? productSource : product.productSource,
      status: status !== undefined ? status : product.status,
    });

    const updated = await Product.findByPk(productId, {
      include: [{ model: User, attributes: ['id', 'fullName', 'username', 'role'] }]
    });

    return res.json({
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * POST /marketplace/products/:productId/reviews
 * Create a new review for a product
 */
export const createProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existing = await ProductReview.findOne({ where: { userId, productId } });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this product. You can edit your existing review.' });
    }

    const review = await ProductReview.create({
      userId,
      productId,
      rating: numRating,
      comment,
    });

    const populated = await ProductReview.findByPk(review.id, {
      include: [{ model: User, attributes: ['id', 'fullName', 'username'] }]
    });

    return res.status(201).json({
      message: 'Review submitted successfully',
      review: populated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /marketplace/products/:productId/reviews
 * Get all reviews for a product
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await ProductReview.findAll({
      where: { productId },
      include: [{ model: User, attributes: ['id', 'fullName', 'username'] }],
      order: [['createdAt', 'DESC']],
    });

    let totalRating = 0;
    reviews.forEach(r => totalRating += r.rating);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    return res.json({
      reviews,
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PUT /marketplace/products/:productId/reviews/:reviewId
 * Edit an existing review
 */
export const updateProductReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const review = await ProductReview.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to edit this review' });
    }

    const updateData = {};
    if (rating !== undefined) {
      const numRating = parseInt(rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      updateData.rating = numRating;
    }
    if (comment !== undefined) {
      updateData.comment = comment;
    }

    await review.update(updateData);

    const populated = await ProductReview.findByPk(review.id, {
      include: [{ model: User, attributes: ['id', 'fullName', 'username'] }]
    });

    return res.json({
      message: 'Review updated successfully',
      review: populated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /marketplace/products/:productId/reviews/:reviewId
 * Delete a review (owner or Admin)
 */
export const deleteProductReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user = req.user;

    const review = await ProductReview.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized to delete this review' });
    }

    await review.destroy();
    return res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

