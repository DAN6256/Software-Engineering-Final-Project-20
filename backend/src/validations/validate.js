/**
 * Request Validation Middleware Factory
 *
 * Creates an Express middleware that validates incoming request data against a Joi schema.
 * If validation fails, responds with 400 Bad Request and the first error message.
 *
 * @param {import('joi').Schema} schema     - Joi schema to validate against.
 * @param {string}              [property] - Request property to validate: 'body' or 'params'.
 * @returns {import('express').RequestHandler} Middleware function.
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    // If no schema provided, skip validation
    if (!schema) {
      return next();
    }

    // Determine which part of the request to validate
    const data = property === 'params' ? req.params : req.body;

    // Execute Joi validation
    const { error } = schema.validate(data);

    // On validation failure, send 400 with error message
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Data is valid—proceed to the next middleware or route handler
    next();
  };
};

module.exports = validate;
