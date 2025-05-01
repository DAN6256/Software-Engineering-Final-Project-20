/**
 * @file auth.service.test.js
 * Unit tests for AuthService methods: signUpUser, loginUser, and editUserDetails.
 * Mocks the User model and bcrypt functions to isolate service logic.
 */

const AuthService = require('../../src/services/auth.service');
const { User } = require('../../src/models');
const bcrypt = require('bcrypt');

// Mock the User model methods
jest.mock('../../src/models', () => ({
  User: {
    unscoped: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }
}));

// Mock bcrypt hashing and comparison methods
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('AuthService', () => {
  // Reset mocks after each test to avoid cross-test interference
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * signUpUser()
   * - Creates a new user if the email is not already in use.
   * - Throws an error when attempting to register an existing email.
   */
  describe('signUpUser', () => {
    it('creates a new user when email is available', async () => {
      // Arrange: simulate no existing user and successful creation
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({ UserID: 123, Email: 'test@x.com' });

      // Act
      const newUser = await AuthService.signUpUser({
        email: 'test@x.com',
        password: 'password',
        name: 'Tester',
        role: 'Student',
        major: 'CS',
        yearGroup: 2025
      });

      // Assert: verify calls and return value
      expect(User.findOne).toHaveBeenCalledWith({ where: { Email: 'test@x.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(User.create).toHaveBeenCalled();
      expect(newUser.UserID).toBe(123);
    });

    it('throws an error if email is already taken', async () => {
      // Arrange: simulate an existing user
      User.findOne.mockResolvedValue({ Email: 'test@x.com' });

      // Act & Assert: expect an error to be thrown
      await expect(
        AuthService.signUpUser({
          email: 'test@x.com',
          password: 'password',
          name: 'Tester',
          role: 'Student',
          major: 'CS',
          yearGroup: 2025
        })
      ).rejects.toThrow('Email already taken');
    });
  });

  /**
   * loginUser()
   * - Verifies credentials and returns a JWT and user data.
   * - Throws an error when user not found or password mismatch.
   */
  describe('loginUser', () => {
    it('throws an error if user is not found', async () => {
      // Arrange: no user in database
      User.unscoped().findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        AuthService.loginUser({ email: 'none@x.com', password: 'secret' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('throws an error if password does not match', async () => {
      // Arrange: simulate user found but wrong password
      User.unscoped().findOne.mockResolvedValue({ Email: 'valid@x.com', Password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(
        AuthService.loginUser({ email: 'valid@x.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('returns a token and user object on successful login', async () => {
      // Arrange: valid user and password match
      User.unscoped().findOne.mockResolvedValue({
        UserID: 10,
        Email: 'valid@x.com',
        Password: 'hashed',
        Role: 'Student'
      });
      bcrypt.compare.mockResolvedValue(true);

      // Act
      const { token, user } = await AuthService.loginUser({
        email: 'valid@x.com',
        password: 'secret'
      });

      // Assert: verify token is returned and password is omitted
      expect(token).toBeDefined();
      expect(user.Email).toBe('valid@x.com');
      expect(user.Password).toBeUndefined();
    });
  });

  /**
   * editUserDetails()
   * - Updates the specified fields for an existing user.
   * - Throws an error if the user does not exist.
   */
  describe('editUserDetails', () => {
    it('updates and returns user when found', async () => {
      // Arrange: simulate existing user instance
      const mockUser = {
        UserID: 20,
        Name: 'Old Name',
        major: 'OldMajor',
        yearGroup: 2020,
        save: jest.fn().mockResolvedValue(true)
      };
      User.unscoped().findByPk.mockResolvedValue(mockUser);

      // Act
      const updated = await AuthService.editUserDetails(20, {
        name: 'New Name',
        major: 'NewMajor',
        yearGroup: 2025
      });

      // Assert: verify fields updated
      expect(updated.Name).toBe('New Name');
      expect(updated.major).toBe('NewMajor');
      expect(updated.yearGroup).toBe(2025);
    });

    it('throws an error if user is not found', async () => {
      // Arrange: no user found
      User.unscoped().findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(
        AuthService.editUserDetails(99, { name: 'Any', major: 'CS', yearGroup: 2025 })
      ).rejects.toThrow('User not found');
    });
  });
});
