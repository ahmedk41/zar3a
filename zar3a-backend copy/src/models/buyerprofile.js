import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BuyerProfile = sequelize.define('BuyerProfile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
  },
  companyName: {
    type: DataTypes.STRING(255),
  },
  businessType: {
    type: DataTypes.STRING(255),
  },
  location: {
    type: DataTypes.STRING(255),
  },
}, {
  timestamps: false,
});

export default BuyerProfile;
