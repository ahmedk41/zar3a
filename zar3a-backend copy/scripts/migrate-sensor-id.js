import { Sequelize } from 'sequelize';

const dbUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/zar3a_db';

const sequelize = new Sequelize(dbUrl, {
  dialect: 'mysql',
  logging: console.log,
});

async function migrate() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Altering FarmerProfiles table...');
    
    await sequelize.query('ALTER TABLE FarmerProfiles MODIFY sensorId VARCHAR(255) NULL;');
    console.log('Modified sensorId to be nullable.');

    // Check if column exists
    const [results] = await sequelize.query(`SHOW COLUMNS FROM FarmerProfiles LIKE 'sensorStatus';`);
    if (results.length === 0) {
      await sequelize.query(`ALTER TABLE FarmerProfiles ADD COLUMN sensorStatus VARCHAR(50) DEFAULT 'PENDING';`);
      console.log('Added sensorStatus column.');
    } else {
      console.log('sensorStatus column already exists.');
    }

    console.log('Migration complete.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
