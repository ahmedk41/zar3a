import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const VerificationToken = sequelize.define('VerificationToken', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('EMAIL_VERIFY', 'PASSWORD_RESET'),
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

export default VerificationToken;
