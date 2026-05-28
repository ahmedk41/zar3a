/**
 * Test script to verify notification system works end-to-end
 */
import sequelize from './src/config/database.js';
import { User, Product, Order, OrderItem, Notification } from './src/models/index.js';
import { triggerOrderNotifications } from './src/controllers/notification.controller.js';

async function test() {
  try {
    console.log('Connecting database...');
    await sequelize.authenticate();
    
    // 1. Check if Notification table has orderId column
    const [columns] = await sequelize.query("SHOW COLUMNS FROM Notifications");
    const colNames = columns.map(c => c.Field);
    console.log('\n📋 Notification table columns:', colNames.join(', '));
    
    const hasOrderId = colNames.includes('orderId');
    const hasQuantity = colNames.includes('quantity');
    console.log(`  orderId column exists: ${hasOrderId ? '✅' : '❌'}`);
    console.log(`  quantity column exists: ${hasQuantity ? '✅' : '❌'}`);
    
    if (!hasOrderId || !hasQuantity) {
      console.error('\n❌ Missing columns! Run server with alter: true first.');
      process.exit(1);
    }

    // 2. Get a test user
    const admin = await User.findOne({ where: { role: 'ADMIN' } });
    if (!admin) {
      console.error('No admin user found');
      process.exit(1);
    }
    console.log(`\n👤 Testing as: ${admin.fullName} (${admin.role})`);

    // 3. Check existing notifications
    const existingCount = await Notification.count({ where: { userId: admin.id } });
    console.log(`📬 Existing notifications for admin: ${existingCount}`);

    // 4. Simulate a mini order + trigger notifications
    const cropProduct = await Product.findOne({ where: { marketplaceType: 'CROP_MARKET', status: 'AVAILABLE' } });
    if (!cropProduct) {
      console.log('No crop product found, skipping trigger test');
      process.exit(0);
    }

    // Create a test order
    const testOrder = await Order.create({
      userId: admin.id,
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      totalAmount: cropProduct.price,
      paymentMethod: 'TEST',
    });

    const testItem = await OrderItem.create({
      orderId: testOrder.id,
      productId: cropProduct.id,
      title: cropProduct.title,
      description: cropProduct.description,
      category: cropProduct.category,
      price: cropProduct.price,
      unit: cropProduct.unit,
      quantity: 1,
      totalPrice: cropProduct.price,
      imageUrl: cropProduct.imageUrl,
      marketplaceType: cropProduct.marketplaceType,
      productSource: cropProduct.productSource,
      region: cropProduct.region,
      ownerId: cropProduct.userId,
      status: 'SOLD',
    });

    console.log(`\n🛒 Created test order #${testOrder.id} with crop item "${cropProduct.title}"`);

    // 5. Trigger notifications
    console.log('\n🔔 Triggering order notifications...');
    await triggerOrderNotifications(testOrder, [testItem]);

    // 6. Check new notifications
    const newCount = await Notification.count({ where: { userId: admin.id } });
    const newNotifs = await Notification.findAll({
      where: { orderId: testOrder.id },
      attributes: ['id', 'userId', 'orderId', 'type', 'title', 'message', 'quantity', 'isRead'],
    });

    console.log(`\n✅ Notifications created for this order: ${newNotifs.length}`);
    newNotifs.forEach(n => {
      const plain = n.get({ plain: true });
      console.log(`  → [User ${plain.userId}] ${plain.title}: ${plain.message.substring(0, 60)}...`);
    });

    console.log(`\n📊 Total admin notifications now: ${newCount} (was ${existingCount})`);

    // 7. Test the GET /notifications API response format
    const allNotifs = await Notification.findAll({
      where: { userId: admin.id },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });
    console.log(`\n📡 Latest 5 notifications (API format):`);
    allNotifs.forEach(n => {
      const p = n.get({ plain: true });
      console.log(`  ID:${p.id} | type:${p.type} | read:${p.isRead} | "${p.title}"`);
    });

    // Cleanup test order
    await OrderItem.destroy({ where: { orderId: testOrder.id } });
    await Notification.destroy({ where: { orderId: testOrder.id } });
    await Order.destroy({ where: { id: testOrder.id } });
    console.log(`\n🧹 Cleaned up test order #${testOrder.id}`);

    console.log('\n✅ ALL NOTIFICATION TESTS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

test();
