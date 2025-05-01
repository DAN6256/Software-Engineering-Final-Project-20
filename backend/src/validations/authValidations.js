/**
 * Validation Schemas for Authentication Routes
 *
 * Defines Joi schemas to validate incoming request bodies for:
 * - User signup
 * - User login
 * - Editing user profile details
 */

const Joi = require('joi');

/**
 * Schema for user registration (POST /signup)
 *
 * Fields:
 *   - email:      Must be a valid email address (required)
 *   - password:   Must be a string of at least 6 characters (required)
 *   - name:       Non-empty string representing the user's full name (required)
 *   - role:       Must be either 'Student' or 'Admin' (required)
 *   - major:      Non-empty string for the user's academic major (required)
 *   - yearGroup:  Numeric year group (e.g., 2025) (required)
 */
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
  role: Joi.string().valid('Student', 'Admin').required(),
  major: Joi.string().required(),
  yearGroup: Joi.number().required()
});

/**
 * Schema for user login (POST /login)
 *
 * Fields:
 *   - email:    Must be a valid email address (required)
 *   - password: Must be a string of at least 6 characters (required)
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

/**
 * Schema for editing user profile (PUT /user)
 *
 * At least one of the following optional fields must be present:
 *   - name:      Updated full name (string)
 *   - major:     Updated academic major (string)
 *   - yearGroup: Updated year group (number)
 */
const editUserSchema = Joi.object({
  name: Joi.string().optional(),
  major: Joi.string().optional(),
  yearGroup: Joi.number().optional()
}).min(1); // Require at least one field to be provided

module.exports = {
  signupSchema,
  loginSchema,
  editUserSchema
};
