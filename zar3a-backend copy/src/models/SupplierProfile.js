import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SupplierProfile = sequelize.define('SupplierProfile', {
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
  tradeLicense: {
    type: DataTypes.STRING(255),
  },
  location: {
    type: DataTypes.STRING(255),
  },
}, {
  timestamps: false,
});

export default SupplierProfile;