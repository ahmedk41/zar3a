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
    if (user.role === 'BUYER' || user.role === 'AGRO_EXPERT') {
      return res.status(403).json({ message: 'Access denied for your role' });
    }

    const { page, limit, status, marketplaceType, search } = req.query;

    const limitVal = limit ? parseInt(limit) : null;
    const offsetVal = page && limit ? (parseInt(page) - 1) * limitVal : null;

    // Build filters based on user role
    const prodWhere = {};
    const trackWhere = {
      [Op.or]: [
        { type: 'LISTING' },
        { paymentStatus: 'PAID' }
      ]
    };
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
      ...(limitVal ? { limit: limitVal } : {}),
      ...(offsetVal ? { offset: offsetVal } : {}),
    });

    // Fetch order tracking entries (purchases, inquiries, listings)
    const { rows: trackRows } = await OrderTracking.findAndCountAll({
      where: trackWhere,
      include: [
        {
          model: Product,
          attributes: ['id', 'title', 'category', 'price', 'status', 'userId'],
          include: [{ model: User, attributes: ['id', 'fullName', 'username', 'email'] }],
        },
        { model: User, attributes: ['id', 'fullName', 'email', 'role'] },
      ],
      order: [['createdAt', 'DESC']],
      ...(limitVal ? { limit: limitVal } : {}),
      ...(offsetVal ? { offset: offsetVal } : {}),
    });

    // Fetch order items from real orders
    const orders = await Order.findAll({
      where: orderWhere,
      include: [
        {
          model: OrderItem,
          where: orderItemWhere,
          required: false,
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'category', 'price', 'status', 'userId'],
              include: [{ model: User, attributes: ['id', 'fullName', 'username', 'email'] }],
            },
          ],
        },
        { model: User, attributes: ['id', 'fullName', 'email', 'role'] },
      ],
      order: [['createdAt', 'DESC']],
      ...(limitVal ? { limit: limitVal } : {}),
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

    // Tracking items from OrderTracking (exclude duplicate purchase type, since purchases are fetched from Order/OrderItem tables)
    const trackItems = trackRows
      .filter((t) => t.type !== 'PURCHASE')
      .map((t) => ({
      id: `track-${t.id}`,
      orderId: t.orderId || t.id,
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
      (order.OrderItems || []).map((item) => ({
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
    if (user.role === 'FARMER' || user.role === 'SUPPLIER') {
      filtered = combined.filter((item) => {
        // Must match the marketplace type for Farmer/Supplier
        if (user.role === 'FARMER' && item.marketplaceType !== 'CROP_MARKET') return false;
        if (user.role === 'SUPPLIER' && item.marketplaceType !== 'AGRI_MARKET') return false;

        // Show if it's their own listing
        if (item.type === 'LISTING') {
          return item.User?.id === user.id;
        }

        // Show if it's a purchase they made
        if (item.type === 'PURCHASE') {
          return item.paymentStatus === 'PAID';
        }

        return false;
      });
    }
    // Admin sees everything (no filtering)

    // Deduplicate the combined list by generating a unique key
    const seen = new Set();
    const deduplicated = [];
    for (const item of filtered) {
      const key = item.type === 'LISTING'
        ? `listing-${item.productId}`
        : `purchase-${item.productId}-${item.orderId}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    res.status(200).json({
      total: deduplicated.length,
      page: page ? parseInt(page) : 1,
      limit: limitVal || deduplicated.length,
      pages: limitVal ? Math.ceil(deduplicated.length / limitVal) : 1,
      items: limitVal ? deduplicated.slice(offsetVal, offsetVal + limitVal) : deduplicated,
    });
  } catch (err) {
    console.error('getOrderTracking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export default {
  getOrderTracking,
};
