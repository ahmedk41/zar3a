import { Op } from 'sequelize';
import { OrderTracking, Product, User, Order, OrderItem } from '../models/index.js';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TRACKING CONTROLLER
 * Provides a unified order/product tracking feed for dashboard views
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const getOrderTracking = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 20, status, marketplaceType, search } = req.query;
    const offset = (page - 1) * limit;

    // Build filters based on user role
    const prodWhere = {};
    const trackWhere = { paymentStatus: 'PAID' }; // Only show paid orders
    const orderItemWhere = {};
    const orderWhere = { paymentStatus: 'PAID' }; // Only show paid orders

    // Apply role-based marketplace filtering
    if (user.role === 'FARMER') {
      // Farmers only see CROP_MARKET items they purchased
      prodWhere.marketplaceType = 'CROP_MARKET';
      trackWhere.marketplaceType = 'CROP_MARKET';
      orderItemWhere.marketplaceType = 'CROP_MARKET';
    } else if (user.role === 'SUPPLIER') {
      // Suppliers only see AGRI_MARKET items they purchased
      prodWhere.marketplaceType = 'AGRI_MARKET';
      trackWhere.marketplaceType = 'AGRI_MARKET';
      orderItemWhere.marketplaceType = 'AGRI_MARKET';
    }
    // Admin sees everything (no marketplace filter)

    // Apply search and status filters
    if (marketplaceType && user.role === 'ADMIN') {
      // Admin can filter by marketplace type if specified
      prodWhere.marketplaceType = marketplaceType;
      trackWhere.marketplaceType = marketplaceType;
      orderItemWhere.marketplaceType = marketplaceType;
    }
    if (search) {
      prodWhere.title = { [Op.like]: `%${search}%` };
      trackWhere.title = { [Op.like]: `%${search}%` };
      orderItemWhere.title = { [Op.like]: `%${search}%` };
    }
    if (status) {
      trackWhere.status = status;
      orderWhere.status = status;
    }

    // Fetch products (listings) - manual & sensed
    const products = await Product.findAll({
      where: prodWhere,
      include: [{ model: User, attributes: ['id', 'fullName', 'username', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    // Fetch order tracking entries (purchases, inquiries, listings)
    const { rows: trackRows } = await OrderTracking.findAndCountAll({
      where: trackWhere,
      include: [
        { model: Product, attributes: ['id', 'title', 'category', 'price', 'status'] },
        { model: User, attributes: ['id', 'fullName', 'email', 'role'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    // Fetch order items from real orders
    const orders = await Order.findAll({
      where: orderWhere,
      include: [
        {
          model: OrderItem,
          where: orderItemWhere,
          required: false,
          include: [{ model: Product, attributes: ['id', 'title', 'category', 'price', 'status'] }],
        },
        { model: User, attributes: ['id', 'fullName', 'email', 'role'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Normalize products as tracking items (type: LISTING)
    const productItems = products.map((p) => ({
      id: `prod-${p.id}`,
      productId: p.id,
      type: 'LISTING',
      title: p.title,
      description: p.description,
      category: p.category,
      price: p.price,
      unit: p.unit,
      region: p.region,
      imageUrl: p.imageUrl,
      marketplaceType: p.marketplaceType,
      productSource: p.productSource,
      status: p.status,
      paymentStatus: 'NONE',
      User: p.User,
      createdAt: p.createdAt,
    }));

    // Tracking items from OrderTracking
    const trackItems = trackRows.map((t) => ({
      id: `track-${t.id}`,
      orderId: t.id,
      productId: t.productId,
      type: t.type,
      title: t.title,
      description: t.description,
      category: t.category,
      price: t.price,
      unit: t.unit,
      region: t.region,
      imageUrl: t.imageUrl,
      marketplaceType: t.marketplaceType,
      productSource: t.productSource,
      status: t.status,
      paymentStatus: t.paymentStatus || 'NONE',
      quantity: t.quantity,
      User: t.User,
      Product: t.Product,
      createdAt: t.createdAt,
    }));

    // Order items from new orders
    const orderItems = orders.flatMap((order) =>
      order.OrderItems.map((item) => ({
        id: `orderitem-${item.id}`,
        orderId: order.id,
        productId: item.productId,
        type: 'PURCHASE',
        title: item.title,
        description: item.description,
        category: item.category,
        price: item.price,
        unit: item.unit,
        region: item.region,
        imageUrl: item.imageUrl,
        marketplaceType: item.marketplaceType,
        productSource: item.productSource,
        status: order.status,
        paymentStatus: order.paymentStatus,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        User: order.User,
        Product: item.Product,
        createdAt: item.createdAt,
      }))
    );

    // Combine and sort by createdAt desc
    const combined = [...productItems, ...trackItems, ...orderItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Filter based on user role
    let filtered = combined;
    if (user.role === 'FARMER' || user.role === 'SUPPLIER' || user.role === 'BUYER') {
      // Regular users only see their own purchases (PURCHASE and INQUIRY types with paid status)
      filtered = combined.filter(
        (item) =>
          item.type === 'PURCHASE' &&
          item.paymentStatus === 'PAID' &&
          item.marketplaceType &&
          (user.role === 'FARMER' ? item.marketplaceType === 'CROP_MARKET' : item.marketplaceType === 'AGRI_MARKET')
      );
    }
    // Admin sees everything (no filtering)

    res.status(200).json({
      total: filtered.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(filtered.length / limit),
      items: filtered.slice(offset, offset + parseInt(limit)),
    });
  } catch (err) {
    console.error('getOrderTracking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getOrderTracking,
};
