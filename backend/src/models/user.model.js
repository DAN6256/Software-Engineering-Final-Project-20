const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  UserID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  Email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  Role: {
    type: DataTypes.ENUM('Student', 'Admin'),
    allowNull: false
  },
  Password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  major: { 
    type: DataTypes.STRING,
    allowNull: true 
  },
  yearGroup: {
    type: DataTypes.INTEGER,
    allowNull: true 
  }
}, {
  timestamps: false,
  defaultScope: {
    attributes: { exclude: ['Password'] }
  },
});

module.exports = User;
