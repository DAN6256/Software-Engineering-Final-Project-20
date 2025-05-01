/**
 * BorrowRequest Model Definition
 *
 * Represents a student's request to borrow one or more equipment items.
 * Includes references to the requesting user, timestamps for borrowing,
 * optional collection and return dates, and the current status of the request.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user.model');

const BorrowRequest = sequelize.define('BorrowRequest', {
  // Primary key for each borrow request
  RequestID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Foreign key referencing the User who made the request
  UserID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,     // Links to the User model
      key: 'UserID'
    }
  },

  // Timestamp when the request was created/borrowed
  BorrowDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

  // Current status of the request in its lifecycle
  Status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Returned', 'Overdue'),
    allowNull: false,
    defaultValue: 'Pending'
  },

  // Date by which the borrowed items should be returned
  ReturnDate: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // Creation timestamp (duplicate of BorrowDate if needed separately)
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  // Optional date/time when the user will collect the items
  CollectionDateTime: { 
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  // Disable Sequelize's automatic createdAt and updatedAt columns
  timestamps: false
});

module.exports = BorrowRequest;
