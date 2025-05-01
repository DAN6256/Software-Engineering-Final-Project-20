/**
 * BorrowController
 *
 * Defines HTTP handlers for borrow-related operations:
 * - requestEquipment:   Students submit new borrow requests.
 * - approveRequest:     Admins approve or modify pending requests.
 * - returnEquipment:    Admins mark approved requests as returned.
 * - sendReminder:       Admins trigger reminder emails for due returns.
 * - getAllRequests:     Retrieve all borrow requests (scoped by user role).
 * - getPendingRequests: Retrieve only pending requests (scoped by user role).
 * - getItemsForRequest: Retrieve line items for a specific request.
 * - getAllLogs:         Retrieve audit logs of borrow activities.
 */

const BorrowService = require('../services/borrow.service');

const BorrowController = {
  /**
   * POST /api/borrow/request
   * Create a new borrow request for the authenticated student.
   * Request payload must include:
   *   - items: Array of { equipmentID, quantity, description? }
   *   - collectionDateTime: Desired pickup date and time
   *
   * Success: 201 Created + { message, borrowRequest }
   * Error:   400 Bad Request + { message }
   */
  requestEquipment: async (req, res) => {
    try {
      const { items, collectionDateTime } = req.body;
      const userID = req.user.UserID;

      const borrowRequest = await BorrowService.requestEquipment(
        userID,
        items,
        collectionDateTime
      );
      return res.status(201).json({
        message: 'Request submitted',
        borrowRequest
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * PUT /api/borrow/approve/:requestID
   * Approve or modify a pending borrow request (Admin only).
   * Request params:
   *   - requestID: ID of the request to approve
   * Payload must include:
   *   - returnDate: Deadline for returning items
   *   - items: Array of { borrowedItemID, allow, description?, serialNumber? }
   *
   * Success: 200 OK + { message, approvedRequest }
   * Error:   400 Bad Request + { message }
   */
  approveRequest: async (req, res) => {
    try {
      const { requestID } = req.params;
      const { returnDate, items } = req.body;

      const approvedRequest = await BorrowService.approveRequest(
        requestID,
        returnDate,
        items
      );
      return res.status(200).json({
        message: 'Request approved',
        approvedRequest
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * PUT /api/borrow/return/:requestID
   * Mark an approved borrow request as returned (Admin only).
   * Request params:
   *   - requestID: ID of the request to mark returned
   *
   * Success: 200 OK + { message, returnedRequest }
   * Error:   400 Bad Request + { message }
   */
  returnEquipment: async (req, res) => {
    try {
      const { requestID } = req.params;
      const returnedRequest = await BorrowService.returnEquipment(requestID);
      return res.status(200).json({
        message: 'Equipment returned',
        returnedRequest
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * POST /api/borrow/send-reminder
   * Trigger email reminders for borrow requests due within the next two days (Admin only).
   *
   * Success: 200 OK + { message }
   * Error:   400 Bad Request + { message }
   */
  sendReminder: async (req, res) => {
    try {
      const { remindersSent } = await BorrowService.sendReminderForDueReturns();
      const msg =
        remindersSent > 0
          ? 'Reminders sent successfully'
          : 'No due requests found to remind';
      return res.status(200).json({ message: msg });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * GET /api/borrow/requests
   * Retrieve all borrow requests. Admins see all; students see only their own.
   *
   * Success: 200 OK + { requests }
   * Error:   400 Bad Request + { message }
   */
  getAllRequests: async (req, res) => {
    try {
      const requests = await BorrowService.getAllRequests(req.user);
      return res.status(200).json({ requests });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * GET /api/borrow/requests/pending
   * Retrieve only pending borrow requests. Admins see all pending; students see their own.
   *
   * Success: 200 OK + { requests }
   * Error:   400 Bad Request + { message }
   */
  getPendingRequests: async (req, res) => {
    try {
      const requests = await BorrowService.getPendingRequests(req.user);
      return res.status(200).json({ requests });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  /**
   * GET /api/borrow/requests/:requestID/items
   * Retrieve the line items for a specific borrow request.
   * Students can view only their own; admins can view any.
   *
   * Success: 200 OK + { items }
   * Error:   404 Not Found + { message }
   */
  getItemsForRequest: async (req, res) => {
    try {
      const { requestID } = req.params;
      const items = await BorrowService.getItemsForRequest(
        req.user,
        requestID
      );
      return res.status(200).json({ items });
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  },

  /**
   * GET /api/borrow/logs
   * Retrieve all audit logs related to borrow activities.
   *
   * Success: 200 OK + { logs }
   * Error:   400 Bad Request + { message }
   */
  getAllLogs: async (req, res) => {
    try {
      const logs = await BorrowService.getAllLogs();
      return res.status(200).json({ logs });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

module.exports = BorrowController;
