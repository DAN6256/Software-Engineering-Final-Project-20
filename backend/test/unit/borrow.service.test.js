/**
 * @file borrow.service.test.js
 * Unit tests for BorrowService methods:
 * - requestEquipment
 * - approveRequest
 * - returnEquipment
 * - getAllRequests
 * - getPendingRequests
 * - getItemsForRequest
 *
 * Mocks underlying models (User, Equipment, BorrowRequest, BorrowedItem, AuditLog, Reminder)
 * and the Nodemailer transport to isolate service logic.
 */

const BorrowService = require('../../src/services/borrow.service');
const { User, Equipment, BorrowRequest, BorrowedItem, AuditLog, Reminder } = require('../../src/models');

// Mock Nodemailer so no real emails are sent during tests
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({})
  })
}));

// Mock all Sequelize model methods used by BorrowService
jest.mock('../../src/models', () => ({
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn()
  },
  Equipment: {
    findByPk: jest.fn()
  },
  BorrowRequest: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  BorrowedItem: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn()
  },
  AuditLog: {
    create: jest.fn()
  },
  Reminder: {
    create: jest.fn()
  }
}));

describe('BorrowService', () => {
  // Reset all mocks after each test case
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: requestEquipment
   * Verifies that a valid student borrow request:
   * - Creates a BorrowRequest
   * - Creates BorrowedItem entries
   * - Logs an audit entry
   * - Returns the created request
   */
  describe('requestEquipment', () => {
    it('should create BorrowRequest and items, then log audit', async () => {
      // Arrange: simulate valid student and admin users
      User.findByPk.mockResolvedValue({ Role: 'Student', Email: 'student@x.com', Name: 'Student A' });
      User.findOne.mockResolvedValue({ Role: 'Admin', Email: 'admin@x.com', Name: 'Admin A' });
      BorrowRequest.create.mockResolvedValue({ RequestID: 1 });
      Equipment.findByPk.mockResolvedValue({ EquipmentID: 10 });
      BorrowedItem.create.mockResolvedValue({});
      AuditLog.create.mockResolvedValue({});
      BorrowedItem.findAll.mockResolvedValue([
        { EquipmentID: 10, Quantity: 2, Description: 'TestDesc', Equipment: { Name: 'ItemX' } }
      ]);

      // Act: call service
      const result = await BorrowService.requestEquipment(
        1,
        [{ equipmentID: 10, quantity: 2 }],
        null
      );

      // Assert: verify all steps were executed and returned value
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(BorrowRequest.create).toHaveBeenCalled();
      expect(BorrowedItem.create).toHaveBeenCalledTimes(1);
      expect(AuditLog.create).toHaveBeenCalled();
      expect(result.RequestID).toBe(1);
    });

    it('should throw if user is not a Student', async () => {
      // Arrange: simulate non-student role
      User.findByPk.mockResolvedValue({ Role: 'Admin' });

      // Act & Assert: expect error for invalid role
      await expect(
        BorrowService.requestEquipment(1, [], null)
      ).rejects.toThrow('Invalid student or role');
    });
  });

  /**
   * Test: approveRequest
   * Verifies that approving a pending request:
   * - Updates BorrowedItems based on allow flag
   * - Sets request status and return date
   * - Logs an audit entry
   */
  describe('approveRequest', () => {
    it('should approve a pending request and create audit log', async () => {
      // Arrange: simulate pending request and one borrowed item
      BorrowRequest.findByPk.mockResolvedValue({
        RequestID: 2,
        Status: 'Pending',
        save: jest.fn().mockResolvedValue(true)
      });
      BorrowedItem.findByPk.mockResolvedValue({
        RequestID: 2,
        Description: null,
        SerialNumber: null,
        save: jest.fn().mockResolvedValue(true)
      });
      BorrowedItem.findAll.mockResolvedValue([{ RequestID: 2 }]);
      AuditLog.create.mockResolvedValue({});

      const items = [{ borrowedItemID: 10, allow: true }];

      // Act
      const result = await BorrowService.approveRequest(2, new Date(), items);

      // Assert: status updated and audit logged
      expect(result.Status).toBe('Approved');
      expect(AuditLog.create).toHaveBeenCalled();
    });

    it('should throw if request is not found or not pending', async () => {
      // Arrange: no existing request
      BorrowRequest.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(
        BorrowService.approveRequest(999, new Date(), [])
      ).rejects.toThrow('Request not found or already processed');
    });
  });

  /**
   * Test: returnEquipment
   * Verifies that returning approved items:
   * - Updates request status to 'Returned'
   * - Logs an audit entry
   * - Sends a return confirmation email
   */
  describe('returnEquipment', () => {
    it('should mark request as Returned and log audit', async () => {
      // Arrange: simulate approved request and student lookup
      BorrowRequest.findByPk.mockResolvedValue({
        RequestID: 5,
        Status: 'Approved',
        save: jest.fn().mockResolvedValue(true)
      });
      User.unscoped = jest.fn().mockReturnThis();
      User.findByPk.mockResolvedValue({
        Role: 'Student',
        Name: 'Dave',
        Email: 'student@x.com'
      });
      AuditLog.create.mockResolvedValue({});

      // Act
      const result = await BorrowService.returnEquipment(5);

      // Assert
      expect(result.Status).toBe('Returned');
      expect(AuditLog.create).toHaveBeenCalled();
    });

    it('should throw if request is not approved', async () => {
      // Arrange: simulate request in wrong status
      BorrowRequest.findByPk.mockResolvedValue({ RequestID: 5, Status: 'Pending' });

      // Act & Assert
      await expect(BorrowService.returnEquipment(5))
        .rejects.toThrow('Invalid return request');
    });
  });

  /**
   * Test: getAllRequests
   * Verifies request retrieval logic for Admin vs. Student roles.
   */
  describe('getAllRequests', () => {
    it('should return all requests for Admin', async () => {
      BorrowRequest.findAll.mockResolvedValue([{ RequestID: 1 }, { RequestID: 2 }]);
      const user = { Role: 'Admin' };
      const requests = await BorrowService.getAllRequests(user);

      expect(requests.length).toBe(2);
    });

    it('should return only the user’s requests for Student', async () => {
      BorrowRequest.findAll.mockResolvedValue([{ RequestID: 3 }]);
      const user = { Role: 'Student', UserID: 10 };
      const requests = await BorrowService.getAllRequests(user);

      expect(requests.length).toBe(1);
      expect(BorrowRequest.findAll).toHaveBeenCalled();
    });
  });

  /**
   * Test: getPendingRequests
   * Verifies fetching of only pending borrow requests.
   */
  describe('getPendingRequests', () => {
    it('should return pending requests for Admin', async () => {
      BorrowRequest.findAll.mockResolvedValue([{ RequestID: 1, Status: 'Pending' }]);
      const user = { Role: 'Admin' };
      const requests = await BorrowService.getPendingRequests(user);

      expect(requests[0].Status).toBe('Pending');
    });
  });

  /**
   * Test: getItemsForRequest
   * Verifies that items can be fetched for a valid request,
   * and that unauthorized or missing requests throw errors.
   */
  describe('getItemsForRequest', () => {
    it('should return items when the user is Admin or owner', async () => {
      BorrowRequest.findByPk.mockResolvedValue({ UserID: 10 });
      BorrowedItem.findAll.mockResolvedValue([{ BorrowedItemID: 1 }]);

      const items = await BorrowService.getItemsForRequest({ Role: 'Admin' }, 99);
      expect(items.length).toBe(1);
    });

    it('should throw if request not found', async () => {
      BorrowRequest.findByPk.mockResolvedValue(null);

      await expect(
        BorrowService.getItemsForRequest({ Role: 'Admin' }, 99)
      ).rejects.toThrow('Request not found');
    });
  });
});
