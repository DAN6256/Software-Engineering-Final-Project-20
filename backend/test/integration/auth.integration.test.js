/**
 * Integration Tests for Authentication Endpoints
 *
 * Uses Supertest to simulate HTTP requests against the Express app
 * in an in-memory SQLite database (NODE_ENV=test).
 * Ensures signup, login, logout, and profile editing flows work end-to-end.
 */

const request = require('supertest');
const app = require('../../index');           // Express application entry
const { sequelize } = require('../../src/models'); // Sequelize instance for DB control

describe('Auth Integration (In-Memory)', () => {
  // Before running tests, reset and sync all models to the in-memory database
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  // After tests complete, close the Sequelize connection
  afterAll(async () => {
    await sequelize.close();
  });

  let token;   // Will hold JWT for authenticated requests
  let userID;  // Will store the created user's ID

  describe('POST /api/auth/signup', () => {
    it('signs up a new user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.integration@auth.com',
          password: 'Password123',
          name: 'TestUser',
          role: 'Student',
          major: 'CS',
          yearGroup: 2025
        })
        .expect(201);

      // Verify response body structure and content
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body).toHaveProperty('userID');
      userID = res.body.userID; // Save for later tests
    });

    it('fails if email is already taken', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.integration@auth.com', // Duplicate email
          password: 'DifferentPass',
          name: 'Somebody Else',
          role: 'Student',
          major: 'Engineering',
          yearGroup: 2026
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test.integration@auth.com', password: 'Password123' })
        .expect(200);

      expect(res.body.message).toBe('Login successful');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      token = res.body.token; // Save token for subsequent authenticated requests
    });

    it('fails with invalid password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test.integration@auth.com', password: 'WrongPass' })
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('logs out successfully (stateless JWT flow)', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  describe('PUT /api/auth/edit', () => {
    it('edits user details when authenticated', async () => {
      const res = await request(app)
        .put('/api/auth/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'UpdatedName', major: 'NewMajor', yearGroup: 2027 })
        .expect(200);

      expect(res.body.message).toBe('User details updated successfully');
      // Verify the updated fields in the response
      expect(res.body.user.Name).toBe('UpdatedName');
      expect(res.body.user.major).toBe('NewMajor');
      expect(res.body.user.yearGroup).toBe(2027);
    });

    it('fails without an authorization token', async () => {
      await request(app)
        .put('/api/auth/edit')
        .send({ name: 'No Token' })
        .expect(401);
    });
  });
});
