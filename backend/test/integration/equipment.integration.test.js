/**
 * Equipment Integration Tests
 *
 * Uses Supertest to verify end-to-end equipment management APIs
 * against an in-memory SQLite database (NODE_ENV=test).
 * Covers CRUD operations: create, read (all & by ID), update, and delete.
 */

const request = require('supertest');
const app = require('../../index');               // Main Express application
const { sequelize } = require('../../src/models'); // Sequelize instance for in-memory DB

describe('Equipment Integration (In-Memory)', () => {
  let adminToken; // JWT token for authenticated admin requests
  let eqID;       // ID of the equipment item created during tests

  // Before all tests: sync database and create/login an Admin user
  beforeAll(async () => {
    // Reset and sync all models
    await sequelize.sync({ force: true });

    // Sign up an Admin user
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'equipadmin@int.com',
        password: 'Admin123',
        name: 'EquipAdmin',
        role: 'Admin',
        major: 'NA',
        yearGroup: 2023
      });

    // Log in as the Admin to obtain a JWT token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'equipadmin@int.com', password: 'Admin123' })
      .expect(200);

    adminToken = loginRes.body.token;
  });

  // After all tests: close the database connection
  afterAll(async () => {
    await sequelize.close();
  });

  /**
   * Test: POST /api/equipment
   * Verifies that an Admin can successfully add new equipment.
   */
  describe('POST /api/equipment', () => {
    it('Admin can add equipment', async () => {
      const res = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '3D Printer' })
        .expect(201);

      expect(res.body.message).toBe('Equipment added successfully');
      eqID = res.body.equipment.EquipmentID; // Capture the created EquipmentID
    });
  });

  /**
   * Test: GET /api/equipment
   * Verifies that the list endpoint returns an array of equipment items.
   */
  describe('GET /api/equipment', () => {
    it('lists all equipment', async () => {
      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.equipmentList)).toBe(true);
    });
  });

  /**
   * Test: GET /api/equipment/:eqID
   * Verifies retrieval of a specific equipment by its ID and 404 on missing ID.
   */
  describe('GET /api/equipment/:eqID', () => {
    it('returns 200 if found', async () => {
      const res = await request(app)
        .get(`/api/equipment/${eqID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.equipment.EquipmentID).toBe(eqID);
    });

    it('returns 404 if not found', async () => {
      await request(app)
        .get('/api/equipment/9999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  /**
   * Test: PUT /api/equipment/:eqID
   * Verifies that an Admin can update an equipment’s name.
   */
  describe('PUT /api/equipment/:eqID', () => {
    it('updates name if admin', async () => {
      const res = await request(app)
        .put(`/api/equipment/${eqID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Printer' })
        .expect(200);

      expect(res.body.message).toBe('Equipment updated successfully');
      expect(res.body.updatedEquipment.Name).toBe('Updated Printer');
    });
  });

  /**
   * Test: DELETE /api/equipment/:eqID
   * Verifies that an Admin can delete an equipment item.
   */
  describe('DELETE /api/equipment/:eqID', () => {
    it('deletes the equipment', async () => {
      const res = await request(app)
        .delete(`/api/equipment/${eqID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toBe('Equipment deleted successfully');
    });
  });
});
