/**
 * BorrowedItem Model Definition
 *
 * Represents the relationship between a borrow request and the equipment items
 * included in that request. Each entry records one type of equipment borrowed,
 * the quantity, and optionally any description or serial number details.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const BorrowRequest = require('./borrowRequest.model');
const Equipment = require('./equipment.model');

// Define the BorrowedItem model schema
const BorrowedItem = sequelize.define('BorrowedItem', {
  // Primary key for the borrowed item record
  BorrowedItemID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Foreign key referencing the parent borrow request
  RequestID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BorrowRequest,  // Links to the BorrowRequest model
      key: 'RequestID'
    }
  },
  // Foreign key referencing the specific equipment item
  EquipmentID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Equipment,      // Links to the Equipment model
      key: 'EquipmentID'
    }
  },
  // Optional descriptive notes provided by student or admin
  Description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Optional serial number for tracking specific equipment instances
  SerialNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Quantity of the specified equipment borrowed
  Quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  // Disable automatic timestamp fields (createdAt, updatedAt)
  timestamps: false
});

module.exports = BorrowedItem;
