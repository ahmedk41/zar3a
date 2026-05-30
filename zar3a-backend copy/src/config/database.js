import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';

if (dbUrl && !dbUrl.startsWith('mysql://') && !dbUrl.startsWith('mysqlx://')) {
  console.error('\n❌ ERROR: DATABASE_URL must start with "mysql://" protocol!');
  console.error('Current value:', dbUrl);
  console.error('Please make sure you copy the "Connection URL" (MYSQL_URL) from Railway, which starts with mysql://\n');
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export default sequelize;