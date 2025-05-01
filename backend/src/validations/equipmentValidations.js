/**
 * Validation Schemas for Equipment Routes
 *
 * Defines Joi schemas to validate incoming request bodies for:
 * - Creating a new equipment item
 * - Updating an existing equipment item
 */

const Joi = require('joi');

/**
 * Schema for creating equipment (POST /equipment)
 *
 * Fields:
 *   - name: The name of the new equipment (required, non-empty string)
 */
const createEquipmentSchema = Joi.object({
  name: Joi.string().required()
});

/**
 * Schema for updating equipment (PUT /equipment/:equipmentID)
 *
 * Fields:
 *   - name: The updated name of the equipment (required, non-empty string)
 */
const updateEquipmentSchema = Joi.object({
  name: Joi.string().required()
});

module.exports = {
  createEquipmentSchema,
  updateEquipmentSchema
};
