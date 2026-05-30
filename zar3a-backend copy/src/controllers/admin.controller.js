import { Op, fn, col } from 'sequelize';
import { User, Product, Notification } from '../models/index.js';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADMIN CONTROLLER
 * Handles admin-specific operations: user management, role changes, product deletion
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * GET /admin/users
 * Fetch all users with pagination
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (role) where.role = role;
    if (search) {
      const searchTerm = `%${search}%`;
      where = {
        ...where,
        [Op.or]: [
          { fullName: { [Op.like]: searchTerm } },
          { email: { [Op.like]: searchTerm } },
          { username: { [Op.like]: searchTerm } },
        ],
      };
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['passwordHash'] },
    });

    res.status(200).json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
      users: rows,
    });
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /admin/users/:userId
 * Fetch single user details
 */
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error('getUserDetails error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /admin/users/:userId/role
 * Change user role
 * Body: { newRole: 'FARMER' | 'SUPPLIER' | 'BUYER' | 'ADMIN' | 'AGRO_EXPERT' }
 */
export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const validRoles = ['FARMER', 'SUPPLIER', 'BUYER', 'ADMIN', 'AGRO_EXPERT'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing own role to avoid lockout
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const oldRole = user.role;
    await user.update({ role: newRole });

    console.log(`✅ Role changed for user ${user.email}: ${oldRole} → ${newRole}`);

    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('changeUserRole error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /admin/users/:userId
 * Delete a user and all associated data
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const email = user.email;
    await user.destroy();

    console.log(`✅ User deleted: ${email}`);

    res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: email,
    });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /admin/products/:productId
 * Delete a product from any marketplace
 */
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId, {
      include: { model: User, attributes: ['id', 'fullName', 'email', 'role'] },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productTitle = product.title;
    const productOwner = product.User;

    // Mark as deleted instead of hard delete (audit trail)
    await product.update({ status: 'DELETED' });

    // Create notification for the product owner
    await Notification.create({
      userId: productOwner.id,
      productId: product.id,
      type: 'PRODUCT_DELETED',
      title: 'Product Deleted',
      message: `Your product "${productTitle}" has been removed by an administrator.`,
      createdBy: req.user.id,
    });

    console.log(`✅ Product deleted: ${productTitle} (ID: ${productId})`);

    res.status(200).json({
      message: 'Product deleted successfully',
      deletedProduct: {
        id: productId,
        title: productTitle,
        owner: productOwner.email,
      },
    });
  } catch (err) {
    console.error('deleteProduct error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /admin/stats
 * Get admin dashboard statistics
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['role'],
      raw: true,
    });

    let totalProducts = 0;
    let productsByMarketplace = [];
    try {
      totalProducts = await Product.count({ where: { status: 'AVAILABLE' } });
      productsByMarketplace = await Product.findAll({
        attributes: [
          'marketplaceType',
          [fn('COUNT', col('id')), 'count'],
        ],
        where: { status: 'AVAILABLE' },
        group: ['marketplaceType'],
        raw: true,
      });
    } catch (e) {
      // Some DBs may not have the `status` column yet (migrations out-of-sync).
      // Fall back to counting all products and grouping without status filter.
      console.warn('getAdminStats: fallback due to:', e.message || e);
      totalProducts = await Product.count();
      productsByMarketplace = await Product.findAll({
        attributes: [
          'marketplaceType',
          [fn('COUNT', col('id')), 'count'],
        ],
        group: ['marketplaceType'],
        raw: true,
      });
    }

    const deletedUsers = await User.count({ where: { isActive: false } });

    res.status(200).json({
      stats: {
        totalUsers,
        usersByRole,
        totalProducts,
        productsByMarketplace,
        deletedUsers,
      },
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getAllUsers,
  getUserDetails,
  changeUserRole,
  deleteUser,
  deleteProduct,
  getAdminStats,
};


/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SENSOR QUOTE APPROVAL & INSTANT LINKAGE LOGIC
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const approveSensorQuote = async (req, res) => {
  try {
    const { farmerUserId } = req.body;
    
    // 1. Generate a unique IoT Whitelist ID for the physical sensor
    const generatedSensorId = 'ZAR3A-SENS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // 2. Locate the Farmer's Profile
    const farmerProfile = await FarmerProfile.findOne({ where: { userId: farmerUserId } });
    if (!farmerProfile) {
      return res.status(404).json({ message: 'Farmer profile not found.' });
    }

    // 3. Automatically link the Sensor ID for instant activation upon delivery
    await farmerProfile.update({
      sensorId: generatedSensorId,
      sensorStatus: 'WHITELISTED'
    });

    // 4. Notify the Farmer
    await Notification.create({
      userId: farmerUserId,
      type: 'QUOTE_APPROVED',
      title: 'Sensor Quote Approved',
      message: `Your sensor order is approved! Your dedicated Sensor ID (${generatedSensorId}) has been whitelisted to your profile. It will instantly connect when powered on.`,
      createdBy: req.user.id
    });

    return res.status(200).json({ 
      message: 'Quote approved and sensor whitelisted successfully.',
      sensorId: generatedSensorId
    });
  } catch (err) {
    console.error('approveSensorQuote error:', err);
    return res.status(500).json({ message: 'Server error during sensor approval.' });
  }
};
