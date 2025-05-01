/**
 * Authentication Controller
 *
 * Handles user registration, login, logout, and profile editing.
 * Delegates business logic to AuthService and returns appropriate HTTP responses.
 */

const AuthService = require('../services/auth.service');

const AuthController = {
  /**
   * Register a new user.
   * Route: POST /signup
   *
   * Expects `email`, `password`, `name`, `role`, `major`, and `yearGroup` in request body.
   * On success, returns the new user's ID.
   */
  signUp: async (req, res) => {
    try {
      // Extract registration fields from request body
      const { email, password, name, role, major, yearGroup } = req.body;

      // Delegate user creation to the service layer
      const newUser = await AuthService.signUpUser({
        email,
        password,
        name,
        role,
        major,
        yearGroup
      });

      // Respond with 201 Created and the new user ID
      return res.status(201).json({
        message: 'User registered successfully',
        userID: newUser.UserID
      });
    } catch (error) {
      // On validation or service error, respond with 400 Bad Request
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * Authenticate an existing user.
   * Route: POST /login
   *
   * Expects `email` and `password` in request body.
   * On success, returns a JWT token and user details.
   */
  login: async (req, res) => {
    try {
      // Extract login credentials
      const { email, password } = req.body;

      // Delegate authentication to the service layer
      const { token, user } = await AuthService.loginUser({ email, password });

      // Respond with 200 OK, token, and user profile
      return res.status(200).json({
        message: 'Login successful',
        token,
        user
      });
    } catch (error) {
      // On authentication failure, respond with 401 Unauthorized
      return res.status(401).json({ message: error.message });
    }
  },

  /**
   * Log out the current user.
   * Route: POST /logout
   *
   * Currently a placeholder (stateless JWT).
   * Returns a success message.
   */
  logout: async (req, res) => {
    try {
      // Stateless JWTs don't require server-side invalidation by default
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      // Catch any unexpected errors
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * Edit the authenticated user's profile details.
   * Route: PUT /user
   *
   * Expects `name`, `major`, and `yearGroup` in request body.
   * Requires a valid JWT; user ID is extracted from req.user.
   */
  editUser: async (req, res) => {
    try {
      // Retrieve the user's ID from the authenticated request
      const userID = req.user.UserID;
      const { name, major, yearGroup } = req.body;

      // Delegate profile update to the service layer
      const updatedUser = await AuthService.editUserDetails(userID, {
        name,
        major,
        yearGroup
      });

      // Respond with the updated user details
      return res.status(200).json({
        message: 'User details updated successfully',
        user: updatedUser
      });
    } catch (error) {
      // On validation or service error, respond with 400 Bad Request
      return res.status(400).json({ message: error.message });
    }
  }
};

module.exports = AuthController;
