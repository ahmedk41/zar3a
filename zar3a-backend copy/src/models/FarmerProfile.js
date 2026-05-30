import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FarmerProfile = sequelize.define('FarmerProfile', {
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
  sensorId: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
  },
  farmSize: {
    type: DataTypes.STRING(255),
  },
  soilType: {
    type: DataTypes.STRING(255),
  },
  location: {
    type: DataTypes.STRING(255),
  },
}, {
  timestamps: false,
});

export default FarmerProfile;