/**
 * Borrow Integration Tests
 *
 * Uses Supertest to exercise the end-to-end borrowing API workflows
 * against an in-memory SQLite database (NODE_ENV=test).
 * Validates student and admin interactions: request submission, approval,
 * return marking, and reminder triggering.
 */

const request = require('supertest');
const app = require('../../index');               // Main Express application
const { sequelize } = require('../../src/models'); // Sequelize instance for in-memory DB

// Extend default Jest timeout to accommodate database setup and email workflows
jest.setTimeout(15000);

describe('Borrow Integration (In-Memory)', () => {
  let studentToken;
  let adminToken;
  let requestID;      // ID of the BorrowRequest created
  let equipmentID;    // ID of the Equipment created
  // let borrowedItemID; // Uncomment if you capture the BorrowedItem ID

  // Before all tests, reset database and create necessary users & equipment
  beforeAll(async () => {
    // Synchronize all models to the in-memory database
    await sequelize.sync({ force: true });
    console.log('Database synced for Borrow Integration tests...');

    // 1) Create a Student user
    console.log('Creating Student user...');
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'daniel.tunyinko@ashesi.edu.gh',
        password: 'StuPass1',
        name: 'Borrow Student',
        role: 'Student',
        major: 'CS',
        yearGroup: 2025
      })
      .expect(201);

    // 2) Create an Admin user
    console.log('Creating Admin user...');
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'davedonbo108@gmail.com',
        password: 'Admin123',
        name: 'Borrow Admin',
        role: 'Admin',
        major: 'NA',
        yearGroup: 2023
      })
      .expect(201);

    // 3) Log in as the Student to obtain a JWT
    console.log('Logging in Student...');
    const stRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'daniel.tunyinko@ashesi.edu.gh', password: 'StuPass1' })
      .expect(200);
    studentToken = stRes.body.token;

    // 4) Log in as the Admin to obtain a JWT
    console.log('Logging in Admin...');
    const adRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'davedonbo108@gmail.com', password: 'Admin123' })
      .expect(200);
    adminToken = adRes.body.token;

    // 5) Admin creates an equipment item for the student to borrow
    console.log('Admin creating equipment...');
    const eqRes = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Equipment' })
      .expect(201);
    equipmentID = eqRes.body.equipment.EquipmentID;
    console.log('Created equipmentID:', equipmentID);
  });

  // After all tests, close the database connection
  afterAll(async () => {
    await sequelize.close();
    console.log('Closed DB connection. Borrow Integration tests done.');
  });

  // Test student’s ability to submit a borrow request
  describe('POST /api/borrow/request', () => {
    it('Student can request equipment', async () => {
      console.log('Student requesting equipment ID:', equipmentID);
      const res = await request(app)
        .post('/api/borrow/request')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          items: [{ equipmentID, quantity: 1 }],
          collectionDateTime: '2026-01-01T10:00:00Z'
        });

      console.log('Borrow request =>', res.status, res.body);
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Request submitted');

      // Capture the request ID for subsequent tests
      requestID = res.body.borrowRequest.RequestID;
      console.log('Captured requestID:', requestID);
    });

    it('fails if user is not a Student', async () => {
      const failRes = await request(app)
        .post('/api/borrow/request')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [{ equipmentID, quantity: 2 }],
          collectionDateTime: '2026-02-01T08:00:00Z'
        });
      expect(failRes.status).toBe(403);
    });
  });

  // Test admin’s ability to approve a borrow request
  describe('PUT /api/borrow/approve/:requestID', () => {
    it('Admin can approve the borrow request', async () => {
      console.log('Approving requestID:', requestID);
      // Attempt partial approval; adjust item array if needed
      const items = [{ borrowedItemID: 1, allow: true }];
      const res = await request(app)
        .put(`/api/borrow/approve/${requestID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          returnDate: '2026-02-15T00:00:00Z',
          items
        });

      console.log('Approve response =>', res.status, res.body);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Request approved');
      expect(res.body.approvedRequest.Status).toBe('Approved');
    });
  });

  // Test admin’s ability to mark equipment as returned
  describe('PUT /api/borrow/return/:requestID', () => {
    it('Admin can mark it returned', async () => {
      console.log('Returning requestID:', requestID);
      const res = await request(app)
        .put(`/api/borrow/return/${requestID}`)
        .set('Authorization', `Bearer ${adminToken}`);
      console.log('Return response =>', res.status, res.body);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Equipment returned');
      expect(res.body.returnedRequest.RequestID).toBe(requestID);
    });
  });

  // Test admin’s ability to trigger reminders
  describe('POST /api/borrow/send-reminder', () => {
    it('Admin triggers reminders', async () => {
      console.log('Sending reminder...');
      const res = await request(app)
        .post('/api/borrow/send-reminder')
        .set('Authorization', `Bearer ${adminToken}`);
      console.log('Reminder response =>', res.status, res.body);

      // Expect a 200 status and an appropriate message
      expect(res.status).toBe(200);
      const msg = res.body.message;
      const validMessages = [
        'Reminders sent successfully',
        'No due requests found to remind'
      ];
      expect(validMessages).toContain(msg);
    });
  });
});
