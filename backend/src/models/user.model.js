/**
 * User Model Definition
 *
 * Represents a registered user of the FabTrack system.
 * Stores personal details, login credentials (hashed password),
 * and role information for access control.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  // Primary key: auto-incrementing integer identifier
  UserID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Full name of the user
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Unique email address used for login
  Email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true  // Validates correct email format
    }
  },

  // Role of the user, either 'Student' or 'Admin'
  Role: {
    type: DataTypes.ENUM('Student', 'Admin'),
    allowNull: false
  },

  // Hashed password for authentication
  Password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Optional academic major for student users
  major: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Optional year group (e.g., 2025) for student users
  yearGroup: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  // Disable Sequelize's automatic createdAt/updatedAt columns
  timestamps: false,

  // Exclude the Password field from default query results
  defaultScope: {
    attributes: { exclude: ['Password'] }
  }
});

module.exports = User;
