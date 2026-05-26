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
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    // ⛔ ROLE-BASED ACCESS CONTROL
    if (user.role === 'BUYER' || user.role === 'AGRO_EXPERT') {
      return res.status(403).json({
        message: `${user.role} users do not have access to Track Orders.`,
      });
    }

    // Base where clause - only PAID orders
    const orderWhere = {
      paymentStatus: 'PAID',
      userId: user.id, // User only sees their own orders
    };

    // Role-based marketplace filtering
    if (user.role === 'FARMER') {
      // Farmers see ONLY CROP_MARKET orders
      orderWhere.marketplaceType = 'CROP_MARKET';
    } else if (user.role === 'SUPPLIER') {
      // Suppliers see ONLY AGRI_MARKET orders
      orderWhere.marketplaceType = 'AGRI_MARKET';
    }
    // Admin sees ALL (no marketplace filter)

    // Fetch orders with their items
    const { count, rows: orders } = await Order.findAndCountAll({
      where: { userId: user.id, paymentStatus: 'PAID' },
      include: [
        {
          model: OrderItem,
          where: user.role !== 'ADMIN' ? { marketplaceType: orderWhere.marketplaceType } : {},
          required: false,
          include: [{ model: Product, attributes: ['id', 'title', 'category', 'price', 'status'] }],
        },
        { model: User, attributes: ['id', 'fullName', 'email', 'role'] },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    // Transform orders into items (flatten OrderItems)
    const items = [];
    const seenIds = new Set(); // Deduplicate items

    orders.forEach((order) => {
      order.OrderItems.forEach((item) => {
        // Skip if this exact item was already processed
        const itemKey = `${item.id}-${item.orderId}`;
        if (seenIds.has(itemKey)) return;
        seenIds.add(itemKey);

        items.push({
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
        });
      });
    });

    res.status(200).json({
      total: items.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(items.length / limit),
      items: items.slice(0, parseInt(limit)),
    });
  } catch (err) {
    console.error('getOrderTracking error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export default {
  getOrderTracking,
};
