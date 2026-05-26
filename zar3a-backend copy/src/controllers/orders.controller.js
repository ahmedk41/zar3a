import { Product, OrderTracking, Order, OrderItem, User } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * ─────────────────────────────────────────────────────────
 * CHECKOUT & ORDER CREATION (Main Flow)
 * ─────────────────────────────────────────────────────────
 */
export const createOrder = async (req, res) => {
  try {
    const user = req.user;
    const { productId, quantity = 1, shippingAddress = null, paymentMethod = 'STRIPE' } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const finalQuantity = Number(quantity) || 1;
    if (finalQuantity < 1) return res.status(400).json({ message: 'Quantity must be >= 1' });

    const totalAmount = Number(product.price) * finalQuantity;

    // Create order with PENDING status (will be completed after payment)
    const order = await Order.create({
      userId: user.id,
      status: 'PENDING', // Changed from COMPLETED
      paymentStatus: 'PENDING', // Changed from PAID - will update via Stripe webhook
      totalAmount,
      paymentMethod,
      shippingAddress,
    });

    const orderItem = await OrderItem.create({
      orderId: order.id,
      productId: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      unit: product.unit,
      quantity: finalQuantity,
      totalPrice: totalAmount,
      imageUrl: product.imageUrl,
      marketplaceType: product.marketplaceType,
      productSource: product.productSource,
      region: product.region,
      ownerId: product.userId,
      status: 'AVAILABLE',
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
      quantity: finalQuantity,
      status: 'PENDING',
      type: 'PURCHASE',
      paymentStatus: 'PENDING',
    });

    return res.status(201).json({
      orderId: order.id, // Return for payment processing
      order,
      orderItems: [orderItem],
      message: 'Order created. Proceed to payment.',
      totalAmount,
      paymentMethod,
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkout = async (req, res) => {
  try {
    const user = req.user;
    const { items, shippingAddress = null, paymentMethod = 'STRIPE' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items required' });
    }

    const orderItemsData = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        console.warn(`Product ${item.productId} not found`);
        continue;
      }

      const quantity = Number(item.quantity) || 1;
      if (quantity < 1) continue;

      const itemTotal = Number(product.price) * quantity;
      totalAmount += itemTotal;

      // Validate marketplace type matches
      const expectedMarketplace = item.type === 'crop' ? 'CROP_MARKET' : 'AGRI_MARKET';
      if (product.marketplaceType !== expectedMarketplace) {
        return res.status(400).json({
          message: `Product ${item.productId} is in ${product.marketplaceType}, but type '${item.type}' was specified`,
        });
      }

      orderItemsData.push({
        productId: product.id,
        title: product.title,
        description: product.description,
        category: product.category,
        price: product.price,
        unit: product.unit,
        quantity,
        totalPrice: itemTotal,
        imageUrl: product.imageUrl,
        marketplaceType: product.marketplaceType,
        productSource: product.productSource,
        region: product.region,
        ownerId: product.userId,
        status: 'AVAILABLE',
      });
    }

    if (orderItemsData.length === 0) {
      return res.status(400).json({ message: 'No valid cart items found' });
    }

    // Create order with PAID status (payment validated on frontend via Stripe)
    const order = await Order.create({
      userId: user.id,
      status: 'PROCESSING',
      paymentStatus: 'PAID', // Mark as PAID after successful checkout
      totalAmount,
      paymentMethod,
      shippingAddress,
    });

    const createdOrderItems = await Promise.all(
      orderItemsData.map(async (item) => {
        const created = await OrderItem.create({ orderId: order.id, ...item });

        await OrderTracking.create({
          orderId: order.id,
          productId: item.productId,
          userId: user.id,
          marketplaceType: item.marketplaceType,
          productSource: item.productSource,
          title: item.title,
          description: item.description,
          category: item.category,
          price: item.price,
          unit: item.unit,
          region: item.region,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          status: 'PROCESSING',
          type: 'PURCHASE',
          paymentStatus: 'PAID',
        });

        return created;
      })
    );

    return res.status(201).json({
      message: 'Order created successfully after payment.',
      orderId: order.id,
      totalAmount,
      paymentMethod,
      order,
      orderItems: createdOrderItems,
    });
  } catch (err) {
    console.error('checkout error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const listUserOrders = async (req, res) => {
  try {
    const user = req.user;
    
    let orders;

    // Fetch orders based on role with simplified query
    if (user.role === 'BUYER' || !user.role) {
      // Buyers see all their own orders
      orders = await Order.findAll({
        where: { userId: user.id },
        include: [
          {
            model: OrderItem,
            attributes: ['id', 'orderId', 'productId', 'ownerId', 'title', 'price', 'quantity', 'totalPrice', 'marketplaceType'],
          },
          {
            model: User,
            attributes: ['id', 'fullName', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    } else if (user.role === 'FARMER') {
      // Farmers: Get orders that contain items they own in CROP_MARKET
      orders = await Order.findAll({
        include: [
          {
            model: OrderItem,
            attributes: ['id', 'orderId', 'productId', 'ownerId', 'title', 'price', 'quantity', 'totalPrice', 'marketplaceType'],
            where: {
              ownerId: user.id,
              marketplaceType: 'CROP_MARKET',
            },
          },
          {
            model: User,
            attributes: ['id', 'fullName', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
        subQuery: false,
      });
    } else if (user.role === 'SUPPLIER') {
      // Suppliers: Get orders that contain items they own in AGRI_MARKET
      orders = await Order.findAll({
        include: [
          {
            model: OrderItem,
            attributes: ['id', 'orderId', 'productId', 'ownerId', 'title', 'price', 'quantity', 'totalPrice', 'marketplaceType'],
            where: {
              ownerId: user.id,
              marketplaceType: 'AGRI_MARKET',
            },
          },
          {
            model: User,
            attributes: ['id', 'fullName', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
        subQuery: false,
      });
    } else if (user.role === 'ADMIN') {
      // Admins see everything
      orders = await Order.findAll({
        include: [
          {
            model: OrderItem,
            attributes: ['id', 'orderId', 'productId', 'ownerId', 'title', 'price', 'quantity', 'totalPrice', 'marketplaceType'],
          },
          {
            model: User,
            attributes: ['id', 'fullName', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    } else {
      // Other roles (AGRO_EXPERT) get empty list
      return res.status(200).json({
        count: 0,
        orders: [],
        message: 'Your role does not have access to orders',
      });
    }

    // Filter out orders with no items (edge case)
    const filteredOrders = orders.filter(order => order.OrderItems && order.OrderItems.length > 0);

    res.status(200).json({
      count: filteredOrders.length,
      orders: filteredOrders,
    });
  } catch (err) {
    console.error('listUserOrders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * UPDATE PAYMENT STATUS (Called by Stripe webhook or manually)
 * ─────────────────────────────────────────────────────────
 */
export const updatePaymentStatus = async (req, res, orderId = null, paymentStatus = null) => {
  try {
    // Support both route handler and function call modes
    const finalOrderId = orderId || req.body?.orderId;
    const finalPaymentStatus = paymentStatus || req.body?.paymentStatus;

    const validPaymentStatuses = ['PENDING', 'PAID', 'FAILED'];
    if (!finalPaymentStatus || !validPaymentStatuses.includes(finalPaymentStatus)) {
      return res?.status(400).json?.({
        message: `paymentStatus must be one of: ${validPaymentStatuses.join(', ')}`,
      });
    }

    const order = await Order.findByPk(finalOrderId);
    if (!order) return res?.status(404).json?.({ message: 'Order not found' });

    // Update both payment status and order status
    const newOrderStatus = finalPaymentStatus === 'PAID' ? 'PROCESSING' : 'FAILED';
    await order.update({
      paymentStatus: finalPaymentStatus,
      status: newOrderStatus,
    });

    // Update all tracking records for this order
    await OrderTracking.update(
      { paymentStatus: finalPaymentStatus, status: newOrderStatus },
      { where: { orderId: finalOrderId } }
    ).catch(() => {
      // Silently fail if no tracking records exist
    });

    return res?.json?.({
      message: 'Payment status updated',
      order: order.toJSON(),
    });
  } catch (err) {
    console.error('updatePaymentStatus error:', err);
    return res?.status(500).json?.({ message: 'Server error', error: err.message });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * UPDATE ORDER STATUS (ADMIN ONLY)
 * ─────────────────────────────────────────────────────────
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can update order status' });
    }

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await order.update({ status });

    return res.json({ message: 'Order status updated', order: order.toJSON() });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * GET ORDER BY ID
 * ─────────────────────────────────────────────────────────
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = req.user;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [{ model: Product }],
        },
        { model: User, attributes: ['id', 'fullName', 'email', 'role'] },
      ],
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Verify user owns order or is admin
    if (order.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    return res.json(order);
  } catch (err) {
    console.error('getOrderById error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * ─────────────────────────────────────────────────────────
 * LIST ALL ORDERS (ADMIN ONLY)
 * ─────────────────────────────────────────────────────────
 */
export const listAllOrders = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can list all orders' });
    }

    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [{ model: Product }],
        },
        {
          model: User,
          attributes: ['id', 'fullName', 'email', 'role'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json(orders);
  } catch (err) {
    console.error('listAllOrders error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
