/**
 * Model Associations Setup
 *
 * Defines the relationships between all Sequelize models:
 * - User ↔ BorrowRequest
 * - BorrowRequest ↔ BorrowedItem
 * - Equipment ↔ BorrowedItem
 * - BorrowRequest ↔ Reminder
 * - User ↔ AuditLog
 * - BorrowRequest ↔ AuditLog
 *
 * After defining these associations, Sequelize will be able to
 * generate the appropriate JOIN queries and foreign key constraints.
 */

const { sequelize } = require('../config/db');
const User = require('./user.model');
const Equipment = require('./equipment.model');
const BorrowRequest = require('./borrowRequest.model');
const BorrowedItem = require('./borrowedItem.model');
const Reminder = require('./reminder.model');
const AuditLog = require('./auditLog.model');

// A User can have many BorrowRequests; each request belongs to one User
User.hasMany(BorrowRequest, { foreignKey: 'UserID' });
BorrowRequest.belongsTo(User, { foreignKey: 'UserID' });

// A BorrowRequest can include multiple BorrowedItems; each item belongs to one request
BorrowRequest.hasMany(BorrowedItem, { foreignKey: 'RequestID' });
BorrowedItem.belongsTo(BorrowRequest, { foreignKey: 'RequestID' });

// Equipment can be referenced in many BorrowedItems; each borrowed item references one Equipment
Equipment.hasMany(BorrowedItem, { foreignKey: 'EquipmentID' });
BorrowedItem.belongsTo(Equipment, { foreignKey: 'EquipmentID' });

// A BorrowRequest can have multiple Reminders; each reminder belongs to one request
BorrowRequest.hasMany(Reminder, { foreignKey: 'RequestID' });
Reminder.belongsTo(BorrowRequest, { foreignKey: 'RequestID' });

// A User can generate multiple AuditLog entries; each log entry belongs to one User
User.hasMany(AuditLog, { foreignKey: 'UserID' });
AuditLog.belongsTo(User, { foreignKey: 'UserID' });

// A BorrowRequest can generate multiple AuditLog entries; each log entry can be tied to one request
BorrowRequest.hasMany(AuditLog, { foreignKey: 'RequestID' });
AuditLog.belongsTo(BorrowRequest, { foreignKey: 'RequestID' });

module.exports = {
  sequelize,
  User,
  Equipment,
  BorrowRequest,
  BorrowedItem,
  Reminder,
  AuditLog
};
