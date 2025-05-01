/**
 * Equipment Model Definition
 *
 * Represents an item in the FabTrack inventory. Each equipment record
 * has a unique identifier and a required name. This model does not
 * include quantity tracking, as only the number borrowed is recorded
 * elsewhere.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Equipment = sequelize.define('Equipment', {
  // Primary key, auto-incrementing integer
  EquipmentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Human-readable name of the equipment item
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Disable automatic timestamps (createdAt, updatedAt)
  timestamps: false
});

module.exports = Equipment;
