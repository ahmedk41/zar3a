import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  category: {
    type: DataTypes.ENUM(
      'SEEDS',
      'FERTILIZERS',
      'TOOLS',
      'PRODUCE',
      'EQUIPMENT',
      'OTHER'
    ),
    allowNull: true,
    defaultValue: 'OTHER',
  },

  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },

  region: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  },

  marketplaceType: {
    type: DataTypes.ENUM('CROP_MARKET', 'AGRI_MARKET'),
    defaultValue: 'CROP_MARKET',
  },

  productSource: {
    type: DataTypes.ENUM('MANUAL', 'SENSED'),
    defaultValue: 'MANUAL',
  },

  status: {
    type: DataTypes.ENUM('AVAILABLE', 'SOLD', 'DELETED'),
    defaultValue: 'AVAILABLE',
  },

  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }

}, {
  tableName: 'Products',
  timestamps: true,
});

export default Product;