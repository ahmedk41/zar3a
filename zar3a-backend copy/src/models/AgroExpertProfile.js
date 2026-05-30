import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AgroExpertProfile = sequelize.define('AgroExpertProfiles', {
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
  academicDegree: {
    type: DataTypes.STRING(255),
  },
  experienceYears: {
    type: DataTypes.INTEGER,
  },
  cvFilePath: {
    type: DataTypes.STRING(255),
  },
  bio: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: false,
});

export default AgroExpertProfile;