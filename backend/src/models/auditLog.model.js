/**
 * AuditLog Model Definition
 *
 * Represents a record of key user and system actions for traceability.
 * Each log entry includes the user who performed the action, an optional
 * borrow request context, the type of action, descriptive details, and
 * a timestamp indicating when the action occurred.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user.model');

// Define the AuditLog model schema
const AuditLog = sequelize.define('AuditLog', {
  // Primary key for the log entry
  LogID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Foreign key referencing the user who performed the action
  UserID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,       // References the User model
      key: 'UserID'
    }
  },
  // Optional context: which borrow request this log entry relates to
  RequestID: {
    type: DataTypes.INTEGER,
    allowNull: true   // Null if not tied to a specific borrow request
  },
  // Type of action performed
  Action: {
    type: DataTypes.ENUM(
      'Create',       // Record creation
      'Update',       // Record update
      'Delete',       // Record deletion
      'Borrow',       // Equipment borrowed
      'Return',       // Equipment returned
      'Notify',       // Notification sent
      'Approve'       // Borrow request approved
    ),
    allowNull: false
  },
  // Detailed description of the action
  Details: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // Timestamp when the action occurred
  Timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  // Disable Sequelize's automatic createdAt/updatedAt fields
  timestamps: false
});

module.exports = AuditLog;
