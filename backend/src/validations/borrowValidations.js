const Joi = require('joi');

const requestBorrowSchema = Joi.object({
  collectionDateTime: Joi.date().required(),
  items: Joi.array().items(
    Joi.object({
      equipmentID: Joi.number().integer().required(),
      quantity: Joi.number().integer().min(1).required(),
      description: Joi.string().optional()
    })
  ).min(1).required()
});

const approveBorrowSchema = Joi.object({
  returnDate: Joi.date().required(),
  items: Joi.array().items(
    Joi.object({
      borrowedItemID: Joi.number().integer().required(),
      allow: Joi.boolean().required(),
      description: Joi.string().optional(),
      serialNumber: Joi.string().optional()
    })
  ).min(1).required()
});

const getBorrowItemsSchema = Joi.object({
  requestID: Joi.number().integer().required()
});

module.exports = {
  requestBorrowSchema,
  approveBorrowSchema,
  getBorrowItemsSchema
};
