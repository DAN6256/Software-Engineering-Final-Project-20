/**
 * Reminder Model Definition
 *
 * Represents a scheduled reminder for a specific borrow request.
 * Each reminder entry stores the target date/time for the reminder
 * and whether it has been sent.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const BorrowRequest = require('./borrowRequest.model');

const Reminder = sequelize.define('Reminder', {
  // Primary key for the reminder entry
  ReminderID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Foreign key linking this reminder to a specific borrow request
  RequestID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BorrowRequest, // References the BorrowRequest model
      key: 'RequestID'
    }
  },

  // The date and time at which the reminder should be sent
  ReminderDate: {
    type: DataTypes.DATE,
    allowNull: false
  },

  // Flag indicating whether the reminder has already been sent
  Sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  // Disable automatic timestamp fields (createdAt, updatedAt)
  timestamps: false
});

module.exports = Reminder;
