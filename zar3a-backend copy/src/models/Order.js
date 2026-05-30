import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'FAILED'),
    defaultValue: 'PENDING',
  },
  paymentStatus: {
    type: DataTypes.ENUM('NONE', 'PENDING', 'PAID', 'FAILED'),
    defaultValue: 'PAID',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  paymentMethod: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'CREDIT_CARD',
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'Orders',
  timestamps: true,
  underscored: false,
});

export default Order;
