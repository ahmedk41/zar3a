import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Notification Model
 * Stores notifications for users when products are added
 */
const Notification = sequelize.define(
  'Notification',
  {
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Products',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('PRODUCT_ADDED', 'PRODUCT_DELETED', 'ORDER_STATUS', 'SYSTEM'),
      defaultValue: 'PRODUCT_ADDED',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'Notifications',
    timestamps: true,
    underscored: false,
  }
);

export default Notification;
