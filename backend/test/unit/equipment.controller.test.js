/**
 * @file equipment.controller.test.js
 * Unit tests for EquipmentController methods:
 * - addEquipment
 * - updateEquipment
 * - deleteEquipment
 * - getAllEquipment
 * - getEquipmentById
 *
 * Mocks EquipmentService to isolate controller logic and verify
 * HTTP status codes and JSON response payloads.
 */

const EquipmentController = require('../../src/controllers/equipment.controller');
const EquipmentService = require('../../src/services/equipment.service');

// Mock the EquipmentService module so that actual database operations are bypassed
jest.mock('../../src/services/equipment.service');

describe('EquipmentController', () => {
  // Reset mock state after each test to prevent interference
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test suite for adding new equipment (POST /api/equipment).
   */
  describe('addEquipment', () => {
    it('should respond with 201 Created when service succeeds', async () => {
      // Arrange: simulate successful equipment creation
      EquipmentService.addEquipment.mockResolvedValue({
        EquipmentID: 10,
        Name: '3D Printer'
      });

      const req = {
        body: { name: '3D Printer' },  // Payload sent by the client
        user: { UserID: 1 }             // Authenticated admin user
      };
      const res = {
        status: jest.fn().mockReturnThis(),  // Capture status code
        json: jest.fn()                      // Capture JSON response
      };

      // Act
      await EquipmentController.addEquipment(req, res);

      // Assert: correct status and response structure
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Equipment added successfully',
        equipment: { EquipmentID: 10, Name: '3D Printer' }
      });
    });

    it('should respond with 400 Bad Request when service throws an error', async () => {
      // Arrange: simulate service error
      EquipmentService.addEquipment.mockRejectedValue(new Error('error'));

      const req = { body: {}, user: { UserID: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await EquipmentController.addEquipment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  /**
   * Test suite for updating equipment details (PUT /api/equipment/:equipmentID).
   */
  describe('updateEquipment', () => {
    it('should respond with 200 OK when service succeeds', async () => {
      // Arrange: simulate successful update
      EquipmentService.updateEquipment.mockResolvedValue({
        EquipmentID: 20,
        Name: 'Updated Printer'
      });

      const req = {
        params: { equipmentID: 20 },      // URL parameter
        body: { name: 'Updated Printer' },// Payload for update
        user: { UserID: 2 }               // Authenticated admin user
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await EquipmentController.updateEquipment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Equipment updated successfully',
        updatedEquipment: { EquipmentID: 20, Name: 'Updated Printer' }
      });
    });

    it('should respond with 400 Bad Request when service throws an error', async () => {
      // Arrange: simulate not found error
      EquipmentService.updateEquipment.mockRejectedValue(new Error('Not found'));

      const req = { params: { equipmentID: 99 }, body: {}, user: { UserID: 2 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await EquipmentController.updateEquipment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
    });
  });

  /**
   * Test suite for deleting equipment (DELETE /api/equipment/:equipmentID).
   */
  describe('deleteEquipment', () => {
    it('should respond with 200 OK when deletion succeeds', async () => {
      // Arrange: simulate successful deletion
      EquipmentService.deleteEquipment.mockResolvedValue({ message: 'Equipment deleted' });

      const req = { params: { equipmentID: 30 }, user: { UserID: 2 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await EquipmentController.deleteEquipment(req, res);

      // Assert: confirm success message
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Equipment deleted successfully' });
    });

    it('should respond with 400 Bad Request when service throws an error', async () => {
      // Arrange: simulate service error
      EquipmentService.deleteEquipment.mockRejectedValue(new Error('error'));

      const req = { params: { equipmentID: 999 }, user: { UserID: 2 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await EquipmentController.deleteEquipment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  /**
   * Test suite for listing all equipment (GET /api/equipment).
   */
  describe('getAllEquipment', () => {
    it('should respond with 200 OK and an array of equipment', async () => {
      // Arrange: simulate equipment list
      EquipmentService.getAllEquipment.mockResolvedValue([{ EquipmentID: 1 }]);

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await EquipmentController.getAllEquipment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ equipmentList: [{ EquipmentID: 1 }] });
    });

    it('should respond with 400 Bad Request on service error', async () => {
      // Arrange
      EquipmentService.getAllEquipment.mockRejectedValue(new Error('error'));

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await EquipmentController.getAllEquipment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'error' });
    });
  });

  /**
   * Test suite for retrieving a specific equipment by ID (GET /api/equipment/:equipmentID).
   */
  describe('getEquipmentById', () => {
    it('should respond with 200 OK when the equipment is found', async () => {
      // Arrange: simulate found equipment
      EquipmentService.getEquipmentById.mockResolvedValue({ EquipmentID: 5, Name: 'Scanner' });

      const req = { params: { equipmentID: 5 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await EquipmentController.getEquipmentById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        equipment: { EquipmentID: 5, Name: 'Scanner' }
      });
    });

    it('should respond with 404 Not Found when service throws "not found" error', async () => {
      // Arrange: simulate equipment not found error
      EquipmentService.getEquipmentById.mockRejectedValue(new Error('Equipment not found'));

      const req = { params: { equipmentID: 999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Act
      await EquipmentController.getEquipmentById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Equipment not found' });
    });
  });
});
