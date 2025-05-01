/**
 * Validation Schemas for Borrowing Routes
 *
 * Defines Joi schemas to validate incoming request bodies for:
 * - Submitting a new borrow request
 * - Approving or modifying a borrow request
 * - Fetching items for a specific borrow request
 */

const Joi = require('joi');

/**
 * Schema for submitting a borrow request (POST /borrow/request)
 *
 * Fields:
 *   - collectionDateTime: Date/time when the student will pick up items (required)
 *   - items: Array of one or more objects, each containing:
 *       • equipmentID (integer, required) – ID of the equipment to borrow
 *       • quantity (integer ≥ 1, required) – Number of units requested
 *       • description (string, optional) – Student’s note about the request
 */
const requestBorrowSchema = Joi.object({
  collectionDateTime: Joi.date().required(),
  items: Joi.array()
    .items(
      Joi.object({
        equipmentID: Joi.number().integer().required(),
        quantity: Joi.number().integer().min(1).required(),
        description: Joi.string().optional()
      })
    )
    .min(1)
    .required()
});

/**
 * Schema for approving or modifying a borrow request (PUT /borrow/approve/:id)
 *
 * Fields:
 *   - returnDate: Date/time by which items must be returned (required)
 *   - items: Array of one or more objects, each containing:
 *       • borrowedItemID (integer, required) – ID of the BorrowedItem record
 *       • allow (boolean, required) – Whether this item will be issued
 *       • description (string, optional) – Updated description by admin
 *       • serialNumber (string, optional) – Serial number assigned by admin
 */
const approveBorrowSchema = Joi.object({
  returnDate: Joi.date().required(),
  items: Joi.array()
    .items(
      Joi.object({
        borrowedItemID: Joi.number().integer().required(),
        allow: Joi.boolean().required(),
        description: Joi.string().optional(),
        serialNumber: Joi.string().optional()
      })
    )
    .min(1)
    .required()
});

/**
 * Schema for fetching borrowed items of a specific request
 * (GET /borrow/requests/:requestID/items)
 *
 * Fields:
 *   - requestID: ID of the borrow request whose items are being retrieved (required)
 */
const getBorrowItemsSchema = Joi.object({
  requestID: Joi.number().integer().required()
});

module.exports = {
  requestBorrowSchema,
  approveBorrowSchema,
  getBorrowItemsSchema
};
