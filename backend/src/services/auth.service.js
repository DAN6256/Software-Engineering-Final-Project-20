/**
 * AuthService
 *
 * Provides user authentication and management functions:
 * - signUpUser: Registers a new user with hashed password.
 * - loginUser: Validates credentials and issues JWT.
 * - editUserDetails: Updates non-sensitive user profile fields.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Sequelize User model
require('dotenv').config();

const AuthService = {
  /**
   * Register a new user.
   *
   * @param {Object} userInfo
   * @param {string} userInfo.email     - User's email address (must be unique)
   * @param {string} userInfo.password  - User's plaintext password
   * @param {string} userInfo.name      - User's full name
   * @param {string} userInfo.role      - 'Student' or 'Admin'
   * @param {string} [userInfo.major]      - Optional major field for students
   * @param {number} [userInfo.yearGroup]  - Optional year group for students
   * @returns {Promise<User>} The newly created user instance (without password in default scope)
   * @throws {Error} If the email is already taken
   */
  signUpUser: async ({ email, password, name, role, major, yearGroup }) => {
    // Check for existing user with the same email
    const existing = await User.findOne({ where: { Email: email } });
    if (existing) {
      throw new Error('Email already taken');
    }

    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create and return the new user record
    const newUser = await User.create({
      Name: name,
      Email: email,
      Role: role,
      Password: hashedPassword,
      major,
      yearGroup
    });

    return newUser;
  },

  /**
   * Authenticate a user and issue a JWT.
   *
   * @param {Object} credentials
   * @param {string} credentials.email    - User's email address
   * @param {string} credentials.password - User's plaintext password
   * @returns {Promise<{ token: string, user: User }>} The JWT and user profile (password omitted)
   * @throws {Error} If credentials are invalid
   */
  loginUser: async ({ email, password }) => {
    // Retrieve the user including the hashed password
    const user = await User.unscoped().findOne({ where: { Email: email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare provided password to the stored hash
    const match = await bcrypt.compare(password, user.Password);
    if (!match) {
      throw new Error('Invalid credentials');
    }

    // Create a JWT payload
    const token = jwt.sign(
      {
        UserID: user.UserID,
        Email: user.Email,
        Role: user.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: '60m' }
    );

    // Remove sensitive data before returning
    user.Password = undefined;

    return { token, user };
  },

  /**
   * Update profile details for an existing user.
   *
   * @param {number} userID - The ID of the user to update
   * @param {Object} updates
   * @param {string} [updates.name]      - New name
   * @param {string} [updates.major]     - New major
   * @param {number} [updates.yearGroup] - New year group
   * @returns {Promise<User>} The updated user instance
   * @throws {Error} If the user is not found
   */
  editUserDetails: async (userID, { name, major, yearGroup }) => {
    // Find the user record by primary key
    const user = await User.unscoped().findByPk(userID);
    if (!user) {
      throw new Error('User not found');
    }

    // Apply any provided updates
    if (name !== undefined) user.Name = name;
    if (major !== undefined) user.major = major;
    if (yearGroup !== undefined) user.yearGroup = yearGroup;

    // Persist changes and return the updated record
    await user.save();
    return user;
  }
};

module.exports = AuthService;
