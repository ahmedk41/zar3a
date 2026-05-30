import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * ChatMessage Model
 * Stores persistent specialist chat messages
 */
const ChatMessage = sequelize.define(
  'ChatMessages',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachmentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'ChatMessages',
    timestamps: true,
    underscored: false,
  }
);

export default ChatMessage;
