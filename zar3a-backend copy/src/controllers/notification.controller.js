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

export default {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  notifyUsersOnProductAdded,
};
