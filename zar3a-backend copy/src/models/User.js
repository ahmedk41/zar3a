import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  passwordHash: {
    type: DataTypes.STRING(255),
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'FARMER', 'BUYER', 'SUPPLIER', 'AGRO_EXPERT'),
    allowNull: true,
  },
  pendingRole: {
    type: DataTypes.ENUM('AGRO_EXPERT'),
    allowNull: true,
  },
  authProvider: {
    type: DataTypes.ENUM('EMAIL', 'GOOGLE'),
    defaultValue: 'EMAIL',
  },
  googleId: {
    type: DataTypes.STRING(255),
    unique: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cv: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export default User;