/**
 * @file equipment.service.test.js
 * Unit tests for EquipmentService methods:
 * - addEquipment
 * - updateEquipment
 * - deleteEquipment
 * - getAllEquipment
 * - getEquipmentById
 *
 * Mocks the Equipment and AuditLog models to isolate service logic
 * and verify that database operations and audit logging occur as expected.
 */

const EquipmentService = require('../../../../SecretBackend/src/services/equipment.service');
const { Equipment, AuditLog } = require('../../../../SecretBackend/src/models');

// Mock the Equipment and AuditLog model methods
jest.mock('../../src/models', () => ({
  Equipment: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn()
  },
  AuditLog: {
    create: jest.fn()
  }
}));

describe('EquipmentService', () => {
  // Reset mock call history after each individual test
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test suite for addEquipment()
   * Verifies that:
   * - A new Equipment record is created
   * - An audit log entry is recorded
   * - The newly created equipment object is returned
   */
  describe('addEquipment', () => {
    it('should create equipment and log to AuditLog', async () => {
      // Arrange: simulate successful creation of equipment
      Equipment.create.mockResolvedValue({ EquipmentID: 101, Name: '3D Printer' });

      // Act: call the service method
      const result = await EquipmentService.addEquipment('3D Printer', 1);

      // Assert: correct calls and returned data
      expect(Equipment.create).toHaveBeenCalledWith({ Name: '3D Printer' });
      expect(AuditLog.create).toHaveBeenCalledWith({
        UserID: 1,
        Action: 'Create',
        Details: `Equipment added by Admin: 3D Printer`,
        Timestamp: expect.any(Date)
      });
      expect(result).toEqual({ EquipmentID: 101, Name: '3D Printer' });
    });
  });

  /**
   * Test suite for updateEquipment()
   * Verifies that:
   * - Equipment name is updated when found
   * - An audit log entry is recorded
   * - An error is thrown if equipment does not exist
   */
  describe('updateEquipment', () => {
    it('should update equipment name if found', async () => {
      // Arrange: mock an existing equipment instance
      const mockEquip = {
        EquipmentID: 200,
        Name: 'Old Name',
        save: jest.fn().mockResolvedValue(true)
      };
      Equipment.findByPk.mockResolvedValue(mockEquip);

      // Act: call the service method
      const updated = await EquipmentService.updateEquipment(200, 'New Name', 2);

      // Assert: verify name change and audit log creation
      expect(mockEquip.Name).toBe('New Name');
      expect(mockEquip.save).toHaveBeenCalled();
      expect(AuditLog.create).toHaveBeenCalledWith({
        UserID: 2,
        Action: 'Update',
        Details: `Equipment 200 updated by Admin`,
        Timestamp: expect.any(Date)
      });
      expect(updated).toEqual(mockEquip);
    });

    it('should throw if equipment not found', async () => {
      // Arrange: simulate missing equipment
      Equipment.findByPk.mockResolvedValue(null);

      // Act & Assert: expect error to be thrown
      await expect(
        EquipmentService.updateEquipment(999, 'Anything', 2)
      ).rejects.toThrow('Equipment not found');
    });
  });

  /**
   * Test suite for deleteEquipment()
   * Verifies that:
   * - Equipment is deleted when found
   * - An audit log entry is recorded
   * - An error is thrown if equipment does not exist
   */
  describe('deleteEquipment', () => {
    it('should delete equipment if found', async () => {
      // Arrange: mock existing equipment and destroy behavior
      const mockEquip = { EquipmentID: 300, Name: 'Laser' };
      Equipment.findByPk.mockResolvedValue(mockEquip);
      Equipment.destroy.mockResolvedValue(1);

      // Act: call the service method
      const result = await EquipmentService.deleteEquipment(300, 2);

      // Assert: verify deletion and audit log
      expect(Equipment.destroy).toHaveBeenCalledWith({ where: { EquipmentID: 300 } });
      expect(AuditLog.create).toHaveBeenCalledWith({
        UserID: 2,
        Action: 'Delete',
        Details: `Equipment 300 deleted by Admin`,
        Timestamp: expect.any(Date)
      });
      expect(result).toEqual({ message: 'Equipment deleted' });
    });

    it('should throw if equipment not found', async () => {
      // Arrange: simulate missing equipment
      Equipment.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(
        EquipmentService.deleteEquipment(999, 2)
      ).rejects.toThrow('Equipment not found');
    });
  });

  /**
   * Test suite for getAllEquipment()
   * Verifies that the service returns a list of all equipment records.
   */
  describe('getAllEquipment', () => {
    it('should return a list of all equipment', async () => {
      // Arrange: simulate multiple equipment entries
      Equipment.findAll.mockResolvedValue([{ EquipmentID: 1 }, { EquipmentID: 2 }]);

      // Act
      const list = await EquipmentService.getAllEquipment();

      // Assert
      expect(Equipment.findAll).toHaveBeenCalled();
      expect(list).toHaveLength(2);
    });
  });

  /**
   * Test suite for getEquipmentById()
   * Verifies that:
   * - The correct equipment is returned when it exists
   * - An error is thrown if equipment does not exist
   */
  describe('getEquipmentById', () => {
    it('should return equipment if found', async () => {
      // Arrange: simulate found equipment
      Equipment.findByPk.mockResolvedValue({ EquipmentID: 5, Name: 'Cutter' });

      // Act
      const eq = await EquipmentService.getEquipmentById(5);

      // Assert
      expect(Equipment.findByPk).toHaveBeenCalledWith(5);
      expect(eq.Name).toBe('Cutter');
    });

    it('should throw if not found', async () => {
      // Arrange: simulate missing equipment
      Equipment.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(EquipmentService.getEquipmentById(9)).rejects.toThrow('Equipment not found');
    });
  });
});
