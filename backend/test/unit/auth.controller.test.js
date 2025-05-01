/**
 * @file auth.controller.test.js
 * Unit tests for AuthController methods: signUp, login, logout, and editUser.
 * Uses Jest to mock AuthService and validate controller behavior.
 */

const AuthController = require('../../src/controllers/auth.controller');
const AuthService = require('../../src/services/auth.service');

// Mock the AuthService module so we can control its behavior in tests
jest.mock('../../src/services/auth.service');

describe('AuthController', () => {
  // Clear mocks after each test to prevent state leakage
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Tests for the signUp controller method.
   */
  describe('signUp', () => {
    it('should return 201 on successful registration', async () => {
      // Arrange: mock AuthService.signUpUser to resolve with a new user ID
      AuthService.signUpUser.mockResolvedValue({ UserID: 100 });

      // Create a fake request body
      const req = {
        body: {
          email: 'test@x.com',
          password: 'secret',
          name: 'Tester',
          role: 'Student',
          major: 'CS',
          yearGroup: 2025
        }
      };
      // Fake response object with chained status/json methods
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Act: call the controller method
      await AuthController.signUp(req, res);

      // Assert: service was called, and correct response was sent
      expect(AuthService.signUpUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        userID: 100
      });
    });

    it('should return 400 if registration fails', async () => {
      // Arrange: simulate service throwing an error
      AuthService.signUpUser.mockRejectedValue(new Error('Email already taken'));

      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Act
      await AuthController.signUp(req, res);

      // Assert: 400 Bad Request with error message
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already taken' });
    });
  });

  /**
   * Tests for the login controller method.
   */
  describe('login', () => {
    it('should return 200 and token on successful login', async () => {
      // Arrange: mock a successful login response
      AuthService.loginUser.mockResolvedValue({
        token: 'my-jwt',
        user: { Email: 'valid@x.com', Password: undefined }
      });

      const req = { body: { email: 'valid@x.com', password: 'secret' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Act
      await AuthController.login(req, res);

      // Assert
      expect(AuthService.loginUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'my-jwt',
        user: { Email: 'valid@x.com', Password: undefined }
      });
    });

    it('should return 401 on invalid credentials', async () => {
      // Arrange: simulate authentication failure
      AuthService.loginUser.mockRejectedValue(new Error('Invalid credentials'));

      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Act
      await AuthController.login(req, res);

      // Assert: 401 Unauthorized with error message
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });

  /**
   * Tests for the logout controller method.
   */
  describe('logout', () => {
    it('should respond with 200 and success message', async () => {
      const req = {}; // No specific input needed
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Act
      await AuthController.logout(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });

  /**
   * Tests for the editUser controller method.
   */
  describe('editUser', () => {
    it('should return 200 and updated user data on success', async () => {
      // Arrange: mock updated user details
      AuthService.editUserDetails.mockResolvedValue({
        UserID: 10,
        Name: 'New Name',
        major: 'NewMajor',
        yearGroup: 2025
      });

      const req = {
        user: { UserID: 10 },
        body: { name: 'New Name', major: 'NewMajor', yearGroup: 2025 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Act
      await AuthController.editUser(req, res);

      // Assert: service called with correct params and response contains updated user
      expect(AuthService.editUserDetails).toHaveBeenCalledWith(10, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User details updated successfully',
        user: {
          UserID: 10,
          Name: 'New Name',
          major: 'NewMajor',
          yearGroup: 2025
        }
      });
    });

    it('should return 400 if update fails', async () => {
      // Arrange: simulate service error
      AuthService.editUserDetails.mockRejectedValue(new Error('User not found'));

      const req = {
        user: { UserID: 99 },
        body: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Act
      await AuthController.editUser(req, res);

      // Assert: 400 Bad Request with error message
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });
});
