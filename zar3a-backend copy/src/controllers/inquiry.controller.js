import { Notification, User, Product } from '../models/index.js';

export const createInquiry = async (req, res) => {
  try {
    const { productId, message, quantity, location } = req.body;
    const user = req.user;

    if (!['FARMER', 'BUYER'].includes(user.role)) {
      return res.status(403).json({ message: 'Only Farmers and Buyers can request sensor quotes.' });
    }

    const product = await Product.findByPk(productId);
    if (!product || product.marketplaceType !== 'SENSOR_MARKET') {
      return res.status(404).json({ message: 'Sensor product not found.' });
    }

    const admins = await User.findAll({ where: { role: 'ADMIN' } });
    
    const notificationsToCreate = admins.map(admin => ({
      userId: admin.id,
      productId: product.id,
      type: 'QUOTE_REQUEST',
      title: 'New Sensor Quote Request',
      message: `${user.fullName} (${user.role}) requested a quote for ${quantity}x "${product.title}". Location: ${location}. Message: ${message}`,
      createdBy: user.id,
    }));

    if (notificationsToCreate.length > 0) {
      await Notification.bulkCreate(notificationsToCreate);
    }

    return res.status(201).json({ message: 'Quote request submitted successfully. An Admin will contact you shortly.' });
  } catch (err) {
    console.error('createInquiry error:', err);
    return res.status(500).json({ message: 'Server error while submitting quote request.' });
  }
};
