import { Sequelize } from 'sequelize';

const localUrl = 'mysql://root:@localhost:3306/zar3a_db';
const remoteUrl = 'mysql://root:YWvPNPxfowhyJXGTCFyoMpjjuXIudpRG@zephyr.proxy.rlwy.net:35402/railway';

async function run() {
  console.log('🔄 Connecting to databases...');
  const localDb = new Sequelize(localUrl, { dialect: 'mysql', logging: false });
  const remoteDb = new Sequelize(remoteUrl, { dialect: 'mysql', logging: false });

  try {
    // Test connections
    await localDb.authenticate();
    console.log('✅ Connected to local database');
    await remoteDb.authenticate();
    console.log('✅ Connected to remote database');

    // Fetch local products
    console.log('📦 Fetching products from local database...');
    const [localProducts] = await localDb.query('SELECT * FROM Products');
    console.log(`ℹ️ Found ${localProducts.length} products locally.`);

    if (localProducts.length === 0) {
      console.log('⚠️ No products found to migrate.');
      return;
    }

    // Disable foreign key checks on remote
    console.log('🔓 Disabling foreign key checks on remote database...');
    await remoteDb.query('SET FOREIGN_KEY_CHECKS = 0');

    // Clear remote Products table
    console.log('🧹 Clearing existing products in remote database...');
    await remoteDb.query('DELETE FROM Products');

    // Insert products
    console.log('📥 Migrating products to remote...');
    for (const prod of localProducts) {
      // Build the insert query dynamically based on product keys
      const columns = Object.keys(prod).join(', ');
      const placeholders = Object.keys(prod).map(() => '?').join(', ');
      const values = Object.values(prod);

      await remoteDb.query(
        `INSERT INTO Products (${columns}) VALUES (${placeholders})`,
        { replacements: values }
      );
    }

    console.log('🔒 Re-enabling foreign key checks...');
    await remoteDb.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    try {
      await remoteDb.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (_) { }
  } finally {
    await localDb.close();
    await remoteDb.close();
  }
}

run();
