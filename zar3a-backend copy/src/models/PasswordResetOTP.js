import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * PasswordResetOTP Model
 * Stores OTP for password reset flow with expiration and verification state
 */
const PasswordResetOTP = sequelize.define('PasswordResetOTP', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Email to which OTP was sent (may differ from user email)',
  },
  otp: {
    type: DataTypes.STRING(255), // Stored as hashed
    allowNull: false,
    comment: 'Hashed 6-digit OTP for security',
  },
  otpAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Track failed OTP verification attempts',
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Flag to mark OTP as verified (next step: reset password)',
  },
  verificationToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    comment: 'Temporary token issued after OTP verification (used for reset-password endpoint)',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'OTP expiration time (5-10 minutes)',
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
  indexes: [
    { fields: ['userId'] },
    { fields: ['email'] },
    { fields: ['verificationToken'] },
  ],
});

export default PasswordResetOTP;
