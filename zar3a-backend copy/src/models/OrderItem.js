import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
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
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  marketplaceType: {
    type: DataTypes.ENUM('CROP_MARKET', 'AGRI_MARKET'),
    defaultValue: 'CROP_MARKET',
  },
  productSource: {
    type: DataTypes.ENUM('MANUAL', 'SENSED'),
    defaultValue: 'MANUAL',
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'SOLD', 'PENDING', 'INQUIRY_PENDING', 'DELETED'),
    defaultValue: 'PENDING',
  },
}, {
  tableName: 'OrderItems',
  timestamps: true,
  underscored: false,
});

export default OrderItem;
