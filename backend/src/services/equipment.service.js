/**
 * EquipmentService
 *
 * Encapsulates business logic for managing equipment records:
 * - addEquipment: Create a new equipment entry and log the action.
 * - updateEquipment: Modify an existing equipment's name and log the update.
 * - deleteEquipment: Remove an equipment entry and log the deletion.
 * - getAllEquipment: Retrieve all equipment records.
 * - getEquipmentById: Fetch a single equipment record by its ID.
 */

const { Equipment, AuditLog } = require('../models');

const EquipmentService = {
  /**
   * Create a new equipment record.
   *
   * @param {string} name    - The name of the new equipment.
   * @param {number} userID  - The ID of the admin performing the action.
   * @returns {Promise<Equipment>} The newly created equipment instance.
   */
  addEquipment: async (name, userID) => {
    // Persist the new equipment entry
    const equipment = await Equipment.create({ Name: name });

    // Audit log for creation
    await AuditLog.create({
      UserID: userID,
      Action: 'Create',
      Details: `Equipment added by Admin: ${name}`,
      Timestamp: new Date()
    });

    return equipment;
  },

  /**
   * Update an existing equipment's name.
   *
   * @param {number} equipmentID  - ID of the equipment to update.
   * @param {string} name         - New name for the equipment (optional).
   * @param {number} userID       - The ID of the admin performing the update.
   * @throws {Error} If no equipment is found for the given ID.
   * @returns {Promise<Equipment>} The updated equipment instance.
   */
  updateEquipment: async (equipmentID, name, userID) => {
    // Find the equipment by primary key
    const equipment = await Equipment.findByPk(equipmentID);
    if (!equipment) throw new Error('Equipment not found');

    // Update name if provided
    equipment.Name = name || equipment.Name;
    await equipment.save();

    // Audit log for update
    await AuditLog.create({
      UserID: userID,
      Action: 'Update',
      Details: `Equipment ${equipmentID} updated by Admin`,
      Timestamp: new Date()
    });

    return equipment;
  },

  /**
   * Delete an equipment record.
   *
   * @param {number} equipmentID  - ID of the equipment to delete.
   * @param {number} userID       - The ID of the admin performing the deletion.
   * @throws {Error} If no equipment is found for the given ID.
   * @returns {Promise<{ message: string }>} A confirmation message.
   */
  deleteEquipment: async (equipmentID, userID) => {
    // Ensure the equipment exists
    const equipment = await Equipment.findByPk(equipmentID);
    if (!equipment) throw new Error('Equipment not found');

    // Remove the equipment entry
    await Equipment.destroy({ where: { EquipmentID: equipmentID } });

    // Audit log for deletion
    await AuditLog.create({
      UserID: userID,
      Action: 'Delete',
      Details: `Equipment ${equipmentID} deleted by Admin`,
      Timestamp: new Date()
    });

    return { message: 'Equipment deleted' };
  },

  /**
   * Retrieve all equipment records.
   *
   * @returns {Promise<Equipment[]>} Array of equipment instances.
   */
  getAllEquipment: async () => {
    return await Equipment.findAll();
  },

  /**
   * Fetch a specific equipment by its ID.
   *
   * @param {number} equipmentID  - ID of the equipment to retrieve.
   * @throws {Error} If no equipment is found for the given ID.
   * @returns {Promise<Equipment>} The found equipment instance.
   */
  getEquipmentById: async (equipmentID) => {
    const equipment = await Equipment.findByPk(equipmentID);
    if (!equipment) throw new Error('Equipment not found');
    return equipment;
  }
};

module.exports = EquipmentService;
