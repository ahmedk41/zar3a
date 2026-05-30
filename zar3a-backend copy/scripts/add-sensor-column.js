import { sequelize } from '../src/models/index.js';

async function migrate() {
  try {
    console.log("Adding sensorId column to FarmerProfiles...");
    await sequelize.query('ALTER TABLE FarmerProfiles ADD COLUMN sensorId VARCHAR(255) UNIQUE;');
    console.log("✅ Column added successfully!");
  } catch (err) {
    if (err.message.includes("Duplicate column name")) {
      console.log("ℹ️ Column sensorId already exists.");
    } else {
      console.error("❌ Migration failed:", err.message);
    }
  } finally {
    await sequelize.close();
    process.exit();
  }
}

migrate();
