import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * OrderTracking Model
 * Tracks all products (both manually added and sensed)
 * Aggregates products from all marketplaces
 */
const OrderTracking = sequelize.define(
  'OrderTracking',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    marketplaceType: {
      type: DataTypes.ENUM('CROP_MARKET', 'AGRI_MARKET'),
      defaultValue: 'CROP_MARKET',
    },
    productSource: {
      type: DataTypes.ENUM('MANUAL', 'SENSED'),
      defaultValue: 'MANUAL',
    },
    // Type of tracking entry: listing (product added), purchase, inquiry
    type: {
      type: DataTypes.ENUM('LISTING', 'PURCHASE', 'INQUIRY'),
      defaultValue: 'LISTING',
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
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'SOLD', 'PENDING', 'INQUIRY_PENDING', 'DELETED'),
      defaultValue: 'AVAILABLE',
    },
    // Payment status for purchases
    paymentStatus: {
      type: DataTypes.ENUM('NONE', 'PENDING', 'PAID', 'FAILED'),
      defaultValue: 'PAID',
    },
  },
  {
    tableName: 'OrderTracking',
    timestamps: true,
    underscored: false,
  }
);

export default OrderTracking;
