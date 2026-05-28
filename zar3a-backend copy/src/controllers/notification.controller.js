import { Notification, User, Product } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NOTIFICATION CONTROLLER
 * Handles notification creation, retrieval, and management
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * POST /notifications
 * Internal: Create notification (called when product is added)
 * Body: { userId, productId, type, title, message }
 */
export const createNotification = async (req, res) => {
  try {
    const { userId, productId, type = 'PRODUCT_ADDED', title, message } = req.body;

    const notification = await Notification.create({
      userId,
      productId,
      type,
      title,
      message,
      createdBy: req.user?.id || null,
    });

    res.status(201).json({
      message: 'Notification created',
      notification,
    });
  } catch (err) {
    console.error('createNotification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /notifications
 * Get all notifications for current user
 * Query: { page, limit, unreadOnly }
 */
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    let where = { userId: req.user.id };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['id', 'fullName', 'email'] },
        { model: Product, attributes: ['id', 'title', 'category', 'price'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
      notifications: rows,
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PUT /notifications/:notificationId/read
 * Mark notification as read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await notification.update({ isRead: true });

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('markNotificationAsRead error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PUT /notifications/read-all
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('markAllNotificationsAsRead error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /notifications/:notificationId
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await notification.destroy();

    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('deleteNotification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /notifications/unread-count
 * Get unread notification count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.status(200).json({ unreadCount });
  } catch (err) {
    console.error('getUnreadCount error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * INTERNAL: Notify farmers and suppliers when a product is added
 */
export const notifyUsersOnProductAdded = async (product, addedByUser) => {
  try {
    // Get all farmers and suppliers
    const farmersAndSuppliers = await User.findAll({
      where: {
        role: { [Op.in]: ['FARMER', 'SUPPLIER'] },
        id: { [Op.ne]: addedByUser.id }, // Exclude the user who added the product
      },
    });

    // Create notifications for each farmer and supplier
    const notifications = farmersAndSuppliers.map((user) => ({
      userId: user.id,
      productId: product.id,
      type: 'PRODUCT_ADDED',
      title: `New ${product.marketplaceType === 'AGRI_MARKET' ? 'Agricultural Product' : 'Crop'} Available`,
      message: `${addedByUser.fullName} added a new product: "${product.title}" for ${product.price} (${product.unit})`,
      createdBy: addedByUser.id,
    }));

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
      console.log(`✅ Notified ${notifications.length} users about new product: ${product.title}`);
    }
  } catch (err) {
    console.error('notifyUsersOnProductAdded error:', err);
  }
};

export const triggerOrderNotifications = async (order, items) => {
  try {
    // Convert Sequelize instances to plain objects if needed
    const plainItems = items.map(item => 
      typeof item.get === 'function' ? item.get({ plain: true }) : item
    );

    const hasCrop = plainItems.some(item => item.marketplaceType === 'CROP_MARKET');
    const hasAgri = plainItems.some(item => item.marketplaceType === 'AGRI_MARKET');

    const totalQty = plainItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const cropQty = plainItems.filter(item => item.marketplaceType === 'CROP_MARKET').reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const agriQty = plainItems.filter(item => item.marketplaceType === 'AGRI_MARKET').reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

    const notificationsToCreate = [];

    // 1. Purchaser (Buyer) notification
    const itemsListStr = plainItems.map(item => `${item.title} (x${item.quantity})`).join(', ');
    notificationsToCreate.push({
      userId: order.userId,
      orderId: order.id,
      type: 'order',
      title: 'Order Placed Successfully',
      message: `Your order has been successfully placed. Order ID: ${order.id}. Items: ${itemsListStr}.`,
      quantity: totalQty,
      isRead: false
    });

    // 2. Admin notifications
    const admins = await User.findAll({ where: { role: 'ADMIN' } });
    admins.forEach(admin => {
      notificationsToCreate.push({
        userId: admin.id,
        orderId: order.id,
        type: 'order',
        title: 'New Marketplace Order',
        message: 'New order has been placed in the marketplace.',
        quantity: totalQty,
        isRead: false
      });
    });

    // 3. Farmer notifications (if crop items are purchased)
    if (hasCrop) {
      const farmers = await User.findAll({ where: { role: 'FARMER' } });
      farmers.forEach(farmer => {
        notificationsToCreate.push({
          userId: farmer.id,
          orderId: order.id,
          type: 'order',
          title: 'New Crop Order Placed',
          message: 'New Crop Market order has been placed.',
          quantity: cropQty,
          isRead: false
        });
      });
    }

    // 4. Supplier notifications (if agri items are purchased)
    if (hasAgri) {
      const suppliers = await User.findAll({ where: { role: 'SUPPLIER' } });
      suppliers.forEach(supplier => {
        notificationsToCreate.push({
          userId: supplier.id,
          orderId: order.id,
          type: 'order',
          title: 'New Agri Order Placed',
          message: 'New Agri Shop order has been placed.',
          quantity: agriQty,
          isRead: false
        });
      });
    }

    // Deduplicate by recipient userId so each user gets exactly one notification per order
    const uniqueNotifications = [];
    const seenUserIds = new Set();

    // First priority: Buyer notification
    notificationsToCreate.filter(n => n.userId === order.userId).forEach(n => {
      if (!seenUserIds.has(n.userId)) {
        seenUserIds.add(n.userId);
        uniqueNotifications.push(n);
      }
    });

    // Second priority: Farmers / Suppliers
    notificationsToCreate.filter(n => n.userId !== order.userId && (n.title.includes('Crop') || n.title.includes('Agri'))).forEach(n => {
      if (!seenUserIds.has(n.userId)) {
        seenUserIds.add(n.userId);
        uniqueNotifications.push(n);
      }
    });

    // Third priority: Admins
    notificationsToCreate.filter(n => !seenUserIds.has(n.userId)).forEach(n => {
      seenUserIds.add(n.userId);
      uniqueNotifications.push(n);
    });

    if (uniqueNotifications.length > 0) {
      await Notification.bulkCreate(uniqueNotifications);
      console.log(`✅ Dispatched ${uniqueNotifications.length} order notifications for Order #${order.id}`);
    }
  } catch (err) {
    console.error('triggerOrderNotifications error:', err);
  }
};

export default {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  notifyUsersOnProductAdded,
  triggerOrderNotifications,
};
