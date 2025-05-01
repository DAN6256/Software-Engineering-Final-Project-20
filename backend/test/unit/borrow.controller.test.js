/**
 * @file borrow.controller.test.js
 * Unit tests for BorrowController methods:
 * - requestEquipment
 * - approveRequest
 * - returnEquipment
 * - sendReminder
 * - getAllRequests
 * - getPendingRequests
 * - getItemsForRequest
 *
 * Mocks the BorrowService to isolate controller logic and verify
 * HTTP status codes and JSON responses.
 */

const BorrowController = require('../../src/controllers/borrow.controller');
const BorrowService = require('../../src/services/borrow.service');

// Mock the entire BorrowService module
jest.mock('../../src/services/borrow.service');

describe('BorrowController', () => {
  // Clear mock call history after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Tests for handling new borrow requests by students.
   */
  describe('requestEquipment', () => {
    it('should respond with 201 Created on successful request', async () => {
      // Arrange: simulate a successful service call returning a RequestID
      BorrowService.requestEquipment.mockResolvedValue({ RequestID: 123 });

      const req = {
        body: { items: [{ equipmentID: 10, quantity: 2 }], collectionDateTime: null },
        user: { UserID: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Act
      await BorrowController.requestEquipment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Request submitted',
        borrowRequest: { RequestID: 123 }
      });
    });

    it('should respond with 400 Bad Request on service error', async () => {
      // Arrange: simulate service throwing an error
      BorrowService.requestEquipment.mockRejectedValue(new Error('some error'));

      const req = { body: {}, user: { UserID: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await BorrowController.requestEquipment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'some error' });
    });
  });

  /**
   * Tests for approving borrow requests by admins.
   */
  describe('approveRequest', () => {
    it('should respond with 200 OK on successful approval', async () => {
      // Arrange: simulate successful approval
      BorrowService.approveRequest.mockResolvedValue({ RequestID: 2, Status: 'Approved' });

      const req = {
        params: { requestID: 2 },
        body: { returnDate: null, items: [{ borrowedItemID: 10, allow: true }] }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await BorrowController.approveRequest(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Request approved',
        approvedRequest: { RequestID: 2, Status: 'Approved' }
      });
    });

    it('should respond with 400 Bad Request on service error', async () => {
      // Arrange: simulate service error
      BorrowService.approveRequest.mockRejectedValue(new Error('Invalid request'));

      const req = { params: { requestID: 99 }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await BorrowController.approveRequest(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid request' });
    });
  });

  /**
   * Tests for marking equipment as returned.
   */
  describe('returnEquipment', () => {
    it('should respond with 200 OK on successful return', async () => {
      // Arrange: simulate successful return
      BorrowService.returnEquipment.mockResolvedValue({ RequestID: 5 });

      const req = { params: { requestID: 5 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await BorrowController.returnEquipment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Equipment returned',
        returnedRequest: { RequestID: 5 }
      });
    });
  });

  /**
   * Tests for sending return reminders.
   */
  describe('sendReminder', () => {
    it('should respond with 200 OK and success message when reminders sent', async () => {
      // Arrange: simulate sending one reminder
      BorrowService.sendReminderForDueReturns.mockResolvedValue(1);

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await BorrowController.sendReminder(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Reminders sent successfully' });
    });

    it('should respond with 400 Bad Request on service error', async () => {
      // Arrange: simulate error
      BorrowService.sendReminderForDueReturns.mockRejectedValue(new Error('some error'));

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await BorrowController.sendReminder(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'some error' });
    });
  });

  /**
   * Tests for retrieving all borrow requests.
   */
  describe('getAllRequests', () => {
    it('should respond with 200 OK and a list of requests for Admin', async () => {
      // Arrange: simulate list of requests
      BorrowService.getAllRequests.mockResolvedValue([{ RequestID: 1 }, { RequestID: 2 }]);

      const req = { user: { Role: 'Admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await BorrowController.getAllRequests(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ requests: [{ RequestID: 1 }, { RequestID: 2 }] });
    });

    it('should respond with 400 Bad Request on service error', async () => {
      // Arrange: simulate error
      BorrowService.getAllRequests.mockRejectedValue(new Error('some error'));

      const req = { user: { Role: 'Admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await BorrowController.getAllRequests(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  /**
   * Tests for retrieving only pending borrow requests.
   */
  describe('getPendingRequests', () => {
    it('should respond with 200 OK and a list of pending requests', async () => {
      // Arrange: simulate one pending request
      BorrowService.getPendingRequests.mockResolvedValue([{ RequestID: 10, Status: 'Pending' }]);

      const req = { user: { Role: 'Admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await BorrowController.getPendingRequests(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ requests: [{ RequestID: 10, Status: 'Pending' }] });
    });
  });

  /**
   * Tests for retrieving items associated with a specific borrow request.
   */
  describe('getItemsForRequest', () => {
    it('should respond with 200 OK and the list of items', async () => {
      // Arrange: simulate line items
      BorrowService.getItemsForRequest.mockResolvedValue([{ BorrowedItemID: 1 }]);

      const req = { params: { requestID: 99 }, user: { Role: 'Admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await BorrowController.getItemsForRequest(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ items: [{ BorrowedItemID: 1 }] });
    });

    it('should respond with 404 Not Found if service throws an error', async () => {
      // Arrange: simulate not found error
      BorrowService.getItemsForRequest.mockRejectedValue(new Error('Request not found'));

      const req = { params: { requestID: 99 }, user: { Role: 'Admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await BorrowController.getItemsForRequest(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Request not found' });
    });
  });
});
