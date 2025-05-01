/**
 * Equipment Controller
 *
 * Exposes CRUD operations for equipment management:
 * - addEquipment: Admins can add new equipment items.
 * - updateEquipment: Admins can update existing equipment details.
 * - deleteEquipment: Admins can remove equipment items.
 * - getAllEquipment: Retrieve a list of all equipment.
 * - getEquipmentById: Retrieve details of a specific equipment item.
 *
 * Business logic is delegated to EquipmentService; HTTP responses
 * reflect the outcome of service operations.
 */

const EquipmentService = require('../services/equipment.service');

const EquipmentController = {
  /**
   * Add a new equipment item.
   * Route: POST /equipment
   *
   * Expects:
   *   - name: The name of the equipment (from req.body)
   *   - req.user.UserID: The ID of the authenticated admin user
   *
   * Responds:
   *   - 201 Created with the created equipment object on success
   *   - 400 Bad Request if validation or service error occurs
   */
  addEquipment: async (req, res) => {
    try {
      const { name } = req.body;
      const userID = req.user.UserID;

      // Delegate creation to service layer
      const equipment = await EquipmentService.addEquipment(name, userID);

      return res
        .status(201)
        .json({ message: 'Equipment added successfully', equipment });
    } catch (error) {
      // Return error message for any failure
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * Update details of an existing equipment item.
   * Route: PUT /equipment/:equipmentID
   *
   * Expects:
   *   - equipmentID: Path parameter identifying the item to update
   *   - name: (Optional) New name for the equipment
   *   - req.user.UserID: The ID of the authenticated admin user
   *
   * Responds:
   *   - 200 OK with the updated equipment object on success
   *   - 400 Bad Request if validation or service error occurs
   */
  updateEquipment: async (req, res) => {
    try {
      const { equipmentID } = req.params;
      const { name } = req.body;
      const userID = req.user.UserID;

      // Delegate update to service layer
      const updatedEquipment = await EquipmentService.updateEquipment(
        equipmentID,
        name,
        userID
      );

      return res
        .status(200)
        .json({ message: 'Equipment updated successfully', updatedEquipment });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * Delete an equipment item.
   * Route: DELETE /equipment/:equipmentID
   *
   * Expects:
   *   - equipmentID: Path parameter identifying the item to delete
   *   - req.user.UserID: The ID of the authenticated admin user
   *
   * Responds:
   *   - 200 OK with a success message on deletion
   *   - 400 Bad Request if service error occurs
   */
  deleteEquipment: async (req, res) => {
    try {
      const { equipmentID } = req.params;
      const userID = req.user.UserID;

      // Delegate deletion to service layer
      await EquipmentService.deleteEquipment(equipmentID, userID);

      return res
        .status(200)
        .json({ message: 'Equipment deleted successfully' });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * Retrieve a list of all equipment items.
   * Route: GET /equipment
   *
   * Responds:
   *   - 200 OK with an array of equipment objects on success
   *   - 400 Bad Request if service error occurs
   */
  getAllEquipment: async (req, res) => {
    try {
      // Delegate fetch-all to service layer
      const equipmentList = await EquipmentService.getAllEquipment();

      return res.status(200).json({ equipmentList });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * Retrieve details for a specific equipment item.
   * Route: GET /equipment/:equipmentID
   *
   * Expects:
   *   - equipmentID: Path parameter identifying the item to fetch
   *
   * Responds:
   *   - 200 OK with the equipment object on success
   *   - 404 Not Found if the item does not exist
   */
  getEquipmentById: async (req, res) => {
    try {
      const { equipmentID } = req.params;

      // Delegate fetch-by-id to service layer
      const equipment = await EquipmentService.getEquipmentById(equipmentID);

      return res.status(200).json({ equipment });
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }
};

module.exports = EquipmentController;
